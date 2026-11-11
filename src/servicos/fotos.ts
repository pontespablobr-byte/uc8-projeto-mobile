import { ErroDaApi, configuracao, lerMensagemDeErro } from './api';

const PASTA = 'fotos-os';

// Foto escolhida no formulário: uma nova (ainda no aparelho) ou a que a ordem já tem.
export type FotoDaOrdem =
  | { tipo: 'nova'; uri: string; base64: string; mimeType: 'image/jpeg' | 'image/png' }
  | { tipo: 'existente'; url: string };

function base64ParaBytes(base64: string): ArrayBuffer {
  const binario = atob(base64);
  const memoria = new ArrayBuffer(binario.length);
  const bytes = new Uint8Array(memoria);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return memoria;
}

// Envia a foto para o Storage do Supabase e devolve o endereço público dela.
export async function enviarFoto(base64: string, mimeType: string): Promise<string> {
  const { url, chave } = configuracao();
  const extensao = mimeType === 'image/png' ? 'png' : 'jpg';
  const caminho = `ordens/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;
  const resposta = await fetch(`${url}/storage/v1/object/${PASTA}/${caminho}`, {
    method: 'POST',
    headers: { apikey: chave, 'Content-Type': mimeType },
    body: base64ParaBytes(base64),
  });
  if (!resposta.ok) {
    throw new ErroDaApi(resposta.status, await lerMensagemDeErro(resposta));
  }
  return `${url}/storage/v1/object/public/${PASTA}/${caminho}`;
}

// Devolve o endereço que a ordem deve guardar: envia a foto nova, mantém a existente.
export async function resolverFoto(foto: FotoDaOrdem | null): Promise<string | null> {
  if (foto === null) return null;
  if (foto.tipo === 'existente') return foto.url;
  return enviarFoto(foto.base64, foto.mimeType);
}
