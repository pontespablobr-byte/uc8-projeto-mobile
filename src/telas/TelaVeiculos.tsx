import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { AvisoEstadoFrota } from '../componentes/AvisoEstadoFrota';
import { Botao } from '../componentes/Botao';
import { CartaoVeiculo } from '../componentes/CartaoVeiculo';
import { Chip } from '../componentes/Chip';
import { ConfirmarExclusao } from '../componentes/ConfirmarExclusao';
import { motivoParaNaoExcluirVeiculo, useFrota } from '../contexto/FrotaContexto';
import { registrarErro } from '../erros/erros';
import type { Veiculo } from '../types';
import { formatarPlaca } from '../utils/formatar';
import { cores, espacos, larguraLarga, raio } from '../tema/tema';

interface TelaVeiculosProps {
  aoNovoVeiculo: () => void;
  aoNovoMecanico: () => void;
}

function semSeparadores(texto: string): string {
  return texto.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function TelaVeiculos({ aoNovoVeiculo, aoNovoMecanico }: TelaVeiculosProps) {
  const { estado, recarregar, excluirVeiculo } = useFrota();
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<{ id: string; mensagem: string } | null>(null);
  const [busca, setBusca] = useState('');
  const [marcaEscolhida, setMarcaEscolhida] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;

  if (estado.tipo !== 'pronto') {
    return <AvisoEstadoFrota estado={estado} aoTentarDeNovo={recarregar} />;
  }

  const porMarca = new Map<string, { nome: string; quantidade: number }>();
  for (const veiculo of estado.veiculos) {
    const chave = veiculo.marca.trim().toLowerCase();
    const atual = porMarca.get(chave);
    porMarca.set(chave, {
      nome: atual?.nome ?? veiculo.marca.trim(),
      quantidade: (atual?.quantidade ?? 0) + 1,
    });
  }
  const marcas = [...porMarca.entries()]
    .map(([chave, dados]) => ({ chave, ...dados }))
    .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome));

  const termo = semSeparadores(busca);
  const filtrados = estado.veiculos.filter(
    (veiculo) =>
      (marcaEscolhida === null || veiculo.marca.trim().toLowerCase() === marcaEscolhida) &&
      (semSeparadores(veiculo.placa).includes(termo) ||
        semSeparadores(veiculo.modelo).includes(termo)),
  );

  const { ordens, pendentes } = estado;

  function pedirExclusao(veiculo: Veiculo) {
    const motivo = motivoParaNaoExcluirVeiculo(veiculo, ordens, pendentes);
    if (motivo !== null) {
      setConfirmandoId(null);
      setErroExclusao({ id: veiculo.id, mensagem: motivo });
      return;
    }
    setErroExclusao(null);
    setConfirmandoId(veiculo.id);
  }

  async function excluir(veiculo: Veiculo) {
    if (excluindo) return;
    setExcluindo(true);
    try {
      await excluirVeiculo(veiculo.id);
      setConfirmandoId(null);
    } catch (falha: unknown) {
      setConfirmandoId(null);
      setErroExclusao({ id: veiculo.id, mensagem: registrarErro('exclusao de veiculo', falha).mensagem });
    } finally {
      setExcluindo(false);
    }
  }

  const resumo = (
    <View style={estilos.resumo}>
      <Text style={estilos.tituloResumo}>Por marca</Text>
      <View style={estilos.marcas}>
        {marcas.map((marca) => (
          <Chip
            key={marca.chave}
            rotulo={`${marca.nome} · ${marca.quantidade}`}
            ativo={marcaEscolhida === marca.chave}
            aoTocar={() =>
              setMarcaEscolhida((atual) => (atual === marca.chave ? null : marca.chave))
            }
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={estilos.tela}>
      <View style={estilos.acoes}>
        <View style={estilos.acao}>
          <Botao titulo="+ Novo veículo" aoPressionar={aoNovoVeiculo} />
        </View>
        <View style={estilos.acao}>
          <Botao titulo="+ Novo mecânico" variante="secundario" aoPressionar={aoNovoMecanico} />
        </View>
      </View>
      <TextInput
        style={estilos.busca}
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar por placa ou modelo"
        placeholderTextColor={cores.textoSecundario}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={estilos.contador}>
        {filtrados.length} {filtrados.length === 1 ? 'veículo' : 'veículos'} ·{' '}
        {estado.mecanicos.length} {estado.mecanicos.length === 1 ? 'mecânico' : 'mecânicos'}
      </Text>
      {estado.origem === 'aparelho' && (
        <Text style={estilos.aviso}>
          Mostrando os veículos guardados no aparelho: {estado.motivo}
        </Text>
      )}
      <FlatList
        key={duasColunas ? 'duas' : 'uma'}
        ListHeaderComponent={resumo}
        data={filtrados}
        numColumns={duasColunas ? 2 : 1}
        columnWrapperStyle={duasColunas ? estilos.linhaDeColunas : undefined}
        keyExtractor={(veiculo) => veiculo.id}
        renderItem={({ item }) => (
          <View style={duasColunas ? estilos.celula : undefined}>
            <CartaoVeiculo
              veiculo={item}
              aoExcluir={() => pedirExclusao(item)}
              exclusaoDesabilitada={excluindo}
            />
            {confirmandoId === item.id && (
              <View style={estilos.abaixoDoCartao}>
                <ConfirmarExclusao
                  pergunta={`Excluir o veículo ${item.modelo} (${formatarPlaca(item.placa)})?`}
                  excluindo={excluindo}
                  aoConfirmar={() => excluir(item)}
                  aoCancelar={() => setConfirmandoId(null)}
                />
              </View>
            )}
            {erroExclusao?.id === item.id && (
              <Text style={[estilos.erro, estilos.abaixoDoCartao]}>{erroExclusao.mensagem}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={estilos.vazio}>Nenhum veículo encontrado.</Text>
        }
        contentContainerStyle={estilos.lista}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    paddingHorizontal: espacos.md,
    paddingTop: espacos.md,
  },
  acoes: {
    flexDirection: 'row',
    gap: espacos.sm,
    marginBottom: espacos.sm,
  },
  aviso: {
    color: cores.destaque,
    marginBottom: espacos.sm,
  },
  resumo: {
    marginBottom: espacos.sm,
  },
  tituloResumo: {
    color: cores.destaque,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: espacos.sm,
  },
  marcas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  acao: {
    flex: 1,
  },
  busca: {
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    color: cores.texto,
    borderRadius: raio,
    padding: espacos.sm + 4,
  },
  contador: {
    color: cores.textoSecundario,
    marginVertical: espacos.sm,
  },
  lista: {
    paddingBottom: espacos.lg,
  },
  abaixoDoCartao: {
    marginBottom: espacos.md,
  },
  erro: {
    color: cores.erro,
  },
  linhaDeColunas: {
    justifyContent: 'space-between',
  },
  celula: {
    width: '49%',
  },
  vazio: {
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacos.lg,
  },
});
