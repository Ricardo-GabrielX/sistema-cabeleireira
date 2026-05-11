package com.leila.salao.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

public class ServicoDTO {

    @Data
    public static class Request {
        private String nome;
        private String descricao;
        private Integer duracaoMinutos;
        private BigDecimal preco;
    }

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String nome;
        private String descricao;
        private Integer duracaoMinutos;
        private BigDecimal preco;
    }
}