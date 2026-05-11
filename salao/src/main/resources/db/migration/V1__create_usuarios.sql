CREATE TABLE usuarios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(150)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    senha_hash  VARCHAR(255)        NOT NULL,
    telefone    VARCHAR(20)         NOT NULL,
    role        VARCHAR(20)         NOT NULL CHECK (role IN ('CLIENTE', 'CABELEIREIRA')),
    criado_em   TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);