import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BarraAbas } from './src/componentes/BarraAbas';
import { Cabecalho } from './src/componentes/Cabecalho';
import type { Aba } from './src/componentes/BarraAbas';
import { FrotaProvedor } from './src/contexto/FrotaContexto';
import { TelaDetalheOrdem } from './src/telas/TelaDetalheOrdem';
import { TelaNovaOrdem } from './src/telas/TelaNovaOrdem';
import { TelaOrdens } from './src/telas/TelaOrdens';
import { TelaVeiculos } from './src/telas/TelaVeiculos';
import { cores } from './src/tema/tema';

export default function App() {
  const [aba, setAba] = useState<Aba>('veiculos');
  // Guarda só o id: assim o detalhe sempre mostra a ordem atualizada.
  const [ordemSelecionadaId, setOrdemSelecionadaId] = useState<string | null>(null);

  function mudarAba(novaAba: Aba) {
    setAba(novaAba);
    setOrdemSelecionadaId(null);
  }

  // Ordem de prioridade: detalhe da OS, depois a tela da aba atual.
  function renderizarConteudo() {
    if (ordemSelecionadaId !== null) {
      return (
        <TelaDetalheOrdem
          ordemId={ordemSelecionadaId}
          aoVoltar={() => setOrdemSelecionadaId(null)}
        />
      );
    }
    return renderizarAba();
  }

  function renderizarAba() {
    if (aba === 'veiculos') {
      return <TelaVeiculos />;
    }
    if (aba === 'ordens') {
      return <TelaOrdens aoSelecionarOrdem={(ordem) => setOrdemSelecionadaId(ordem.id)} />;
    }
    return <TelaNovaOrdem aoCriar={() => setAba('ordens')} />;
  }

  return (
    <SafeAreaProvider>
      <FrotaProvedor>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />

          <Cabecalho />

          <BarraAbas abaAtual={aba} aoMudar={mudarAba} />

          {renderizarConteudo()}
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
});
