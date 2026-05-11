package com.leila.salao.dto;

import com.leila.salao.model.UsuarioRole;
import lombok.*;
import java.util.UUID;

public class AuthDTO {

    @Data
    public static class CadastroRequest {
        private String nome;
        private String email;
        private String senha;
        private String telefone;
        private UsuarioRole role;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String senha;
    }

    @Data
    @Builder
    public static class LoginResponse {
        private String token;
        private String nome;
        private UUID usuarioId;
        private String role;
    }
}