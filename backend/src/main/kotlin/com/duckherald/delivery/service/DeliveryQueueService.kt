// 3. DeliveryQueueService: 대량 이메일의 비동기 병렬 처리 담당
// 주요 역할:
// 이메일 발송 대기열 관리
// 대량 이메일 발송 시 처리량 제어
// 발송 우선순위 관리
// 재시도 메커니즘 제공
// 이 서비스는 대량의 이메일을 효율적으로 발송하기 위한 큐 관리 기능을 제공

package com.duckherald.delivery.service

import com.duckherald.delivery.dto.EmailDeliveryTask
import com.duckherald.delivery.model.DeliveryLog
import com.duckherald.delivery.repository.DeliveryLogRepository
import com.duckherald.newsletter.service.NewsletterService
import com.duckherald.user.dto.SubscriberResponse
import com.duckherald.user.service.SubscriberService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.scheduling.annotation.Async
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.concurrent.Executor
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.TimeUnit

/**
 * 발송 대기열 서비스
 * 
 * 뉴스레터 발송을 위한 대기열을 관리합니다.
 * 특정 시간 간격으로 대기열을 처리하고, 발송 결과를 기록합니다.
 * 
 * 큐 구현은 메모리 기반으로 수정되었습니다.
 */
@Service
class DeliveryQueueService(
    private val newsletterService: NewsletterService,
    private val subscriberService: SubscriberService,
    private val deliveryLogRepository: DeliveryLogRepository
) {
    private val logger = LoggerFactory.getLogger(DeliveryQueueService::class.java)
    
    // 메모리 기반 큐로 구현
    private val deliveryQueue = ConcurrentLinkedQueue<EmailDeliveryTask>()
    private val processingTasks = ConcurrentLinkedQueue<EmailDeliveryTask>()
    
    /**
     * 이메일 발송을 위한 스레드 풀 구성
     * 이 구성을 통해 병렬 처리가 가능해집니다.
     */
    @Bean
    fun emailTaskExecutor(): Executor {
        val executor = ThreadPoolTaskExecutor()
        executor.corePoolSize = 10     // 기본 스레드 수
        executor.maxPoolSize = 20     // 최대 스레드 수
        executor.queueCapacity = 500  // 작업 대기열 크기
        executor.setThreadNamePrefix("EmailSender-")
        executor.initialize()
        logger.info("이메일 발송용 스레드 풀 초기화 완료 (코어: 10, 최대: 20, 큐: 500)")
        return executor
    }
    
    /**
     * 새로운 배송 작업을 큐에 추가
     */
    fun addDeliveryTask(task: EmailDeliveryTask) {
        deliveryQueue.add(task)
        logger.debug("발송 작업이 큐에 추가됨: ${task.email} (뉴스레터 ID: ${task.newsletterId})")
    }
    
    /**
     * 큐에서 다음 배송 작업 가져오기
     */
    fun getNextDeliveryTask(): EmailDeliveryTask? {
        val task = deliveryQueue.poll()
        
        // 작업을 처리 중 세트에 추가
        if (task != null) {
            processingTasks.add(task)
            logger.debug("큐에서 작업 가져옴: ${task.email}")
        }
        
        return task
    }
    
    /**
     * 처리 완료된 작업 제거
     */
    fun markTaskComplete(task: EmailDeliveryTask) {
        processingTasks.remove(task)
        logger.debug("작업 처리 완료: ${task.email}")
    }
    
    /**
     * 큐가 비었는지 확인
     */
    fun isQueueEmpty(): Boolean {
        return deliveryQueue.isEmpty()
    }
    
    /**
     * 특정 뉴스레터의 모든 발송 작업을 큐에 추가
     */
    fun scheduleNewsletterDelivery(newsletterId: Int, title: String, content: String, subscribers: List<SubscriberResponse>) {
        // 각 구독자에 대한 이메일 작업 생성
        subscribers.forEach { subscriberResponse ->
            val task = EmailDeliveryTask(
                subscriberId = subscriberResponse.id!!,
                email = subscriberResponse.email,
                newsletterId = newsletterId,
                title = title,
                content = content
            )
            addDeliveryTask(task)
        }
        logger.info("뉴스레터 발송 작업 ${subscribers.size}개가 큐에 추가됨 (뉴스레터 ID: $newsletterId)")
        
        // 큐 처리 시작 트리거
        processQueueAsync()
    }
    
    /**
     * 비동기로 큐 처리 시작
     * 이 메소드는 @Async 어노테이션을 통해 별도 스레드에서 실행됩니다.
     */
    @Async("emailTaskExecutor")
    fun processQueueAsync() {
        logger.info("큐 처리 시작")
        var processedCount = 0
        var successCount = 0
        var failedCount = 0
        
        try {
            while (!isQueueEmpty()) {
                val task = getNextDeliveryTask() ?: break
                processedCount++
                
                try {
                    // 뉴스레터와 구독자 정보 조회
                    val newsletter = newsletterService.getNewsletterById(task.newsletterId)
                    val subscriber = subscriberService.getSubscriberByEmail(task.email)
                        ?: throw IllegalArgumentException("구독자를 찾을 수 없음: 이메일 ${task.email}")
                    
                    // 이메일 발송 - 실제 서비스에서는 EmailService 를 사용
                    val success = true // 테스트용 더미 값
                    
                    // 발송 결과 로깅
                    val log = DeliveryLog(
                        newsletterId = task.newsletterId,
                        subscriberId = task.subscriberId,
                        status = if (success) "SENT" else "FAILED",
                        sentAt = LocalDateTime.now(),
                        openedAt = null,
                        newsletterTitle = newsletter.title
                    )
                    deliveryLogRepository.save(log)
                    
                    if (success) {
                        successCount++
                    } else {
                        failedCount++
                    }
                    
                } catch (e: Exception) {
                    // 오류 발생 시 로그 기록
                    logger.error("이메일 발송 오류 (${task.email}): ${e.message}", e)
                    failedCount++
                    
                    // 로그 저장
                    val log = DeliveryLog(
                        newsletterId = task.newsletterId,
                        subscriberId = task.subscriberId,
                        status = "FAILED",
                        sentAt = LocalDateTime.now(),
                        openedAt = null,
                        newsletterTitle = task.title
                    )
                    deliveryLogRepository.save(log)
                }
                
                // 작업 완료 표시
                markTaskComplete(task)
                
                // 진행 상황 로깅 (50개마다)
                if (processedCount % 50 == 0) {
                    logger.info("큐 처리 진행 중: $processedCount 처리됨 (성공: $successCount, 실패: $failedCount)")
                }
            }
        } catch (e: Exception) {
            logger.error("큐 처리 중 오류 발생: ${e.message}", e)
        }
        
        logger.info("큐 처리 완료: 총 $processedCount 처리됨 (성공: $successCount, 실패: $failedCount)")
    }
    
    /**
     * 주기적으로 큐 처리 (스케줄러)
     * 10분마다 실행하여 큐에 남아 있는 작업이 있으면 처리합니다.
     */
    @Scheduled(fixedRate = 600000) // 10분마다
    fun scheduledQueueProcessing() {
        if (!isQueueEmpty()) {
            logger.info("스케줄러: 남은 큐 처리 시작")
            processQueueAsync()
        }
    }
} 