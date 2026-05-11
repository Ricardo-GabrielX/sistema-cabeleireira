CREATE TABLE agendamentos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id  UUID            NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data_hora   TIMESTAMP       NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'PENDENTE'
                    CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'CANCELADO')),
    observacao  VARCHAR(500),
    criado_em   TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agendamentos_cliente_id  ON agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_data_hora   ON agendamentos(data_hora);