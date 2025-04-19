package com.duckherald.auth

import com.duckherald.config.JwtTokenProvider
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val token = resolveToken(request)
            if (token != null && jwtTokenProvider.validateToken(token)) {
                // 토큰으로부터 사용자 ID와 권한 추출
                val userId = jwtTokenProvider.getUserId(token)
                val roles = jwtTokenProvider.getRoles(token)
                
                // 권한 설정
                val authorities = roles.map { SimpleGrantedAuthority("ROLE_$it") }
                
                // 인증 객체 생성 및 SecurityContext에 설정
                val authentication = UsernamePasswordAuthenticationToken(userId, "", authorities)
                SecurityContextHolder.getContext().authentication = authentication
            }
        } catch (e: Exception) {
            // 토큰 검증 실패 시 로깅
            logger.error("JWT 토큰 검증 실패", e)
        }

        filterChain.doFilter(request, response)
    }

    private fun resolveToken(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else null
    }
} 