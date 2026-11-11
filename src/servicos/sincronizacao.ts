import { listarPendentes, removerPendente } from '../banco/banco';
import { registrarErro } from '../erros/erros';
import { ErroDaApi } from './api';
import { enviarFoto } from './fotos';
import { incluirOrdem } from './ordensServico';

// Recusas que dizem respeito aos dados da própria ordem: tentar de novo não adianta.
const RECUSAS_DEFINITIVAS = [400, 409, 422];

// Envia as ordens guardadas sem rede, da mais antiga para a mais nova.
// Para na primeira falha de rede: o resto continua na fila para a próxima vez.
export async function sincronizarPendentes(): Promise<number> {
  let enviadas = 0;
  for (const pendente of await listarPendentes()) {
    try {
      const fotoUrl =
        pendente.fotoBase64 !== null && pendente.fotoMime !== null
          ? await enviarFoto(pendente.fotoBase64, pendente.fotoMime)
          : null;
      await incluirOrdem({
        veiculoId: pendente.veiculoId,
        mecanicoId: pendente.mecanicoId,
        tipo: pendente.tipo,
        prioridade: pendente.prioridade,
        descricao: pendente.descricao,
        custoEstimado: pendente.custoEstimado,
        quilometragemNoServico: pendente.quilometragemNoServico,
        fotoUrl,
      });
      enviadas++;
    } catch (erro: unknown) {
      if (erro instanceof ErroDaApi && RECUSAS_DEFINITIVAS.includes(erro.status)) {
        registrarErro('pendente descartado', erro);
      } else {
        registrarErro('pendente adiado', erro);
        return enviadas;
      }
    }
    await removerPendente(pendente.id);
  }
  return enviadas;
}
