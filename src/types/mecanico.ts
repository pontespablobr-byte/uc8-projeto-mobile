export type Especialidade =
  | 'motor'
  | 'suspensao'
  | 'freios'
  | 'eletrica'
  | 'geral';

export type Mecanico = {
  id: string;
  nome: string;
  telefone: string;
  especialidade: Especialidade;
  ativo: boolean;
};
