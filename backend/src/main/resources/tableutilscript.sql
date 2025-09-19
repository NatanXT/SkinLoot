CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- gerar o uuid automaticamente quando o id não é fornecido pelo insert --
ALTER TABLE jogo
ALTER COLUMN id SET DEFAULT gen_random_uuid();
