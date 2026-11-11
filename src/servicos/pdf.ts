import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { Mecanico, OrdemServico, Veiculo } from '../types';
import { montarHtmlDaOrdem } from '../utils/htmlOrdem';

// Baixa a foto e a devolve como data URI, para ela entrar dentro do PDF.
async function paraDataUri(url: string): Promise<string> {
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error('Não foi possível baixar a foto.');
  }
  const blob = await resposta.blob();
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === 'string') resolver(leitor.result);
      else rejeitar(new Error('Não foi possível ler a foto.'));
    };
    leitor.onerror = () => rejeitar(new Error('Não foi possível ler a foto.'));
    leitor.readAsDataURL(blob);
  });
}

// No navegador o expo-print imprime a página inteira; aqui imprimimos só o documento.
function imprimirNoNavegador(html: string): void {
  const quadro = document.createElement('iframe');
  quadro.setAttribute('aria-hidden', 'true');
  quadro.style.position = 'fixed';
  quadro.style.width = '0';
  quadro.style.height = '0';
  quadro.style.border = '0';
  document.body.appendChild(quadro);
  const documento = quadro.contentDocument;
  const janela = quadro.contentWindow;
  if (documento === null || janela === null) {
    quadro.remove();
    throw new Error('Não foi possível abrir a impressão.');
  }
  documento.open();
  documento.write(html);
  documento.close();
  setTimeout(() => {
    janela.focus();
    janela.print();
    setTimeout(() => quadro.remove(), 1000);
  }, 300);
}

export async function gerarPdfDaOrdem(
  ordem: OrdemServico,
  veiculo: Veiculo | undefined,
  mecanico: Mecanico | undefined,
): Promise<void> {
  // Sem a foto o PDF ainda sai: a falha ao baixá-la não impede o documento.
  const foto = ordem.fotoUrl ? await paraDataUri(ordem.fotoUrl).catch(() => null) : null;
  const html = montarHtmlDaOrdem(ordem, veiculo, mecanico, foto);

  if (Platform.OS === 'web') {
    imprimirNoNavegador(html);
    return;
  }

  // Tamanho A4 em pontos (72 por polegada).
  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento não está disponível neste aparelho.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: `OS #${ordem.id}`,
  });
}
