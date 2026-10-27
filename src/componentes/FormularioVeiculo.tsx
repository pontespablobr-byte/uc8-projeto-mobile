import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

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
        placeholderTextColor={cores.textoSecundario}
      />
      <TextInput
        style={styles.campo}
        value={placa}
        onChangeText={setPlaca}
        placeholder="Placa"
        placeholderTextColor={cores.textoSecundario}
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
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    color: cores.texto,
    borderRadius: raio,
    padding: espacos.sm,
    marginBottom: espacos.sm,
  },
  botao: {
    backgroundColor: cores.destaque,
    borderRadius: raio,
    paddingVertical: 10,
    alignItems: 'center',
  },
  textoBotao: {
    color: cores.textoSobreDestaque,
    fontWeight: 'bold',
  },
});