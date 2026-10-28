import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { CartaoVeiculo } from '../componentes/CartaoVeiculo';
import { cores, espacos, raio } from '../tema/tema';
import type { Veiculo } from '../types';

interface TelaVeiculosProps {
  veiculos: Veiculo[];
}

function semSeparadores(texto: string): string {
  return texto.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function TelaVeiculos({ veiculos }: TelaVeiculosProps) {
  const [busca, setBusca] = useState('');

  const termo = semSeparadores(busca);
  const filtrados = veiculos.filter(
    (veiculo) =>
      semSeparadores(veiculo.placa).includes(termo) ||
      semSeparadores(veiculo.modelo).includes(termo),
  );

  return (
    <View style={estilos.tela}>
      <TextInput
        style={estilos.busca}
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar por placa ou modelo"
        placeholderTextColor={cores.textoSecundario}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={estilos.contador}>
        {filtrados.length} {filtrados.length === 1 ? 'veículo' : 'veículos'}
      </Text>
      <FlatList
        data={filtrados}
        keyExtractor={(veiculo) => veiculo.id}
        renderItem={({ item }) => <CartaoVeiculo veiculo={item} />}
        ListEmptyComponent={
          <Text style={estilos.vazio}>Nenhum veículo encontrado.</Text>
        }
        contentContainerStyle={estilos.lista}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
  },
  busca: {
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    color: cores.texto,
    borderRadius: raio,
    padding: espacos.sm + 4,
  },
  contador: {
    color: cores.textoSecundario,
    marginVertical: espacos.sm,
  },
  lista: {
    paddingBottom: espacos.lg,
  },
  vazio: {
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacos.lg,
  },
});
