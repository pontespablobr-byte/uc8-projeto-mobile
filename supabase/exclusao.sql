-- Exclusão de ordens de serviço. Cole inteiro no SQL Editor do projeto e execute uma vez,
-- depois de edicao_e_fotos.sql.

-- Só ordens abertas ou canceladas podem ser excluídas; em andamento e concluídas ficam guardadas.
create policy "exclusao de abertas e canceladas" on public.ordens_servico
  for delete to anon using (status in ('aberta', 'cancelada'));
grant delete on public.ordens_servico to anon;
