package com.duckherald.delivery.service

import com.duckherald.delivery.model.DeliveryLog
import com.duckherald.delivery.repository.DeliveryLogRepository
import com.duckherald.newsletter.model.NewsletterEntity
import com.duckherald.newsletter.service.NewsletterService
import com.duckherald.user.model.Subscriber
import com.duckherald.user.service.SubscriberService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.any
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDateTime
import java.util.concurrent.CompletableFuture
import org.junit.jupiter.api.Assertions.*
import org.mockito.ArgumentCaptor

/**
 * DeliveryService 단위 테스트
 */
@ExtendWith(MockitoExtension::class)
class DeliveryServiceTest {

    @InjectMocks
    private lateinit var deliveryService: DeliveryService

    @Mock
    private lateinit var deliveryLogRepository: DeliveryLogRepository

    @Mock
    private lateinit var newsletterService: NewsletterService

    @Mock
    private lateinit var subscriberService: SubscriberService

    @Mock
    private lateinit var emailService: EmailService

    @Mock
    private lateinit var deliveryQueueService: DeliveryQueueService

    // 테스트 데이터
    private val now = LocalDateTime.now()
    private val newsletterId = 1
    private val subscriberId = 1L

    // 샘플 뉴스레터
    private lateinit var sampleNewsletter: NewsletterEntity

    // 샘플 구독자
    private lateinit var sampleSubscriber: Subscriber

    // 샘플 구독자 목록
    private lateinit var sampleSubscribers: List<Subscriber>

    // 샘플 발송 로그
    private lateinit var sampleDeliveryLogs: List<DeliveryLog>

    @BeforeEach
    fun setup() {
        // 샘플 뉴스레터 초기화
        sampleNewsletter = NewsletterEntity(
            id = newsletterId,
            title = "테스트 뉴스레터",
            content = "<p>테스트 내용입니다</p>",
            status = "PUBLISHED",
            createdAt = now.minusDays(1)
        )

        // 샘플 구독자 초기화
        sampleSubscriber = Subscriber(
            id = 1,
            email = "test@example.com",
            status = "ACTIVE",
            createdAt = now.minusDays(7)
        )

        // 샘플 구독자 목록 초기화
        sampleSubscribers = listOf(
            sampleSubscriber,
            Subscriber(id = 2, email = "test2@example.com", status = "ACTIVE", createdAt = now.minusDays(6)),
            Subscriber(id = 3, email = "test3@example.com", status = "ACTIVE", createdAt = now.minusDays(5))
        )

        // 샘플 발송 로그 초기화
        sampleDeliveryLogs = listOf(
            DeliveryLog(
                id = 1,
                newsletterId = newsletterId,
                subscriberId = 1L,
                status = "SENT",
                sentAt = now,
                newsletterTitle = "테스트 뉴스레터"
            ),
            DeliveryLog(
                id = 2,
                newsletterId = newsletterId,
                subscriberId = 2L,
                status = "FAILED",
                sentAt = now,
                newsletterTitle = "테스트 뉴스레터"
            ),
            DeliveryLog(
                id = 3,
                newsletterId = newsletterId,
                subscriberId = 3L,
                status = "OPENED",
                sentAt = now,
                openedAt = now.plusHours(1),
                newsletterTitle = "테스트 뉴스레터"
            )
        )
    }

    /**
     * 모든 발송 기록 조회 테스트
     */
    @Test
    @DisplayName("모든 발송 기록 조회")
    fun getAllDeliveryLogs_ShouldReturnAllLogs() {
        // Given
        `when`(deliveryLogRepository.findAll()).thenReturn(sampleDeliveryLogs)

        // When
        val result = deliveryService.getAllDeliveryLogs()

        // Then
        assertEquals(3, result.size)
        verify(deliveryLogRepository, times(1)).findAll()
        
        println("모든 발송 기록 조회 테스트 완료")
    }

    /**
     * 구독자별 발송 기록 조회 테스트
     */
    @Test
    @DisplayName("구독자별 발송 기록 조회")
    fun getDeliveryLogsBySubscriber_ShouldReturnSubscriberLogs() {
        // Given
        val subscriberLogs = sampleDeliveryLogs.filter { it.subscriberId == subscriberId }
        `when`(deliveryLogRepository.findBySubscriberId(subscriberId)).thenReturn(subscriberLogs)

        // When
        val result = deliveryService.getDeliveryLogsBySubscriber(subscriberId)

        // Then
        assertEquals(1, result.size)
        assertEquals(subscriberId, result[0].subscriberId)
        verify(deliveryLogRepository, times(1)).findBySubscriberId(subscriberId)
        
        println("구독자별 발송 기록 조회 테스트 완료")
    }

