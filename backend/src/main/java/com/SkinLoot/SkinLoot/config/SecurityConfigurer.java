package com.SkinLoot.SkinLoot.config;

import com.SkinLoot.SkinLoot.model.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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
import java.util.List;

/**
 * Configuração de segurança principal do sistema.
 * Define CORS, filtros JWT, permissões e gerenciamento de sessão sem estado.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfigurer {

    private final JwtRequestFilter jwtRequestFilter;

    @Value("${backend.allowed.origins:http://localhost:5173}")
    private List<String> allowedOrigins;

    public SecurityConfigurer(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    // Gerenciador de autenticação (usado no login)
    @Bean
    public AuthenticationManager authenticationManager(
            HttpSecurity http,
            PasswordEncoder passwordEncoder,
            UserDetailsService userDetailsService) throws Exception {

        AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);
        builder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
        return builder.build();
    }

    // Encoder padrão (BCrypt)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configuração principal de segurança
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos
                        .requestMatchers(
                                "/usuarios/login",
                                "/usuarios/register",
                                "/usuarios/auth/refresh",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/ws-chat/**")
                        .permitAll()

                        // Anúncios públicos (GET)
                        .requestMatchers(HttpMethod.GET, "/anuncios/**").permitAll()

                        // Anúncios protegidos (POST, PUT, DELETE) — qualquer usuário logado
                        .requestMatchers(HttpMethod.POST, "/anuncios/save").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/anuncios/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/anuncios/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/planos/renovar").authenticated()
                        .requestMatchers(HttpMethod.POST, "/planos/upgrade").authenticated()


                        // Área admin
                        .requestMatchers("/api/admin/**").hasAuthority(Role.ADMIN.name())


                        // Outras rotas exigem autenticação
                        .anyRequest().authenticated())
                // JWT = stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Adiciona o filtro JWT antes do UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                // Tratamento de erros
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler(new AccessDeniedHandlerImpl()));

        return http.build();
    }

    // Configuração CORS — necessária para enviar cookies e headers Authorization
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(allowedOrigins);
        cfg.setAllowCredentials(true);
        cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Auth-Token",
                "Accept",
                "Origin"));
        cfg.setExposedHeaders(Arrays.asList("Authorization", "X-Auth-Token"));
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
