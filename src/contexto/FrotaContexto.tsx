import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { carregarMecanicos } from '../servicos/mecanicos';
import {
  carregarOrdens,
  descreverErro,
  incluirOrdem,
  type DadosInclusaoOrdem,
} from '../servicos/ordensServico';
import { carregarVeiculos } from '../servicos/veiculos';
import type { Mecanico, OrdemServico, StatusOrdemServico, Veiculo } from '../types';

export type EstadoFrota =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; veiculos: Veiculo[]; mecanicos: Mecanico[]; ordens: OrdemServico[] };

interface ValorDaFrota {
  estado: EstadoFrota;
  recarregar: () => void;
  incluir: (dados: DadosInclusaoOrdem) => Promise<OrdemServico>;
  atualizarStatus: (id: string, status: StatusOrdemServico) => void;
}

const FrotaContexto = createContext<ValorDaFrota | undefined>(undefined);

export function FrotaProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoFrota>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'carregando' });
    Promise.all([carregarVeiculos(), carregarMecanicos(), carregarOrdens()])
      .then(([veiculos, mecanicos, ordens]) => {
        if (!cancelado) {
          setEstado({ tipo: 'pronto', veiculos, mecanicos, ordens });
        }
      })
      .catch((erro: unknown) => {
        if (!cancelado) {
          setEstado({ tipo: 'erro', mensagem: descreverErro(erro) });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  function recarregar() {
    setTentativa((atual) => atual + 1);
  }

  async function incluir(dados: DadosInclusaoOrdem): Promise<OrdemServico> {
    const nova = await incluirOrdem(dados);
    setEstado((atual) =>
      atual.tipo === 'pronto' ? { ...atual, ordens: [nova, ...atual.ordens] } : atual,
    );
    return nova;
  }

  // Só na memória: a chave publicável não tem permissão de alterar a tabela.
  function atualizarStatus(id: string, status: StatusOrdemServico) {
    setEstado((atual) => {
      if (atual.tipo !== 'pronto') return atual;
      return {
        ...atual,
        ordens: atual.ordens.map((ordem) => {
          if (ordem.id !== id || ordem.status === status) return ordem;
          return {
            ...ordem,
            status,
            dataConclusao: status === 'concluida' ? new Date().toISOString() : null,
          };
        }),
      };
    });
  }

  return (
    <FrotaContexto.Provider value={{ estado, recarregar, incluir, atualizarStatus }}>
      {children}
    </FrotaContexto.Provider>
  );
}

export function useFrota(): ValorDaFrota {
  const valor = useContext(FrotaContexto);
  if (valor === undefined) {
    throw new Error('useFrota só funciona dentro de FrotaProvedor');
  }
  return valor;
}
