
INSERT INTO plano_assinatura (nome, preco_mensal, limite_anuncios, destaque_anuncio)
VALUES ('Gratuito', 0.00, 5, false)
    ON CONFLICT (nome) DO NOTHING;

-- Insere os outros planos da mesma forma
INSERT INTO plano_assinatura (nome, preco_mensal, limite_anuncios, destaque_anuncio)
VALUES ('Intermediário', 19.90, 20, true)
    ON CONFLICT (nome) DO NOTHING;

INSERT INTO plano_assinatura (nome, preco_mensal, limite_anuncios, destaque_anuncio)
VALUES ('Plus', 49.90, 100, true)
    ON CONFLICT (nome) DO NOTHING;
