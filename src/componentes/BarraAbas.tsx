import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { cores, espacos } from '../tema/tema';

export type Aba = 'veiculos' | 'ordens' | 'nova' | 'relatorios' | 'sobre';

interface BarraAbasProps {
  abaAtual: Aba;
  aoMudar: (aba: Aba) => void;
}

const abas: { chave: Aba; rotulo: string }[] = [
  { chave: 'veiculos', rotulo: 'Veículos' },
  { chave: 'ordens', rotulo: 'Ordens' },
  { chave: 'nova', rotulo: 'Nova OS' },
  { chave: 'relatorios', rotulo: 'Relatórios' },
  { chave: 'sobre', rotulo: 'Sobre' },
];

// Ícones em traço, desenhados num quadro de 24 x 24.
function IconeAba({ aba, cor }: { aba: Aba; cor: string }) {
  const traco = { stroke: cor, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {aba === 'veiculos' && (
        <>
          <Path d="M3 16v-3l2-5.2A2 2 0 0 1 6.9 6.5h10.2a2 2 0 0 1 1.9 1.3L21 13v3z" {...traco} />
          <Path d="M3 13h18" {...traco} />
          <Circle cx={7.5} cy={17} r={2} fill={cor} />
          <Circle cx={16.5} cy={17} r={2} fill={cor} />
        </>
      )}
      {aba === 'ordens' && (
        <>
          <Rect x={5} y={4} width={14} height={17} rx={2} {...traco} />
          <Rect x={9} y={2} width={6} height={4} rx={1} {...traco} />
          <Path d="M9 11h6M9 15h4" {...traco} />
        </>
      )}
      {aba === 'nova' && (
        <>
          <Circle cx={12} cy={12} r={9} {...traco} />
          <Path d="M12 8v8M8 12h8" {...traco} />
        </>
      )}
      {aba === 'relatorios' && (
        <>
          <Path d="M4 20h16" {...traco} />
          <Rect x={6} y={12} width={3} height={8} rx={0.5} {...traco} />
          <Rect x={10.5} y={6} width={3} height={14} rx={0.5} {...traco} />
          <Rect x={15} y={9} width={3} height={11} rx={0.5} {...traco} />
        </>
      )}
      {aba === 'sobre' && (
        <>
          <Circle cx={12} cy={12} r={9} {...traco} />
          <Path d="M12 11v6" {...traco} />
          <Circle cx={12} cy={7.5} r={1.3} fill={cor} />
        </>
      )}
    </Svg>
  );
}

export function BarraAbas({ abaAtual, aoMudar }: BarraAbasProps) {
  const margens = useSafeAreaInsets();
  const [tecladoAberto, setTecladoAberto] = useState(false);

  // No Android o teclado empurra a tela para cima; a barra some para não ficar em cima dele.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const aoAbrir = Keyboard.addListener('keyboardDidShow', () => setTecladoAberto(true));
    const aoFechar = Keyboard.addListener('keyboardDidHide', () => setTecladoAberto(false));
    return () => {
      aoAbrir.remove();
      aoFechar.remove();
    };
  }, []);

  if (tecladoAberto) return null;

  return (
    <View
      style={[estilos.barra, { paddingBottom: Math.max(margens.bottom, espacos.sm) }]}
      accessibilityRole="tablist"
    >
      {abas.map((aba) => {
        const ativa = aba.chave === abaAtual;
        const cor = ativa ? cores.destaque : cores.textoSecundario;
        return (
          <Pressable
            key={aba.chave}
            onPress={() => aoMudar(aba.chave)}
            style={({ pressed }) => [estilos.aba, pressed && estilos.pressionada]}
            accessibilityRole="tab"
            aria-selected={ativa}
            accessibilityLabel={aba.rotulo}
          >
            <View style={[estilos.fundoIcone, ativa && estilos.fundoIconeAtivo]}>
              <IconeAba aba={aba.chave} cor={cor} />
            </View>
            <Text
              style={[estilos.texto, ativa && estilos.textoAtivo]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
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
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: espacos.sm,
  },
  aba: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 2,
  },
  pressionada: {
    opacity: 0.7,
  },
  fundoIcone: {
    width: 52,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundoIconeAtivo: {
    backgroundColor: cores.destaqueFraco,
  },
  texto: {
    color: cores.textoSecundario,
    fontSize: 11,
  },
  textoAtivo: {
    color: cores.destaque,
    fontWeight: 'bold',
  },
});
