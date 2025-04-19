package com.duckherald

import org.junit.jupiter.api.Test
import java.util.Properties
import jakarta.mail.Authenticator
import jakarta.mail.Message
import jakarta.mail.PasswordAuthentication
import jakarta.mail.Session
import jakarta.mail.Transport
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeMessage

class SmtpTest {
    
    @Test
    fun testSmtpConnection() {
        val username = "doyeon.sean.dev@gmail.com"
        val password = "igrnbxplhsnoajvq"  // 앱 비밀번호
        
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
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("qazopl123@naver.com"))
            message.subject = "SMTP 연결 테스트"
            message.setText("이 이메일은 SMTP 연결 테스트입니다.")
            
            Transport.send(message)
            println("테스트 이메일이 성공적으로 발송되었습니다.")
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }
} 