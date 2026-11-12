import type { Mecanico, OrdemServico, Prioridade, TipoManutencao, Veiculo } from '../types';

export interface DadosPendente {
  veiculoId: string;
  mecanicoId: string;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custoEstimado: number;
  quilometragemNoServico: number;
  fotoBase64: string | null;
  fotoMime: 'image/jpeg' | 'image/png' | null;
}

export interface Pendente extends DadosPendente {
  id: number;
}

export interface DadosLocais {
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
  ordens: OrdemServico[];
}

export interface ContagemLocal {
  veiculos: number;
  mecanicos: number;
  ordens: number;
}
