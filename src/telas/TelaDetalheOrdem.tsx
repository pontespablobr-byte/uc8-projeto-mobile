import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AvisoEstadoFrota } from '../componentes/AvisoEstadoFrota';
import { BadgeStatus } from '../componentes/BadgeStatus';
import { Chip } from '../componentes/Chip';
import { useFrota } from '../contexto/FrotaContexto';
import { cores, espacos, raio } from '../tema/tema';
import type { StatusOrdemServico } from '../types';
import {
  formatarData,
  formatarMoeda,
  formatarPlaca,
  formatarQuilometragem,
  formatarTelefone,
} from '../utils/formatar';
import {
  rotulosEspecialidade,
  rotulosPrioridade,
  rotulosStatusOrdem,
  rotulosTipo,
} from '../utils/rotulos';

interface TelaDetalheOrdemProps {
  ordemId: string;
  aoVoltar: () => void;
}

const statusDisponiveis: StatusOrdemServico[] = [
  'aberta',
  'em_andamento',
  'concluida',
  'cancelada',
];

interface LinhaProps {
  rotulo: string;
  valor: string;
}

function Linha({ rotulo, valor }: LinhaProps) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

export function TelaDetalheOrdem({ ordemId, aoVoltar }: TelaDetalheOrdemProps) {
  const { estado, recarregar, atualizarStatus } = useFrota();

  if (estado.tipo !== 'pronto') {
    return <AvisoEstadoFrota estado={estado} aoTentarDeNovo={recarregar} />;
  }

  const ordem = estado.ordens.find((item) => item.id === ordemId);
  const botaoVoltar = (
    <Pressable onPress={aoVoltar} style={estilos.voltar}>
      <Text style={estilos.textoVoltar}>← Voltar</Text>
    </Pressable>
  );

  if (ordem === undefined) {
    return (
      <ScrollView contentContainerStyle={estilos.conteudo}>
        {botaoVoltar}
        <Text style={estilos.descricao}>Ordem de serviço não encontrada.</Text>
      </ScrollView>
    );
  }

  const veiculo = estado.veiculos.find((item) => item.id === ordem.veiculoId);
  const mecanico = estado.mecanicos.find((item) => item.id === ordem.mecanicoId);

  return (
    <ScrollView contentContainerStyle={estilos.conteudo}>
      {botaoVoltar}

      <View style={estilos.cabecalho}>
        <Text style={estilos.numero}>OS #{ordem.id}</Text>
        <BadgeStatus status={ordem.status} />
      </View>
      <Text style={estilos.descricao}>{ordem.descricao}</Text>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>Veículo</Text>
        {veiculo ? (
          <>
            <Linha rotulo="Modelo" valor={`${veiculo.marca} ${veiculo.modelo}`} />
            <Linha rotulo="Placa" valor={formatarPlaca(veiculo.placa)} />
            <Linha
              rotulo="Quilometragem no serviço"
              valor={formatarQuilometragem(ordem.quilometragemNoServico)}
            />
          </>
        ) : (
          <Text style={estilos.valor}>Veículo não encontrado.</Text>
        )}
      </View>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>Mecânico</Text>
        {mecanico ? (
          <>
            <Linha rotulo="Nome" valor={mecanico.nome} />
            <Linha
              rotulo="Especialidade"
              valor={rotulosEspecialidade[mecanico.especialidade]}
            />
            <Linha rotulo="Telefone" valor={formatarTelefone(mecanico.telefone)} />
          </>
        ) : (
          <Text style={estilos.valor}>Mecânico não encontrado.</Text>
        )}
      </View>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>Serviço</Text>
        <Linha rotulo="Tipo" valor={rotulosTipo[ordem.tipo]} />
        <Linha rotulo="Prioridade" valor={rotulosPrioridade[ordem.prioridade]} />
        <Linha rotulo="Custo estimado" valor={formatarMoeda(ordem.custoEstimado)} />
        <Linha rotulo="Aberta em" valor={formatarData(ordem.dataAbertura)} />
        <Linha
          rotulo="Concluída em"
          valor={ordem.dataConclusao ? formatarData(ordem.dataConclusao) : '—'}
        />
      </View>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>Atualizar status</Text>
        <View style={estilos.chips}>
          {statusDisponiveis.map((status) => (
            <Chip
              key={status}
              rotulo={rotulosStatusOrdem[status]}
              ativo={ordem.status === status}
              aoTocar={() => atualizarStatus(ordem.id, status)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    padding: espacos.md,
    paddingBottom: espacos.lg * 2,
  },
  voltar: {
    alignSelf: 'flex-start',
    paddingVertical: espacos.sm,
    paddingRight: espacos.md,
    marginBottom: espacos.sm,
  },
  textoVoltar: {
    color: cores.destaque,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numero: {
    color: cores.destaque,
    fontSize: 22,
    fontWeight: 'bold',
  },
  descricao: {
    color: cores.texto,
    fontSize: 17,
    marginTop: espacos.sm,
    marginBottom: espacos.md,
  },
  secao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    padding: espacos.md,
    marginBottom: espacos.sm,
  },
  tituloSecao: {
    color: cores.destaque,
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: espacos.sm,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacos.md,
    paddingVertical: espacos.xs,
  },
  rotulo: {
    color: cores.textoSecundario,
    fontSize: 14,
  },
  valor: {
    color: cores.texto,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
});
