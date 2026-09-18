export type Combustivel = 'gasolina' | 'etanol' | 'flex' | 'diesel' | 'eletrico';

export type StatusVeiculo = 'ativo' | 'em_manutencao' | 'inativo';

export type Veiculo = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  combustivel: Combustivel;
  quilometragem: number;
  proximaRevisaoKm: number;
  status: StatusVeiculo;
};
