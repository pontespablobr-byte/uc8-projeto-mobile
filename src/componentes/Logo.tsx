import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { cores } from '../tema/tema';

interface LogoProps {
  tamanho?: number;
}

// Logo do app: um carro esportivo de perfil, com faróis acesos, rodando
// numa estrada tracejada, sobre o quadrado amarelo do tema.
export function Logo({ tamanho = 52 }: LogoProps) {
  const escuro = cores.textoSobreDestaque;
  const claro = cores.destaque;

  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
      <Rect width="64" height="64" rx="16" fill={claro} />

      {/* linhas de velocidade */}
      <Rect x="5" y="27" width="9" height="2.4" rx="1.2" fill={escuro} opacity={0.35} />
      <Rect x="3" y="33" width="11" height="2.4" rx="1.2" fill={escuro} opacity={0.35} />

      {/* carroceria */}
      <Path
        d="M12 44 L12 38 Q12 35 15 34.5 L23 33 L28 25.5 Q29.3 24 31.3 24 L42 24 Q44 24 45.4 25.4 L51 32.5 L56 34 Q59 35 59 38 L59 44 Z"
        fill={escuro}
      />
      {/* janelas */}
      <Path d="M29.6 32 L32.6 27 L38.5 27 L38.5 32 Z" fill={claro} />
      <Path d="M41 27 L43 27 L47.4 32 L41 32 Z" fill={claro} />
      {/* farol e lanterna */}
      <Path d="M54.5 36 L57.5 36.6 L57.5 38.6 L54.5 38.2 Z" fill={claro} />
      <Rect x="12" y="37" width="3" height="2" rx="1" fill={claro} />

      {/* rodas */}
      <Circle cx="23" cy="45" r="7" fill={escuro} stroke={claro} strokeWidth="2.4" />
      <Circle cx="23" cy="45" r="2.2" fill={claro} />
      <Circle cx="49" cy="45" r="7" fill={escuro} stroke={claro} strokeWidth="2.4" />
      <Circle cx="49" cy="45" r="2.2" fill={claro} />

      {/* estrada */}
      <Rect x="10" y="54" width="10" height="2.6" rx="1.3" fill={escuro} />
      <Rect x="27" y="54" width="10" height="2.6" rx="1.3" fill={escuro} />
      <Rect x="44" y="54" width="10" height="2.6" rx="1.3" fill={escuro} />
    </Svg>
  );
}
