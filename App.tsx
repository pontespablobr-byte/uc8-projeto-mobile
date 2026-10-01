import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CartaoVeiculo } from './src/componentes/CartaoVeiculo';
import { FormularioVeiculo } from './src/componentes/FormularioVeiculo';
import { carregarVeiculos } from './src/servicos/veiculos';
import type { Veiculo } from './src/types';

export default function App() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarVeiculos().then((resultado) => {
      setVeiculos(resultado);
      setCarregando(false);
    });
  }, []);

  function tratarNovoVeiculo(dados: { modelo: string; placa: string }) {
    const maiorId = veiculos.reduce(
      (maior, veiculo) => Math.max(maior, Number(veiculo.id)),
      0,
    );

    const novo: Veiculo = {
      id: String(maiorId + 1),
      placa: dados.placa,
      marca: '',
      modelo: dados.modelo,
      anoFabricacao: new Date().getFullYear(),
      combustivel: 'flex',
      quilometragem: 0,
      proximaRevisaoKm: 10000,
      status: 'ativo',
    };

    setVeiculos((atuais) => [...atuais, novo]);
  }

  return (
    <View style={styles.container}>
      <FormularioVeiculo aoCriar={tratarNovoVeiculo} />

      {carregando ? (
        <Text style={styles.aviso}>Carregando a frota...</Text>
      ) : (
        <FlatList
          data={veiculos}
          keyExtractor={(veiculo) => veiculo.id}
          renderItem={({ item }) => <CartaoVeiculo veiculo={item} />}
          ListEmptyComponent={
            <Text style={styles.aviso}>Nenhum veículo na frota.</Text>
          }
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  lista: {
    paddingBottom: 24,
  },
  aviso: {
    marginTop: 24,
    textAlign: 'center',
  },
});
