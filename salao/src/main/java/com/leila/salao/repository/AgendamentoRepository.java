package com.leila.salao.repository;

import com.leila.salao.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AgendamentoRepository extends JpaRepository<Agendamento, UUID> {

    List<Agendamento> findByClienteIdOrderByDataHoraDesc(UUID clienteId);

    List<Agendamento> findByDataHoraBetweenOrderByDataHoraAsc(
        LocalDateTime inicio, LocalDateTime fim);

    List<Agendamento> findByClienteIdAndDataHoraBetween(
        UUID clienteId, LocalDateTime inicio, LocalDateTime fim);
}