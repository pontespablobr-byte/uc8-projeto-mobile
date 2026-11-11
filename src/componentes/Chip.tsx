import { Pressable, StyleSheet, Text } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

interface ChipProps {
  rotulo: string;
  ativo: boolean;
  aoTocar: () => void;
  // Para grades de largura igual: menos folga e a altura inteira da célula.
  compacto?: boolean;
}

export function Chip({ rotulo, ativo, aoTocar, compacto = false }: ChipProps) {
  return (
    <Pressable
      onPress={aoTocar}
      style={[estilos.chip, compacto && estilos.compacto, ativo && estilos.chipAtivo]}
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
  compacto: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: espacos.xs,
  },
  chipAtivo: {
    borderColor: cores.destaque,
    backgroundColor: cores.destaque,
  },
  texto: {
    color: cores.texto,
    fontSize: 13,
    textAlign: 'center',
  },
  textoAtivo: {
    color: cores.textoSobreDestaque,
    fontWeight: 'bold',
  },
});
