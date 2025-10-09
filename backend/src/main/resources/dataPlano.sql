-- Garante que a coluna 'nome' seja única para o ON CONFLICT funcionar
-- Execute este comando uma vez no seu banco de dados se ainda não o fez.
ALTER TABLE plano_assinatura ADD CONSTRAINT uk_plano_assinatura_nome UNIQUE (nome);

-- Insere os planos com nomes em MAIÚSCULAS para corresponder ao Enum Java
INSERT INTO plano_assinatura (nome, preco_mensal, limite_anuncios, destaque_anuncio)
VALUES ('GRATUITO', 0.00, 5, false)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO plano_assinatura (nome, preco_mensal, limite_anuncios, destaque_anuncio)
VALUES ('INTERMEDIARIO', 19.90, 20, true)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO plano_assinatura (nome, preco_mensal, limite_anuncios, destaque_anuncio)
VALUES ('PLUS', 49.90, 100, true)
ON CONFLICT (nome) DO NOTHING;
