import type { Mecanico, OrdemServico, Veiculo } from '../types';
import {
  formatarData,
  formatarMoeda,
  formatarPlaca,
  formatarQuilometragem,
  formatarTelefone,
} from './formatar';
import {
  rotulosEspecialidade,
  rotulosPrioridade,
  rotulosStatusOrdem,
  rotulosTipo,
} from './rotulos';

export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function linha(rotulo: string, valor: string): string {
  return `<tr><th>${escaparHtml(rotulo)}</th><td>${escaparHtml(valor)}</td></tr>`;
}

export function montarHtmlDaOrdem(
  ordem: OrdemServico,
  veiculo: Veiculo | undefined,
  mecanico: Mecanico | undefined,
  fotoDataUri: string | null,
): string {
  const linhasVeiculo = veiculo
    ? linha('Veículo', `${veiculo.marca} ${veiculo.modelo}`) +
      linha('Placa', formatarPlaca(veiculo.placa)) +
      linha('Ano', String(veiculo.anoFabricacao))
    : linha('Veículo', 'não encontrado');
  const linhasMecanico = mecanico
    ? linha('Nome', mecanico.nome) +
      linha('Especialidade', rotulosEspecialidade[mecanico.especialidade]) +
      linha('Telefone', formatarTelefone(mecanico.telefone))
    : linha('Mecânico', 'não encontrado');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>OS #${escaparHtml(ordem.id)}</title>
<style>
  @page { margin: 24px; }
  /* Papel sempre branco, mesmo com o aparelho no modo escuro. */
  :root { color-scheme: light; }
  html, body { background: #FFFFFF; }
  body { font-family: Helvetica, Arial, sans-serif; color: #161616; font-size: 13px; margin: 0; }
  .faixa { height: 8px; background: repeating-linear-gradient(135deg, #FFC400 0 10px, #161616 10px 20px); }
  header { display: flex; justify-content: space-between; align-items: flex-end; margin: 16px 0; }
  h1 { margin: 0; font-size: 26px; letter-spacing: 3px; }
  .sub { color: #8a6d00; font-size: 10px; letter-spacing: 2px; font-weight: bold; }
  .numero { font-size: 20px; font-weight: bold; text-align: right; }
  .status { display: inline-block; margin-top: 4px; padding: 3px 10px; border-radius: 6px; background: #7BE07B; font-weight: bold; }
  h2 { font-size: 12px; text-transform: uppercase; color: #8a6d00; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 18px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; color: #666; font-weight: normal; width: 40%; padding: 4px 0; }
  td { text-align: right; padding: 4px 0; }
  .descricao { white-space: pre-wrap; margin: 4px 0; }
  .foto { width: 100%; max-height: 320px; object-fit: contain; border: 1px solid #ddd; border-radius: 6px; }
  .assinaturas { display: flex; gap: 32px; margin-top: 48px; }
  .assinaturas div { flex: 1; border-top: 1px solid #161616; padding-top: 4px; text-align: center; color: #666; }
</style>
</head>
<body>
  <div class="faixa"></div>
  <header>
    <div>
      <h1>GESTÃO</h1>
      <div class="sub">PREVENTIVA &amp; CORRETIVA</div>
    </div>
    <div>
      <div class="numero">Ordem de Serviço #${escaparHtml(ordem.id)}</div>
      <div style="text-align:right"><span class="status">${escaparHtml(rotulosStatusOrdem[ordem.status])}</span></div>
    </div>
  </header>

  <h2>Serviço</h2>
  <p class="descricao">${escaparHtml(ordem.descricao)}</p>
  <table>
    ${linha('Tipo', rotulosTipo[ordem.tipo])}
    ${linha('Prioridade', rotulosPrioridade[ordem.prioridade])}
    ${linha('Custo estimado', formatarMoeda(ordem.custoEstimado))}
    ${linha('Quilometragem no serviço', formatarQuilometragem(ordem.quilometragemNoServico))}
    ${linha('Aberta em', formatarData(ordem.dataAbertura))}
    ${linha('Concluída em', ordem.dataConclusao ? formatarData(ordem.dataConclusao) : '—')}
  </table>

  <h2>Veículo</h2>
  <table>${linhasVeiculo}</table>

  <h2>Mecânico responsável</h2>
  <table>${linhasMecanico}</table>

  ${fotoDataUri ? `<h2>Foto</h2><img class="foto" src="${fotoDataUri}" alt="Foto da ordem de serviço" />` : ''}

  <div class="assinaturas">
    <div>Mecânico responsável</div>
    <div>Cliente</div>
  </div>
</body>
</html>`;
}
