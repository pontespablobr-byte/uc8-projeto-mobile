import { StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';
import type { StatusOrdemServico, StatusVeiculo } from '../types';

type Status = StatusVeiculo | StatusOrdemServico;
type Variante = 'neutro' | 'alerta' | 'sucesso' | 'erro';

interface BadgeStatusProps {
  status: Status;
}

// Um único lugar decide o texto e a cor de cada status, do veículo e da ordem.
const aparencia: Record<Status, { rotulo: string; variante: Variante }> = {
  ativo: { rotulo: 'Ativo', variante: 'sucesso' },
  em_manutencao: { rotulo: 'Em manutenção', variante: 'alerta' },
  inativo: { rotulo: 'Inativo', variante: 'neutro' },
  aberta: { rotulo: 'Aberta', variante: 'neutro' },
  em_andamento: { rotulo: 'Em andamento', variante: 'alerta' },
  concluida: { rotulo: 'Concluída', variante: 'sucesso' },
  cancelada: { rotulo: 'Cancelada', variante: 'erro' },
};

export function BadgeStatus({ status }: BadgeStatusProps) {
  const { rotulo, variante } = aparencia[status];

  return (
    <View style={[estilos.badge, estilos[variante]]}>
      <Text style={estilos.texto}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    borderRadius: raio,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xs,
  },
  texto: {
    color: cores.textoSobreDestaque,
    fontSize: 12,
    fontWeight: 'bold',
  },
  neutro: { backgroundColor: cores.textoSecundario },
  alerta: { backgroundColor: cores.destaque },
  sucesso: { backgroundColor: cores.sucesso },
  erro: { backgroundColor: cores.erro },
});
