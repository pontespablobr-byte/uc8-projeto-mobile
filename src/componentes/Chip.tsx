import { Pressable, StyleSheet, Text } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

interface ChipProps {
  rotulo: string;
  ativo: boolean;
  aoTocar: () => void;
}

export function Chip({ rotulo, ativo, aoTocar }: ChipProps) {
  return (
    <Pressable
      onPress={aoTocar}
      style={[estilos.chip, ativo && estilos.chipAtivo]}
    >
      <Text style={[estilos.texto, ativo && estilos.textoAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    borderRadius: raio,
    paddingHorizontal: espacos.sm + 4,
    paddingVertical: espacos.sm,
  },
  chipAtivo: {
    borderColor: cores.destaque,
    backgroundColor: cores.destaque,
  },
  texto: {
    color: cores.texto,
    fontSize: 13,
  },
  textoAtivo: {
    color: cores.textoSobreDestaque,
    fontWeight: 'bold',
  },
});
