import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CartaoOrdemServico } from '../componentes/CartaoOrdemServico';
import { Chip } from '../componentes/Chip';
import { cores, espacos } from '../tema/tema';
import type {
  Mecanico,
  OrdemServico,
  StatusOrdemServico,
  TipoManutencao,
  Veiculo,
} from '../types';

interface TelaOrdensProps {
  ordens: OrdemServico[];
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
}

type FiltroStatus = StatusOrdemServico | 'todas';
type FiltroTipo = TipoManutencao | 'todos';

const opcoesStatus: { valor: FiltroStatus; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'aberta', rotulo: 'Aberta' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'concluida', rotulo: 'Concluída' },
  { valor: 'cancelada', rotulo: 'Cancelada' },
];

const opcoesTipo: { valor: FiltroTipo; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos os tipos' },
  { valor: 'preventiva', rotulo: 'Preventiva' },
  { valor: 'corretiva', rotulo: 'Corretiva' },
];

export function TelaOrdens({ ordens, veiculos, mecanicos }: TelaOrdensProps) {
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todas');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');

  // O filtro já devolve um array novo; a ordenação (id decrescente) age nele.
  const visiveis = ordens
    .filter((ordem) => filtroStatus === 'todas' || ordem.status === filtroStatus)
    .filter((ordem) => filtroTipo === 'todos' || ordem.tipo === filtroTipo)
    .sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <View style={estilos.tela}>
      <View style={estilos.chips}>
        {opcoesStatus.map((opcao) => (
          <Chip
            key={opcao.valor}
            rotulo={opcao.rotulo}
            ativo={filtroStatus === opcao.valor}
            aoTocar={() => setFiltroStatus(opcao.valor)}
          />
        ))}
      </View>
      <View style={estilos.chips}>
        {opcoesTipo.map((opcao) => (
          <Chip
            key={opcao.valor}
            rotulo={opcao.rotulo}
            ativo={filtroTipo === opcao.valor}
            aoTocar={() => setFiltroTipo(opcao.valor)}
          />
        ))}
      </View>

      <Text style={estilos.contador}>
        {visiveis.length} {visiveis.length === 1 ? 'ordem' : 'ordens'}
      </Text>

      <FlatList
        data={visiveis}
        keyExtractor={(ordem) => ordem.id}
        renderItem={({ item }) => (
          <CartaoOrdemServico
            ordem={item}
            veiculo={veiculos.find((veiculo) => veiculo.id === item.veiculoId)}
            mecanico={mecanicos.find((mecanico) => mecanico.id === item.mecanicoId)}
          />
        )}
        ListEmptyComponent={
          <Text style={estilos.vazio}>
            Nenhuma ordem de serviço com esses filtros.
          </Text>
        }
        contentContainerStyle={estilos.lista}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
    marginBottom: espacos.sm,
  },
  contador: {
    color: cores.textoSecundario,
    marginVertical: espacos.sm,
  },
  lista: {
    paddingBottom: espacos.lg,
  },
  vazio: {
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacos.lg,
  },
});
