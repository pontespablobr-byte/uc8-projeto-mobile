export class ErroDaApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.status = status;
  }
}

function ehMensagemDeErro(valor: unknown): valor is { message: string } {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    typeof (valor as Record<string, unknown>).message === 'string'
  );
}

export async function lerMensagemDeErro(resposta: Response): Promise<string> {
  const corpo: unknown = await resposta.json().catch(() => undefined);
  return ehMensagemDeErro(corpo) ? corpo.message : 'sem detalhe no corpo da resposta';
}

export function configuracao(): { url: string; chave: string } {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const chave = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (url === undefined || chave === undefined) {
    throw new Error('Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_KEY em .env.local');
  }
  return { url, chave };
}

const TEMPO_LIMITE_MS = 15000;

export async function buscarComLimite(
  endereco: string,
  opcoes: RequestInit,
  tempoLimiteMs: number = TEMPO_LIMITE_MS,
): Promise<Response> {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), tempoLimiteMs);
  try {
    return await fetch(endereco, { ...opcoes, signal: controle.signal });
  } catch (erro: unknown) {
    if (controle.signal.aborted) {
      throw new TypeError(
        `Network request failed: o servidor não respondeu em ${tempoLimiteMs / 1000} segundos`,
      );
    }
    throw erro;
  } finally {
    clearTimeout(relogio);
  }
}

export async function requisitar(
  caminho: string,
  metodo: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  corpo?: object,
): Promise<unknown> {
  const { url, chave } = configuracao();
  const resposta = await buscarComLimite(`${url}/rest/v1/${caminho}`, {
    method: metodo,
    headers: {
      apikey: chave,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  if (!resposta.ok) {
    throw new ErroDaApi(resposta.status, await lerMensagemDeErro(resposta));
  }
  return resposta.json();
}