    /**
     * 뉴스레터별 발송 기록 조회 테스트
     */
    @Test
    @DisplayName("뉴스레터별 발송 기록 조회")
    fun getDeliveryLogsByNewsletter_ShouldReturnNewsletterLogs() {
        // Given
        `when`(deliveryLogRepository.findByNewsletterId(newsletterId)).thenReturn(sampleDeliveryLogs)

        // When
        val result = deliveryService.getDeliveryLogsByNewsletter(newsletterId)

        // Then
        assertEquals(3, result.size)
        result.forEach { assertEquals(newsletterId, it.newsletterId) }
        verify(deliveryLogRepository, times(1)).findByNewsletterId(newsletterId)
        
        println("뉴스레터별 발송 기록 조회 테스트 완료")
    }

    /**
     * 뉴스레터 발송 성공 테스트
     */
    @Test
    @DisplayName("뉴스레터 발송 성공")
    fun sendNewsletter_WhenAllSucceed_ShouldReturnCorrectResult() {
        // Given
        `when`(newsletterService.getNewsletterById(newsletterId)).thenReturn(sampleNewsletter)
        `when`(subscriberService.getAllActiveSubscribers()).thenReturn(sampleSubscribers)
        
        // 모든 이메일 발송 성공으로 설정
        `when`(emailService.sendEmail(any(), any())).thenReturn(true)
        
        // 저장된 발송 로그 모의
        `when`(deliveryLogRepository.save(any())).thenAnswer { invocation ->
            val log = invocation.getArgument<DeliveryLog>(0)
            log.copy(id = (log.subscriberId % 100).toInt()) // 임의 ID 부여
        }
        
        // When
        val result = deliveryService.sendNewsletter(newsletterId)
        
        // Then
        assertEquals(newsletterId, result.newsletterId)
        assertEquals(3, result.sentCount) // 성공 3건
        assertEquals(0, result.failedCount) // 실패 0건
        assertEquals(3, result.logs.size)
        
        // 모든 구독자에게 이메일 발송 시도 확인
        verify(emailService, times(3)).sendEmail(any(), any())
        
        // 모든 발송 로그 저장 확인
        verify(deliveryLogRepository, times(3)).save(any())
        
        println("뉴스레터 발송 성공 테스트 완료")
    }

    /**
     * 뉴스레터 발송 실패 테스트
     */
    @Test
    @DisplayName("뉴스레터 발송 실패")
    fun sendNewsletter_WhenSomeFail_ShouldReturnCorrectResult() {
        // Given
        `when`(newsletterService.getNewsletterById(newsletterId)).thenReturn(sampleNewsletter)
        `when`(subscriberService.getAllActiveSubscribers()).thenReturn(sampleSubscribers)
        
        // 첫 번째 구독자는 성공, 나머지는 실패로 설정
        `when`(emailService.sendEmail(any(), any())).thenAnswer { invocation ->
            val subscriber = invocation.getArgument<Subscriber>(1)
            subscriber.id == 1L // ID가 1인 구독자만 성공
        }
        
        // 저장된 발송 로그 모의
        `when`(deliveryLogRepository.save(any())).thenAnswer { invocation ->
            val log = invocation.getArgument<DeliveryLog>(0)
            log.copy(id = (log.subscriberId % 100).toInt()) // 임의 ID 부여
        }
        
        // When
        val result = deliveryService.sendNewsletter(newsletterId)
        
        // Then
        assertEquals(newsletterId, result.newsletterId)
        assertEquals(1, result.sentCount) // 성공 1건
        assertEquals(2, result.failedCount) // 실패 2건
        assertEquals(3, result.logs.size)
        
        // 모든 구독자에게 이메일 발송 시도 확인
        verify(emailService, times(3)).sendEmail(any(), any())
        
        // 모든 발송 로그 저장 확인
        verify(deliveryLogRepository, times(3)).save(any())
        
        println("뉴스레터 발송 실패 테스트 완료")
    }

