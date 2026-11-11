import { StyleSheet, Text, View } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';
import { Botao } from './Botao';

interface ConfirmarExclusaoProps {
  ordemId: string;
  excluindo: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

// Confirmação dentro da própria tela: funciona igual no celular e no navegador.
export function ConfirmarExclusao({
  ordemId,
  excluindo,
  aoConfirmar,
  aoCancelar,
}: ConfirmarExclusaoProps) {
  return (
    <View style={estilos.caixa}>
      <Text style={estilos.pergunta}>Excluir a OS #{ordemId}?</Text>
      <Text style={estilos.aviso}>Essa ação não pode ser desfeita.</Text>
      <View style={estilos.botoes}>
        <View style={estilos.botao}>
          <Botao
            titulo="Cancelar"
            variante="secundario"
            aoPressionar={aoCancelar}
            desabilitado={excluindo}
          />
        </View>
        <View style={estilos.botao}>
          <Botao
            titulo={excluindo ? 'Excluindo...' : 'Sim, excluir'}
            variante="perigoForte"
            aoPressionar={aoConfirmar}
            desabilitado={excluindo}
          />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    borderWidth: 1,
    borderColor: cores.erro,
    borderRadius: raio,
    backgroundColor: cores.superficie,
    padding: espacos.md,
  },
  pergunta: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: 'bold',
  },
  aviso: {
    color: cores.textoSecundario,
    marginTop: espacos.xs,
  },
  botoes: {
    flexDirection: 'row',
    gap: espacos.sm,
    marginTop: espacos.md,
  },
  botao: {
    flex: 1,
  },
});
