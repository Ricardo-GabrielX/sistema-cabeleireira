package com.leila.salao.controller;

import com.leila.salao.dto.AgendamentoDTO;
import com.leila.salao.service.AgendamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    // --- CLIENTE ---

    @PostMapping
    public ResponseEntity<AgendamentoDTO.Response> criar(
            @RequestBody AgendamentoDTO.Request req,
            Authentication auth) {
        UUID clienteId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(agendamentoService.criar(req, clienteId));
    }

    @GetMapping("/meus")
    public ResponseEntity<List<AgendamentoDTO.Response>> meus(Authentication auth) {
        UUID clienteId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(agendamentoService.listarDoCliente(clienteId));
    }

    @PutMapping("/{id}/cliente")
    public ResponseEntity<AgendamentoDTO.Response> atualizarComoCliente(
            @PathVariable UUID id,
            @RequestBody AgendamentoDTO.Request req,
            Authentication auth) {
        UUID clienteId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(agendamentoService.atualizarComoCliente(id, req, clienteId));
    }

    
    @GetMapping("/horarios-disponiveis")
    public ResponseEntity<List<String>> horariosDisponiveis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(agendamentoService.horariosDisponiveis(data));
    }

    // --- CABELEIREIRA ---

    @GetMapping("/todos")
    public ResponseEntity<List<AgendamentoDTO.Response>> todos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(agendamentoService.listarPorPeriodo(inicio, fim));
    }

    @PutMapping("/{id}/cabeleireira")
    public ResponseEntity<AgendamentoDTO.Response> atualizarComoCabeleireira(
            @PathVariable UUID id,
            @RequestBody AgendamentoDTO.Request req) {
        return ResponseEntity.ok(agendamentoService.atualizarComoCabeleireira(id, req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AgendamentoDTO.Response> alterarStatus(
            @PathVariable UUID id,
            @RequestBody AgendamentoDTO.StatusRequest req) {
        return ResponseEntity.ok(agendamentoService.alterarStatus(id, req.getStatus()));
    }
}