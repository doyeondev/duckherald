package com.duckherald

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import java.util.Properties
import jakarta.mail.Authenticator
import jakarta.mail.Message
import jakarta.mail.PasswordAuthentication
import jakarta.mail.Session
import jakarta.mail.Transport
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeMessage
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Assertions.assertDoesNotThrow

class SmtpTest {
    
    /**
     * 테스트 환경에서는 실행하지 않고, RUN_SMTP_TEST 환경변수가 설정된 경우에만 실행
     * 실제 SMTP 서버에 접속하는 테스트는 CI/CD 환경에서 실패할 수 있음
     */
    @Test
    @Disabled("실제 SMTP 서버에 접속하므로 필요할 때만 활성화")
    fun testRealSmtpConnection() {
        val username = System.getenv("SMTP_USERNAME") ?: "test@example.com"
        val password = System.getenv("SMTP_PASSWORD") ?: "password"  // 환경변수에서 가져오도록 수정
        
        val props = Properties()
        props["mail.smtp.host"] = "smtp.gmail.com"
        props["mail.smtp.port"] = "587"
        props["mail.smtp.auth"] = "true"
        props["mail.smtp.starttls.enable"] = "true"
        
        val session = Session.getInstance(props, object : Authenticator() {
            override fun getPasswordAuthentication(): PasswordAuthentication {
                return PasswordAuthentication(username, password)
            }
        })
        
        try {
            val message = MimeMessage(session)
            message.setFrom(InternetAddress(username))
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("test@example.com"))
            message.subject = "SMTP 연결 테스트"
            message.setText("이 이메일은 SMTP 연결 테스트입니다.")
            
            Transport.send(message)
            println("테스트 이메일이 성공적으로 발송되었습니다.")
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }
    
    /**
     * 단순히 SMTP 세션 생성이 가능한지 테스트
     * 실제 서버 연결은 시도하지 않음
     */
    @Test
    fun testSmtpSessionCreation() {
        val props = Properties()
        props["mail.smtp.host"] = "localhost"
        props["mail.smtp.port"] = "25"
        
        // 세션 생성만 테스트
        assertDoesNotThrow {
            val session = Session.getInstance(props)
            val message = MimeMessage(session)
            message.setFrom(InternetAddress("test@example.com"))
            message.addRecipient(Message.RecipientType.TO, InternetAddress("recipient@example.com"))
            message.subject = "테스트 메일"
            message.setText("테스트 내용입니다.")
            
            // 실제 전송은 하지 않음
            println("SMTP 세션 및 메시지 생성 성공")
        }
    }
} 