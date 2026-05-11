package com.leila.salao.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "servicos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @Column(nullable = false)
    private Integer duracaoMinutos;

    @Column(nullable = false)
    private BigDecimal preco;
}