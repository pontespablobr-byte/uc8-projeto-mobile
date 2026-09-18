export type TipoManutencao = 'preventiva' | 'corretiva';

export type StatusOrdemServico =
  | 'aberta'
  | 'em_andamento'
  | 'concluida'
  | 'cancelada';

export type Prioridade = 'baixa' | 'media' | 'alta';

export type OrdemServico = {
  id: string;
  veiculoId: string;
  mecanicoId: string;
  tipo: TipoManutencao;
  descricao: string;
  prioridade: Prioridade;
  status: StatusOrdemServico;
  quilometragemNoServico: number;
  custoEstimado: number;
  dataAbertura: string;
  dataConclusao: string | null;
};
