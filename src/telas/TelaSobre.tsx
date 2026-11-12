import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import configuracaoDoApp from '../../app.json';
import { contarLocal } from '../banco/banco';
import { useFrota } from '../contexto/FrotaContexto';
import { registrarErro } from '../erros/erros';
import { cores, espacos, raio } from '../tema/tema';

const funcoes = [
  'Cadastrar veículos e mecânicos, com a quantidade de carros por marca.',
  'Abrir ordens de serviço preventivas e corretivas, com foto do veículo.',
  'Acompanhar, editar e mudar o status de cada ordem, e excluir as abertas ou canceladas.',
  'Gerar o PDF das ordens concluídas para enviar ou imprimir.',
  'Ver o relatório de valores dos serviços concluídos.',
];

const tecnologias = [
  'React Native com Expo e TypeScript',
  'Supabase (banco de dados e fotos na nuvem)',
  'expo-sqlite (cópia no aparelho e fila sem rede)',
  'expo-image-picker, expo-print e expo-sharing',
];

export function TelaSobre() {
  const { estado } = useFrota();
  const [guardados, setGuardados] = useState('...');

  useEffect(() => {
    let cancelado = false;
    contarLocal()
      .then((total) => {
        if (!cancelado) {
          setGuardados(
            `${total.ordens} ordens, ${total.veiculos} veículos e ${total.mecanicos} mecânicos`,
          );
        }
      })
      .catch((erro: unknown) => {
        registrarErro('contagem', erro);
        if (!cancelado) {
          setGuardados('indisponível');
        }
      });
    return () => {
      cancelado = true;
    };
  }, [estado]);

  const contagens =
    estado.tipo === 'pronto'
      ? [
          { rotulo: 'Veículos', valor: estado.veiculos.length },
          { rotulo: 'Mecânicos', valor: estado.mecanicos.length },
          { rotulo: 'Ordens', valor: estado.ordens.length },
        ]
      : null;

  return (
    <ScrollView contentContainerStyle={estilos.conteudo}>
      {contagens !== null && (
        <View style={estilos.numeros}>
          {contagens.map((item) => (
            <View key={item.rotulo} style={estilos.cartaoNumero}>
              <Text style={estilos.valorNumero}>{item.valor}</Text>
              <Text style={estilos.rotuloNumero}>{item.rotulo}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>O que o app faz</Text>
        {funcoes.map((funcao) => (
          <Text key={funcao} style={estilos.item}>
            • {funcao}
          </Text>
        ))}
      </View>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>Feito com</Text>
        {tecnologias.map((tecnologia) => (
          <Text key={tecnologia} style={estilos.item}>
            • {tecnologia}
          </Text>
        ))}
      </View>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>Seus dados</Text>
        <Text style={estilos.item}>
          Os dados ficam no Supabase, protegidos por regras de acesso: o app pode ler, incluir
          e alterar, e só pode excluir ordens de serviço abertas ou canceladas. Uma cópia fica
          no aparelho para quando não houver rede, e a ordem aberta sem rede é enviada na
          próxima vez que o app abrir conectado. Use apenas dados fictícios nos testes e não
          fotografe pessoas nem documentos.
        </Text>
        <Text style={estilos.item}>Guardados no aparelho: {guardados}</Text>
      </View>

      <View style={estilos.secao}>
        <Text style={estilos.tituloSecao}>Projeto</Text>
        <Text style={estilos.item}>
          Desenvolvido por Pablo Alejandro na UC8 (Desenvolvimento para dispositivos móveis), a
          partir do sistema de gestão de manutenção criado na UC5.
        </Text>
        <Text style={estilos.versao}>Versão {configuracaoDoApp.expo.version}</Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    padding: espacos.md,
    paddingBottom: espacos.lg * 2,
  },
  versao: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: espacos.xs,
  },
  numeros: {
    flexDirection: 'row',
    gap: espacos.sm,
  },
  cartaoNumero: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    paddingVertical: espacos.md,
  },
  valorNumero: {
    color: cores.destaque,
    fontSize: 24,
    fontWeight: '900',
  },
  rotuloNumero: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: espacos.xs,
  },
  secao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio,
    padding: espacos.md,
    marginTop: espacos.sm,
  },
  tituloSecao: {
    color: cores.destaque,
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: espacos.sm,
  },
  item: {
    color: cores.texto,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: espacos.xs,
  },
});
