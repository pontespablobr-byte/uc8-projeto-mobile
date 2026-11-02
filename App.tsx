import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BarraAbas } from './src/componentes/BarraAbas';
import type { Aba } from './src/componentes/BarraAbas';
import { carregarMecanicos } from './src/servicos/mecanicos';
import { carregarOrdens } from './src/servicos/ordensServico';
import { carregarVeiculos } from './src/servicos/veiculos';
import { TelaDetalheOrdem } from './src/telas/TelaDetalheOrdem';
import { TelaOrdens } from './src/telas/TelaOrdens';
import { TelaVeiculos } from './src/telas/TelaVeiculos';
import { cores, espacos, raio } from './src/tema/tema';
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
  const [aba, setAba] = useState<Aba>('veiculos');
  // Guarda só o id: assim o detalhe sempre mostra a ordem atualizada.
  const [ordemSelecionadaId, setOrdemSelecionadaId] = useState<string | null>(null);

  const ordemSelecionada = ordens.find((ordem) => ordem.id === ordemSelecionadaId);

  useEffect(() => {
    Promise.all([carregarVeiculos(), carregarMecanicos(), carregarOrdens()]).then(
      ([veiculosCarregados, mecanicosCarregados, ordensCarregadas]) => {
        setVeiculos(veiculosCarregados);
        setMecanicos(mecanicosCarregados);
        setOrdens(ordensCarregadas);
        setCarregando(false);
      },
    );
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
      <Text style={styles.aviso}>
        A tela de nova ordem de serviço entra no Passo 6.
      </Text>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.topo}>
          <View style={styles.selo}>
            <Text style={styles.textoSelo}>GM</Text>
          </View>
          <View>
            <Text style={styles.titulo}>Gestão de Manutenção</Text>
            <Text style={styles.subtitulo}>Preventiva e corretiva de veículos</Text>
          </View>
        </View>

        <BarraAbas abaAtual={aba} aoMudar={mudarAba} />

        {carregando ? (
          <Text style={styles.aviso}>Carregando a frota...</Text>
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
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md - 4,
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
    paddingBottom: espacos.md,
  },
  selo: {
    width: 44,
    height: 44,
    borderRadius: raio,
    backgroundColor: cores.destaque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSelo: {
    color: cores.textoSobreDestaque,
    fontWeight: 'bold',
    fontSize: 16,
  },
  titulo: {
    color: cores.texto,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 13,
  },
  aviso: {
    marginTop: espacos.lg,
    textAlign: 'center',
    color: cores.textoSecundario,
  },
});
