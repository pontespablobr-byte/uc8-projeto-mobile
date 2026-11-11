import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

interface CampoProps extends TextInputProps {
  rotulo: string;
}

export function Campo({ rotulo, style, ...resto }: CampoProps) {
  return (
    <View>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        style={[estilos.campo, style]}
        placeholderTextColor={cores.textoSecundario}
        {...resto}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  rotulo: {
    color: cores.destaque,
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: espacos.md,
    marginBottom: espacos.sm,
  },
  campo: {
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    color: cores.texto,
    borderRadius: raio,
    padding: espacos.sm + 4,
  },
});
