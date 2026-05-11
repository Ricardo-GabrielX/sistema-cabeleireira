package com.leila.salao.controller;

import com.leila.salao.dto.DashboardDTO;
import com.leila.salao.service.AgendamentoService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AgendamentoService agendamentoService;

    @GetMapping("/semana")
    public ResponseEntity<Map<String, Object>> semana() {
        return ResponseEntity.ok(agendamentoService.dashboardSemana());
    }
}