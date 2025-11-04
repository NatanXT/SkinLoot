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
 * Utilitário de JWT (HS256).
 * Suporte completo para geração, validação e extração de claims.
 */
@Component
public class JwtTokenUtil {

    // 🔐 Chave secreta em Base64 (256 bits)
    private static final String SECRET_KEY_B64 = "aG9nZXJzZWNyZXRvLXNraW5sb290LWF1dGgtdG9rZW4tc2VjcmV0";

    // ⏰ Tempo de expiração
    private static final long ACCESS_TOKEN_EXPIRATION = 10000 * 60 * 1000L; // ? min
    private static final long REFRESH_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000L; // 1 dia

    // --------------------------- CHAVE ---------------------------
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY_B64);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // --------------------------- GERAÇÃO ---------------------------

    /** ✅ Novo método padrão (String subject) */
    public String generateAccessToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** ✅ Novo método para refresh */
    public String generateRefreshToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** 🔙 Compatibilidade: usado no UsuarioController (UserDetails) */
    public String generateToken(UserDetails userDetails) {
        return generateAccessToken(userDetails.getUsername());
    }

    /** 🔙 Compatibilidade: usado no UsuarioController (email) */
    public String generateTokenFromEmail(String email) {
        return generateAccessToken(email);
    }

    // --------------------------- VALIDAÇÃO ---------------------------

    public boolean isTokenValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username != null &&
                username.equals(userDetails.getUsername()) &&
                !isTokenExpired(token));
    }

    // --------------------------- EXTRAÇÃO ---------------------------

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = parseToken(token);
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        final Date exp = extractExpiration(token);
        return exp.before(new Date());
    }
}
