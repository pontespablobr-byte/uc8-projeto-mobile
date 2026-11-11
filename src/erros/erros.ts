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

// O fetch avisa a falta de rede com textos diferentes em cada plataforma.
const MENSAGENS_DE_REDE = [
  'Network request failed',
  'Failed to fetch',
  'Load failed',
  'fetch failed',
  'NetworkError when attempting to fetch resource.',
];

// Uma mensagem por código: cada recusa diz à pessoa o que conferir.
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
  if (erro instanceof TypeError && MENSAGENS_DE_REDE.includes(erro.message)) {
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

// Um só lugar para registrar: o console recebe a origem e o detalhe; a tela, a mensagem.
export function registrarErro(origem: string, erro: unknown): ErroClassificado {
  const classificado = classificarErro(erro);
  console.error(`[${origem}] ${classificado.tipo}: ${classificado.detalhe}`);
  return classificado;
}
