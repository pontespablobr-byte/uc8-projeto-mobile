import { requisitar } from './api';
import type { Especialidade, Mecanico } from '../types';

export interface DadosNovoMecanico {
  nome: string;
  telefone: string;
  especialidade: Especialidade;
}

interface MecanicoRemoto extends DadosNovoMecanico {
  id: number;
  ativo: boolean;
}

const ESPECIALIDADES: readonly unknown[] = ['motor', 'suspensao', 'freios', 'eletrica', 'geral'];

function ehMecanicoRemoto(valor: unknown): valor is MecanicoRemoto {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const campos = valor as Record<string, unknown>;
  return (
    typeof campos.id === 'number' &&
    typeof campos.nome === 'string' &&
    typeof campos.telefone === 'string' &&
    ESPECIALIDADES.includes(campos.especialidade) &&
    typeof campos.ativo === 'boolean'
  );
}

function ehListaDeMecanicos(valor: unknown): valor is MecanicoRemoto[] {
  return Array.isArray(valor) && valor.every(ehMecanicoRemoto);
}

function paraMecanico(remoto: MecanicoRemoto): Mecanico {
  return {
    id: String(remoto.id),
    nome: remoto.nome,
    telefone: remoto.telefone,
    especialidade: remoto.especialidade,
    ativo: remoto.ativo,
  };
}

export async function carregarMecanicos(): Promise<Mecanico[]> {
  const corpo = await requisitar('mecanicos?select=*&order=id');
  if (!ehListaDeMecanicos(corpo)) {
    throw new Error('Resposta inesperada da API');
  }
  return corpo.map(paraMecanico);
}

export async function incluirMecanico(dados: DadosNovoMecanico): Promise<Mecanico> {
  const corpo = await requisitar('mecanicos?select=*', 'POST', dados);
  if (!ehListaDeMecanicos(corpo) || corpo.length !== 1) {
    throw new Error('Resposta inesperada da API');
  }
  return paraMecanico(corpo[0]);
}
