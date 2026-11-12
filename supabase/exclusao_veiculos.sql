-- Exclusão de veículos. Cole inteiro no SQL Editor do projeto e execute uma vez,
-- depois de endurecimento.sql.

-- Só veículo sem nenhuma ordem de serviço pode ser excluído: assim nenhuma ordem fica sem veículo.
grant delete on public.veiculos to anon;
create policy "exclusao de veiculos sem ordens" on public.veiculos
  for delete to anon
  using (not exists (select 1 from public.ordens_servico o where o.veiculo_id = veiculos.id));
