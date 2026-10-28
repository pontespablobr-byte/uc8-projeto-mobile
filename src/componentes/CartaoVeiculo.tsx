import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';
import type { Veiculo } from '../types';
import { formatarPlaca, formatarQuilometragem } from '../utils/formatar';
import { BadgeStatus } from './BadgeStatus';

interface CartaoVeiculoProps {
  veiculo: Veiculo;
  aoTocar?: () => void;
}

export function CartaoVeiculo({ veiculo, aoTocar }: CartaoVeiculoProps) {
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
        <BadgeStatus status={veiculo.status} />
      </View>

      <View style={estilos.rodape}>
        <Text style={estilos.texto}>
          {formatarQuilometragem(veiculo.quilometragem)}
        </Text>
        <Text style={estilos.texto}>
          Próxima revisão: {formatarQuilometragem(veiculo.proximaRevisaoKm)}
        </Text>
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
    marginTop: espacos.sm,
    gap: espacos.xs,
  },
  texto: {
    fontSize: 14,
    color: cores.texto,
  },
});
