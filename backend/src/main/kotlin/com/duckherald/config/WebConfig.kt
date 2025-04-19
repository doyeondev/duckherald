package com.duckherald.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {

    /**
     * CORS 설정 구성
     * 모든 출처(origins)에서의 요청을 허용하고, 필요한 헤더와 HTTP 메서드를 설정합니다.
     */
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**") // 모든 경로에 적용
            .allowedOrigins("*") // 모든 출처 허용
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // 모든 HTTP 메서드 허용
            .allowedHeaders("*") // 모든 헤더 허용
            .maxAge(3600) // 3600초 동안 pre-flight 요청 결과를 캐시
            
        // 콘솔에 CORS 설정 로그 출력
        println("=== CORS 설정 완료 ===")
        println("모든 출처(*)에서의 API 요청 허용")
        println("허용 메서드: GET, POST, PUT, DELETE, OPTIONS, PATCH")
        println("허용 헤더: 모든 헤더(*)")
    }
} 