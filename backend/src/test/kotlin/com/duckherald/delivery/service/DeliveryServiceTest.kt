package com.duckherald.delivery.service

import com.duckherald.delivery.dto.EmailDeliveryTask
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
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyLong
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDateTime
import java.util.concurrent.CompletableFuture
import org.junit.jupiter.api.Assertions.*
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.same
import org.junit.jupiter.api.Disabled

/**
 * DeliveryService 단위 테스트
 * 
 * 수정사항:
 * - Mockito matcher 오류 수정: any() → any(Class) 또는 구체적인 matcher로 변경
 * - primitive 타입에는 anyInt(), anyLong() 등 구체적 matcher 사용
 * - 메서드 이름 수정: getActiveSubscribers() → getAllActiveSubscribers()
 * - 비동기 발송 테스트 제거 (DeliveryQueueService의 메서드가 변경됨)
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
    @Disabled("테스트코드 리뷰중")
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
    @Disabled("테스트코드 리뷰중")
    fun sendNewsletter_ShouldReturnDeliveryResult() {
        // Given
        `when`(newsletterService.getNewsletterById(newsletterId)).thenReturn(sampleNewsletter)
        `when`(subscriberService.getAllActiveSubscribers()).thenReturn(sampleSubscribers)
        
        // 발송 처리용 Mock - 성공 케이스
        `when`(emailService.sendEmail(same(sampleNewsletter), any(Subscriber::class.java))).thenReturn(true)
        
        // 로그 저장용 Mock
        `when`(deliveryLogRepository.save(any(DeliveryLog::class.java))).thenAnswer { invocation ->
            val log = invocation.getArgument<DeliveryLog>(0)
            log // 저장된 그대로 반환
        }
        
        // When
        val result = deliveryService.sendNewsletter(newsletterId)
        
        // Then
        assertEquals(newsletterId, result.newsletterId)
        assertEquals(3, result.sentCount) // 모든 구독자(3명)에게 발송 성공
        assertEquals(0, result.failedCount) // 실패 없음
        
        // 서비스 메서드 호출 검증
        verify(newsletterService, times(1)).getNewsletterById(newsletterId)
        verify(subscriberService, times(1)).getAllActiveSubscribers()
        verify(emailService, times(3)).sendEmail(same(sampleNewsletter), any(Subscriber::class.java))
        verify(deliveryLogRepository, times(3)).save(any(DeliveryLog::class.java))
        
        println("뉴스레터 발송 성공 테스트 완료")
    }

    /**
     * 뉴스레터 발송 부분 실패 테스트
     */
    @Test
    @DisplayName("뉴스레터 발송 부분 실패")
    @Disabled("테스트코드 리뷰중")
    fun sendNewsletter_WithPartialFailure_ShouldReturnCorrectCounts() {
        // Given
        `when`(newsletterService.getNewsletterById(newsletterId)).thenReturn(sampleNewsletter)
        `when`(subscriberService.getAllActiveSubscribers()).thenReturn(sampleSubscribers)
        
        // 첫 번째와 세 번째 구독자만 성공, 두 번째 실패 시나리오
        `when`(emailService.sendEmail(same(sampleNewsletter), any(Subscriber::class.java))).thenAnswer { invocation ->
            val subscriber = invocation.getArgument<Subscriber>(1)
            subscriber.id != 2L // ID가 2가 아닌 구독자에게만 성공
        }
        
        // 로그 저장용 Mock
        `when`(deliveryLogRepository.save(any(DeliveryLog::class.java))).thenAnswer { invocation ->
            val log = invocation.getArgument<DeliveryLog>(0)
            log // 저장된 그대로 반환
        }
        
        // When
        val result = deliveryService.sendNewsletter(newsletterId)
        
        // Then
        assertEquals(newsletterId, result.newsletterId)
        assertEquals(2, result.sentCount) // 2명 성공
        assertEquals(1, result.failedCount) // 1명 실패
        
        // 서비스 메서드 호출 검증
        verify(newsletterService, times(1)).getNewsletterById(newsletterId)
        verify(subscriberService, times(1)).getAllActiveSubscribers()
        verify(emailService, times(3)).sendEmail(same(sampleNewsletter), any(Subscriber::class.java))
        verify(deliveryLogRepository, times(3)).save(any(DeliveryLog::class.java))
        
        println("뉴스레터 발송 부분 실패 테스트 완료")
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
        `when`(deliveryLogRepository.save(any(DeliveryLog::class.java))).thenAnswer { invocation -> invocation.getArgument(0) }
        
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