import { ErroDoBanco } from '../erros/erros';
import type { ContagemLocal, DadosLocais, DadosPendente, Pendente } from './tipos';

export type { ContagemLocal, DadosLocais, DadosPendente, Pendente } from './tipos';

// No navegador o expo-sqlite ainda é experimental e pede configuração própria do servidor.
// O app é para celular: aqui o banco local recusa toda operação, e a lista segue com a nuvem.
function indisponivel<T>(): Promise<T> {
  return Promise.reject(new ErroDoBanco('O banco do aparelho não está disponível no navegador.'));
}

export function listarLocal(): Promise<DadosLocais> {
  return indisponivel();
}

export function guardarLocal(_dados: DadosLocais): Promise<void> {
  return indisponivel();
}

export function contarLocal(): Promise<ContagemLocal> {
  return indisponivel();
}

export function listarPendentes(): Promise<Pendente[]> {
  return indisponivel();
}

export function guardarPendente(_dados: DadosPendente): Promise<Pendente> {
  return indisponivel();
}

export function removerPendente(_id: number): Promise<void> {
  return indisponivel();
}
