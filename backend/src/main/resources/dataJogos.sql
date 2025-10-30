-- Garante que o nome do jogo é único passo1
-- ALTER TABLE jogo
--     ADD CONSTRAINT uk_jogo_nome UNIQUE (nome);

ALTER TABLE jogo_categorias DROP CONSTRAINT IF EXISTS jogo_categorias_categoria_check;

-- Garante que a combinação jogo-categoria é única para evitar duplicatas
ALTER TABLE jogo_categorias ADD CONSTRAINT jogo_categorias_categoria_check
    CHECK (categoria IN (
        -- Categorias antigas
                         'FPS',
                         'RPG',
                         'MOBA',
                         'ESTRATEGIA',
                         'SANDBOX',
                         'P2W',
        -- Categorias novas
                         'TATICO',
                         'COMPETITIVO',
                         'HERO_SHOOTER',
                         'SOBREVIVENCIA',
                         'MUNDO_ABERTO'
        ));

-- Insere as categorias passo2
-- Insere os jogos na tabela principal
INSERT INTO jogo (id, nome) VALUES
                                (gen_random_uuid(), 'CS:GO'),
                                (gen_random_uuid(), 'Valorant'),
                                (gen_random_uuid(), 'League of Legends'),
                                (gen_random_uuid(), 'Rust'),
                                (gen_random_uuid(), 'Dota 2')
ON CONFLICT (nome) DO NOTHING;

--passo 3 Associa categorias ao CS:GO
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('CS:GO', 'FPS') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('CS:GO', 'TATICO') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('CS:GO', 'COMPETITIVO') ON CONFLICT DO NOTHING;

-- Associa categorias ao Valorant
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Valorant', 'FPS') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Valorant', 'TATICO') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Valorant', 'HERO_SHOOTER') ON CONFLICT DO NOTHING;

-- Associa categorias ao Dota 2
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Dota 2', 'MOBA') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Dota 2', 'ESTRATEGIA') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Dota 2', 'COMPETITIVO') ON CONFLICT DO NOTHING;

-- Associa categorias ao League of Legends
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('League of Legends', 'MOBA') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('League of Legends', 'ESTRATEGIA') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('League of Legends', 'COMPETITIVO') ON CONFLICT DO NOTHING;

-- Associa categorias ao Rust
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Rust', 'SOBREVIVENCIA') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Rust', 'MUNDO_ABERTO') ON CONFLICT DO NOTHING;
INSERT INTO jogo_categorias (jogo_nome, categoria) VALUES ('Rust', 'FPS') ON CONFLICT DO NOTHING;
