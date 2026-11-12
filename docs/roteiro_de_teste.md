# Roteiro de teste - Gestão (manutenção preventiva e corretiva)

Cada caso tem os passos, o resultado esperado e o resultado observado. A coluna "Onde e quando" diz em que ambiente o caso foi executado:

- **navegador**: o app exportado para web (`npx expo export --platform web`), dirigido por um teste automatizado no Microsoft Edge, numa janela de celular (412 x 860). As leituras vão ao Supabase real; inclusões, alterações, exclusões e envio de foto são simulados com as respostas da API, para não mudar os dados do projeto.
- **Node**: o código real de `src/banco/banco.ts`, `src/servicos/sincronizacao.ts` e `src/erros/erros.ts` rodando no Node 24, com o `expo-sqlite` trocado por um SQLite em memória com a mesma API.
- **aparelho**: celular com o Expo Go.

Um caso com falha ganha a correção e é executado de novo; a linha registra as duas execuções.

Legenda do resultado: **aprovado** (o observado é o esperado), **falha** (não é), **corrigido** (falhou, foi corrigido e aprovado na repetição), **não executado**.

## Requisitos do recorte

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C01 | Carga com rede | Abrir o app com rede | Aba Veículos com os veículos da nuvem, contagem "N veículos · N mecânicos" e quantidade por marca | aprovado | navegador, 11/11/2026 | - |
| C02 | Busca de veículo | Digitar `hilux`, depois `abc5678`, depois `zzz` | 1 veículo; 1 veículo (placa sem hífen); "Nenhum veículo encontrado." | aprovado | navegador, 11/11/2026 | - |
| C03 | Filtro por marca | Tocar em "Toyota · 1"; tocar de novo | Só a Hilux; depois todos os veículos | aprovado | navegador, 11/11/2026 | - |
| C04 | Todos aparecem como ativos | Aba Veículos | Todos os cartões com a etiqueta "Ativo", nenhum "Em manutenção" | aprovado | navegador, 11/11/2026 | - |
| C05 | Cadastro de veículo | "+ Novo veículo"; placa `fgh1j23`, Ford, Ranger, 2022, Diesel, 50.000, 60000; Salvar | Volta à lista com "4 veículos"; POST com `placa: FGH1J23`, `quilometragem: 50000` | aprovado | navegador, 11/11/2026 | - |
| C06 | Cadastro de mecânico | "+ Novo mecânico"; nome, telefone `84999991111`, Suspensão; Salvar | Contagem "4 mecânicos"; telefone enviado só com dígitos | aprovado | navegador, 11/11/2026 | - |
| C07 | Filtro de ordens | Aba Ordens; Aberta; Todas | Contagem igual à da tabela no Supabase em cada filtro | aprovado | navegador, 11/11/2026 | - |
| C08 | Botões de status alinhados | Aba Ordens em 412, 360 e 320 px | 3 botões iguais na 1ª linha, 2 na 2ª, bordas alinhadas, sem texto cortado | corrigido | navegador, 10/11/2026 | Em 360 px "Em andamento" quebrava e desalinhava; o Chip ganhou o modo compacto |
| C09 | Nova OS | Escolher veículo e mecânico, descrição, custo `350,50`; Abrir | Volta a Ordens com a OS no topo e a contagem +1; POST com `custo_estimado: 350.5` | aprovado | navegador, 11/11/2026 | - |
| C10 | Nova OS com foto | "Escolher da galeria"; escolher uma imagem; Abrir | Prévia da foto; a foto vai ao Storage antes da OS; a OS guarda o endereço público | aprovado | navegador, 11/11/2026 | - |
| C11 | Foto pela câmera | "Tirar foto"; permitir a câmera; fotografar | Prévia da foto no formulário | não executado | - | - |
| C12 | Toque duplo no envio | Tocar duas vezes em "Abrir ordem de serviço" | Um só POST | aprovado | navegador, 11/11/2026 | - |
| C13 | Detalhe da OS | Tocar numa OS | Veículo, mecânico (telefone com máscara), serviço e datas | aprovado | navegador, 11/11/2026 | - |
| C14 | Troca de status | Detalhe; Concluída; depois Aberta | PATCH com `status` e `data_conclusao`; "Concluída em" preenchida e depois "—" | aprovado | navegador, 11/11/2026 | - |
| C15 | Edição | Detalhe; Editar; mudar descrição e prioridade; Salvar | Formulário já preenchido; PATCH só com os campos da ordem; detalhe atualizado | aprovado | navegador, 11/11/2026 | - |
| C16 | PDF da OS concluída | Aba Ordens, filtro Concluída; "Gerar PDF da OS #6" | Documento com OS, veículo, mecânico, valores e foto; no celular, menu de compartilhar | aprovado | navegador, 11/11/2026 | O documento é montado e impresso; o menu de compartilhar só existe no aparelho |
| C17 | PDF legível | Gerar o PDF com o aparelho em modo escuro | Papel branco, texto escuro | corrigido | navegador, 10/11/2026 | O HTML não definia o fundo e saía escuro; agora o papel é sempre branco |
| C18 | PDF só para concluídas | Filtros Todas, Aberta; detalhe de OS em andamento | Nenhum botão de PDF | aprovado | navegador, 11/11/2026 | - |
| C19 | Exclusão | Filtro Aberta; "Excluir OS #2"; Cancelar; Excluir de novo; "Sim, excluir" | Pede confirmação; Cancelar não apaga; depois a OS sai da lista; DELETE com `id=eq.2` | aprovado | navegador, 11/11/2026 | - |
| C20 | Exclusão só de abertas e canceladas | Filtros Todas, Em andamento, Concluída; detalhe de OS em andamento | Nenhum botão de excluir; o banco só apaga abertas e canceladas | aprovado | navegador e Node (SQL), 11/11/2026 | - |
| C21 | Relatórios | Aba Relatórios | Só OS concluídas; valor geral igual à soma; subtotal por tipo | aprovado | navegador, 11/11/2026 | - |
| C22 | Sobre | Aba Sobre | Começa nos quadrados de contagem; versão do app; "Guardados no aparelho" | aprovado | navegador, 11/11/2026 | - |
| C23 | Barra de abas | Qualquer aba | Barra embaixo, 5 abas com ícone, aba atual marcada | aprovado | navegador, 11/11/2026 | - |
| C31 | Duas colunas na tela larga | Abrir Veículos e Ordens numa janela de 900 px; voltar para 412 px | Duas colunas lado a lado em tela larga; uma coluna no celular | aprovado | navegador, 11/11/2026 | - |
| C24 | Teclado no Android | Nova OS; tocar na descrição | A barra de abas some enquanto o teclado está aberto | não executado | - | - |

