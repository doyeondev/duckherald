package com.duckherald.config

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}")
    private val secretKeyString: String,
    
    @Value("\${jwt.expiration}")
    private val validityInMilliseconds: Long
) {
    private val logger = LoggerFactory.getLogger(JwtTokenProvider::class.java)
    
    // SecretKey 초기화 - 값이 유효한 Base64인지 확인 후 디코딩
    private val key: SecretKey by lazy {
        try {
            logger.info("JWT 키 초기화 중...")
            Keys.hmacShaKeyFor(secretKeyString.toByteArray())
        } catch (e: Exception) {
            logger.error("키 초기화 실패: ${e.message}")
            throw RuntimeException("JWT 시크릿 키 초기화 오류", e)
        }
    }
    
    /**
     * JWT 토큰 생성
     * 
     * @param id 사용자 ID
     * @param roles 사용자 권한 목록
     * @return 생성된 JWT 토큰
     */
    fun createToken(id: String, roles: List<String>): String {
        logger.debug("토큰 생성: id=$id, roles=$roles")
        
        val claims: Claims = Jwts.claims().setSubject(id)
        claims["roles"] = roles
        
        val now = Date()
        val validity = Date(now.time + validityInMilliseconds)
        
        val token = Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact()
            
        logger.debug("토큰 생성 완료: ${token.substring(0, 10)}...")
        return token
    }
    
    /**
     * 토큰에서 사용자 ID 추출
     * 
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    fun getUserId(token: String): String {
        try {
            val subject = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .body
                .subject
                
            logger.debug("토큰에서 ID 추출: $subject")
            return subject
        } catch (e: Exception) {
            logger.error("토큰에서 ID 추출 실패: ${e.message}")
            throw e
        }
    }
    
    /**
     * 토큰에서 사용자 권한 추출
     * 
     * @param token JWT 토큰
     * @return 사용자 권한 목록
     */
    @Suppress("UNCHECKED_CAST")
    fun getRoles(token: String): List<String> {
        try {
            val claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .body
                
            val roles = claims["roles"] as List<String>
            logger.debug("토큰에서 권한 추출: $roles")
            return roles
        } catch (e: Exception) {
            logger.error("토큰에서 권한 추출 실패: ${e.message}")
            return emptyList()
        }
    }
    
    /**
     * 토큰 유효성 검증
     * 
     * @param token JWT 토큰
     * @return 유효성 여부
     */
    fun validateToken(token: String): Boolean {
        try {
            val claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                
            // 만료 시간 확인
            val valid = !claims.body.expiration.before(Date())
            logger.debug("토큰 유효성 검증: $valid")
            return valid
        } catch (e: Exception) {
            logger.error("토큰 검증 실패: ${e.message}")
            return false
        }
    }
} 