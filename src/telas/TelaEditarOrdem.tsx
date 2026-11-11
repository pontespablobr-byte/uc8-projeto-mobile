import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { AvisoEstadoFrota } from '../componentes/AvisoEstadoFrota';
import { FormularioOrdemServico } from '../componentes/FormularioOrdemServico';
import type { DadosNovaOrdem } from '../componentes/FormularioOrdemServico';
import { useFrota } from '../contexto/FrotaContexto';
import { resolverFoto } from '../servicos/fotos';
import { cores, espacos } from '../tema/tema';

interface TelaEditarOrdemProps {
  ordemId: string;
  aoVoltar: () => void;
}

export function TelaEditarOrdem({ ordemId, aoVoltar }: TelaEditarOrdemProps) {
  const { estado, recarregar, editarOrdem } = useFrota();

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
        <Text style={estilos.aviso}>Ordem de serviço não encontrada.</Text>
      </ScrollView>
    );
  }

  const ordemAtual = ordem;
  // O veículo da ordem aparece mesmo que tenha ficado inativo depois.
  const veiculos = estado.veiculos.filter(
    (veiculo) => veiculo.status !== 'inativo' || veiculo.id === ordemAtual.veiculoId,
  );
  const mecanicos = estado.mecanicos.filter(
    (mecanico) => mecanico.ativo || mecanico.id === ordemAtual.mecanicoId,
  );

  async function salvar(dados: DadosNovaOrdem): Promise<void> {
    const { foto, ...campos } = dados;
    const fotoUrl = await resolverFoto(foto);
    // A quilometragem só muda se a ordem passar para outro veículo.
    const novoVeiculo =
      campos.veiculoId === ordemAtual.veiculoId
        ? undefined
        : veiculos.find((veiculo) => veiculo.id === campos.veiculoId);
    await editarOrdem(ordemAtual.id, {
      ...campos,
      quilometragemNoServico: novoVeiculo
        ? novoVeiculo.quilometragem
        : ordemAtual.quilometragemNoServico,
      fotoUrl,
    });
    aoVoltar();
  }

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {botaoVoltar}
        <Text style={estilos.titulo}>Editar OS #{ordemAtual.id}</Text>
        <FormularioOrdemServico
          veiculos={veiculos}
          mecanicos={mecanicos}
          aoCriar={salvar}
          textoBotao="Salvar alterações"
          origem="edicao"
          inicial={{
            veiculoId: ordemAtual.veiculoId,
            mecanicoId: ordemAtual.mecanicoId,
            tipo: ordemAtual.tipo,
            prioridade: ordemAtual.prioridade,
            descricao: ordemAtual.descricao,
            custoEstimado: ordemAtual.custoEstimado,
            foto: ordemAtual.fotoUrl ? { tipo: 'existente', url: ordemAtual.fotoUrl } : null,
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  voltar: {
    alignSelf: 'flex-start',
    paddingVertical: espacos.sm,
    paddingRight: espacos.md,
  },
  textoVoltar: {
    color: cores.destaque,
    fontSize: 16,
    fontWeight: 'bold',
  },
  titulo: {
    color: cores.texto,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: espacos.xs,
  },
  aviso: {
    color: cores.texto,
    fontSize: 17,
    marginTop: espacos.sm,
  },
});