## Dados no aparelho (cache e fila)

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| C25 | Cache guardado | Carga com rede; ler o banco do aparelho | Veículos, mecânicos e ordens iguais aos da nuvem; carga seguinte substitui, sem duplicar | aprovado | Node, 11/11/2026 | - |
| C26 | Carga sem rede, com cache | Carregar uma vez com rede; desligar a rede; fechar e abrir | Lista do aparelho com o aviso "Mostrando ... guardados no aparelho" | não executado | - | - |
| C27 | Carga sem rede, sem cache | Instalação nova; sem rede; abrir | Tela de erro com "Sem conexão com o servidor..." e "Tentar de novo" | não executado | - | - |
| C28 | Cadastro sem rede | Sem rede; Nova OS; Abrir | Volta a Ordens com "A enviar (1): ..." | aprovado | aparelho (iPhone, Expo Go), 11/11/2026 | - |
| C29 | Sincronização | Fila com 3 ordens (uma com foto); a 3ª sem rede | Envia as 2 primeiras (a foto antes da ordem) e para; a 3ª continua na fila. No aparelho: com a rede de volta, a ordem sai de "A enviar" e aparece na lista | aprovado | Node e aparelho (iPhone, Expo Go), 11/11/2026 | - |
| C30 | Pendente recusado | Fila com uma ordem que o Supabase recusa (400); depois com a chave errada (401) | 400: descartada e registrada; 401: continua na fila | aprovado | Node, 11/11/2026 | - |

## Erros tratados

