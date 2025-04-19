// 4. DeliveryScheduleService: 예약 발송 관리 (기존 기능 유지)
// 주요 역할:
// 뉴스레터 발송 일정 관리
// 예약 발송 기능 처리
// 발송 스케줄 설정 및 관리
// 정기 발송 뉴스레터 처리
// 이 서비스는 뉴스레터의 예약 발송 및 일정 관리에 중점

package com.duckherald.delivery.service

import com.duckherald.newsletter.service.NewsletterService
import com.duckherald.user.service.SubscriberService
import org.slf4j.LoggerFactory
import org.springframework.batch.core.Job
import org.springframework.batch.core.JobParameters
import org.springframework.batch.core.JobParametersBuilder
import org.springframework.batch.core.launch.JobLauncher
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.Date
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy

/**
 * 배송 일정 서비스
 * 
 * 뉴스레터의 예약 발송을 관리합니다.
 * 특정 시간에 발송되도록 예약된 뉴스레터를 처리합니다.
 * 
 * 메모리 기반 구현으로 변경되었습니다.
 */
@Service
class DeliveryScheduleService(
    private val jobLauncher: JobLauncher,
    @Autowired(required = false) @Qualifier("newsletterDeliveryJob") private val deliveryJob: Job?,
    private val newsletterService: NewsletterService,
    private val subscriberService: SubscriberService,
    private val deliveryQueueService: DeliveryQueueService,
    private val deliveryService: DeliveryService
) {
    private val logger = LoggerFactory.getLogger(DeliveryScheduleService::class.java)
    
    /**
     * 뉴스레터 수동 발송
     */
    fun sendNewsletter(newsletterId: Int) {
        logger.info("뉴스레터 발송 스케줄링 시작 (ID: $newsletterId)")
        
        // DeliveryService의 발송 기능을 재사용
        val result = deliveryService.sendNewsletter(newsletterId)
        
        logger.info("뉴스레터 발송 완료: 성공 ${result.sentCount}건, 실패 ${result.failedCount}건")
    }
    
    /**
     * 예약된 뉴스레터 발송 (매 시간 체크)
     */
    @Scheduled(cron = "0 0 * * * *") // 매 시간마다 실행
    fun checkScheduledNewsletters() {
        logger.info("예약된 뉴스레터 확인 중...")
        val now = LocalDateTime.now()
        val oneHourLater = now.plusHours(1)
        
        val newsletters = newsletterService.findNewslettersScheduledBetween(now, oneHourLater)
        
        newsletters.forEach { newsletter ->
            logger.info("예약 발송 시작: '${newsletter.title}'")
            sendNewsletter(newsletter.id!!)
        }
    }

    fun runDeliveryJob() {
        if (deliveryJob != null) {
            val jobParameters = JobParametersBuilder()
                .addDate("date", Date())
                .toJobParameters()
                
            jobLauncher.run(deliveryJob, jobParameters)
        } else {
            // Job이 없을 경우 로깅만 하고 에러 발생시키지 않음
            println("Newsletter delivery job is not available, skipping execution")
        }
    }
} 