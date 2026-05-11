package com.leila.salao.controller;

import com.leila.salao.dto.AuthDTO;
import com.leila.salao.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/cadastro")
    public ResponseEntity<AuthDTO.LoginResponse> cadastrar(@RequestBody AuthDTO.CadastroRequest req) {
        return ResponseEntity.ok(authService.cadastrar(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.LoginResponse> login(@RequestBody AuthDTO.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}