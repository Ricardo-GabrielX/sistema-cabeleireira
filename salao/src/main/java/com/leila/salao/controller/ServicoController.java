package com.leila.salao.controller;

import com.leila.salao.dto.ServicoDTO;
import com.leila.salao.service.ServicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/servicos")
@RequiredArgsConstructor
public class ServicoController {

    private final ServicoService servicoService;

    @GetMapping
    public ResponseEntity<List<ServicoDTO.Response>> listar() {
        return ResponseEntity.ok(servicoService.listarTodos());
    }

    @PostMapping("/admin")
    public ResponseEntity<ServicoDTO.Response> criar(@RequestBody ServicoDTO.Request req) {
        return ResponseEntity.ok(servicoService.criar(req));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ServicoDTO.Response> atualizar(
            @PathVariable UUID id, @RequestBody ServicoDTO.Request req) {
        return ResponseEntity.ok(servicoService.atualizar(id, req));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        servicoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}