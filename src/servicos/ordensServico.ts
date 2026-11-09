import type {
  OrdemServico,
  Prioridade,
  StatusOrdemServico,
  TipoManutencao,
} from '../types';

export interface DadosInclusaoOrdem {
  veiculoId: string;
  mecanicoId: string;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custoEstimado: number;
  quilometragemNoServico: number;
}

interface LinhaNovaOrdem {
  veiculo_id: number;
  mecanico_id: number;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custo_estimado: number;
  quilometragem_no_servico: number;
}

interface OrdemRemota extends LinhaNovaOrdem {
  id: number;
  status: StatusOrdemServico;
  data_abertura: string;
  data_conclusao: string | null;
}

const TIPOS: readonly unknown[] = ['preventiva', 'corretiva'];
const PRIORIDADES: readonly unknown[] = ['baixa', 'media', 'alta'];
const STATUS: readonly unknown[] = ['aberta', 'em_andamento', 'concluida', 'cancelada'];

export class ErroDaApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroDaApi';
    this.status = status;
  }
}

export function descreverErro(erro: unknown): string {
  if (erro instanceof ErroDaApi) {
    return `A API respondeu ${erro.status}: ${erro.message}`;
  }
  if (erro instanceof Error) {
    return erro.message;
  }
  return 'Erro desconhecido';
}

function ehMensagemDeErro(valor: unknown): valor is { message: string } {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    typeof (valor as Record<string, unknown>).message === 'string'
  );
}

async function lerMensagemDeErro(resposta: Response): Promise<string> {
  const corpo: unknown = await resposta.json().catch(() => undefined);
  return ehMensagemDeErro(corpo) ? corpo.message : 'sem detalhe no corpo da resposta';
}

function configuracao(): { url: string; chave: string } {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const chave = process.env.EXPO_PUBLIC_SUPABASE_KEY;
  if (url === undefined || chave === undefined) {
    throw new Error('Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_KEY em .env.local');
  }
  return { url, chave };
}

function ehOrdemRemota(valor: unknown): valor is OrdemRemota {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const campos = valor as Record<string, unknown>;
  return (
    typeof campos.id === 'number' &&
    typeof campos.veiculo_id === 'number' &&
    typeof campos.mecanico_id === 'number' &&
    TIPOS.includes(campos.tipo) &&
    typeof campos.descricao === 'string' &&
    PRIORIDADES.includes(campos.prioridade) &&
    STATUS.includes(campos.status) &&
    typeof campos.quilometragem_no_servico === 'number' &&
    typeof campos.custo_estimado === 'number' &&
    typeof campos.data_abertura === 'string' &&
    (campos.data_conclusao === null || typeof campos.data_conclusao === 'string')
  );
}

function ehListaDeOrdens(valor: unknown): valor is OrdemRemota[] {
  return Array.isArray(valor) && valor.every(ehOrdemRemota);
}

function paraOrdem(remota: OrdemRemota): OrdemServico {
  return {
    id: String(remota.id),
    veiculoId: String(remota.veiculo_id),
    mecanicoId: String(remota.mecanico_id),
    tipo: remota.tipo,
    descricao: remota.descricao,
    prioridade: remota.prioridade,
    status: remota.status,
    quilometragemNoServico: remota.quilometragem_no_servico,
    custoEstimado: remota.custo_estimado,
    dataAbertura: remota.data_abertura,
    dataConclusao: remota.data_conclusao,
  };
}

async function requisitar(
  caminho: string,
  metodo: 'GET' | 'POST' = 'GET',
  corpo?: LinhaNovaOrdem,
): Promise<unknown> {
  const { url, chave } = configuracao();
  const resposta = await fetch(`${url}/rest/v1/${caminho}`, {
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

// Mais recentes primeiro, a mesma posição em que uma ordem nova entra na lista.
export async function carregarOrdens(): Promise<OrdemServico[]> {
  const corpo = await requisitar('ordens_servico?select=*&order=id.desc');
  if (!ehListaDeOrdens(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraOrdem);
}

export async function incluirOrdem(dados: DadosInclusaoOrdem): Promise<OrdemServico> {
  const corpo = await requisitar('ordens_servico?select=*', 'POST', {
    veiculo_id: Number(dados.veiculoId),
    mecanico_id: Number(dados.mecanicoId),
    tipo: dados.tipo,
    prioridade: dados.prioridade,
    descricao: dados.descricao,
    custo_estimado: dados.custoEstimado,
    quilometragem_no_servico: dados.quilometragemNoServico,
  });
  if (!ehListaDeOrdens(corpo) || corpo.length !== 1) {
    throw new Error('Resposta inesperada da API');
  }
  return paraOrdem(corpo[0]);
}
