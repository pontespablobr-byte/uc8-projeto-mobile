import { ErroDaApi, requisitar } from './api';
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
  fotoUrl: string | null;
}

export interface AlteracoesOrdem {
  veiculoId?: string;
  mecanicoId?: string;
  tipo?: TipoManutencao;
  prioridade?: Prioridade;
  descricao?: string;
  custoEstimado?: number;
  quilometragemNoServico?: number;
  status?: StatusOrdemServico;
  dataConclusao?: string | null;
  fotoUrl?: string | null;
}

interface OrdemRemota {
  id: number;
  veiculo_id: number;
  mecanico_id: number;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custo_estimado: number;
  quilometragem_no_servico: number;
  status: StatusOrdemServico;
  data_abertura: string;
  data_conclusao: string | null;
  foto_url?: string | null;
}

const TIPOS: readonly unknown[] = ['preventiva', 'corretiva'];
const PRIORIDADES: readonly unknown[] = ['baixa', 'media', 'alta'];
const STATUS: readonly unknown[] = ['aberta', 'em_andamento', 'concluida', 'cancelada'];

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
    (campos.data_conclusao === null || typeof campos.data_conclusao === 'string') &&
    (campos.foto_url === undefined ||
      campos.foto_url === null ||
      typeof campos.foto_url === 'string')
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
    fotoUrl: remota.foto_url ?? null,
  };
}

function paraLinha(alteracoes: AlteracoesOrdem): Record<string, unknown> {
  const linha: Record<string, unknown> = {};
  if (alteracoes.veiculoId !== undefined) linha.veiculo_id = Number(alteracoes.veiculoId);
  if (alteracoes.mecanicoId !== undefined) linha.mecanico_id = Number(alteracoes.mecanicoId);
  if (alteracoes.tipo !== undefined) linha.tipo = alteracoes.tipo;
  if (alteracoes.prioridade !== undefined) linha.prioridade = alteracoes.prioridade;
  if (alteracoes.descricao !== undefined) linha.descricao = alteracoes.descricao;
  if (alteracoes.custoEstimado !== undefined) linha.custo_estimado = alteracoes.custoEstimado;
  if (alteracoes.quilometragemNoServico !== undefined) {
    linha.quilometragem_no_servico = alteracoes.quilometragemNoServico;
  }
  if (alteracoes.status !== undefined) linha.status = alteracoes.status;
  if (alteracoes.dataConclusao !== undefined) linha.data_conclusao = alteracoes.dataConclusao;
  if (alteracoes.fotoUrl !== undefined) linha.foto_url = alteracoes.fotoUrl;
  return linha;
}

export async function carregarOrdens(): Promise<OrdemServico[]> {
  const corpo = await requisitar('ordens_servico?select=*&order=id.desc');
  if (!ehListaDeOrdens(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraOrdem);
}

export async function incluirOrdem(dados: DadosInclusaoOrdem): Promise<OrdemServico> {
  const { fotoUrl, ...resto } = dados;
  const linha = paraLinha(fotoUrl === null ? resto : dados);
  const corpo = await requisitar('ordens_servico?select=*', 'POST', linha);
  if (!ehListaDeOrdens(corpo) || corpo.length !== 1) {
    throw new Error('Resposta inesperada da API');
  }
  return paraOrdem(corpo[0]);
}

export async function excluirOrdem(id: string): Promise<void> {
  const corpo = await requisitar(
    `ordens_servico?id=eq.${encodeURIComponent(id)}&select=id`,
    'DELETE',
  );
  if (!Array.isArray(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  if (corpo.length !== 1) {
    throw new ErroDaApi(
      403,
      'A ordem não foi excluída. Só ordens abertas ou canceladas podem ser excluídas; confira também se o arquivo supabase/exclusao.sql foi executado no Supabase.',
    );
  }
}

export async function atualizarOrdem(
  id: string,
  alteracoes: AlteracoesOrdem,
): Promise<OrdemServico> {
  const corpo = await requisitar(
    `ordens_servico?id=eq.${encodeURIComponent(id)}&select=*`,
    'PATCH',
    paraLinha(alteracoes),
  );
  if (!ehListaDeOrdens(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  if (corpo.length !== 1) {
    throw new ErroDaApi(
      403,
      'A ordem não foi alterada. Confira se o arquivo supabase/edicao_e_fotos.sql foi executado no Supabase.',
    );
  }
  return paraOrdem(corpo[0]);
}
