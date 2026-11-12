import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AvisoEstadoFrota } from '../componentes/AvisoEstadoFrota';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { Chip } from '../componentes/Chip';
import { useFrota } from '../contexto/FrotaContexto';
import { registrarErro } from '../erros/erros';
import { cores, espacos } from '../tema/tema';
import type { Especialidade } from '../types';
import { formatarTelefone } from '../utils/formatar';
import { rotulosEspecialidade } from '../utils/rotulos';

interface TelaNovoMecanicoProps {
  aoVoltar: () => void;
}

const especialidades: Especialidade[] = ['geral', 'motor', 'suspensao', 'freios', 'eletrica'];

export function TelaNovoMecanico({ aoVoltar }: TelaNovoMecanicoProps) {
  const { estado, recarregar, incluirMecanico } = useFrota();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [especialidade, setEspecialidade] = useState<Especialidade>('geral');
  const [erro, setErro] = useState<string | null>(null);
  const [erroNome, setErroNome] = useState<string | undefined>(undefined);
  const [erroTelefone, setErroTelefone] = useState<string | undefined>(undefined);
  const [enviando, setEnviando] = useState(false);

  if (estado.tipo !== 'pronto') {
    return <AvisoEstadoFrota estado={estado} aoTentarDeNovo={recarregar} />;
  }

  async function salvar() {
    if (enviando) return;

    const digitos = telefone.replace(/\D/g, '');
    setErro(null);
    setErroNome(undefined);
    setErroTelefone(undefined);

    if (nome.trim() === '') {
      setErroNome('Informe o nome do mecânico.');
      return;
    }
    if (digitos.length < 10) {
      setErroTelefone('Informe o telefone com DDD, como (84) 98888-7777.');
      return;
    }

    setEnviando(true);
    try {
      await incluirMecanico({ nome: nome.trim(), telefone: digitos, especialidade });
    } catch (falha: unknown) {
      setErro(registrarErro('cadastro de mecanico', falha).mensagem);
      setEnviando(false);
      return;
    }
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
        <Pressable onPress={aoVoltar} style={estilos.voltar}>
          <Text style={estilos.textoVoltar}>← Voltar</Text>
        </Pressable>
        <Text style={estilos.titulo}>Novo mecânico</Text>

        <Campo
          rotulo="Nome"
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Carlos Silva"
          erro={erroNome}
        />
        <Campo
          rotulo="Telefone"
          value={telefone}
          onChangeText={(texto) => setTelefone(formatarTelefone(texto))}
          placeholder="Ex: (84) 98888-7777"
          keyboardType="phone-pad"
          erro={erroTelefone}
        />

        <Text style={estilos.rotulo}>Especialidade</Text>
        <View style={estilos.chips}>
          {especialidades.map((opcao) => (
            <Chip
              key={opcao}
              rotulo={rotulosEspecialidade[opcao]}
              ativo={especialidade === opcao}
              aoTocar={() => setEspecialidade(opcao)}
            />
          ))}
        </View>

        {erro !== null && <Text style={estilos.erro}>{erro}</Text>}

        <View style={estilos.acao}>
          <Botao
            titulo={enviando ? 'Enviando...' : 'Salvar mecânico'}
            aoPressionar={salvar}
            desabilitado={enviando}
          />
        </View>
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
  rotulo: {
    color: cores.destaque,
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: espacos.md,
    marginBottom: espacos.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  erro: {
    color: cores.erro,
    marginTop: espacos.md,
  },
  acao: {
    marginTop: espacos.md,
  },
});
