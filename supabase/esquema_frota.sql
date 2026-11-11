-- Veículos e mecânicos no Supabase. Cole inteiro no SQL Editor do projeto e execute uma vez,
-- depois de esquema.sql. As linhas de exemplo ficam com os ids 1 a 3, os mesmos
-- que as ordens de serviço já usam em veiculo_id e mecanico_id.

create table public.veiculos (
  id bigint generated always as identity primary key,
  placa text not null unique,
  marca text not null,
  modelo text not null,
  ano_fabricacao integer not null,
  combustivel text not null
    check (combustivel in ('gasolina', 'etanol', 'flex', 'diesel', 'eletrico')),
  quilometragem integer not null,
  proxima_revisao_km integer not null,
  status text not null default 'ativo'
    check (status in ('ativo', 'em_manutencao', 'inativo'))
);

create table public.mecanicos (
  id bigint generated always as identity primary key,
  nome text not null,
  telefone text not null,
  especialidade text not null
    check (especialidade in ('motor', 'suspensao', 'freios', 'eletrica', 'geral')),
  ativo boolean not null default true
);

alter table public.veiculos enable row level security;
alter table public.mecanicos enable row level security;

create policy "leitura anonima" on public.veiculos for select to anon using (true);
create policy "inclusao anonima" on public.veiculos for insert to anon with check (true);
create policy "leitura anonima" on public.mecanicos for select to anon using (true);
create policy "inclusao anonima" on public.mecanicos for insert to anon with check (true);

grant usage on schema public to anon;
grant select, insert on public.veiculos to anon;
grant select, insert on public.mecanicos to anon;
grant usage, select on sequence public.veiculos_id_seq to anon;
grant usage, select on sequence public.mecanicos_id_seq to anon;

insert into public.veiculos
  (placa, marca, modelo, ano_fabricacao, combustivel, quilometragem, proxima_revisao_km, status)
values
  ('QWE-1234', 'Fiat', 'Strada', 2019, 'flex', 85000, 90000, 'ativo'),
  ('ABC-5678', 'Toyota', 'Hilux', 2021, 'diesel', 45000, 50000, 'ativo'),
  ('XYZ-9012', 'Volkswagen', 'Saveiro', 2018, 'flex', 62000, 65000, 'em_manutencao');

insert into public.mecanicos (nome, telefone, especialidade, ativo) values
  ('Carlos Silva', '84988887777', 'motor', true),
  ('Marcos Lima', '84977776666', 'freios', true),
  ('Ana Souza', '8433334444', 'eletrica', true);
