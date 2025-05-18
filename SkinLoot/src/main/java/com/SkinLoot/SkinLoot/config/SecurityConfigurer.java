package com.SkinLoot.SkinLoot.config;

import com.SkinLoot.SkinLoot.model.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration // Indica que esta classe fornece configurações para o Spring
@EnableWebSecurity // Habilita as configurações de segurança da aplicação
public class SecurityConfigurer {

    private final JwtRequestFilter jwtRequestFilter; // Filtro personalizado que valida tokens JWT em cada requisição

    @Value("${backend.allowed.origins}")
    private List<String> allowedOrigins; // Lista de origens permitidas para requisições CORS (configurável via properties)

    // Constantes para rotas públicas (sem autenticação) e para rotas de admin
    private static final String[] PUBLIC_ENDPOINTS = {
            "/usuarios/login",
            "/usuarios/register"
    };
    private static final String ADMIN_ENDPOINT = "/api/user/**";

    // Injeção do filtro JWT via construtor
    public SecurityConfigurer(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    // Define o AuthenticationManager que gerencia a autenticação dos usuários
    @Bean
    public AuthenticationManager authenticationManager(
            HttpSecurity http,
            PasswordEncoder passwordEncoder,
            UserDetailsService userDetailsService
    ) throws Exception {
        AuthenticationManagerBuilder authManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authManagerBuilder
                .userDetailsService(userDetailsService) // Serviço que fornece os dados do usuário a partir do banco
                .passwordEncoder(passwordEncoder); // Define o algoritmo de hash de senha (BCrypt)
        return authManagerBuilder.build(); // Cria o AuthenticationManager configurado
    }

    // Define o algoritmo usado para codificar as senhas
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Utiliza o algoritmo BCrypt (seguro e amplamente utilizado)
    }

    // Configura a cadeia de filtros de segurança para as requisições HTTP
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // Ativa suporte a CORS (Cross-Origin Resource Sharing)
                .csrf(AbstractHttpConfigurer::disable) // Desativa CSRF (não é necessário com JWT)
                .anonymous(AbstractHttpConfigurer::disable) // Bloqueia acesso de usuários anônimos
                .authorizeHttpRequests(this::configureAuthorization) // Aplica regras de autorização por rota
                /*.authorizeHttpRequests(authorize -> { Mesma coisa que o de cima mas colocar no lugar caso a versão de conflitancia
                    authorize
                            .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                            .requestMatchers(ADMIN_ENDPOINT).hasAuthority(Role.ADMIN.name())
                            .anyRequest().authenticated();
                })*/
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Define que não há sessão (stateless), pois usamos JWT
                .exceptionHandling(this::configureExceptionHandling) // Define como as exceções de segurança serão tratadas
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class); // Insere o filtro JWT antes da autenticação padrão

        return http.build(); // Retorna a configuração final da cadeia de segurança
    }

    // Define as permissões de acesso com base nas rotas e papéis dos usuários
    private void configureAuthorization(HttpSecurity.AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry authorize) {
        authorize
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll() // Rotas públicas não exigem autenticação
                .requestMatchers(ADMIN_ENDPOINT).hasAuthority(Role.ADMIN.name()) // Apenas usuários com papel ADMIN podem acessar
                .anyRequest().authenticated(); // Todas as outras rotas exigem autenticação
    }

    // Define o comportamento para quando o usuário não estiver autenticado ou não tiver permissão
    private void configureExceptionHandling(HttpSecurity.ExceptionHandlingConfigurer<HttpSecurity> handling) {
        handling
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) // Retorna HTTP 401 se não autenticado
                .accessDeniedHandler(new AccessDeniedHandlerImpl()); // Retorna HTTP 403 se autenticado, mas sem permissão suficiente
    }

    // Configura as regras de CORS com base nas origens permitidas definidas no properties
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            // Proteção extra: evita iniciar a aplicação se nenhuma origem for permitida
            throw new IllegalStateException("A lista de origens permitidas (allowedOrigins) está vazia!");
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(allowedOrigins); // Permite padrões de origem (ex: http://localhost:*)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")); // Métodos HTTP permitidos
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token")); // Cabeçalhos aceitos
        configuration.setExposedHeaders(Collections.singletonList("x-auth-token")); // Cabeçalho exposto ao cliente (ex: tokens)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplica a configuração para todos os endpoints da API
        return source;
    }
}
