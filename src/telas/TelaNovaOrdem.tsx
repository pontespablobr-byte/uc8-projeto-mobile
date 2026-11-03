import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { FormularioOrdemServico } from '../componentes/FormularioOrdemServico';
import type { DadosNovaOrdem } from '../componentes/FormularioOrdemServico';
import { espacos } from '../tema/tema';
import type { Mecanico, Veiculo } from '../types';

interface TelaNovaOrdemProps {
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
  aoCriar: (dados: DadosNovaOrdem) => void;
}

export function TelaNovaOrdem({ veiculos, mecanicos, aoCriar }: TelaNovaOrdemProps) {
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
          aoCriar={aoCriar}
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
