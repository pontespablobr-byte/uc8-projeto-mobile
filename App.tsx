import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BarraAbas } from './src/componentes/BarraAbas';
import { Cabecalho } from './src/componentes/Cabecalho';
import type { Aba } from './src/componentes/BarraAbas';
import { FrotaProvedor } from './src/contexto/FrotaContexto';
import { TelaDetalheOrdem } from './src/telas/TelaDetalheOrdem';
import { TelaEditarOrdem } from './src/telas/TelaEditarOrdem';
import { TelaNovaOrdem } from './src/telas/TelaNovaOrdem';
import { TelaNovoMecanico } from './src/telas/TelaNovoMecanico';
import { TelaNovoVeiculo } from './src/telas/TelaNovoVeiculo';
import { TelaOrdens } from './src/telas/TelaOrdens';
import { TelaRelatorios } from './src/telas/TelaRelatorios';
import { TelaSobre } from './src/telas/TelaSobre';
import { TelaVeiculos } from './src/telas/TelaVeiculos';
import { cores } from './src/tema/tema';

export default function App() {
  const [aba, setAba] = useState<Aba>('veiculos');
  const [ordemSelecionadaId, setOrdemSelecionadaId] = useState<string | null>(null);
  const [cadastro, setCadastro] = useState<'veiculo' | 'mecanico' | null>(null);
  const [editando, setEditando] = useState(false);

  function mudarAba(novaAba: Aba) {
    setAba(novaAba);
    setOrdemSelecionadaId(null);
    setCadastro(null);
    setEditando(false);
  }

  function renderizarConteudo() {
    if (cadastro === 'veiculo') {
      return <TelaNovoVeiculo aoVoltar={() => setCadastro(null)} />;
    }
    if (cadastro === 'mecanico') {
      return <TelaNovoMecanico aoVoltar={() => setCadastro(null)} />;
    }
    if (ordemSelecionadaId !== null && editando) {
      return (
        <TelaEditarOrdem ordemId={ordemSelecionadaId} aoVoltar={() => setEditando(false)} />
      );
    }
    if (ordemSelecionadaId !== null) {
      return (
        <TelaDetalheOrdem
          ordemId={ordemSelecionadaId}
          aoVoltar={() => setOrdemSelecionadaId(null)}
          aoEditar={() => setEditando(true)}
        />
      );
    }
    return renderizarAba();
  }

  function renderizarAba() {
    if (aba === 'veiculos') {
      return (
        <TelaVeiculos
          aoNovoVeiculo={() => setCadastro('veiculo')}
          aoNovoMecanico={() => setCadastro('mecanico')}
        />
      );
    }
    if (aba === 'ordens') {
      return <TelaOrdens aoSelecionarOrdem={(ordem) => setOrdemSelecionadaId(ordem.id)} />;
    }
    if (aba === 'relatorios') {
      return <TelaRelatorios />;
    }
    if (aba === 'sobre') {
      return <TelaSobre />;
    }
    return <TelaNovaOrdem aoCriar={() => setAba('ordens')} />;
  }

  return (
    <SafeAreaProvider>
      <FrotaProvedor>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar style="light" />

          <Cabecalho />

          <View style={styles.conteudo}>{renderizarConteudo()}</View>

          <BarraAbas abaAtual={aba} aoMudar={mudarAba} />
        </SafeAreaView>
      </FrotaProvedor>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flex: 1,
  },
});
