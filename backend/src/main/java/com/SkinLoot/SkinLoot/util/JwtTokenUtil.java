package com.SkinLoot.SkinLoot.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

/**
 * Classe utilitária para geração e validação de tokens JWT (HS256).
 * Usa uma chave secreta codificada em Base64 e define expirações separadas
 * para tokens de acesso e refresh.
 */
@Component
public class JwtTokenUtil {

    // 🔐 Chave secreta em Base64 (mínimo 256 bits)
    private static final String SECRET_KEY_B64 = "aG9nZXJzZWNyZXRvLXNraW5sb290LWF1dGgtdG9rZW4tc2VjcmV0";

    // ⏰ Tempos de expiração (em milissegundos)
    private static final long ACCESS_TOKEN_EXPIRATION = 30 * 60 * 1000L; // 30 minutos
    private static final long REFRESH_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000L; // 1 dia

    /**
     * Retorna a chave HMAC derivada da SECRET_KEY (decodificada de Base64).
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY_B64);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ---------------------- GERAÇÃO ----------------------

    /**
     * Gera um token de acesso (curta duração).
     */
    public String generateAccessToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Gera um token de refresh (longa duração).
     */
    public String generateRefreshToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ---------------------- VALIDAÇÃO ----------------------

    /**
     * Verifica se o token é válido sintaticamente e não expirou.
     */
    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    /**
     * Valida o token comparando o username interno com o do UserDetails.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username != null &&
                username.equals(userDetails.getUsername()) &&
                !isTokenExpired(token));
    }

    // ---------------------- EXTRAÇÃO ----------------------

    /**
     * Retorna todas as claims do token.
     */
    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extrai o nome do usuário (subject) do token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrai a data de expiração.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extrai uma claim genérica usando um resolver.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = parseToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Retorna se o token já expirou.
     */
    private boolean isTokenExpired(String token) {
        final Date exp = extractExpiration(token);
        return exp.before(new Date());
    }
}
