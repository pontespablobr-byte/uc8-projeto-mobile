import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { EstadoFrota } from '../contexto/FrotaContexto';
import { cores, espacos, raio } from '../tema/tema';

interface AvisoEstadoFrotaProps {
  estado: Exclude<EstadoFrota, { tipo: 'pronto' }>;
  aoTentarDeNovo: () => void;
}

export function AvisoEstadoFrota({ estado, aoTentarDeNovo }: AvisoEstadoFrotaProps) {
  switch (estado.tipo) {
    case 'carregando':
      return (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" color={cores.destaque} />
          <Text style={estilos.detalhe}>Carregando a frota...</Text>
        </View>
      );
    case 'erro':
      return (
        <View style={estilos.centro}>
          <Text style={estilos.erro}>Não foi possível carregar a frota.</Text>
          <Text style={estilos.detalhe}>{estado.mensagem}</Text>
          <Pressable style={estilos.botao} onPress={aoTentarDeNovo}>
            <Text style={estilos.textoBotao}>Tentar de novo</Text>
          </Pressable>
        </View>
      );
  }
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.sm,
    padding: espacos.md,
  },
  erro: {
    color: cores.erro,
    fontWeight: 'bold',
  },
  detalhe: {
    color: cores.textoSecundario,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: cores.destaque,
    borderRadius: raio,
    paddingVertical: espacos.sm + 4,
    paddingHorizontal: espacos.lg,
    marginTop: espacos.sm,
  },
  textoBotao: {
    color: cores.textoSobreDestaque,
    fontWeight: 'bold',
  },
});
