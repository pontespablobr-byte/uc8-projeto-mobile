import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BarraAbas } from './src/componentes/BarraAbas';
import { Cabecalho } from './src/componentes/Cabecalho';
import type { Aba } from './src/componentes/BarraAbas';
import { carregarMecanicos } from './src/servicos/mecanicos';
import { carregarOrdens, incluirOrdem } from './src/servicos/ordensServico';
import { carregarVeiculos } from './src/servicos/veiculos';
import type { DadosNovaOrdem } from './src/componentes/FormularioOrdemServico';
import { TelaDetalheOrdem } from './src/telas/TelaDetalheOrdem';
import { TelaNovaOrdem } from './src/telas/TelaNovaOrdem';
import { TelaOrdens } from './src/telas/TelaOrdens';
import { TelaVeiculos } from './src/telas/TelaVeiculos';
import { cores, espacos } from './src/tema/tema';
import type {
  Mecanico,
  OrdemServico,
  StatusOrdemServico,
  Veiculo,
} from './src/types';

export default function App() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>('veiculos');
  // Guarda só o id: assim o detalhe sempre mostra a ordem atualizada.
  const [ordemSelecionadaId, setOrdemSelecionadaId] = useState<string | null>(null);

  const ordemSelecionada = ordens.find((ordem) => ordem.id === ordemSelecionadaId);

  useEffect(() => {
    Promise.all([carregarVeiculos(), carregarMecanicos(), carregarOrdens()])
      .then(([veiculosCarregados, mecanicosCarregados, ordensCarregadas]) => {
        setVeiculos(veiculosCarregados);
        setMecanicos(mecanicosCarregados);
        setOrdens(ordensCarregadas);
      })
      .catch((erro: unknown) => {
        setErroCarga(erro instanceof Error ? erro.message : 'Erro desconhecido');
      })
      .finally(() => setCarregando(false));
  }, []);

  function mudarAba(novaAba: Aba) {
    setAba(novaAba);
    setOrdemSelecionadaId(null);
  }

  function atualizarStatusOrdem(id: string, status: StatusOrdemServico) {
    setOrdens((atuais) =>
      atuais.map((ordem) => {
        if (ordem.id !== id || ordem.status === status) return ordem;
        return {
          ...ordem,
          status,
          dataConclusao: status === 'concluida' ? new Date().toISOString() : null,
        };
      }),
    );
  }

  async function criarOrdem(dados: DadosNovaOrdem): Promise<void> {
    const veiculo = veiculos.find((item) => item.id === dados.veiculoId);

    // O banco define o id, o status inicial e a data de abertura.
    const nova = await incluirOrdem({
      ...dados,
      quilometragemNoServico: veiculo ? veiculo.quilometragem : 0,
    });

    setOrdens((atuais) => [nova, ...atuais]);
    setAba('ordens');
  }

  // Ordem de prioridade: detalhe da OS, depois a tela da aba atual.
  function renderizarConteudo() {
    if (ordemSelecionada) {
      return (
        <TelaDetalheOrdem
          ordem={ordemSelecionada}
          veiculo={veiculos.find((veiculo) => veiculo.id === ordemSelecionada.veiculoId)}
          mecanico={mecanicos.find((mecanico) => mecanico.id === ordemSelecionada.mecanicoId)}
          aoVoltar={() => setOrdemSelecionadaId(null)}
          aoAtualizarStatus={(status) => atualizarStatusOrdem(ordemSelecionada.id, status)}
        />
      );
    }
    return renderizarAba();
  }

  function renderizarAba() {
    if (aba === 'veiculos') {
      return <TelaVeiculos veiculos={veiculos} />;
    }
    if (aba === 'ordens') {
      return (
        <TelaOrdens
          ordens={ordens}
          veiculos={veiculos}
          mecanicos={mecanicos}
          aoSelecionarOrdem={(ordem) => setOrdemSelecionadaId(ordem.id)}
        />
      );
    }
    return (
      <TelaNovaOrdem
        veiculos={veiculos}
        mecanicos={mecanicos}
        aoCriar={criarOrdem}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <Cabecalho />

        <BarraAbas abaAtual={aba} aoMudar={mudarAba} />

        {carregando ? (
          <Text style={styles.aviso}>Carregando a frota...</Text>
        ) : erroCarga !== null ? (
          <Text style={styles.aviso}>Não foi possível carregar: {erroCarga}</Text>
        ) : (
          renderizarConteudo()
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  aviso: {
    marginTop: espacos.lg,
    textAlign: 'center',
    color: cores.textoSecundario,
  },
});
