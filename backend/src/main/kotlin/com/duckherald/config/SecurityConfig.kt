package com.duckherald.config

import com.duckherald.auth.JwtAuthenticationFilter
import com.duckherald.config.JwtTokenProvider
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.DelegatingPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import java.util.HashMap

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtTokenProvider: JwtTokenProvider
) {
    @Bean
    fun passwordEncoder(): PasswordEncoder {
        // 커스텀 Argon2 패스워드 인코더를 사용 
        // - Directus/PHP 스타일의 $argon2id$ 해시 형식을 처리할 수 있음
        return CustomArgon2PasswordEncoder()
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.disable() }
            .sessionManagement { 
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authorizeHttpRequests {
                it
                    // Swagger UI와 OpenAPI 문서 경로 접근 허용
                    .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                    // 인증 관련 API는 모두 허용
                    .requestMatchers("/api/auth/login").permitAll()
                    .requestMatchers("/api/auth/admin/create").permitAll()
                    .requestMatchers("/api/auth/signup").permitAll()
                    .requestMatchers("/api/auth/validate").permitAll()
                    .requestMatchers("/api/auth/test-token").permitAll()
                    // 뉴스레터 API는 공개적으로 접근 가능하게 설정
                    .requestMatchers("/api/newsletters").permitAll()
                    .requestMatchers("/api/newsletters/**").permitAll()
                    .requestMatchers("/api/newsletters/published").permitAll()
                    // 구독자 API도 모두 허용
                    .requestMatchers("/api/subscribers").permitAll()
                    .requestMatchers("/api/subscribers/**").permitAll()
                    .requestMatchers("/api/admin/subscribers").permitAll()
                    .requestMatchers("/api/admin/subscribers/**").permitAll()
                    // 배송 API도 모두 허용
                    .requestMatchers("/api/delivery").permitAll()
                    .requestMatchers("/api/delivery/**").permitAll()
                    // 그 외 모든 요청은 인증 필요
                    .anyRequest().authenticated()
            }
            .addFilterBefore(
                JwtAuthenticationFilter(jwtTokenProvider),
                UsernamePasswordAuthenticationFilter::class.java
            )

        return http.build()
    }
} 