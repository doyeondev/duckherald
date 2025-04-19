// 2. DeliveryService: 발송 결과 추적 및 로깅, 발송 명령 조정
// 주요 역할:
// 뉴스레터 발송의 핵심 기능 담당
// 구독자에게 이메일 전송 처리
// 발송 결과를 로깅하고 DB에 저장
// 발송 상태 추적
// 이 서비스는 가장 크고 복잡한 클래스로, 실제 이메일 발송 과정의 대부분을 담당

package com.duckherald.delivery.service

import com.duckherald.delivery.model.DeliveryLog
import com.duckherald.delivery.repository.DeliveryLogRepository
import com.duckherald.newsletter.model.NewsletterEntity
import com.duckherald.newsletter.service.NewsletterService
import com.duckherald.user.model.Subscriber
import com.duckherald.user.service.SubscriberService
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.concurrent.CompletableFuture
import com.duckherald.user.dto.SubscriberResponse

/**
 * 발송 결과를 담는 DTO
 */
data class DeliveryResult(
    val newsletterId: Int,
    val sentCount: Int = 0,
    val failedCount: Int = 0,
    val logs: List<DeliveryLog> = emptyList()
)

@Service
class DeliveryService(
    private val deliveryLogRepository: DeliveryLogRepository,
    private val newsletterService: NewsletterService,
    private val subscriberService: SubscriberService,
    private val emailService: EmailService,
    private val deliveryQueueService: DeliveryQueueService
) {
    private val logger = LoggerFactory.getLogger(DeliveryService::class.java)
    
    /**
     * 모든 발송 기록 조회
     */
    fun getAllDeliveryLogs(): List<DeliveryLog> {
        return deliveryLogRepository.findAll()
    }

    /**
     * 특정 구독자의 발송 기록 조회
     */
    fun getDeliveryLogsBySubscriber(subscriberId: Long): List<DeliveryLog> {
        return deliveryLogRepository.findBySubscriberId(subscriberId)
    }

    /**
     * 특정 뉴스레터의 발송 기록 조회
     */
    fun getDeliveryLogsByNewsletter(newsletterId: Int): List<DeliveryLog> {
        return deliveryLogRepository.findByNewsletterId(newsletterId)
    }

    /**
     * 뉴스레터 발송 (기존 방식: 직접 발송)
     * 모든 활성 구독자에게 뉴스레터를 발송하고 결과를 로깅합니다.
     */
    fun sendNewsletter(newsletterId: Int): DeliveryResult {
        val newsletter = newsletterService.getNewsletterById(newsletterId)
        val activeSubscribers = subscriberService.getAllActiveSubscribers()
        
        // 디버깅을 위한 로그 추가
        logger.info("뉴스레터 '${newsletter.title}' 발송을 시작합니다. 총 ${activeSubscribers.size}명의 구독자에게 전송됩니다.")
        logger.info("뉴스레터 상세정보: ID=${newsletter.id}, 제목=${newsletter.title}, 내용 길이=${newsletter.content?.length ?: 0}")
        
        val logs = mutableListOf<DeliveryLog>()
        var sentCount = 0
        var failedCount = 0
        
        // 각 구독자에게 이메일 발송
        activeSubscribers.forEach { subscriber ->
            try {
                // 구독자 정보 로깅
                logger.info("구독자 정보: ID=${subscriber.id}, 이메일=${subscriber.email}, 상태=${subscriber.status}")
                
                // EmailService로 이메일 발송 위임
                val success = emailService.sendEmail(newsletter, subscriber)
                
                if (success) {
                    // 발송 성공 로그 생성
                    val log = DeliveryLog(
                        newsletterId = newsletterId,
                        subscriberId = subscriber.id?.toLong() ?: 0L,
                        status = "SENT",
                        sentAt = LocalDateTime.now(),
                        openedAt = null,
                        newsletterTitle = newsletter.title // null이면 "제목 없음"으로 대체
                            ?: "제목 없음" // 명시적으로 null 처리
                    )
                    logs.add(deliveryLogRepository.save(log))
                    sentCount++
                    
                    logger.info("구독자 ${subscriber.email}에게 뉴스레터 발송 성공")
                } else {
                    // 발송 실패 로그 생성
                    val log = DeliveryLog(
                        newsletterId = newsletterId,
                        subscriberId = subscriber.id?.toLong() ?: 0L,
                        status = "FAILED",
                        sentAt = LocalDateTime.now(),
                        openedAt = null,
                        newsletterTitle = newsletter.title ?: "제목 없음" // 명시적으로 null 처리
                    )
                    logs.add(deliveryLogRepository.save(log))
                    failedCount++
                    
                    logger.error("구독자 ${subscriber.email}에게 뉴스레터 발송 실패")
                }
            } catch (e: Exception) {
                // 상세한 오류 정보 로깅
                logger.error("구독자 ${subscriber.email}에게 뉴스레터 발송 중 예외 발생: ${e.message}", e)
                e.printStackTrace() // 스택 트레이스 출력
                
                // 발송 실패 로그 생성
                val log = DeliveryLog(
                    newsletterId = newsletterId,
                    subscriberId = subscriber.id?.toLong() ?: 0L,
                    status = "FAILED",
                    sentAt = LocalDateTime.now(),
                    openedAt = null,
                    newsletterTitle = newsletter.title ?: "제목 없음" // 명시적으로 null 처리
                )
                logs.add(deliveryLogRepository.save(log))
                failedCount++
            }
        }
        
        logger.info("뉴스레터 발송 완료. 성공: $sentCount, 실패: $failedCount")
        
        return DeliveryResult(
            newsletterId = newsletterId,
            sentCount = sentCount,
            failedCount = failedCount,
            logs = logs
        )
    }
    
    /**
     * 비동기 뉴스레터 발송
     * DeliveryQueueService를 사용하여 큐 기반으로 발송
     */
    @Async
    fun sendNewsletterAsync(newsletterId: Int): CompletableFuture<DeliveryResult> {
        try {
            val newsletter = newsletterService.getNewsletterById(newsletterId)
            val activeSubscribers = subscriberService.getAllActiveSubscribers()
            
            logger.info("비동기 뉴스레터 발송 시작: ${newsletter.title}")
            
            // 큐 서비스에 작업 위임 - 기존 기능을 유지하면서 큐 서비스도 활용
            deliveryQueueService.scheduleNewsletterDelivery(
                newsletterId = newsletter.id ?: 0,
                title = newsletter.title ?: "제목 없음",
                content = newsletter.content ?: "내용 없음",
                subscribers = activeSubscribers.map { subscriber -> 
                    SubscriberResponse.from(subscriber)
                }
            )
            
            // 결과는 큐 처리 완료 후 별도로 조회해야 함
            return CompletableFuture.completedFuture(
                DeliveryResult(
                    newsletterId = newsletterId,
                    sentCount = 0,  // 큐에 추가된 작업 수는 알 수 없음
                    failedCount = 0
                )
            )
        } catch (e: Exception) {
            logger.error("뉴스레터 비동기 발송 준비 중 오류: ${e.message}", e)
            val future = CompletableFuture<DeliveryResult>()
            future.completeExceptionally(e)
            return future
        }
    }
    
    /**
     * 이메일 오픈 추적
     */
    fun trackEmailOpen(deliveryLogId: Int) {
        val deliveryLog = deliveryLogRepository.findById(deliveryLogId).orElseThrow {
            IllegalArgumentException("해당 발송 기록이 존재하지 않습니다: $deliveryLogId")
        }
        
        // 이미 오픈된 경우 처리 안함
        if (deliveryLog.status == "OPENED" || deliveryLog.openedAt != null) {
            return
        }
        
        // 새 DeliveryLog 객체 생성 (불변 객체이므로)
        val updatedLog = deliveryLog.copy(
            status = "OPENED",
            openedAt = LocalDateTime.now()
        )
        
        deliveryLogRepository.save(updatedLog)
    }

    /**
     * 테스트용 단일 이메일 발송
     * 이 기능은 이미 성공적으로 테스트되었으므로 최소한의 변경만 적용
     */
    fun testSendNewsletter(newsletterId: Int, email: String): Map<String, Any> {
        val newsletter = newsletterService.getNewsletterById(newsletterId)
        
        // findByEmail 메소드 사용
        val subscriber = subscriberService.getSubscriberByEmail(email)
            ?: throw IllegalArgumentException("구독자를 찾을 수 없습니다: $email")
        
        try {
            // EmailService로 이메일 발송 위임
            val success = emailService.sendEmail(newsletter, subscriber)
            
            return if (success) {
                mapOf(
                    "status" to "SUCCESS",
                    "message" to "테스트 이메일이 성공적으로 발송되었습니다."
                )
            } else {
                mapOf(
                    "status" to "FAILED",
                    "message" to "테스트 이메일 발송 실패"
                )
            }
        } catch (e: Exception) {
            logger.error("테스트 이메일 발송 실패: ${e.message}", e)
            return mapOf(
                "status" to "FAILED",
                "message" to "테스트 이메일 발송 실패: ${e.message}"
            )
        }
    }
} 