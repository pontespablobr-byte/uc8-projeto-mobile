import { ErroDaApi } from '../servicos/api';

export type TipoDeErro = 'rede' | 'api' | 'banco' | 'validacao' | 'desconhecido';

export interface ErroClassificado {
  tipo: TipoDeErro;
  mensagem: string;
  detalhe: string;
}

export class ErroDeValidacao extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDeValidacao';
  }
}

export class ErroDoBanco extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDoBanco';
  }
}

const PARECE_FALTA_DE_REDE =
  /network request failed|failed to fetch|fetch failed|load failed|networkerror|timed out|internet connection|could not connect|network connection was lost|não respondeu em/i;

function ehFaltaDeRede(erro: Error): boolean {
  return erro.name === 'AbortError' || PARECE_FALTA_DE_REDE.test(erro.message);
}

function mensagemDaApi(erro: ErroDaApi): string {
  if (/permission denied/i.test(erro.message)) {
    return 'O Supabase não permite essa operação.';
  }
  switch (erro.status) {
    case 400:
      return `O servidor recusou os dados enviados (400): ${erro.message}`;
    case 401:
      return 'A chave do Supabase foi recusada (401). Confira o arquivo .env.local.';
    case 403:
      return erro.message;
    case 404:
      return 'O Supabase não encontrou a tabela (404). Confira se todos os arquivos SQL foram executados.';
    default:
      return `O servidor recusou a operação (${erro.status}): ${erro.message}`;
  }
}

export function classificarErro(erro: unknown): ErroClassificado {
  if (erro instanceof ErroDeValidacao) {
    return { tipo: 'validacao', mensagem: erro.message, detalhe: `${erro.name}: ${erro.message}` };
  }
  if (erro instanceof ErroDaApi) {
    return {
      tipo: 'api',
      mensagem: mensagemDaApi(erro),
      detalhe: `${erro.name} ${erro.status}: ${erro.message}`,
    };
  }
  if (erro instanceof ErroDoBanco) {
    return {
      tipo: 'banco',
      mensagem: 'Não foi possível ler ou guardar os dados no aparelho.',
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }
  if (erro instanceof Error && ehFaltaDeRede(erro)) {
    return {
      tipo: 'rede',
      mensagem: 'Sem conexão com o servidor. Verifique a rede e tente de novo.',
      detalhe: `${erro.name}: ${erro.message}`,
    };
  }
  if (erro instanceof Error) {
    return { tipo: 'desconhecido', mensagem: erro.message, detalhe: `${erro.name}: ${erro.message}` };
  }
  return { tipo: 'desconhecido', mensagem: 'Algo deu errado. Tente de novo.', detalhe: String(erro) };
}

export function registrarErro(origem: string, erro: unknown): ErroClassificado {
  const classificado = classificarErro(erro);
  const linha = `[${origem}] ${classificado.tipo}: ${classificado.detalhe}`;
  if (classificado.tipo === 'rede' || classificado.tipo === 'validacao') {
    console.log(linha);
  } else {
    console.error(linha);
  }
  return classificado;
}
