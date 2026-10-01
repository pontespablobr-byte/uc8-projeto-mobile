import type { Veiculo } from '../types';

export const frota: Veiculo[] = [
  {
    id: '1',
    placa: 'QWE-1234',
    marca: 'Fiat',
    modelo: 'Strada',
    anoFabricacao: 2019,
    combustivel: 'flex',
    quilometragem: 85000,
    proximaRevisaoKm: 90000,
    status: 'ativo',
  },
  {
    id: '2',
    placa: 'ABC-5678',
    marca: 'Toyota',
    modelo: 'Hilux',
    anoFabricacao: 2021,
    combustivel: 'diesel',
    quilometragem: 45000,
    proximaRevisaoKm: 50000,
    status: 'ativo',
  },
  {
    id: '3',
    placa: 'XYZ-9012',
    marca: 'Volkswagen',
    modelo: 'Saveiro',
    anoFabricacao: 2018,
    combustivel: 'flex',
    quilometragem: 62000,
    proximaRevisaoKm: 65000,
    status: 'em_manutencao',
  },
];

export function carregarVeiculos(): Promise<Veiculo[]> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(frota), 800);
  });
}
