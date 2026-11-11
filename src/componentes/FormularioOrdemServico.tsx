import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { registrarErro } from '../erros/erros';
import type { FotoDaOrdem } from '../servicos/fotos';
import { cores, espacos, raio } from '../tema/tema';
import type { Mecanico, Prioridade, TipoManutencao, Veiculo } from '../types';
import { formatarPlaca, formatarQuilometragem, lerValor } from '../utils/formatar';
import { rotulosPrioridade, rotulosTipo } from '../utils/rotulos';
import { Botao } from './Botao';
import { Chip } from './Chip';

export interface DadosNovaOrdem {
  veiculoId: string;
  mecanicoId: string;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custoEstimado: number;
  foto: FotoDaOrdem | null;
}

interface FormularioOrdemServicoProps {
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
  aoCriar: (dados: DadosNovaOrdem) => Promise<void>;
  // Na edição, o formulário já começa preenchido com a ordem.
  inicial?: DadosNovaOrdem;
  textoBotao?: string;
  // Nome da operação no registro de erros (cadastro ou edição).
  origem?: string;
}

const tipos: TipoManutencao[] = ['preventiva', 'corretiva'];
const prioridades: Prioridade[] = ['baixa', 'media', 'alta'];

function custoComoTexto(valor: number): string {
  return String(valor).replace('.', ',');
}

