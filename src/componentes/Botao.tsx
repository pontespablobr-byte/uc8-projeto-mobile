import { Pressable, StyleSheet, Text } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';

type Variante = 'primario' | 'secundario' | 'perigo' | 'perigoForte';

interface BotaoProps {
  titulo: string;
  aoPressionar: () => void;
  variante?: Variante;
  desabilitado?: boolean;
}

export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  desabilitado = false,
}: BotaoProps) {
  return (
    <Pressable
      onPress={aoPressionar}
      disabled={desabilitado}
      style={({ pressed }) => [
        estilos.botao,
        estilos[variante],
        pressed && estilos.pressionado,
        desabilitado && estilos.desabilitado,
      ]}
    >
      <Text style={[estilos.texto, estilos[`texto_${variante}`]]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    borderWidth: 1,
    borderRadius: raio,
    paddingVertical: espacos.sm + 4,
    paddingHorizontal: espacos.sm,
    alignItems: 'center',
  },
  primario: {
    backgroundColor: cores.destaque,
    borderColor: cores.destaque,
  },
  secundario: {
    backgroundColor: cores.superficie,
    borderColor: cores.destaque,
  },
  perigo: {
    backgroundColor: cores.superficie,
    borderColor: cores.erro,
  },
  perigoForte: {
    backgroundColor: cores.erro,
    borderColor: cores.erro,
  },
  pressionado: {
    opacity: 0.8,
  },
  desabilitado: {
    opacity: 0.5,
  },
  texto: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  texto_primario: {
    color: cores.textoSobreDestaque,
  },
  texto_secundario: {
    color: cores.destaque,
  },
  texto_perigo: {
    color: cores.erro,
  },
  texto_perigoForte: {
    color: cores.textoSobreDestaque,
  },
});
