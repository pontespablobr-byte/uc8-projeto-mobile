import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  guardarLocal,
  guardarPendente,
  listarLocal,
  listarPendentes,
  type Pendente,
} from '../banco/banco';
import { ErroDeValidacao, registrarErro } from '../erros/erros';
import { ErroDaApi } from '../servicos/api';
import { resolverFoto, type FotoDaOrdem } from '../servicos/fotos';
import {
  carregarMecanicos,
  incluirMecanico as enviarMecanico,
  type DadosNovoMecanico,
} from '../servicos/mecanicos';
import {
  atualizarOrdem,
  carregarOrdens,
  excluirOrdem as apagarOrdem,
  incluirOrdem,
  type AlteracoesOrdem,
} from '../servicos/ordensServico';
import { sincronizarPendentes } from '../servicos/sincronizacao';
import {
  carregarVeiculos,
  incluirVeiculo as enviarVeiculo,
  type DadosNovoVeiculo,
} from '../servicos/veiculos';
import type {
  Mecanico,
  OrdemServico,
  Prioridade,
  StatusOrdemServico,
  TipoManutencao,
  Veiculo,
} from '../types';

interface DadosDaFrota {
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
  ordens: OrdemServico[];
  pendentes: Pendente[];
}

export type EstadoFrota =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | ({ tipo: 'pronto'; origem: 'nuvem' } & DadosDaFrota)
  | ({ tipo: 'pronto'; origem: 'aparelho'; motivo: string } & DadosDaFrota);

// O que a tela de nova OS entrega: a foto ainda no aparelho, se houver.
export interface DadosNovaOrdemCompleta {
  veiculoId: string;
  mecanicoId: string;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custoEstimado: number;
  quilometragemNoServico: number;
  foto: FotoDaOrdem | null;
}

interface ValorDaFrota {
  estado: EstadoFrota;
  recarregar: () => void;
  // 'pendente' quando não havia rede: a ordem ficou no aparelho para enviar depois.
  incluir: (dados: DadosNovaOrdemCompleta) => Promise<'enviada' | 'pendente'>;
  incluirVeiculo: (dados: DadosNovoVeiculo) => Promise<Veiculo>;
  incluirMecanico: (dados: DadosNovoMecanico) => Promise<Mecanico>;
  atualizarStatus: (id: string, status: StatusOrdemServico) => Promise<void>;
  editarOrdem: (id: string, alteracoes: AlteracoesOrdem) => Promise<OrdemServico>;
  excluirOrdem: (id: string) => Promise<void>;
}

const FrotaContexto = createContext<ValorDaFrota | undefined>(undefined);

const CUSTO_MAXIMO = 99999999.99;
const QUILOMETRAGEM_MAXIMA = 9999999;
const PLACA_VALIDA = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;

function validarCusto(custo: number) {
  if (!Number.isFinite(custo) || custo < 0 || custo > CUSTO_MAXIMO) {
    throw new ErroDeValidacao('O custo estimado precisa ser um valor entre zero e R$ 99.999.999,99.');
  }
}

function validarDescricao(descricao: string) {
  if (descricao.trim() === '') {
    throw new ErroDeValidacao('Descreva o serviço ou o defeito apresentado.');
  }
}

function validarQuilometragem(km: number, rotulo: string) {
  if (!Number.isInteger(km) || km < 0 || km > QUILOMETRAGEM_MAXIMA) {
    throw new ErroDeValidacao(`${rotulo} precisa ser um número inteiro entre 0 e 9.999.999.`);
  }
}

