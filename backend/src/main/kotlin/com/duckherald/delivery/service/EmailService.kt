// 1. EmailService: 이메일 콘텐츠 생성 및 발송을 담당
// 주요 역할:
// 이메일 콘텐츠 생성 및 포맷팅
// 템플릿 기반 이메일 렌더링
// 이메일 본문 HTML 생성
// 이메일 발송을 위한 저수준 기능 제공
// 이 서비스는 실제 이메일 내용을 만들고 포맷팅하는 역할을 담당

package com.duckherald.delivery.service

import com.duckherald.delivery.model.DeliveryLog
import com.duckherald.delivery.repository.DeliveryLogRepository
import com.duckherald.newsletter.model.NewsletterEntity
import com.duckherald.user.model.Subscriber
import com.duckherald.newsletter.service.NewsletterService
import com.duckherald.user.service.SubscriberService
import org.slf4j.LoggerFactory
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import org.thymeleaf.TemplateEngine
import org.thymeleaf.context.Context
import java.time.LocalDateTime
import java.util.concurrent.Executors
import jakarta.mail.internet.MimeMessage

@Service
class EmailService(
    private val mailSender: JavaMailSender,
    private val deliveryLogRepository: DeliveryLogRepository,
    private val newsletterService: NewsletterService,
    private val subscriberService: SubscriberService,
    private val templateEngine: TemplateEngine?
) {
    private val logger = LoggerFactory.getLogger(EmailService::class.java)
    private val executor = Executors.newFixedThreadPool(5)

    /**
     * 뉴스레터 발송 (비동기 처리)
     */
    fun sendNewsletter(newsletterId: Int) {
        val newsletter = newsletterService.getNewsletterById(newsletterId)
        val subscribers = subscriberService.getAllActiveSubscribers()
        
        subscribers.forEach { subscriber ->
            executor.submit {
                try {
                    val message = mailSender.createMimeMessage()
                    val helper = MimeMessageHelper(message, true, "UTF-8")
                    
                    helper.setTo(subscriber.email)
                    helper.setSubject(newsletter.title)
                    helper.setText(newsletter.content, true) // HTML 형식
                    
                    mailSender.send(message)
                    
                    // 발송 로그 기록
                    val log = DeliveryLog(
                        newsletterId = newsletterId,
                        subscriberId = subscriber.id!!,
                        status = "SENT",
                        sentAt = LocalDateTime.now()
                    )
                    
                    deliveryLogRepository.save(log)
                } catch (e: Exception) {
                    // 발송 실패 로그 기록
                    val log = DeliveryLog(
                        newsletterId = newsletterId,
                        subscriberId = subscriber.id!!,
                        status = "FAILED",
                        sentAt = LocalDateTime.now()
                    )
                    
                    deliveryLogRepository.save(log)
                }
            }
        }
    }

    /**
     * 발송 통계 조회
     */
    fun getDeliveryStats(newsletterId: Int): Map<String, Long> {
        val sentCount = deliveryLogRepository.countByNewsletterIdAndStatus(newsletterId, "SENT")
        val openedCount = deliveryLogRepository.countByNewsletterIdAndStatus(newsletterId, "OPENED")
        val clickedCount = deliveryLogRepository.countByNewsletterIdAndStatus(newsletterId, "CLICKED")
        val failedCount = deliveryLogRepository.countByNewsletterIdAndStatus(newsletterId, "FAILED")
        
        return mapOf(
            "sent" to sentCount,
            "opened" to openedCount,
            "clicked" to clickedCount,
            "failed" to failedCount
        )
    }

    /**
     * 단일 이메일 발송 처리
     * @param newsletter 뉴스레터 정보
     * @param subscriber 구독자 정보
     * @return 발송 성공 여부
     */
    fun sendEmail(newsletter: NewsletterEntity, subscriber: Subscriber): Boolean {
        try {
            // 상세 디버깅 로그 추가
            logger.info("이메일 발송 시작 - 구독자: ${subscriber.email}, 뉴스레터: ${newsletter.title}")
            logger.info("뉴스레터 ID: ${newsletter.id}, 내용 길이: ${newsletter.content?.length ?: 0}")
            
            val message = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, true, "UTF-8")
            
            // 이메일 메타 정보 설정
            helper.setFrom("doyeon.sean.dev@gmail.com", "덕헤럴드")
            helper.setTo(subscriber.email)
            helper.setSubject(newsletter.title ?: "덕헤럴드 뉴스레터")
            
            logger.info("메일 헤더 설정 완료 - 보낸사람: doyeon.sean.dev@gmail.com, 받는사람: ${subscriber.email}")
            
            // 이메일 추적용 픽셀 이미지 URL 생성
            val trackingPixelUrl = "http://localhost:8080/api/delivery/track/${newsletter.id}/${subscriber.id}"
            
            // 이메일 본문 생성 전 로깅
            logger.info("HTML 컨텐츠 생성 시작 - 뉴스레터 ID: ${newsletter.id}")
            
            // 검증: newsletter.content가 null인지 확인
            if (newsletter.content == null || newsletter.content.isBlank()) {
                logger.warn("뉴스레터 내용이 비어있음: ${newsletter.id}")
            }
            
            val htmlContent = generateEmailContent(newsletter, subscriber, trackingPixelUrl)
            
            logger.info("HTML 컨텐츠 생성 완료 - 길이: ${htmlContent.length}")
            
            helper.setText(htmlContent, true)
            
            // 이메일 발송 시도
            logger.info("이메일 발송 시도")
            mailSender.send(message)
            logger.info("이메일 발송 성공 - 구독자: ${subscriber.email}")
            
            return true
        } catch (e: Exception) {
            logger.error("이메일 발송 실패 - 구독자: ${subscriber.email}, 오류: ${e.message}", e)
            e.printStackTrace()  // 스택 트레이스 출력
            
            return false
        }
    }
    
    /**
     * HTML 이메일 본문 생성
     */
    fun generateEmailContent(newsletter: NewsletterEntity, subscriber: Subscriber, trackingPixelUrl: String): String {
        try {
            // 내용 검증
            val safeContent = newsletter.content?.takeIf { it.isNotBlank() } ?: "뉴스레터 내용이 없습니다."
            val safeTitle = newsletter.title?.takeIf { it.isNotBlank() } ?: "덕헤럴드 뉴스레터"
            
            logger.info("이메일 본문 생성 - 제목: $safeTitle, 내용 길이: ${safeContent.length}")
            
            // 직접 HTML 생성
            return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${safeTitle}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        padding: 20px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .content {
                        padding: 20px;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px 0;
                        border-top: 1px solid #eee;
                        font-size: 12px;
                        color: #999;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${safeTitle}</h1>
                </div>
                
                <div class="content">
                    ${safeContent}
                </div>
                
                <div class="footer">
                    <p>덕헤럴드 뉴스레터 구독을 해주셔서 감사합니다.</p>
                    <p>
                        구독 해지를 원하시면 
                        <a href="http://localhost:3000/unsubscribe?email=${subscriber.email}">
                            여기를 클릭하세요
                        </a>.
                    </p>
                    <!-- 이메일 열람 추적용 픽셀 -->
                    <img src="${trackingPixelUrl}" width="1" height="1" alt="">
                </div>
            </body>
            </html>
            """.trimIndent()
        } catch (e: Exception) {
            logger.error("HTML 이메일 본문 생성 실패: ${e.message}", e)
            throw e
        }
    }

    /**
     * 뉴스레터 이메일 발송
     */
    fun sendNewsletterEmail(newsletterId: Int, to: String) {
        val newsletter = newsletterService.getNewsletterById(newsletterId)
        
        val subject = newsletter.title
        val htmlContent = """
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    h1 { color: #2c3e50; }
                    .content { margin: 20px 0; }
                    .footer { margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center; }
                    .unsubscribe { margin-top: 10px; }
                    a { color: #3498db; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${newsletter.title}</h1>
                    <div class="content">
                        ${newsletter.content}
                    </div>
                    <div class="footer">
                        <p>Duck Herald - K-POP 뉴스레터</p>
                        <p class="unsubscribe">더 이상 이메일을 받고 싶지 않으세요? <a href="http://localhost:3000/unsubscribe?email=${to}">구독 취소하기</a></p>
                    </div>
                </div>
            </body>
            </html>
        """.trimIndent()
        
        val subscriber = subscriberService.getSubscriberByEmail(to)
            ?: throw IllegalArgumentException("구독자를 찾을 수 없습니다: $to")
        
        sendEmail(newsletter, subscriber)
    }
} 