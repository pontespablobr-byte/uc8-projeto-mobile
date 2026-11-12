import { ErroDaApi, requisitar } from './api';
import type { Combustivel, StatusVeiculo, Veiculo } from '../types';

export interface DadosNovoVeiculo {
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  combustivel: Combustivel;
  quilometragem: number;
  proximaRevisaoKm: number;
}

interface LinhaNovoVeiculo {
  placa: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  combustivel: Combustivel;
  quilometragem: number;
  proxima_revisao_km: number;
}

interface VeiculoRemoto extends LinhaNovoVeiculo {
  id: number;
  status: StatusVeiculo;
}

const COMBUSTIVEIS: readonly unknown[] = ['gasolina', 'etanol', 'flex', 'diesel', 'eletrico'];
const STATUS: readonly unknown[] = ['ativo', 'em_manutencao', 'inativo'];

function ehVeiculoRemoto(valor: unknown): valor is VeiculoRemoto {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const campos = valor as Record<string, unknown>;
  return (
    typeof campos.id === 'number' &&
    typeof campos.placa === 'string' &&
    typeof campos.marca === 'string' &&
    typeof campos.modelo === 'string' &&
    typeof campos.ano_fabricacao === 'number' &&
    COMBUSTIVEIS.includes(campos.combustivel) &&
    typeof campos.quilometragem === 'number' &&
    typeof campos.proxima_revisao_km === 'number' &&
    STATUS.includes(campos.status)
  );
}

function ehListaDeVeiculos(valor: unknown): valor is VeiculoRemoto[] {
  return Array.isArray(valor) && valor.every(ehVeiculoRemoto);
}

function paraVeiculo(remoto: VeiculoRemoto): Veiculo {
  return {
    id: String(remoto.id),
    placa: remoto.placa,
    marca: remoto.marca,
    modelo: remoto.modelo,
    anoFabricacao: remoto.ano_fabricacao,
    combustivel: remoto.combustivel,
    quilometragem: remoto.quilometragem,
    proximaRevisaoKm: remoto.proxima_revisao_km,
    status: remoto.status,
  };
}

export async function carregarVeiculos(): Promise<Veiculo[]> {
  const corpo = await requisitar('veiculos?select=*&order=id');
  if (!ehListaDeVeiculos(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraVeiculo);
}

export async function incluirVeiculo(dados: DadosNovoVeiculo): Promise<Veiculo> {
  const linha: LinhaNovoVeiculo = {
    placa: dados.placa,
    marca: dados.marca,
    modelo: dados.modelo,
    ano_fabricacao: dados.anoFabricacao,
    combustivel: dados.combustivel,
    quilometragem: dados.quilometragem,
    proxima_revisao_km: dados.proximaRevisaoKm,
  };
  const corpo = await requisitar('veiculos?select=*', 'POST', linha);
  if (!ehListaDeVeiculos(corpo) || corpo.length !== 1) {
    throw new Error('Resposta inesperada da API');
  }
  return paraVeiculo(corpo[0]);
}

export async function excluirVeiculo(id: string): Promise<void> {
  const corpo = await requisitar(`veiculos?id=eq.${encodeURIComponent(id)}&select=id`, 'DELETE');
  if (!Array.isArray(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  if (corpo.length !== 1) {
    throw new ErroDaApi(
      403,
      'O veículo não foi excluído. Só veículos sem ordens de serviço podem ser excluídos; confira também se o arquivo supabase/exclusao_veiculos.sql foi executado no Supabase.',
    );
  }
}
