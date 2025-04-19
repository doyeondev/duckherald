package com.duckherald.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import java.util.Properties

@Configuration
class MailConfig {
    private val logger = LoggerFactory.getLogger(MailConfig::class.java)

    @Value("\${MAIL_USERNAME:doyeon.sean.dev@gmail.com}")
    private lateinit var username: String

    @Value("\${MAIL_PASSWORD:igrnbxplhsnoajvq}")
    private lateinit var password: String

    init {
        println("===== MailConfig 초기화됨 =====")
    }

    @Bean
    @Primary
    @Profile("dev", "default") // 개발 환경 및 기본 환경용
    fun javaMailSender(): JavaMailSender {
        println("==== 개발환경 메일 설정 초기화 시작 ====")
        
        val mailSender = JavaMailSenderImpl()
        mailSender.host = "smtp.gmail.com"
        mailSender.port = 587
        
        println("SMTP 설정: smtp.gmail.com:587")
        println("사용자: $username")
        
        mailSender.username = username
        mailSender.password = password
        
        val props = Properties()
        props["mail.transport.protocol"] = "smtp"
        props["mail.smtp.auth"] = "true"
        props["mail.smtp.starttls.enable"] = "true"
        props["mail.smtp.starttls.required"] = "true"
        props["mail.smtp.ssl.trust"] = "smtp.gmail.com"
        props["mail.debug"] = "true" // 개발 환경에서는 디버그 활성화
        
        mailSender.javaMailProperties = props
        
        println("==== 개발환경 메일 설정 초기화 완료 ====")
        
        return mailSender
    }
    
    @Bean
    @Profile("prod") // 프로덕션 환경용
    fun secureMailSender(): JavaMailSender {
        logger.info("==== 프로덕션 환경 메일 설정 초기화 시작 ====")
        
        val mailSender = JavaMailSenderImpl()
        mailSender.host = "smtp.gmail.com"
        mailSender.port = 587
        
        // 환경 변수에서만 값을 가져오고 기본값은 제공하지 않음
        val secureUsername = System.getenv("MAIL_USERNAME") 
            ?: throw IllegalStateException("MAIL_USERNAME 환경 변수가 설정되지 않았습니다.")
        val securePassword = System.getenv("MAIL_PASSWORD") 
            ?: throw IllegalStateException("MAIL_PASSWORD 환경 변수가 설정되지 않았습니다.")
        
        logger.info("SMTP 설정: smtp.gmail.com:587")
        logger.info("메일 계정이 설정되었습니다.")
        
        mailSender.username = secureUsername
        mailSender.password = securePassword
        
        // 보안 설정 강화
        val props = Properties()
        props["mail.transport.protocol"] = "smtp"
        props["mail.smtp.auth"] = "true"
        props["mail.smtp.starttls.enable"] = "true"
        props["mail.smtp.starttls.required"] = "true"
        props["mail.smtp.ssl.trust"] = "smtp.gmail.com"
        props["mail.debug"] = "false" // 프로덕션에서는 디버그 비활성화
        
        // 타임아웃 설정 추가
        props["mail.smtp.connectiontimeout"] = "5000" // 연결 타임아웃 5초
        props["mail.smtp.timeout"] = "10000" // 소켓 타임아웃 10초
        props["mail.smtp.writetimeout"] = "10000" // 쓰기 타임아웃 10초
        
        mailSender.javaMailProperties = props
        
        logger.info("==== 프로덕션 환경 메일 설정 초기화 완료 ====")
        
        return mailSender
    }
} 