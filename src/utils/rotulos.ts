import type {
  Especialidade,
  Prioridade,
  StatusOrdemServico,
  TipoManutencao,
} from '../types';

export const rotulosTipo: Record<TipoManutencao, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
};

export const rotulosPrioridade: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export const rotulosStatusOrdem: Record<StatusOrdemServico, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const rotulosEspecialidade: Record<Especialidade, string> = {
  motor: 'Motor',
  suspensao: 'Suspensão',
  freios: 'Freios',
  eletrica: 'Elétrica',
  geral: 'Geral',
};