export function FrotaProvedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoFrota>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'carregando' });

    // Primeiro a fila: o que ficou no aparelho sobe antes de a lista ser lida.
    sincronizarPendentes()
      .catch((erro: unknown) => {
        registrarErro('sincronizar', erro);
      })
      .then(() => Promise.all([carregarVeiculos(), carregarMecanicos(), carregarOrdens()]))
      .then(async ([veiculos, mecanicos, ordens]) => {
        const pendentes = await listarPendentes().catch((erro: unknown) => {
          registrarErro('pendentes', erro);
          return [];
        });
        if (!cancelado) {
          setEstado({ tipo: 'pronto', origem: 'nuvem', veiculos, mecanicos, ordens, pendentes });
        }
      })
      .catch((erro: unknown) => {
        // Sem a nuvem, mostra o que foi guardado no aparelho na última carga.
        const motivo = registrarErro('carga', erro).mensagem;
        Promise.all([listarLocal(), listarPendentes()])
          .then(([local, pendentes]) => {
            if (cancelado) return;
            if (local.veiculos.length > 0 || local.ordens.length > 0 || pendentes.length > 0) {
              setEstado({ tipo: 'pronto', origem: 'aparelho', motivo, ...local, pendentes });
            } else {
              setEstado({ tipo: 'erro', mensagem: motivo });
            }
          })
          .catch((erroLocal: unknown) => {
            registrarErro('leitura do aparelho', erroLocal);
            if (!cancelado) {
              setEstado({ tipo: 'erro', mensagem: motivo });
            }
          });
      });

    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  // Cada versão que veio da nuvem (ou foi alterada nela) fica guardada no aparelho.
  useEffect(() => {
    if (estado.tipo !== 'pronto' || estado.origem !== 'nuvem') return;
    guardarLocal({
      veiculos: estado.veiculos,
      mecanicos: estado.mecanicos,
      ordens: estado.ordens,
    }).catch((erro: unknown) => {
      registrarErro('guardar no aparelho', erro);
    });
  }, [estado]);

  function recarregar() {
    setTentativa((atual) => atual + 1);
  }

  function dadosProntos(): DadosDaFrota {
    if (estado.tipo !== 'pronto') {
      throw new ErroDeValidacao('A frota ainda não foi carregada.');
    }
    return estado;
  }

  async function incluir(dados: DadosNovaOrdemCompleta): Promise<'enviada' | 'pendente'> {
    // A tela já validou; o provedor confere de novo antes de enviar.
    const { veiculos, mecanicos } = dadosProntos();
    if (!veiculos.some((veiculo) => veiculo.id === dados.veiculoId)) {
      throw new ErroDeValidacao('Escolha um veículo cadastrado.');
    }
    if (!mecanicos.some((mecanico) => mecanico.id === dados.mecanicoId)) {
      throw new ErroDeValidacao('Escolha um mecânico cadastrado.');
    }
    validarDescricao(dados.descricao);
    validarCusto(dados.custoEstimado);
    validarQuilometragem(dados.quilometragemNoServico, 'A quilometragem no serviço');

    const { foto, ...campos } = dados;
    try {
      const fotoUrl = await resolverFoto(foto);
      const nova = await incluirOrdem({ ...campos, fotoUrl });
      setEstado((atual) =>
        atual.tipo === 'pronto' ? { ...atual, ordens: [nova, ...atual.ordens] } : atual,
      );
      return 'enviada';
    } catch (erro: unknown) {
      // Recusa do servidor volta para a tela; falta de rede vira pendente no aparelho.
      if (erro instanceof ErroDaApi) {
        throw erro;
      }
      registrarErro('cadastro sem rede', erro);
      const pendente = await guardarPendente({
        ...campos,
        fotoBase64: foto?.tipo === 'nova' ? foto.base64 : null,
        fotoMime: foto?.tipo === 'nova' ? foto.mimeType : null,
      });
      setEstado((atual) =>
        atual.tipo === 'pronto' ? { ...atual, pendentes: [...atual.pendentes, pendente] } : atual,
      );
      return 'pendente';
    }
  }

  async function incluirVeiculo(dados: DadosNovoVeiculo): Promise<Veiculo> {
    const { veiculos } = dadosProntos();
    const anoMaximo = new Date().getFullYear() + 1;
    if (!PLACA_VALIDA.test(dados.placa)) {
      throw new ErroDeValidacao('Informe uma placa válida, como ABC-1234 ou ABC1D23.');
    }
    if (veiculos.some((veiculo) => veiculo.placa.replace('-', '') === dados.placa.replace('-', ''))) {
      throw new ErroDeValidacao('Já existe um veículo com essa placa.');
    }
    if (dados.marca.trim() === '' || dados.modelo.trim() === '') {
      throw new ErroDeValidacao('Informe a marca e o modelo.');
    }
    if (!Number.isInteger(dados.anoFabricacao) || dados.anoFabricacao < 1950 || dados.anoFabricacao > anoMaximo) {
      throw new ErroDeValidacao(`Informe um ano de fabricação entre 1950 e ${anoMaximo}.`);
    }
    validarQuilometragem(dados.quilometragem, 'A quilometragem');
    validarQuilometragem(dados.proximaRevisaoKm, 'A próxima revisão');
    if (dados.proximaRevisaoKm <= dados.quilometragem) {
      throw new ErroDeValidacao('A próxima revisão precisa ser maior que a quilometragem atual.');
    }

    const novo = await enviarVeiculo(dados);
    setEstado((atual) =>
      atual.tipo === 'pronto' ? { ...atual, veiculos: [...atual.veiculos, novo] } : atual,
    );
    return novo;
  }

  async function incluirMecanico(dados: DadosNovoMecanico): Promise<Mecanico> {
    dadosProntos();
    if (dados.nome.trim() === '') {
      throw new ErroDeValidacao('Informe o nome do mecânico.');
    }
    if (!/^\d{10,11}$/.test(dados.telefone)) {
      throw new ErroDeValidacao('O telefone precisa ter DDD e 8 ou 9 dígitos.');
    }

    const novo = await enviarMecanico(dados);
    setEstado((atual) =>
      atual.tipo === 'pronto' ? { ...atual, mecanicos: [...atual.mecanicos, novo] } : atual,
    );
    return novo;
  }

  // Troca a ordem alterada pela versão que o banco devolveu.
  async function editarOrdem(id: string, alteracoes: AlteracoesOrdem): Promise<OrdemServico> {
    if (alteracoes.descricao !== undefined) validarDescricao(alteracoes.descricao);
    if (alteracoes.custoEstimado !== undefined) validarCusto(alteracoes.custoEstimado);
    if (alteracoes.quilometragemNoServico !== undefined) {
      validarQuilometragem(alteracoes.quilometragemNoServico, 'A quilometragem no serviço');
    }

    const atualizada = await atualizarOrdem(id, alteracoes);
    setEstado((atual) =>
      atual.tipo === 'pronto'
        ? {
            ...atual,
            ordens: atual.ordens.map((ordem) => (ordem.id === id ? atualizada : ordem)),
          }
        : atual,
    );
    return atualizada;
  }

  async function excluirOrdem(id: string): Promise<void> {
    const ordem = dadosProntos().ordens.find((item) => item.id === id);
    if (ordem === undefined || (ordem.status !== 'aberta' && ordem.status !== 'cancelada')) {
      throw new ErroDeValidacao('Só ordens abertas ou canceladas podem ser excluídas.');
    }

    await apagarOrdem(id);
    setEstado((atual) =>
      atual.tipo === 'pronto'
        ? { ...atual, ordens: atual.ordens.filter((item) => item.id !== id) }
        : atual,
    );
  }

  async function atualizarStatus(id: string, status: StatusOrdemServico): Promise<void> {
    await editarOrdem(id, {
      status,
      dataConclusao: status === 'concluida' ? new Date().toISOString() : null,
    });
  }

  return (
    <FrotaContexto.Provider
      value={{
        estado,
        recarregar,
        incluir,
        incluirVeiculo,
        incluirMecanico,
        atualizarStatus,
        editarOrdem,
        excluirOrdem,
      }}
    >
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
