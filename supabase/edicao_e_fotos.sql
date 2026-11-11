-- Edição das ordens de serviço e fotos. Cole inteiro no SQL Editor do projeto e execute uma vez,
-- depois de esquema.sql e esquema_frota.sql.

-- A foto fica no Storage; a ordem guarda só o endereço público dela.
alter table public.ordens_servico add column foto_url text;

-- Permite alterar a ordem (edição e troca de status). Excluir continua proibido.
create policy "alteracao anonima" on public.ordens_servico
  for update to anon using (true) with check (true);
grant update on public.ordens_servico to anon;

-- Pasta pública de fotos: até 5 MB por arquivo, só imagens.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-os', 'fotos-os', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- O aplicativo pode enviar fotos para essa pasta, mas não apagar nem trocar as que existem.
create policy "envio anonimo de fotos" on storage.objects
  for insert to anon with check (bucket_id = 'fotos-os');
