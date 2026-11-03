import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { cores, espacos } from '../tema/tema';
import { Logo } from './Logo';

// Faixa de risco de oficina (a mesma assinatura visual do projeto desktop):
// um padrão de listras amarelas inclinadas que se repete na largura toda.
function FaixaDeRisco() {
  return (
    <Svg width="100%" height={6}>
      <Defs>
        <Pattern id="risco" width={14} height={6} patternUnits="userSpaceOnUse">
          <Path d="M0 6 L6 0 L12 0 L6 6 Z" fill={cores.destaque} />
        </Pattern>
      </Defs>
      <Rect width="100%" height={6} fill="url(#risco)" />
    </Svg>
  );
}

export function Cabecalho() {
  return (
    <View>
      <View style={estilos.faixa}>
        <FaixaDeRisco />
      </View>

      <View style={estilos.linha}>
        <Logo tamanho={56} />
        <View style={estilos.textos}>
          <Text style={estilos.titulo}>GESTÃO</Text>
          <Text style={estilos.etiqueta}>PREVENTIVA & CORRETIVA</Text>
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    marginHorizontal: espacos.md,
    marginTop: espacos.sm,
    borderRadius: 3,
    overflow: 'hidden',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
    paddingBottom: espacos.md,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    color: cores.texto,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 4,
    lineHeight: 34,
  },
  etiqueta: {
    color: cores.destaque,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2.5,
    marginTop: 2,
  },
});
