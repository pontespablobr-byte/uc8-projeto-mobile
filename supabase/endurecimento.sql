-- Endurecimento das permissões. Cole inteiro no SQL Editor do projeto e execute uma vez,
-- depois dos outros arquivos desta pasta.

-- Veículos e mecânicos: o papel anon só lê e inclui. Apagar e alterar já eram barrados pela RLS
-- (não há política para isso); o revoke tira também o privilégio que o projeto concede por padrão,
-- e a API passa a recusar com 42501 em vez de responder uma lista vazia.
revoke update, delete on public.veiculos from anon;
revoke update, delete on public.mecanicos from anon;

-- Ordens de serviço: o app precisa alterar (edição e status) e excluir as abertas ou canceladas,
-- então update e delete continuam, limitados pelas políticas de edicao_e_fotos.sql e exclusao.sql.
-- O que o app nunca usa sai de todas as tabelas.
revoke truncate, references, trigger on public.ordens_servico from anon;
revoke truncate, references, trigger on public.veiculos from anon;
revoke truncate, references, trigger on public.mecanicos from anon;
