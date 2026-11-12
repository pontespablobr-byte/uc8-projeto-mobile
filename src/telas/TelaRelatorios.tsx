import { FlatList, StyleSheet, Text, View } from 'react-native';
import { AvisoEstadoFrota } from '../componentes/AvisoEstadoFrota';
import { useFrota } from '../contexto/FrotaContexto';
import { cores, espacos, raio } from '../tema/tema';
import type { TipoManutencao } from '../types';
import { formatarData, formatarMoeda, formatarPlaca } from '../utils/formatar';
import { rotulosTipo } from '../utils/rotulos';

const tipos: TipoManutencao[] = ['preventiva', 'corretiva'];

function somar(valores: number[]): number {
  return valores.reduce((total, valor) => total + Math.round(valor * 100), 0) / 100;
}

export function TelaRelatorios() {
  const { estado, recarregar } = useFrota();

  if (estado.tipo !== 'pronto') {
    return <AvisoEstadoFrota estado={estado} aoTentarDeNovo={recarregar} />;
  }

  const concluidas = estado.ordens
    .filter((ordem) => ordem.status === 'concluida')
    .sort((a, b) => (b.dataConclusao ?? '').localeCompare(a.dataConclusao ?? ''));

  const total = somar(concluidas.map((ordem) => ordem.custoEstimado));
  const media = concluidas.length > 0 ? total / concluidas.length : 0;
  const porTipo = tipos.map((tipo) => {
    const doTipo = concluidas.filter((ordem) => ordem.tipo === tipo);
    return {
      tipo,
      quantidade: doTipo.length,
      valor: somar(doTipo.map((ordem) => ordem.custoEstimado)),
    };
  });

  const resumo = (
    <View>
      <View style={estilos.destaque}>
        <Text style={estilos.rotuloDestaque}>Valor geral dos serviços concluídos</Text>
        <Text style={estilos.valorDestaque}>{formatarMoeda(total)}</Text>
        <Text style={estilos.detalheDestaque}>
          {concluidas.length} {concluidas.length === 1 ? 'serviço' : 'serviços'} · média de{' '}
          {formatarMoeda(media)}
        </Text>
      </View>

      <View style={estilos.tipos}>
        {porTipo.map((item) => (
          <View key={item.tipo} style={estilos.cartaoTipo}>
            <Text style={estilos.rotuloTipo}>{rotulosTipo[item.tipo]}</Text>
            <Text style={estilos.valorTipo}>{formatarMoeda(item.valor)}</Text>
            <Text style={estilos.detalhe}>
              {item.quantidade} {item.quantidade === 1 ? 'serviço' : 'serviços'}
            </Text>
          </View>
        ))}
      </View>

      <Text style={estilos.titulo}>Serviços concluídos</Text>
    </View>
  );

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      ListHeaderComponent={resumo}
      data={concluidas}
      keyExtractor={(ordem) => ordem.id}
      renderItem={({ item }) => {
        const veiculo = estado.veiculos.find((v) => v.id === item.veiculoId);
        return (
          <View style={estilos.linha}>
            <View style={estilos.coluna}>
              <Text style={estilos.numero}>
                OS #{item.id} · {rotulosTipo[item.tipo]}
              </Text>
              <Text style={estilos.descricao} numberOfLines={2}>
                {item.descricao}
              </Text>
              <Text style={estilos.detalhe}>
                {veiculo
                  ? `${veiculo.modelo} — ${formatarPlaca(veiculo.placa)}`
                  : 'Veículo não encontrado'}
                {item.dataConclusao ? ` · ${formatarData(item.dataConclusao)}` : ''}
              </Text>
            </View>
            <Text style={estilos.valor}>{formatarMoeda(item.custoEstimado)}</Text>
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={estilos.vazio}>Nenhum serviço concluído ainda.</Text>
      }
      ListFooterComponent={
        concluidas.length > 0 ? (
          <View style={estilos.rodape}>
            <Text style={estilos.rotuloTotal}>Valor geral</Text>
            <Text style={estilos.valorTotal}>{formatarMoeda(total)}</Text>
          </View>
        ) : undefined
      }
    />
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    padding: espacos.md,
    paddingBottom: espacos.lg * 2,
  },
  destaque: {
    backgroundColor: cores.destaque,
    borderRadius: raio,
    padding: espacos.md,
  },
  rotuloDestaque: {
    color: cores.textoSobreDestaque,
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  valorDestaque: {
    color: cores.textoSobreDestaque,
    fontSize: 32,
    fontWeight: '900',
    marginTop: espacos.xs,
  },
  detalheDestaque: {
    color: cores.textoSobreDestaque,
    marginTop: espacos.xs,
  },
  tipos: {
    flexDirection: 'row',
    gap: espacos.sm,
    marginTop: espacos.sm,
  },
  cartaoTipo: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    padding: espacos.md,
  },
  rotuloTipo: {
    color: cores.destaque,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  valorTipo: {
    color: cores.texto,
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: espacos.xs,
  },
  titulo: {
    color: cores.destaque,
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: espacos.lg,
    marginBottom: espacos.sm,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    padding: espacos.md,
    marginBottom: espacos.sm,
  },
  coluna: {
    flex: 1,
  },
  numero: {
    color: cores.destaque,
    fontSize: 12,
    fontWeight: 'bold',
  },
  descricao: {
    color: cores.texto,
    fontSize: 15,
    marginVertical: espacos.xs,
  },
  detalhe: {
    color: cores.textoSecundario,
    fontSize: 13,
  },
  valor: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: 'bold',
  },
  vazio: {
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacos.lg,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: cores.destaque,
    paddingTop: espacos.md,
    marginTop: espacos.sm,
  },
  rotuloTotal: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: 'bold',
  },
  valorTotal: {
    color: cores.destaque,
    fontSize: 20,
    fontWeight: '900',
  },
});
