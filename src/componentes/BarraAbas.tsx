import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos } from '../tema/tema';

export type Aba = 'veiculos' | 'ordens' | 'nova';

interface BarraAbasProps {
  abaAtual: Aba;
  aoMudar: (aba: Aba) => void;
}

const abas: { chave: Aba; rotulo: string }[] = [
  { chave: 'veiculos', rotulo: 'Veículos' },
  { chave: 'ordens', rotulo: 'Ordens' },
  { chave: 'nova', rotulo: 'Nova OS' },
];

export function BarraAbas({ abaAtual, aoMudar }: BarraAbasProps) {
  return (
    <View style={estilos.barra}>
      {abas.map((aba) => {
        const ativa = aba.chave === abaAtual;
        return (
          <Pressable
            key={aba.chave}
            onPress={() => aoMudar(aba.chave)}
            style={[estilos.aba, ativa && estilos.abaAtiva]}
          >
            <Text style={[estilos.texto, ativa && estilos.textoAtivo]}>
              {aba.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  aba: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: espacos.md - 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  abaAtiva: {
    borderBottomColor: cores.destaque,
  },
  texto: {
    color: cores.textoSecundario,
    fontSize: 15,
  },
  textoAtivo: {
    color: cores.destaque,
    fontWeight: 'bold',
  },
});
