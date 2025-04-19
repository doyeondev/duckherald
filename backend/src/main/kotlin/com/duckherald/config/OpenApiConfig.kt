package com.duckherald.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.servers.Server
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * OpenAPI(Swagger) 문서 설정
 * 
 * API 문서 자동화를 위한 설정 클래스
 * 기본 URL: http://localhost:8080/swagger-ui/index.html
 * OpenAPI JSON: http://localhost:8080/v3/api-docs
 */
@Configuration
class OpenApiConfig {
    
    @Bean
    fun openAPI(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("DuckHerald API")
                .description("뉴스레터 서비스 DuckHerald의 API 문서")
                .version("v1.0.0")
                .contact(
                    Contact()
                        .name("DuckHerald Team")
                        .email("support@duckherald.com")
                )
        )
        .servers(
            listOf(
                Server()
                    .url("http://localhost:8080")
                    .description("개발 서버"),
                Server()
                    .url("https://api.duckherald.com")
                    .description("운영 서버")
            )
        )
} 