import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { descreverErro } from '../servicos/ordensServico';
import { cores, espacos, raio } from '../tema/tema';
import type { Mecanico, Prioridade, TipoManutencao, Veiculo } from '../types';
import { formatarPlaca, formatarQuilometragem, lerValor } from '../utils/formatar';
import { rotulosPrioridade, rotulosTipo } from '../utils/rotulos';
import { Chip } from './Chip';

export interface DadosNovaOrdem {
  veiculoId: string;
  mecanicoId: string;
  tipo: TipoManutencao;
  prioridade: Prioridade;
  descricao: string;
  custoEstimado: number;
}

interface FormularioOrdemServicoProps {
  veiculos: Veiculo[];
  mecanicos: Mecanico[];
  aoCriar: (dados: DadosNovaOrdem) => Promise<void>;
}

const tipos: TipoManutencao[] = ['preventiva', 'corretiva'];
const prioridades: Prioridade[] = ['baixa', 'media', 'alta'];

export function FormularioOrdemServico({
  veiculos,
  mecanicos,
  aoCriar,
}: FormularioOrdemServicoProps) {
  const [veiculoId, setVeiculoId] = useState<string | null>(null);
  const [mecanicoId, setMecanicoId] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoManutencao>('preventiva');
  const [prioridade, setPrioridade] = useState<Prioridade>('media');
  const [descricao, setDescricao] = useState('');
  const [custo, setCusto] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const veiculoEscolhido = veiculos.find((veiculo) => veiculo.id === veiculoId);

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
      });
    } catch (falha: unknown) {
      // Mantém o que foi digitado para a pessoa poder tentar de novo.
      setErro(descreverErro(falha));
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

      {erro !== null && <Text style={estilos.erro}>{erro}</Text>}

      <Pressable style={estilos.botao} onPress={tratarEnvio} disabled={enviando}>
        <Text style={estilos.textoBotao}>
          {enviando ? 'Enviando...' : 'Abrir ordem de serviço'}
        </Text>
      </Pressable>
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
  erro: {
    color: cores.erro,
    marginTop: espacos.md,
  },
  botao: {
    backgroundColor: cores.destaque,
    borderRadius: raio,
    paddingVertical: espacos.sm + 4,
    alignItems: 'center',
    marginTop: espacos.md,
  },
  textoBotao: {
    color: cores.textoSobreDestaque,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
