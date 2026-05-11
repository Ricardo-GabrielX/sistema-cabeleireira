package com.leila.salao.dto;

import com.leila.salao.model.AgendamentoStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AgendamentoDTO {

    @Data
    public static class Request {
        private LocalDateTime dataHora;
        private List<UUID> servicoIds;
        private String observacao;
    }

    @Data
    public static class StatusRequest {
        private AgendamentoStatus status;
    }

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String clienteNome;
        private String clienteTelefone;
        private LocalDateTime dataHora;
        private AgendamentoStatus status;
        private List<ServicoDTO.Response> servicos;
        private String observacao;
        private LocalDateTime criadoEm;
        private String sugestao; // preenchido quando há conflito de semana
    }
}