package com.duckherald.delivery.controller

import com.duckherald.delivery.dto.DeliveryRequest
import com.duckherald.delivery.dto.DeliveryResponse
import com.duckherald.delivery.model.DeliveryLog
import com.duckherald.delivery.repository.DeliveryLogRepository
import com.duckherald.delivery.service.DeliveryService
import com.duckherald.newsletter.service.NewsletterService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.mail.javamail.JavaMailSenderImpl

/**
 * 배송 관련 컨트롤러 (관리자용)
 * 모든 배송 관련 API를 통합 관리
 */
@RestController
@RequestMapping("/api/delivery")
class DeliveryController(
    private val deliveryService: DeliveryService,
    private val deliveryLogRepository: DeliveryLogRepository,
    private val newsletterService: NewsletterService,
    private val mailSender: JavaMailSender
) {
    private val logger = LoggerFactory.getLogger(DeliveryController::class.java)

    /**
     * 모든 발송 기록 조회 (관리자용)
     */
    @GetMapping
    fun getAllDeliveryLogs(): ResponseEntity<List<DeliveryResponse>> {
        val deliveryLogs = deliveryService.getAllDeliveryLogs()
            .map { DeliveryResponse.from(it) }
        return ResponseEntity.ok(deliveryLogs)
    }

    /**
     * 발송 내역 요약 조회 (관리자용)
     */
    @GetMapping("/logs")
    fun getAllDeliverySummary(): ResponseEntity<List<DeliveryDTO>> {
        val deliveries = deliveryLogRepository.findAllSentLogs()
            .groupBy { "${it.newsletterId}-${it.sentAt?.toLocalDate()}" }
            .map { (_, logs) ->
                val firstLog = logs.first()
                val newsletter = newsletterService.getNewsletterById(firstLog.newsletterId)
                
                DeliveryDTO(
                    id = firstLog.id.toLong(),
                    newsletterId = firstLog.newsletterId,
                    newsletterTitle = firstLog.newsletterTitle ?: newsletter.title ?: "제목 없음",
                    sentAt = firstLog.sentAt ?: LocalDateTime.now(),
                    status = if (logs.any { it.status == "FAILED" }) "FAILED" else "COMPLETED",
                    stats = DeliveryStatsDTO(
                        sent = logs.count { it.status == "SENT" }.toLong(),
                        opened = logs.count { it.status == "OPENED" }.toLong(),
                        clicked = logs.count { it.status == "CLICKED" }.toLong(),
                        failed = logs.count { it.status == "FAILED" }.toLong()
                    )
                )
            }
        
        return ResponseEntity.ok(deliveries)
    }

    /**
     * 특정 구독자 발송 기록 조회
     */
    @GetMapping("/subscriber/{id}")
    fun getDeliveryLogsBySubscriber(
        @PathVariable("id") subscriberId: Long
    ): ResponseEntity<List<DeliveryResponse>> {
        val deliveryLogs = deliveryService.getDeliveryLogsBySubscriber(subscriberId)
            .map { DeliveryResponse.from(it) }
        return ResponseEntity.ok(deliveryLogs)
    }

    /**
     * 특정 뉴스레터 발송 기록 조회
     */
    @GetMapping("/newsletter/{id}")
    fun getDeliveryLogsByNewsletter(
        @PathVariable("id") newsletterId: Int
    ): ResponseEntity<List<DeliveryResponse>> {
        val deliveryLogs = deliveryService.getDeliveryLogsByNewsletter(newsletterId)
            .map { DeliveryResponse.from(it) }
        return ResponseEntity.ok(deliveryLogs)
    }

    /**
     * 뉴스레터 발송 요청 - 통합 API
     */
    @PostMapping("/newsletters/{id}/send")
    fun sendNewsletter(@PathVariable id: Int): ResponseEntity<Map<String, Any>> {
        try {
            logger.info("뉴스레터 발송 API 호출: ID=$id")
            
            // 뉴스레터 존재 여부 검증
            val newsletter = newsletterService.getNewsletterById(id)
            if (newsletter.content.isNullOrBlank()) {
                logger.warn("뉴스레터 내용이 비어있습니다: ID=$id")
                return ResponseEntity.badRequest().body(mapOf(
                    "message" to "뉴스레터 내용이 비어있습니다.",
                    "newsletterId" to id
                ))
            }
            
            // 발송 처리
            val result = deliveryService.sendNewsletter(id)
            
            logger.info("뉴스레터 발송 결과: 성공=${result.sentCount}, 실패=${result.failedCount}")
            
            return ResponseEntity.ok(mapOf(
                "message" to "뉴스레터 발송이 완료되었습니다.",
                "sentCount" to result.sentCount,
                "failedCount" to result.failedCount,
                "status" to if (result.failedCount > 0) "PARTIAL" else "SUCCESS"
            ))
        } catch (e: Exception) {
            logger.error("뉴스레터 발송 중 오류 발생: ${e.message}", e)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "message" to "뉴스레터 발송 중 오류가 발생했습니다: ${e.message}",
                "newsletterId" to id
            ))
        }
    }
    
    /**
     * 뉴스레터 발송 요청 (JSON 방식) - 기존 API 호환성 유지
     * @deprecated 대신 /newsletters/{id}/send 사용 권장
     */
    @PostMapping("/send")
    fun sendNewsletterJson(@RequestBody request: DeliveryRequest): ResponseEntity<Map<String, Any>> {
        // 통합 API 호출로 리다이렉트
        return sendNewsletter(request.newsletterId)
    }
    
    /**
     * 발송 통계 조회
     */
    @GetMapping("/newsletters/{id}/stats")
    fun getDeliveryStats(@PathVariable id: Int): ResponseEntity<Map<String, Long>> {
        val sentCount = deliveryLogRepository.countByNewsletterIdAndStatus(id, "SENT")
        val openedCount = deliveryLogRepository.countByNewsletterIdAndStatus(id, "OPENED")
        val clickedCount = deliveryLogRepository.countByNewsletterIdAndStatus(id, "CLICKED")
        val failedCount = deliveryLogRepository.countByNewsletterIdAndStatus(id, "FAILED")
        
        val stats = mapOf(
            "sent" to sentCount,
            "opened" to openedCount,
            "clicked" to clickedCount,
            "failed" to failedCount
        )
        
        return ResponseEntity.ok(stats)
    }
    
    /**
     * 이메일 열람 추적 엔드포인트
     */
    @GetMapping("/track/{newsletterId}/{subscriberId}")
    fun trackEmailOpen(
        @PathVariable newsletterId: Int,
        @PathVariable subscriberId: Long
    ): ResponseEntity<ByteArray> {
        // 1x1 투명 픽셀 이미지
        val pixel = ByteArray(1) { 0x00 }
        
        // 열람 로그 기록
        val existingLogs = deliveryLogRepository.findByNewsletterIdAndSubscriberId(newsletterId, subscriberId)
        
        if (existingLogs.isNotEmpty()) {
            val latestLog = existingLogs.maxByOrNull { it.sentAt ?: LocalDateTime.MIN }
            if (latestLog != null && latestLog.status == "SENT") {
                val openedLog = latestLog.copy(
                    status = "OPENED",
                    openedAt = LocalDateTime.now()
                )
                deliveryLogRepository.save(openedLog)
            }
        }
        
        return ResponseEntity
            .status(HttpStatus.OK)
            .header("Content-Type", "image/gif")
            .body(pixel)
    }

    /**
     * 뉴스레터 발송 요청 (비동기)
     */
    @PostMapping("/newsletters/{id}/send-async")
    fun sendNewsletterAsync(@PathVariable id: Int): ResponseEntity<Map<String, String>> {
        deliveryService.sendNewsletterAsync(id)
        return ResponseEntity.accepted().body(mapOf(
            "message" to "뉴스레터 발송이 백그라운드에서 시작되었습니다."
        ))
    }

    /**
     * 테스트용 단일 이메일 발송
     */
    @PostMapping("/test-send")
    fun testSendNewsletter(@RequestParam newsletterId: Int, @RequestParam email: String): ResponseEntity<Map<String, Any>> {
        try {
            val result = deliveryService.testSendNewsletter(newsletterId, email)
            return ResponseEntity.ok(mapOf(
                "message" to "테스트 이메일 발송 시도 완료",
                "result" to result
            ))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "message" to "테스트 이메일 발송 실패: ${e.message}"
            ))
        }
    }

    /**
     * 테스트 이메일 발송 엔드포인트
     */
    @PostMapping("/test-email")
    fun sendTestEmail(@RequestParam email: String): ResponseEntity<Map<String, String>> {
        try {
            // mailSender 확인
            if (mailSender is JavaMailSenderImpl) {
                println("현재 SMTP 설정: ${mailSender.host}:${mailSender.port}")
                println("SMTP 사용자: ${mailSender.username}")
                println("SMTP 비밀번호 설정 여부: ${!mailSender.password.isNullOrEmpty()}")
            } else {
                println("JavaMailSenderImpl이 아닌 다른 구현체 사용 중: ${mailSender.javaClass.name}")
            }

            val message = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, true, "UTF-8")
            
            helper.setFrom("doyeon.sean.dev@gmail.com", "덕헤럴드 테스트")
            helper.setTo(email)
            helper.setSubject("테스트 이메일입니다")
            helper.setText("<h1>테스트 이메일</h1><p>이 이메일은 SMTP 설정이 올바르게 작동하는지 확인하기 위한 테스트입니다.</p>", true)
            
            mailSender.send(message)
            
            return ResponseEntity.ok(mapOf(
                "message" to "테스트 이메일이 성공적으로 발송되었습니다."
            ))
        } catch (e: Exception) {
            e.printStackTrace()
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "message" to "테스트 이메일 발송 실패: ${e.message}"
            ))
        }
    }
}

/**
 * 배송 통계 DTO
 */
data class DeliveryStatsDTO(
    val sent: Long = 0,
    val opened: Long = 0,
    val clicked: Long = 0,
    val failed: Long = 0
)

/**
 * 배송 요약 DTO
 */
data class DeliveryDTO(
    val id: Long,
    val newsletterId: Int,
    val newsletterTitle: String,
    val sentAt: LocalDateTime,
    val status: String,
    val stats: DeliveryStatsDTO
) 