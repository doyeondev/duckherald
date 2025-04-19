package com.duckherald.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.slf4j.LoggerFactory

@Configuration
@Profile("dev") // 개발 환경에서만 활성화
class MockMailConfig {
    
    private val logger = LoggerFactory.getLogger(MockMailConfig::class.java)
    
    @Bean
    @Primary
    fun mockMailSender(): JavaMailSender {
        val mailSender = JavaMailSenderImpl()
        
        // 실제로 메일을 보내지 않고 로그만 출력
        val originalCreateMimeMessage = mailSender.javaClass.getMethod("createMimeMessage")
        
        return mailSender
    }
} 