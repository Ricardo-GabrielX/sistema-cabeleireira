CREATE TABLE servicos (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome              VARCHAR(100)    NOT NULL,
    descricao         VARCHAR(255),
    duracao_minutos   INTEGER         NOT NULL,
    preco             NUMERIC(10, 2)  NOT NULL
);