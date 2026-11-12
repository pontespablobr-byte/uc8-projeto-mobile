import { useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AvisoEstadoFrota } from '../componentes/AvisoEstadoFrota';
import { Botao } from '../componentes/Botao';
import { CartaoOrdemServico } from '../componentes/CartaoOrdemServico';
import { Chip } from '../componentes/Chip';
import { ConfirmarExclusao } from '../componentes/ConfirmarExclusao';
import { useFrota } from '../contexto/FrotaContexto';
import { registrarErro } from '../erros/erros';
import { gerarPdfDaOrdem } from '../servicos/pdf';
import { cores, espacos, larguraLarga } from '../tema/tema';
import type { OrdemServico, StatusOrdemServico } from '../types';

interface TelaOrdensProps {
  aoSelecionarOrdem: (ordem: OrdemServico) => void;
}

type FiltroStatus = StatusOrdemServico | 'todas';

const opcoesStatus: { valor: FiltroStatus; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'aberta', rotulo: 'Aberta' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'concluida', rotulo: 'Concluída' },
  { valor: 'cancelada', rotulo: 'Cancelada' },
];

export function TelaOrdens({ aoSelecionarOrdem }: TelaOrdensProps) {
  const { estado, recarregar, excluirOrdem } = useFrota();
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todas');
  const [gerandoId, setGerandoId] = useState<string | null>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraLarga;

  if (estado.tipo !== 'pronto') {
    return <AvisoEstadoFrota estado={estado} aoTentarDeNovo={recarregar} />;
  }

  const { ordens, veiculos, mecanicos } = estado;

  const visiveis = ordens
    .filter((ordem) => filtroStatus === 'todas' || ordem.status === filtroStatus)
    .sort((a, b) => Number(b.id) - Number(a.id));

  const mostrarPdf = filtroStatus === 'concluida';
  const mostrarExcluir = filtroStatus === 'aberta' || filtroStatus === 'cancelada';

  async function excluir(ordem: OrdemServico) {
    if (excluindo) return;
    setErroPdf(null);
    setExcluindo(true);
    try {
      await excluirOrdem(ordem.id);
      setConfirmandoId(null);
    } catch (falha: unknown) {
      setErroPdf(registrarErro('exclusao', falha).mensagem);
    } finally {
      setExcluindo(false);
    }
  }

  async function gerarPdf(ordem: OrdemServico) {
    if (gerandoId !== null) return;
    setErroPdf(null);
    setGerandoId(ordem.id);
    try {
      await gerarPdfDaOrdem(
        ordem,
        veiculos.find((veiculo) => veiculo.id === ordem.veiculoId),
        mecanicos.find((mecanico) => mecanico.id === ordem.mecanicoId),
      );
    } catch (falha: unknown) {
      setErroPdf(registrarErro('pdf', falha).mensagem);
    } finally {
      setGerandoId(null);
    }
  }

  function mudarFiltro(valor: FiltroStatus) {
    setFiltroStatus(valor);
    setErroPdf(null);
    setConfirmandoId(null);
  }

  return (
    <View style={estilos.tela}>
      <View style={estilos.chips}>
        {opcoesStatus.map((opcao) => (
          <View key={opcao.valor} style={estilos.celula}>
            <Chip
              compacto
              rotulo={opcao.rotulo}
              ativo={filtroStatus === opcao.valor}
              aoTocar={() => mudarFiltro(opcao.valor)}
            />
          </View>
        ))}
      </View>

      <Text style={estilos.contador}>
        {visiveis.length} {visiveis.length === 1 ? 'ordem' : 'ordens'}
      </Text>
      {estado.origem === 'aparelho' && (
        <Text style={estilos.aviso}>
          Mostrando as ordens guardadas no aparelho: {estado.motivo}
        </Text>
      )}
      {estado.pendentes.length > 0 && (
        <Text style={estilos.aviso}>
          A enviar ({estado.pendentes.length}):{' '}
          {estado.pendentes.map((pendente) => pendente.descricao).join(', ')}
        </Text>
      )}
      {erroPdf !== null && <Text style={estilos.erro}>{erroPdf}</Text>}

      <FlatList
        key={duasColunas ? 'duas' : 'uma'}
        data={visiveis}
        numColumns={duasColunas ? 2 : 1}
        columnWrapperStyle={duasColunas ? estilos.linhaDeColunas : undefined}
        keyExtractor={(ordem) => ordem.id}
        renderItem={({ item }) => (
          <View
            style={[
              (mostrarPdf || mostrarExcluir) && estilos.itemComAcao,
              duasColunas && estilos.celulaDaLista,
            ]}
          >
            <CartaoOrdemServico
              ordem={item}
              veiculo={veiculos.find((veiculo) => veiculo.id === item.veiculoId)}
              mecanico={mecanicos.find((mecanico) => mecanico.id === item.mecanicoId)}
              aoTocar={() => aoSelecionarOrdem(item)}
            />
            {mostrarPdf && (
              <Botao
                titulo={gerandoId === item.id ? 'Gerando...' : `Gerar PDF da OS #${item.id}`}
                variante="secundario"
                aoPressionar={() => gerarPdf(item)}
                desabilitado={gerandoId !== null}
              />
            )}
            {mostrarExcluir &&
              (confirmandoId === item.id ? (
                <ConfirmarExclusao
                  ordemId={item.id}
                  excluindo={excluindo}
                  aoConfirmar={() => excluir(item)}
                  aoCancelar={() => setConfirmandoId(null)}
                />
              ) : (
                <Botao
                  titulo={`Excluir OS #${item.id}`}
                  variante="perigo"
                  aoPressionar={() => {
                    setErroPdf(null);
                    setConfirmandoId(item.id);
                  }}
                  desabilitado={excluindo}
                />
              ))}
          </View>
        )}
        ListEmptyComponent={
          <Text style={estilos.vazio}>
            Nenhuma ordem de serviço com esses filtros.
          </Text>
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
    marginBottom: espacos.sm,
  },
  celula: {
    flexBasis: '30%',
    flexGrow: 1,
  },
  aviso: {
    color: cores.destaque,
    marginBottom: espacos.sm,
  },
  linhaDeColunas: {
    justifyContent: 'space-between',
  },
  celulaDaLista: {
    width: '49%',
  },
  itemComAcao: {
    marginBottom: espacos.md,
  },
  erro: {
    color: cores.erro,
    marginBottom: espacos.sm,
  },
  contador: {
    color: cores.textoSecundario,
    marginVertical: espacos.sm,
  },
  lista: {
    paddingBottom: espacos.lg,
  },
  vazio: {
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: espacos.lg,
  },
});