| # | Caso | Passos | Esperado | Resultado | Onde e quando | Correção |
|---|---|---|---|---|---|---|
| E01 | Chave recusada na carga | Trocar uma letra da chave no `.env.local`; recarga completa | "A chave do Supabase foi recusada (401). Confira o arquivo .env.local." e "Tentar de novo"; `[carga] api: ErroDaApi 401: Invalid API key` no console | aprovado | navegador, 11/11/2026 | - |
| E02 | Tentar de novo | Na tela de erro, corrigir a causa e tocar em "Tentar de novo" | A lista carrega | aprovado | navegador, 11/11/2026 | - |
| E03 | Recusa do servidor no cadastro | Nova OS com um valor que o banco recusa | "O servidor recusou os dados enviados (400): ..." e o que foi digitado continua no formulário | aprovado | navegador, 11/11/2026 | - |
| E04 | Validação na tela | Nova OS sem veículo, sem mecânico, sem descrição, custo `abc` | Uma mensagem por campo; nenhum POST | aprovado | navegador, 11/11/2026 | - |
| E05 | Validação de veículo | Placa `ab`; placa repetida; ano 1900; revisão menor que a quilometragem | Mensagem embaixo do campo com problema, que fica com borda vermelha; ao corrigir, o erro sai do campo; nenhum POST | aprovado | navegador, 11/11/2026 | - |
| E06 | Valor em reais | Custo `1.234`, `1.234,50`, `1e3`, `0x10` | R$ 1.234,00; R$ 1.234,50; recusado; recusado | corrigido | Node, 10/11/2026 | `1.234` virava R$ 1,23 e `1e3` era aceito; a leitura do valor foi refeita |
| E07 | Data no fuso do aparelho | OS aberta às 21:02 de 09/11 (00:02 UTC de 10/11) | "09/11/2026" no horário de Brasília | corrigido | Node, 10/11/2026 | A data saía em UTC, um dia adiantada à noite |
| E08 | Alteração sem permissão | Status ou edição com o SQL de edição não executado | "A ordem não foi alterada. Confira se o arquivo supabase/edicao_e_fotos.sql foi executado..." | aprovado | navegador, 11/11/2026 | - |
| E09 | Exclusão recusada pelo banco | Excluir com a política ausente | "A ordem não foi excluída..." e a OS continua na lista | aprovado | navegador, 11/11/2026 | - |
| E10 | Banco do aparelho indisponível | Banco que não abre (simulado no Node; no navegador ele não existe) | `ErroDoBanco`; a lista da nuvem continua; Sobre mostra "indisponível"; registros `[...] banco:` no console | aprovado | Node e navegador, 11/11/2026 | - |
| E11 | Sem rede e sem banco | No navegador, Nova OS com a rede cortada | "Não foi possível ler ou guardar os dados no aparelho." e o formulário mantido | aprovado | navegador, 11/11/2026 | - |
| E12 | Tabela ausente | Abrir o app antes de executar `esquema_frota.sql` | "O Supabase não encontrou a tabela (404)..." | falha | aparelho (Expo Go), 10/11/2026 | Mostrou o texto da API em inglês ("Could not find the table..."); a mensagem foi trocada por uma que manda conferir o SQL. Falta repetir no aparelho |
| E14 | Rede ruim no iPhone | Nova OS com sinal fraco (LTE); Abrir | A ordem vai para "A enviar"; falta de rede reconhecida, sem caixa vermelha de erro | corrigido | aparelho (iPhone, Expo Go), 11/11/2026 | O iPhone esperou cerca de um minuto e avisou com `fetch failed: The request timed out.` num `Error` comum, que saiu como "desconhecido" e em `console.error` (caixa vermelha). Agora a falta de rede é reconhecida por esse texto, o pedido desiste em 15 segundos (60 para a foto) e rede e validação vão para `console.log`. Repetido no aparelho: aprovado |
| E13 | Exclusão de veículo pela API | DELETE em `veiculos` com a chave publicável, depois do `endurecimento.sql` | Recusa com 42501 (permission denied) | aprovado | API do Supabase (curl, DELETE num id inexistente em `veiculos` e `mecanicos`), 11/11/2026 | - |
