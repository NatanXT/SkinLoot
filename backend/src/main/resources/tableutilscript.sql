CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- gerar o uuid automaticamente quando o id não é fornecido pelo insert --
ALTER TABLE jogo
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- TUTORIAL DE CONFIGURAÇÃO E AJUSTES DO BANCO DE DADOS
-- Comandos executados desde 05 de Outubro de 2025

-- ================================================================================= --
-- 1. AJUSTE NA TABELA 'usuario': CORREÇÃO DA RESTRIÇÃO DE GÊNERO
-- Objetivo: Alinhar a regra do banco de dados com o Enum 'Genero' do Java.
-- ================================================================================= --

-- Passo 1.1: Remove a restrição antiga que provavelmente usava 'Masculino' com 'M' maiúsculo.
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_genero_check;

-- Passo 1.2: Adiciona a nova restrição correta, aceitando os valores em MAIÚSCULAS.
-- Isso corrige o erro 'viola a restrição de verificação "usuario_genero_check"'.
ALTER TABLE usuario ADD CONSTRAINT usuario_genero_check
    CHECK (genero IN ('MASCULINO', 'FEMININO', 'OUTRO'));


-- ================================================================================= --
-- 2. AJUSTE NA TABELA 'skin': AUMENTO DO TAMANHO DA DESCRIÇÃO
-- Objetivo: Permitir que a coluna 'descricao' armazene textos longos (como a lore dos campeões).
-- ================================================================================= --

-- Passo 2.1: Altera o tipo da coluna de VARCHAR(500) para TEXT.
-- Isso corrige o erro 'valor é muito longo para tipo character varying(500)'.
ALTER TABLE skin ALTER COLUMN descricao TYPE TEXT;


-- ================================================================================= --
-- 3. AJUSTE NA TABELA 'skin': REMOÇÃO DE COLUNA REDUNDANTE
-- Objetivo: Corrigir o design do banco, alinhando-o com as entidades JPA.
-- ================================================================================= --

-- Passo 3.1: Remove a coluna 'jogo_nome' da tabela 'skin'.
-- A informação do nome do jogo deve ser obtida através do relacionamento com a tabela 'jogo' via 'jogo_id'.
-- Isso corrige o erro 'o valor nulo na coluna "jogo_nome" viola a restrição de não-nulo'.
ALTER TABLE skin DROP COLUMN IF EXISTS jogo_nome;


-- ================================================================================= --
-- 4. AJUSTE NA TABELA 'jogo': GARANTIR NOME ÚNICO (SUGERIDO NO ARQUIVO dataJogos.sql)
-- Objetivo: Impedir que dois jogos com o mesmo nome sejam inseridos.
-- ================================================================================= --

-- Passo 4.1: Adiciona uma restrição de unicidade (UNIQUE) na coluna 'nome'.
-- O "IF NOT EXISTS" é para a sintaxe de alguns sistemas, mas no PostgreSQL padrão
-- o ideal é verificar se a constraint já existe antes de rodar. O comando simples é:
ALTER TABLE jogo ADD CONSTRAINT uk_jogo_nome UNIQUE (nome);
