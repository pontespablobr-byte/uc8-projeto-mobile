import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

interface CampoProps extends TextInputProps {
  rotulo: string;
  erro?: string;
}

export function Campo({ rotulo, erro, style, editable, ...resto }: CampoProps) {
  const desabilitado = editable === false;

  return (
    <View>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        style={[
          estilos.campo,
          erro !== undefined && estilos.campoComErro,
          desabilitado && estilos.campoDesabilitado,
          style,
        ]}
        placeholderTextColor={cores.textoSecundario}
        editable={editable}
        accessibilityLabel={rotulo}
        accessibilityHint={erro}
        {...resto}
      />
      {erro !== undefined && <Text style={estilos.erro}>{erro}</Text>}
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
  campoComErro: {
    borderColor: cores.erro,
  },
  campoDesabilitado: {
    opacity: 0.5,
  },
  erro: {
    color: cores.erro,
    fontSize: 13,
    marginTop: espacos.xs,
  },
});