    /**
     * 예외 발생 시 테스트
     */
    @Test
    @DisplayName("이메일 발송 중 예외 발생 시 정상 처리")
    fun sendNewsletter_WhenExceptionOccurs_ShouldHandleGracefully() {
        // Given
        `when`(newsletterService.getNewsletterById(newsletterId)).thenReturn(sampleNewsletter)
        `when`(subscriberService.getAllActiveSubscribers()).thenReturn(sampleSubscribers)
        
        // 예외 발생 시나리오 설정
        `when`(emailService.sendEmail(any(), any())).thenAnswer { invocation ->
            val subscriber = invocation.getArgument<Subscriber>(1)
            if (subscriber.id == 2L) {
                throw RuntimeException("발송 실패")
            }
            true
        }
        
        // 저장된 발송 로그 모의
        `when`(deliveryLogRepository.save(any())).thenAnswer { invocation ->
            val log = invocation.getArgument<DeliveryLog>(0)
            log.copy(id = (log.subscriberId % 100).toInt()) // 임의 ID 부여
        }
        
        // When (예외가 발생해도 처리되어야 함)
        val result = deliveryService.sendNewsletter(newsletterId)
        
        // Then
        assertEquals(newsletterId, result.newsletterId)
        assertEquals(2, result.sentCount) // 성공 2건
        assertEquals(1, result.failedCount) // 실패 1건
        assertEquals(3, result.logs.size)
        
        // 로그에 실패 상태가 포함되어야 함
        assertTrue(result.logs.any { it.status == "FAILED" })
        
        println("예외 발생 시 정상 처리 테스트 완료")
    }

    /**
     * 비동기 뉴스레터 발송 테스트
     */
    @Test
    @DisplayName("비동기 뉴스레터 발송")
    fun sendNewsletterAsync_ShouldScheduleDelivery() {
        // Given
        `when`(newsletterService.getNewsletterById(newsletterId)).thenReturn(sampleNewsletter)
        `when`(subscriberService.getAllActiveSubscribers()).thenReturn(sampleSubscribers)
        
        // 큐 서비스 모킹
        doNothing().`when`(deliveryQueueService).scheduleNewsletterDelivery(
            anyInt(),
            anyString(),
            anyString(),
            anyList()
        )
        
        // When
        val result = deliveryService.sendNewsletterAsync(newsletterId)
        
        // Then
        assertNotNull(result)
        assertTrue(result.isDone)  // CompletableFuture가 완료 상태여야 함
        
        // 큐 서비스에 작업이 위임되었는지 확인
        val idCaptor = ArgumentCaptor.forClass(Int::class.java)
        val titleCaptor = ArgumentCaptor.forClass(String::class.java)
        val contentCaptor = ArgumentCaptor.forClass(String::class.java)
        
        verify(deliveryQueueService, times(1)).scheduleNewsletterDelivery(
            idCaptor.capture(),
            titleCaptor.capture(),
            contentCaptor.capture(),
            anyList()
        )
        
        assertEquals(newsletterId, idCaptor.value)
        assertEquals(sampleNewsletter.title, titleCaptor.value)
        assertEquals(sampleNewsletter.content, contentCaptor.value)
        
        println("비동기 뉴스레터 발송 테스트 완료")
    }

    /**
     * 이메일 열람 추적 테스트
     */
    @Test
    @DisplayName("이메일 열람 추적")
    fun trackEmailOpen_ShouldUpdateDeliveryLog() {
        // Given
        val deliveryLogId = 1
        val deliveryLog = sampleDeliveryLogs[0]
        
        `when`(deliveryLogRepository.findById(deliveryLogId)).thenReturn(java.util.Optional.of(deliveryLog))
        `when`(deliveryLogRepository.save(any())).thenAnswer { invocation -> invocation.getArgument(0) }
        
        // When
        deliveryService.trackEmailOpen(deliveryLogId)
        
        // Then
        // 상태와 열람 시간 업데이트 확인
        val logCaptor = ArgumentCaptor.forClass(DeliveryLog::class.java)
        verify(deliveryLogRepository, times(1)).save(logCaptor.capture())
        
        val updatedLog = logCaptor.value
        assertEquals("OPENED", updatedLog.status)
        assertNotNull(updatedLog.openedAt)
        
        println("이메일 열람 추적 테스트 완료")
    }
} 