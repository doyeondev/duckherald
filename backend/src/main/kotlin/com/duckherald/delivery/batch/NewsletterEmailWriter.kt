package com.duckherald.delivery.batch

import com.duckherald.delivery.dto.EmailDeliveryTask
import com.duckherald.delivery.model.DeliveryLog
import com.duckherald.delivery.repository.DeliveryLogRepository
import org.springframework.batch.item.Chunk
import org.springframework.batch.item.ItemWriter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import java.time.LocalDateTime

class NewsletterEmailWriter : ItemWriter<EmailDeliveryTask> {
    
    @Autowired
    private lateinit var javaMailSender: JavaMailSender
    
    @Autowired
    private lateinit var deliveryLogRepository: DeliveryLogRepository
    
    override fun write(chunk: Chunk<out EmailDeliveryTask>) {
        chunk.items.forEach { item: EmailDeliveryTask ->
            try {
                // 이메일 메시지 생성
                val message = javaMailSender.createMimeMessage()
                val helper = MimeMessageHelper(message, true, "UTF-8")
                
                // 이메일 설정
                helper.setTo(item.email)
                helper.setSubject(item.title)
                helper.setText(item.content, true) // HTML 형식
                
                // 이메일 발송
                javaMailSender.send(message)
                
                // 발송 성공 기록
                val log = DeliveryLog(
                    newsletterId = item.newsletterId,
                    subscriberId = item.subscriberId,
                    status = "SENT",
                    sentAt = LocalDateTime.now()
                )
                deliveryLogRepository.save(log)
                
                item.status = "SENT"
            } catch (e: Exception) {
                // 발송 실패 기록
                val log = DeliveryLog(
                    newsletterId = item.newsletterId,
                    subscriberId = item.subscriberId,
                    status = "FAILED",
                    sentAt = LocalDateTime.now()
                )
                deliveryLogRepository.save(log)
                
                item.status = "FAILED"
            }
        }
    }
} 