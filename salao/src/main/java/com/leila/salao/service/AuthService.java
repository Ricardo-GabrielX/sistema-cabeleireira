package com.leila.salao.service;

import com.leila.salao.dto.AuthDTO;
import com.leila.salao.model.Usuario;
import com.leila.salao.model.UsuarioRole;
import com.leila.salao.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

import javax.management.RuntimeErrorException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthDTO.LoginResponse cadastrar(AuthDTO.CadastroRequest req) {
        if (usuarioRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        if(req.getRole() != null && req.getRole() == UsuarioRole.CABELEIREIRA) {
            throw new RuntimeException("Erro: Não é permitido cadastrar usuários do tipo CABELEIREIRA");
        }

        Usuario usuario = Usuario.builder()
            .nome(req.getNome())
            .email(req.getEmail())
            .senhaHash(passwordEncoder.encode(req.getSenha()))
            .telefone(req.getTelefone())
            .role(req.getRole())
            .build();

        usuario = usuarioRepository.save(usuario);

        String token = gerarTokenPorRole(usuario);

        return AuthDTO.LoginResponse.builder()
            .token(token)
            .nome(usuario.getNome())
            .usuarioId(usuario.getId())
            .role(usuario.getRole().name())
            .build();
    }

    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("Email ou senha inválidos"));

        if (!passwordEncoder.matches(req.getSenha(), usuario.getSenhaHash())) {
            throw new RuntimeException("Email ou senha inválidos");
        }

        String token = gerarTokenPorRole(usuario);

        return AuthDTO.LoginResponse.builder()
            .token(token)
            .nome(usuario.getNome())
            .usuarioId(usuario.getId())
            .role(usuario.getRole().name())
            .build();
    }

    private String gerarTokenPorRole(Usuario usuario) {
        return usuario.getRole() == UsuarioRole.CABELEIREIRA
            ? jwtService.gerarTokenCabeleireira(usuario.getId())
            : jwtService.gerarTokenCliente(usuario.getId());
    }
}