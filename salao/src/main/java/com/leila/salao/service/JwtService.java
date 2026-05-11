package com.leila.salao.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String gerarTokenCliente(UUID clienteId) {
        return gerarToken(clienteId.toString(), "CLIENTE");
    }

    public String gerarTokenCabeleireira(UUID cabelereiraId) {
        return gerarToken(cabelereiraId.toString(), "CABELEIREIRA");
    }

    private String gerarToken(String subject, String tipo) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.builder()
            .subject(subject)
            .claim("tipo", tipo)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(key)
            .compact();
    }

    public UUID extrairId(String token) {
        return UUID.fromString(getClaims(token).getSubject());
    }

    public String extrairTipo(String token) {
        return getClaims(token).get("tipo", String.class);
    }

    public boolean isValido(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}