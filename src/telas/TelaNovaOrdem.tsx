import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { AvisoEstadoFrota } from '../componentes/AvisoEstadoFrota';
import { FormularioOrdemServico } from '../componentes/FormularioOrdemServico';
import type { DadosNovaOrdem } from '../componentes/FormularioOrdemServico';
import { useFrota } from '../contexto/FrotaContexto';
import { espacos } from '../tema/tema';

interface TelaNovaOrdemProps {
  aoCriar: () => void;
}

export function TelaNovaOrdem({ aoCriar }: TelaNovaOrdemProps) {
  const { estado, recarregar, incluir } = useFrota();

  if (estado.tipo !== 'pronto') {
    return <AvisoEstadoFrota estado={estado} aoTentarDeNovo={recarregar} />;
  }

  const { veiculos, mecanicos } = estado;

  async function criar(dados: DadosNovaOrdem): Promise<void> {
    const veiculo = veiculos.find((item) => item.id === dados.veiculoId);
    await incluir({
      ...dados,
      quilometragemNoServico: veiculo ? veiculo.quilometragem : 0,
    });
    aoCriar();
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
        <FormularioOrdemServico
          veiculos={veiculos.filter((veiculo) => veiculo.status !== 'inativo')}
          mecanicos={mecanicos.filter((mecanico) => mecanico.ativo)}
          aoCriar={criar}
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
});
