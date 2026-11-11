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
import type { Combustivel } from '../types';
import { formatarPlaca, lerInteiro } from '../utils/formatar';
import { rotulosCombustivel } from '../utils/rotulos';

interface TelaNovoVeiculoProps {
  aoVoltar: () => void;
}

const combustiveis: Combustivel[] = ['flex', 'gasolina', 'etanol', 'diesel', 'eletrico'];
const placaValida = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;
const quilometragemMaxima = 9999999;

export function TelaNovoVeiculo({ aoVoltar }: TelaNovoVeiculoProps) {
  const { estado, recarregar, incluirVeiculo } = useFrota();
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [combustivel, setCombustivel] = useState<Combustivel>('flex');
  const [quilometragem, setQuilometragem] = useState('');
  const [proximaRevisao, setProximaRevisao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (estado.tipo !== 'pronto') {
    return <AvisoEstadoFrota estado={estado} aoTentarDeNovo={recarregar} />;
  }

  const { veiculos } = estado;

  async function salvar() {
    if (enviando) return;

    const anoFabricacao = lerInteiro(ano.replace(/\./g, ''));
    const km = lerInteiro(quilometragem);
    const proximaRevisaoKm = lerInteiro(proximaRevisao);
    const anoMaximo = new Date().getFullYear() + 1;

    if (!placaValida.test(placa)) {
      setErro('Informe uma placa válida, como ABC-1234 ou ABC1D23.');
      return;
    }
    if (veiculos.some((veiculo) => formatarPlaca(veiculo.placa) === placa)) {
      setErro('Já existe um veículo com essa placa.');
      return;
    }
    if (marca.trim() === '') {
      setErro('Informe a marca.');
      return;
    }
    if (modelo.trim() === '') {
      setErro('Informe o modelo.');
      return;
    }
    if (anoFabricacao === null || anoFabricacao < 1950 || anoFabricacao > anoMaximo) {
      setErro(`Informe um ano de fabricação entre 1950 e ${anoMaximo}.`);
      return;
    }
    if (km === null || km > quilometragemMaxima) {
      setErro('Informe uma quilometragem válida, como 85000.');
      return;
    }
    if (proximaRevisaoKm === null || proximaRevisaoKm > quilometragemMaxima) {
      setErro('Informe a quilometragem da próxima revisão, como 90000.');
      return;
    }
    if (proximaRevisaoKm <= km) {
      setErro('A próxima revisão precisa ser maior que a quilometragem atual.');
      return;
    }

    setErro(null);
    setEnviando(true);
    try {
      await incluirVeiculo({
        placa,
        marca: marca.trim(),
        modelo: modelo.trim(),
        anoFabricacao,
        combustivel,
        quilometragem: km,
        proximaRevisaoKm,
      });
    } catch (falha: unknown) {
      setErro(registrarErro('cadastro de veiculo', falha).mensagem);
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
        <Text style={estilos.titulo}>Novo veículo</Text>

        <Campo
          rotulo="Placa"
          value={placa}
          onChangeText={(texto) => setPlaca(formatarPlaca(texto))}
          placeholder="Ex: ABC-1234"
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Campo rotulo="Marca" value={marca} onChangeText={setMarca} placeholder="Ex: Fiat" />
        <Campo rotulo="Modelo" value={modelo} onChangeText={setModelo} placeholder="Ex: Strada" />
        <Campo
          rotulo="Ano de fabricação"
          value={ano}
          onChangeText={setAno}
          placeholder="Ex: 2021"
          keyboardType="numeric"
          maxLength={4}
        />

        <Text style={estilos.rotulo}>Combustível</Text>
        <View style={estilos.chips}>
          {combustiveis.map((opcao) => (
            <Chip
              key={opcao}
              rotulo={rotulosCombustivel[opcao]}
              ativo={combustivel === opcao}
              aoTocar={() => setCombustivel(opcao)}
            />
          ))}
        </View>

        <Campo
          rotulo="Quilometragem atual"
          value={quilometragem}
          onChangeText={setQuilometragem}
          placeholder="Ex: 85000"
          keyboardType="numeric"
        />
        <Campo
          rotulo="Próxima revisão (km)"
          value={proximaRevisao}
          onChangeText={setProximaRevisao}
          placeholder="Ex: 90000"
          keyboardType="numeric"
        />

        {erro !== null && <Text style={estilos.erro}>{erro}</Text>}

        <View style={estilos.acao}>
          <Botao
            titulo={enviando ? 'Enviando...' : 'Salvar veículo'}
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
