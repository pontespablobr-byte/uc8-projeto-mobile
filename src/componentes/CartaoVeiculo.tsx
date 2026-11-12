import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { cores, espacos, raio } from '../tema/tema';
import type { Veiculo } from '../types';
import { formatarPlaca, formatarQuilometragem } from '../utils/formatar';
import { BadgeStatus } from './BadgeStatus';

interface CartaoVeiculoProps {
  veiculo: Veiculo;
  aoTocar?: () => void;
  aoExcluir?: () => void;
  exclusaoDesabilitada?: boolean;
}

export function CartaoVeiculo({
  veiculo,
  aoTocar,
  aoExcluir,
  exclusaoDesabilitada = false,
}: CartaoVeiculoProps) {
  return (
    <Pressable
      onPress={aoTocar}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      <View style={estilos.linha}>
        <View style={estilos.coluna}>
          <Text style={estilos.titulo}>{veiculo.modelo}</Text>
          <Text style={estilos.subtitulo}>
            {veiculo.marca} · {formatarPlaca(veiculo.placa)}
          </Text>
        </View>
        <BadgeStatus status="ativo" />
      </View>

      <View style={estilos.rodape}>
        <View style={estilos.coluna}>
          <Text style={estilos.texto}>{formatarQuilometragem(veiculo.quilometragem)}</Text>
          <Text style={estilos.texto}>
            Próxima revisão: {formatarQuilometragem(veiculo.proximaRevisaoKm)}
          </Text>
        </View>
        {aoExcluir && (
          <Pressable
            onPress={aoExcluir}
            disabled={exclusaoDesabilitada}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Excluir veículo ${veiculo.modelo}`}
            style={({ pressed }) => [
              estilos.excluir,
              (pressed || exclusaoDesabilitada) && estilos.excluirApagado,
            ]}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path
                d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"
                stroke={cores.erro}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={estilos.textoExcluir}>Excluir</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    padding: espacos.md,
    marginBottom: espacos.sm,
  },
  pressionado: {
    borderColor: cores.destaque,
    backgroundColor: cores.superficieAlta,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
  },
  coluna: {
    flex: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.texto,
  },
  subtitulo: {
    color: cores.textoSecundario,
    marginTop: espacos.xs,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espacos.sm,
    marginTop: espacos.sm,
  },
  texto: {
    fontSize: 14,
    color: cores.texto,
    marginTop: espacos.xs,
  },
  excluir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    paddingVertical: espacos.xs,
  },
  excluirApagado: {
    opacity: 0.5,
  },
  textoExcluir: {
    color: cores.erro,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
