package com.leila.salao.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "agendamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AgendamentoStatus status = AgendamentoStatus.PENDENTE;

    private String observacao;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "agendamento_servicos",
        joinColumns = @JoinColumn(name = "agendamento_id"),
        inverseJoinColumns = @JoinColumn(name = "servico_id")
    )
    @Builder.Default
    private List<Servico> servicos = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime criadoEm;
}