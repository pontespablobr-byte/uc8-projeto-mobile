# uc8-projeto-mobile

Aplicativo mobile da UC8, por Pablo Alejandro. Recorte do sistema **Gestão e manutenção preventiva e corretiva de veículos**, da UC5.

> Recorte definido no encontro 3. Pode mudar depois do prazo desta entrega; qualquer mudança fica registrada em commit.

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

### Telas previstas (5)

1. **Lista de veículos**: busca por placa/modelo e indicação de status e revisão próxima.
2. **Detalhe do veículo**: dados do veículo e histórico de ordens de serviço.
3. **Lista de ordens de serviço**: filtro por status e por tipo (preventiva/corretiva).
4. **Nova ordem de serviço**: formulário com veículo, mecânico, tipo, prioridade e descrição.
5. **Detalhe da ordem de serviço**: acompanhar e atualizar o status (aberta, em andamento, concluída, cancelada).

### O que fica de fora

Do sistema da UC5 não entram no aplicativo o cadastro de clientes, o controle de estoque e compra de peças, o faturamento e a emissão de nota fiscal, o agendamento de horários, os relatórios gerenciais, a gestão de perfis e permissões e as notificações push.

### Convenções dos tipos

- Datas são `string` no formato ISO 8601 (por exemplo, `'2026-09-18T10:30:00Z'`), em todas as entidades.
- Relações entre entidades são feitas por campo de identificador (`veiculoId`, `mecanicoId`), sem aninhar o objeto.
- Valores fixos usam união de literais (status, tipo, prioridade, combustível, especialidade).

## Como rodar

```bash
npm install
npx expo start
```

## Verificação de tipos

```bash
npm run typecheck   # equivale a: npx tsc --noEmit
```
