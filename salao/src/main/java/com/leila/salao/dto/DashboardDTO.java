package com.leila.salao.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

public class DashboardDTO {

    @Data
    @Builder
    public static class SemanaResponse {
        private long totalSemana;
        private long confirmados;
        private long pendentes;
        private long cancelados;
        private Map<String, Long> agendamentosPorDia; // "Seg" -> 3, "Ter" -> 1...
        private List<SugestaoConsolidacao> sugestoes;
    }

    @Data
    @Builder
    public static class SugestaoConsolidacao {
        private String clienteNome;
        private String clienteTelefone;
        private String sugestaoData;
        private List<AgendamentoDTO.Response> agendamentos;
    }
}