package com.SkinLoot.SkinLoot.util;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    // Chave secreta para assinar os tokens — isso pode vir de uma variável de ambiente futuramente
    private final String SECRET_KEY = "aG9nZXJzZWNyZXRvLXNraW5sb290LWF1dGgtdG9rZW4tc2VjcmV0"; // mínimo 256 bits para HS256

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 horas
    private static final long ACCESS_TOKEN_EXPIRATION = 10 * 60 * 1000; // 10 min
    private static final long REFRESH_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 1 dia

//    private final PrivateKey privateKey;
//    private final PublicKey publicKey;

    public JwtTokenUtil() throws Exception {
//        this.privateKey = loadPrivateKeyFromResource("private_key.pem");
//        this.publicKey = loadPublicKeyFromResource("public_key.pem");
    }


    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String generateAccessToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String generateRefreshToken(String sessionId) {
        return Jwts.builder()
                .setId(sessionId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    private PrivateKey loadPrivateKeyFromResource(String filename) throws Exception {
        InputStream is = getClass().getClassLoader().getResourceAsStream(filename);
        String key = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        key = key.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(key);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePrivate(spec);
    }
    private PublicKey loadPublicKeyFromResource(String filename) throws Exception {
        InputStream is = getClass().getClassLoader().getResourceAsStream(filename);
        String key = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        key = key.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(key);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }
}

