import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface NovoVeiculo {
  modelo: string;
  placa: string;
}

interface FormularioVeiculoProps {
  aoCriar: (dados: NovoVeiculo) => void;
}

export function FormularioVeiculo({ aoCriar }: FormularioVeiculoProps) {
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');

  function tratarEnvio() {
    aoCriar({ modelo, placa });
    setModelo('');
    setPlaca('');
  }

  return (
    <View style={styles.formulario}>
      <TextInput
        style={styles.campo}
        value={modelo}
        onChangeText={setModelo}
        placeholder="Modelo"
      />
      <TextInput
        style={styles.campo}
        value={placa}
        onChangeText={setPlaca}
        placeholder="Placa"
      />
      <Pressable style={styles.botao} onPress={tratarEnvio}>
        <Text style={styles.textoBotao}>Adicionar veículo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  formulario: {
    marginBottom: 16,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  botao: {
    backgroundColor: '#1d4ed8',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
