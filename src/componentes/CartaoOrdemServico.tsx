import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';
import type { Mecanico, OrdemServico, Veiculo } from '../types';
import { formatarData, formatarMoeda, formatarPlaca } from '../utils/formatar';
import { rotulosPrioridade, rotulosTipo } from '../utils/rotulos';
import { BadgeStatus } from './BadgeStatus';

interface CartaoOrdemServicoProps {
  ordem: OrdemServico;
  veiculo?: Veiculo;
  mecanico?: Mecanico;
  aoTocar?: () => void;
}

export function CartaoOrdemServico({
  ordem,
  veiculo,
  mecanico,
  aoTocar,
}: CartaoOrdemServicoProps) {
  const titulo = veiculo
    ? `${veiculo.modelo} — ${formatarPlaca(veiculo.placa)}`
    : 'Veículo não encontrado';

  return (
    <Pressable
      onPress={aoTocar}
      style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
    >
      <View style={estilos.linha}>
        <View style={estilos.coluna}>
          <Text style={estilos.numero}>OS #{ordem.id}</Text>
          <Text style={estilos.titulo}>{titulo}</Text>
        </View>
        <BadgeStatus status={ordem.status} />
      </View>

      <Text style={estilos.descricao}>{ordem.descricao}</Text>

      <Text style={estilos.meta}>
        {rotulosTipo[ordem.tipo]} · Prioridade {rotulosPrioridade[ordem.prioridade]}
      </Text>
      <Text style={estilos.meta}>
        {formatarMoeda(ordem.custoEstimado)} · Aberta em{' '}
        {formatarData(ordem.dataAbertura)}
      </Text>
      {mecanico && <Text style={estilos.meta}>Mecânico: {mecanico.nome}</Text>}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    padding: espacos.md,
    marginBottom: espacos.sm,
  },
  pressionado: {
    borderColor: cores.destaque,
    backgroundColor: cores.superficieAlta,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
  },
  coluna: {
    flex: 1,
  },
  numero: {
    color: cores.destaque,
    fontSize: 12,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: cores.texto,
    marginTop: espacos.xs,
  },
  descricao: {
    color: cores.texto,
    fontSize: 14,
    marginTop: espacos.sm,
    marginBottom: espacos.xs,
  },
  meta: {
    color: cores.textoSecundario,
    fontSize: 13,
    marginTop: espacos.xs,
  },
});
