CREATE TABLE agendamento_servicos (
    agendamento_id  UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    servico_id      UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    PRIMARY KEY (agendamento_id, servico_id)
);