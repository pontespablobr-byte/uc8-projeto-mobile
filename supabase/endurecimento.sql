-- Endurecimento das permissões. Cole inteiro no SQL Editor do projeto e execute uma vez,
-- depois dos outros arquivos desta pasta.

-- Veículos e mecânicos: o papel anon não altera nenhum dos dois e não apaga mecânicos. A RLS já
-- barrava (não há política para isso); o revoke tira também o privilégio que o projeto concede por
-- padrão, e a API passa a recusar com 42501 em vez de responder uma lista vazia.
-- A exclusão de veículos sem ordens é liberada em exclusao_veiculos.sql.
revoke update on public.veiculos from anon;
revoke update, delete on public.mecanicos from anon;

-- Ordens de serviço: o app precisa alterar (edição e status) e excluir as abertas ou canceladas,
-- então update e delete continuam, limitados pelas políticas de edicao_e_fotos.sql e exclusao.sql.
-- O que o app nunca usa sai de todas as tabelas.
revoke truncate, references, trigger on public.ordens_servico from anon;
revoke truncate, references, trigger on public.veiculos from anon;
revoke truncate, references, trigger on public.mecanicos from anon;
