import type { Mecanico } from '../types';

// Ids 1 a 3. As ordens de serviço apontam para eles por mecanicoId.
// O telefone fica só com dígitos: formatarTelefone cuida da máscara.
export const mecanicos: Mecanico[] = [
  {
    id: '1',
    nome: 'Carlos Silva',
    telefone: '84988887777',
    especialidade: 'motor',
    ativo: true,
  },
  {
    id: '2',
    nome: 'Marcos Lima',
    telefone: '84977776666',
    especialidade: 'freios',
    ativo: true,
  },
  {
    id: '3',
    nome: 'Ana Souza',
    telefone: '8433334444',
    especialidade: 'eletrica',
    ativo: true,
  },
];

export function carregarMecanicos(): Promise<Mecanico[]> {
  return new Promise((resolver) => {
    setTimeout(() => resolver(mecanicos), 600);
  });
}
