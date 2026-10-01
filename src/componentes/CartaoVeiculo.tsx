import { StyleSheet, Text, View } from 'react-native';
import type { Veiculo } from '../types';

interface CartaoVeiculoProps {
  veiculo: Veiculo;
}

export function CartaoVeiculo({ veiculo }: CartaoVeiculoProps) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.titulo}>{veiculo.modelo}</Text>
      <Text style={styles.texto}>
        {veiculo.marca} · {veiculo.placa}
      </Text>
      <Text style={styles.texto}>{veiculo.quilometragem} km</Text>
      <Text style={styles.texto}>Status: {veiculo.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  texto: {
    fontSize: 14,
    color: '#333',
  },
});