export function FormularioOrdemServico({
  veiculos,
  mecanicos,
  aoCriar,
  inicial,
  textoBotao = 'Abrir ordem de serviço',
  origem = 'cadastro',
}: FormularioOrdemServicoProps) {
  const [veiculoId, setVeiculoId] = useState<string | null>(inicial?.veiculoId ?? null);
  const [mecanicoId, setMecanicoId] = useState<string | null>(inicial?.mecanicoId ?? null);
  const [tipo, setTipo] = useState<TipoManutencao>(inicial?.tipo ?? 'preventiva');
  const [prioridade, setPrioridade] = useState<Prioridade>(inicial?.prioridade ?? 'media');
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '');
  const [custo, setCusto] = useState(inicial ? custoComoTexto(inicial.custoEstimado) : '');
  const [foto, setFoto] = useState<FotoDaOrdem | null>(inicial?.foto ?? null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const veiculoEscolhido = veiculos.find((veiculo) => veiculo.id === veiculoId);

  async function escolherFoto(origem: 'camera' | 'galeria') {
    setErro(null);
    try {
      if (origem === 'camera') {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) {
          setErro('Permita o acesso à câmera para tirar a foto.');
          return;
        }
      }
      const opcoes: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.5,
        base64: true,
      };
      const resultado =
        origem === 'camera'
          ? await ImagePicker.launchCameraAsync(opcoes)
          : await ImagePicker.launchImageLibraryAsync(opcoes);
      if (resultado.canceled) return;

      const imagem = resultado.assets[0];
      if (!imagem.base64) {
        setErro('Não foi possível ler a foto. Tente outra.');
        return;
      }
      setFoto({
        tipo: 'nova',
        uri: imagem.uri,
        base64: imagem.base64,
        mimeType: imagem.mimeType === 'image/png' ? 'image/png' : 'image/jpeg',
      });
    } catch (falha: unknown) {
      setErro(registrarErro('foto', falha).mensagem);
    }
  }

  async function tratarEnvio() {
    if (enviando) return;

    const custoEstimado = lerValor(custo);

    if (veiculoId === null) {
      setErro('Escolha o veículo.');
      return;
    }
    if (mecanicoId === null) {
      setErro('Escolha o mecânico responsável.');
      return;
    }
    if (descricao.trim() === '') {
      setErro('Descreva o serviço ou o defeito apresentado.');
      return;
    }
    if (custoEstimado === null) {
      setErro('Informe um custo estimado válido, como 350 ou 350,50.');
      return;
    }

    setEnviando(true);
    try {
      await aoCriar({
        veiculoId,
        mecanicoId,
        tipo,
        prioridade,
        descricao: descricao.trim(),
        custoEstimado,
        foto,
      });
    } catch (falha: unknown) {
      // Mantém o que foi digitado para a pessoa poder tentar de novo.
      setErro(registrarErro(origem, falha).mensagem);
      return;
    } finally {
      setEnviando(false);
    }

    setErro(null);
    setVeiculoId(null);
    setMecanicoId(null);
    setTipo('preventiva');
    setPrioridade('media');
    setDescricao('');
    setCusto('');
    setFoto(null);
  }

  return (
    <View>
      <Text style={estilos.rotulo}>Veículo</Text>
      <View style={estilos.chips}>
        {veiculos.map((veiculo) => (
          <Chip
            key={veiculo.id}
            rotulo={`${veiculo.modelo} · ${formatarPlaca(veiculo.placa)}`}
            ativo={veiculoId === veiculo.id}
            aoTocar={() => setVeiculoId(veiculo.id)}
          />
        ))}
      </View>
      {veiculoEscolhido && (
        <Text style={estilos.info}>
          Quilometragem atual: {formatarQuilometragem(veiculoEscolhido.quilometragem)}
        </Text>
      )}

      <Text style={estilos.rotulo}>Mecânico</Text>
      <View style={estilos.chips}>
        {mecanicos.map((mecanico) => (
          <Chip
            key={mecanico.id}
            rotulo={mecanico.nome}
            ativo={mecanicoId === mecanico.id}
            aoTocar={() => setMecanicoId(mecanico.id)}
          />
        ))}
      </View>

      <Text style={estilos.rotulo}>Tipo de manutenção</Text>
      <View style={estilos.chips}>
        {tipos.map((opcao) => (
          <Chip
            key={opcao}
            rotulo={rotulosTipo[opcao]}
            ativo={tipo === opcao}
            aoTocar={() => setTipo(opcao)}
          />
        ))}
      </View>

      <Text style={estilos.rotulo}>Prioridade</Text>
      <View style={estilos.chips}>
        {prioridades.map((opcao) => (
          <Chip
            key={opcao}
            rotulo={rotulosPrioridade[opcao]}
            ativo={prioridade === opcao}
            aoTocar={() => setPrioridade(opcao)}
          />
        ))}
      </View>

      <Text style={estilos.rotulo}>Descrição</Text>
      <TextInput
        style={[estilos.campo, estilos.campoLongo]}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Serviço a fazer ou defeito apresentado"
        placeholderTextColor={cores.textoSecundario}
        multiline
      />

      <Text style={estilos.rotulo}>Custo estimado (R$)</Text>
      <TextInput
        style={estilos.campo}
        value={custo}
        onChangeText={setCusto}
        placeholder="Ex: 350,00"
        placeholderTextColor={cores.textoSecundario}
        keyboardType="numeric"
      />

      <Text style={estilos.rotulo}>Foto (opcional)</Text>
      {foto !== null && (
        <View style={estilos.previa}>
          <Image
            source={{ uri: foto.tipo === 'nova' ? foto.uri : foto.url }}
            style={estilos.imagem}
            resizeMode="cover"
            accessibilityLabel="Foto da ordem de serviço"
          />
          <Pressable onPress={() => setFoto(null)} style={estilos.remover}>
            <Text style={estilos.textoRemover}>Remover foto</Text>
          </Pressable>
        </View>
      )}
      <View style={estilos.botoesFoto}>
        <View style={estilos.botaoFoto}>
          <Botao
            titulo={foto ? 'Tirar outra foto' : 'Tirar foto'}
            variante="secundario"
            aoPressionar={() => escolherFoto('camera')}
          />
        </View>
        <View style={estilos.botaoFoto}>
          <Botao
            titulo="Escolher da galeria"
            variante="secundario"
            aoPressionar={() => escolherFoto('galeria')}
          />
        </View>
      </View>

      {erro !== null && <Text style={estilos.erro}>{erro}</Text>}

      <View style={estilos.envio}>
        <Botao
          titulo={enviando ? 'Enviando...' : textoBotao}
          aoPressionar={tratarEnvio}
          desabilitado={enviando}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
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
  info: {
    color: cores.textoSecundario,
    fontSize: 13,
    marginTop: espacos.sm,
  },
  campo: {
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    color: cores.texto,
    borderRadius: raio,
    padding: espacos.sm + 4,
  },
  campoLongo: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  previa: {
    marginBottom: espacos.sm,
  },
  imagem: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  remover: {
    alignSelf: 'flex-start',
    paddingVertical: espacos.sm,
  },
  textoRemover: {
    color: cores.erro,
    fontWeight: 'bold',
  },
  botoesFoto: {
    flexDirection: 'row',
    gap: espacos.sm,
  },
  botaoFoto: {
    flex: 1,
  },
  erro: {
    color: cores.erro,
    marginTop: espacos.md,
  },
  envio: {
    marginTop: espacos.md,
  },
});
