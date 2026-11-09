-- Esquema das ordens de serviço no Supabase. Cole inteiro no SQL Editor do projeto e execute uma vez.
-- veiculo_id e mecanico_id apontam para os ids de src/servicos/veiculos.ts e src/servicos/mecanicos.ts,
-- que continuam no aplicativo: por isso não há chave estrangeira.

create table public.ordens_servico (
  id bigint generated always as identity primary key,
  veiculo_id bigint not null,
  mecanico_id bigint not null,
  tipo text not null check (tipo in ('preventiva', 'corretiva')),
  descricao text not null,
  prioridade text not null check (prioridade in ('baixa', 'media', 'alta')),
  status text not null default 'aberta'
    check (status in ('aberta', 'em_andamento', 'concluida', 'cancelada')),
  quilometragem_no_servico integer not null,
  custo_estimado numeric(10, 2) not null,
  data_abertura timestamptz not null default now(),
  data_conclusao timestamptz
);

alter table public.ordens_servico enable row level security;

create policy "leitura anonima" on public.ordens_servico for select to anon using (true);
create policy "inclusao anonima" on public.ordens_servico for insert to anon with check (true);

grant usage on schema public to anon;
grant select, insert on public.ordens_servico to anon;
grant usage, select on sequence public.ordens_servico_id_seq to anon;

insert into public.ordens_servico
  (veiculo_id, mecanico_id, tipo, descricao, prioridade, status, quilometragem_no_servico, custo_estimado, data_abertura, data_conclusao)
values
  (3, 1, 'corretiva', 'Barulho no motor e perda de potência', 'alta', 'em_andamento', 62000, 1850, '2026-10-20T08:15:00Z', null),
  (1, 2, 'preventiva', 'Troca de pastilhas de freio e rodízio de pneus', 'media', 'aberta', 85000, 390, '2026-10-24T09:00:00Z', null),
  (2, 1, 'preventiva', 'Troca de óleo e filtros (revisão de 45.000 km)', 'baixa', 'concluida', 44800, 340, '2026-09-18T10:30:00Z', '2026-09-18T16:00:00Z'),
  (1, 3, 'corretiva', 'Farol esquerdo apagando: falha no sistema elétrico', 'media', 'concluida', 82000, 220, '2026-08-05T13:20:00Z', '2026-08-06T11:45:00Z'),
  (2, 2, 'corretiva', 'Vibração no volante ao frear', 'alta', 'cancelada', 45000, 600, '2026-10-02T15:10:00Z', null),
  (3, 3, 'preventiva', 'Verificação do sistema elétrico', 'baixa', 'concluida', 58000, 80, '2026-07-10T08:00:00Z', '2026-07-10T10:30:00Z');
