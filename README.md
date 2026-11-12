# uc8-projeto-mobile

Aplicativo mobile da UC8, por Pablo Alejandro. Recorte do sistema **Gestão e manutenção preventiva e corretiva de veículos**, da UC5.

## Recorte do sistema

O app é voltado ao **mecânico/gestor de frota em campo**: consultar veículos, abrir e acompanhar ordens de serviço (preventivas e corretivas) direto do celular.

### Entidades (tipadas em `src/types/`)

**Veiculo** (`veiculo.ts`)

| Campo | Tipo |
| --- | --- |
| id | string |
| placa | string |
| marca | string |
| modelo | string |
| anoFabricacao | number |
| combustivel | `'gasolina' \| 'etanol' \| 'flex' \| 'diesel' \| 'eletrico'` |
| quilometragem | number |
| proximaRevisaoKm | number |
| status | `'ativo' \| 'em_manutencao' \| 'inativo'` |

**Mecanico** (`mecanico.ts`)

| Campo | Tipo |
| --- | --- |
| id | string |
| nome | string |
| telefone | string |
| especialidade | `'motor' \| 'suspensao' \| 'freios' \| 'eletrica' \| 'geral'` |
| ativo | boolean |

**OrdemServico** (`ordem-servico.ts`)

| Campo | Tipo |
| --- | --- |
| id | string |
| veiculoId | string (referencia Veiculo) |
| mecanicoId | string (referencia Mecanico) |
| tipo | `'preventiva' \| 'corretiva'` |
| descricao | string |
| prioridade | `'baixa' \| 'media' \| 'alta'` |
| status | `'aberta' \| 'em_andamento' \| 'concluida' \| 'cancelada'` |
| quilometragemNoServico | number |
| custoEstimado | number |
| dataAbertura | string (ISO 8601) |
| dataConclusao | string \| null (ISO 8601) |
| fotoUrl | string \| null (endereço público no Storage) |

### Telas (barra de abas embaixo)

1. **Veículos**: busca por placa/modelo, quantidade por marca, cadastro de veículos e mecânicos e exclusão de veículos sem ordens.
2. **Ordens**: filtro por status; PDF na aba Concluída; exclusão nas abas Aberta e Cancelada.
3. **Detalhe da ordem de serviço**: foto, edição, troca de status, PDF (concluída) e exclusão (aberta ou cancelada).
4. **Nova OS**: veículo, mecânico, tipo, prioridade, descrição, custo e foto (câmera ou galeria).
5. **Relatórios**: valor de cada serviço concluído, subtotal por tipo e valor geral.
6. **Sobre**: contagem de registros, o que o app faz e o que está guardado no aparelho.

### Dados no aparelho e erros

- A cada carga com rede, veículos, mecânicos e ordens são guardados no aparelho (`src/banco`, com `expo-sqlite`). Sem rede, o app mostra essa cópia e avisa de onde ela veio.
- A ordem aberta sem rede fica na fila do aparelho ("A enviar") e sobe na próxima carga com rede (`src/servicos/sincronizacao.ts`).
- Os erros passam por um só lugar (`src/erros/erros.ts`): `classificarErro` escolhe a mensagem da tela e `registrarErro` escreve a origem e o detalhe no console.
- No navegador o banco do aparelho não é usado (o `expo-sqlite` para web ainda é experimental): a lista vem só da nuvem.
- O roteiro de teste, com os resultados, está em `docs/roteiro_de_teste.md`.
- A documentação completa (arquitetura, dados, fluxos, segurança e erros) está em [`docs/documentacao.md`](docs/documentacao.md).

### O que fica de fora

Do sistema da UC5 não entram no aplicativo o cadastro de clientes, o controle de estoque e compra de peças, o faturamento e a emissão de nota fiscal, o agendamento de horários, os relatórios gerenciais, a gestão de perfis e permissões e as notificações push.

### Convenções dos tipos

- Datas são `string` no formato ISO 8601 (por exemplo, `'2026-09-18T10:30:00Z'`), em todas as entidades.
- Relações entre entidades são feitas por campo de identificador (`veiculoId`, `mecanicoId`), sem aninhar o objeto.
- Valores fixos usam união de literais (status, tipo, prioridade, combustível, especialidade).

## Configuração

O aplicativo lê a URL do projeto e a chave publicável do Supabase de um arquivo `.env.local`, que não vai para o repositório. Copie `.env.example` para `.env.local` e use estes valores:

```
EXPO_PUBLIC_SUPABASE_URL=https://ddrvcftkgcxkluiaynij.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_YMkHJovlh9xJkdXqVtFjQQ_cOMHpRkI
```

As tabelas são criadas no SQL Editor do projeto, executando uma vez cada arquivo, nesta ordem:

1. `supabase/esquema.sql`: tabela `ordens_servico`.
2. `supabase/esquema_frota.sql`: tabelas `veiculos` e `mecanicos`.
3. `supabase/edicao_e_fotos.sql`: edição das ordens e pasta `fotos-os` para as fotos.
4. `supabase/exclusao.sql`: exclusão só de ordens abertas ou canceladas.
5. `supabase/endurecimento.sql`: o app não altera veículos e mecânicos nem apaga mecânicos (`revoke`).
6. `supabase/exclusao_veiculos.sql`: exclusão só de veículos sem ordens de serviço.

## Como rodar

```bash
npm install
npx expo start
```

## Verificação de tipos

```bash
npm run typecheck   # equivale a: npx tsc --noEmit
```
