package com.SkinLoot.SkinLoot.config;

import com.SkinLoot.SkinLoot.util.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    // Classe utilitária responsável por manipular o token JWT (extração de dados, validação, etc.)
    private final JwtTokenUtil jwtTokenUtil;

    // Serviço que carrega os detalhes do usuário com base no username extraído do token
    private final UserDetailsService userDetailsService;

    // Logger para registrar eventos relevantes do filtro
    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    // Injeção de dependências via construtor
    public JwtRequestFilter(JwtTokenUtil jwtTokenUtil, UserDetailsService userDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    // Método principal que intercepta todas as requisições e aplica a lógica de autenticação JWT
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Captura o valor do cabeçalho "Authorization" da requisição HTTP
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        try {
            // Verifica se o cabeçalho começa com "Bearer " (padrão dos tokens JWT)
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                // Extrai o token sem o prefixo "Bearer "
                jwtToken = authorizationHeader.substring(7);
                // Obtém o nome de usuário (username) do token
                username = jwtTokenUtil.extractUsername(jwtToken);
            }

            // Armazena o contexto de segurança para reutilização
            var context = SecurityContextHolder.getContext();

            // Verifica se o username foi extraído com sucesso e se o usuário ainda não está autenticado
            if (username != null && context.getAuthentication() == null) {
                // Carrega os detalhes do usuário com base no username
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // Valida o token JWT com base nos dados do usuário
                if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                    // Cria um objeto de autenticação com base no usuário e suas permissões
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    // Adiciona detalhes adicionais da requisição (ex: IP, sessão)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Define o usuário autenticado no contexto de segurança da aplicação
                    context.setAuthentication(authToken);

                    // (Opcional) Loga que o token foi aceito
                    logger.info("Token JWT válido para o usuário: {}", username);
                }
            }
        } catch (Exception e) {
            // Em caso de erro, registra a mensagem e o stack trace completo para depuração
            logger.warn("Falha na autenticação JWT", e);
        }

        // Continua a execução da cadeia de filtros
        filterChain.doFilter(request, response);
    }
}
