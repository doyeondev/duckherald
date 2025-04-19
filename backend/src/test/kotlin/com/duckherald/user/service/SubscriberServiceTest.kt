package com.duckherald.user.service

import com.duckherald.exception.ResourceNotFoundException
import com.duckherald.user.model.Subscriber
import com.duckherald.user.repository.SubscriberRepository
import com.duckherald.user.dto.SubscriberRequest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Captor
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDateTime
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * SubscriberService 단위 테스트
 * 
 * 테스트 범위:
 * 1. 구독자 생성 기능
 * 2. 구독자 조회 기능
 * 3. 구독 상태 변경 기능
 * 4. 구독 취소 기능
 * 5. 구독자 목록 조회 기능
 * 
 * 모델 구조 변경 반영 사항:
 * - id 타입: String → Long?
 * - name 필드 제거
 * - active 대신 status(String) 필드 사용
 * - verified/verificationToken 필드 제거
 * - unsubscribedAt 필드 추가
 * 
 * API 변경 반영 사항:
 * - createSubscriber → subscribe
 * - findByEmail → getSubscriberByEmail
 * - findById → getSubscriberById (예외 처리 방식 변경)
 * - findByActiveTrue → findByStatus
 */
@ExtendWith(MockitoExtension::class)
class SubscriberServiceTest {

    @Mock
    private lateinit var subscriberRepository: SubscriberRepository

    @InjectMocks
    private lateinit var subscriberService: SubscriberService

    @Captor
    private lateinit var subscriberCaptor: ArgumentCaptor<Subscriber>

    // 테스트 데이터
    private val now = LocalDateTime.now()
    private val id = 1L
    private val email = "test@example.com"
    private val activeStatus = "ACTIVE"
    private val inactiveStatus = "INACTIVE"

    // 샘플 구독자
    private lateinit var sampleSubscriber: Subscriber
    private lateinit var sampleSubscriberRequest: SubscriberRequest

    @BeforeEach
    fun setup() {
        // 샘플 구독자 초기화
        sampleSubscriber = Subscriber(
            id = id,
            email = email,
            status = activeStatus,
            createdAt = now.minusDays(1),
            unsubscribedAt = null
        )

        // 샘플 구독 요청 초기화
        sampleSubscriberRequest = SubscriberRequest(
            email = email
        )
    }

    /**
     * 구독자 생성 테스트
     */
    @Test
    @DisplayName("구독자 생성 테스트")
    fun subscribe_ShouldCreateAndReturnSubscriber() {
        // Given
        `when`(subscriberRepository.findByEmail(email)).thenReturn(Optional.empty())
        `when`(subscriberRepository.save(any())).thenAnswer { invocation ->
            val subscriber = invocation.getArgument<Subscriber>(0)
            subscriber.copy(id = id) // ID 부여
        }

        // When
        val result = subscriberService.subscribe(sampleSubscriberRequest)

        // Then
        assertNotNull(result)
        assertEquals(email, result.email)
        assertEquals(activeStatus, result.status)
        assertNull(result.unsubscribedAt)

        // 저장 메서드 호출 확인
        verify(subscriberRepository, times(1)).save(any())

        println("구독자 생성 테스트 완료")
    }

    /**
     * 이메일로 구독자 조회 테스트
     */
    @Test
    @DisplayName("이메일로 구독자 조회 테스트")
    fun getSubscriberByEmail_WhenExists_ShouldReturnSubscriber() {
        // Given
        `when`(subscriberRepository.findByEmail(email)).thenReturn(Optional.of(sampleSubscriber))

        // When
        val result = subscriberService.getSubscriberByEmail(email)

        // Then
        assertNotNull(result)
        assertEquals(id, result?.id)
        assertEquals(email, result?.email)
        assertEquals(activeStatus, result?.status)

        // 조회 메서드 호출 확인
        verify(subscriberRepository, times(1)).findByEmail(email)

        println("이메일로 구독자 조회 테스트 완료")
    }

    /**
     * 존재하지 않는 이메일로 조회 시 테스트
     */
    @Test
    @DisplayName("존재하지 않는 이메일로 조회 시 null 반환 테스트")
    fun getSubscriberByEmail_WhenNotExists_ShouldReturnNull() {
        // Given
        val nonExistingEmail = "nonexisting@example.com"
        `when`(subscriberRepository.findByEmail(nonExistingEmail)).thenReturn(Optional.empty())

        // When
        val result = subscriberService.getSubscriberByEmail(nonExistingEmail)

        // Then
        assertNull(result)

        // 조회 메서드 호출 확인
        verify(subscriberRepository, times(1)).findByEmail(nonExistingEmail)

        println("존재하지 않는 이메일로 조회 테스트 완료")
    }

    /**
     * ID로 구독자 조회 테스트
     */
    @Test
    @DisplayName("ID로 구독자 조회 테스트")
    fun getSubscriberById_WhenExists_ShouldReturnSubscriber() {
        // Given
        `when`(subscriberRepository.findById(id)).thenReturn(Optional.of(sampleSubscriber))

        // When
        val result = subscriberService.getSubscriberById(id)

        // Then
        assertNotNull(result)
        assertEquals(id, result.id)
        assertEquals(email, result.email)
        assertEquals(activeStatus, result.status)

        // 조회 메서드 호출 확인
        verify(subscriberRepository, times(1)).findById(id)

        println("ID로 구독자 조회 테스트 완료")
    }

    /**
     * 존재하지 않는 ID로 조회 시 테스트
     */
    @Test
    @DisplayName("존재하지 않는 ID로 조회 시 예외 발생 테스트")
    fun getSubscriberById_WhenNotExists_ShouldThrowException() {
        // Given
        val nonExistingId = 999L
        `when`(subscriberRepository.findById(nonExistingId)).thenReturn(Optional.empty())

        // When & Then
        try {
            subscriberService.getSubscriberById(nonExistingId)
            assert(false) { "예외가 발생해야 합니다." }
        } catch (e: ResourceNotFoundException) {
            // 예외가 정상적으로 발생
            assert(true)
        }

        // 조회 메서드 호출 확인
        verify(subscriberRepository, times(1)).findById(nonExistingId)

        println("존재하지 않는 ID로 조회 테스트 완료")
    }

    /**
     * 구독 해지 테스트
     */
    @Test
    @DisplayName("구독 해지 테스트")
    fun unsubscribe_ShouldUpdateSubscriberStatus() {
        // Given
        `when`(subscriberRepository.findByEmail(email)).thenReturn(Optional.of(sampleSubscriber))
        
        val unsubscribedSubscriber = sampleSubscriber.copy(
            status = inactiveStatus,
            unsubscribedAt = now
        )
        
        `when`(subscriberRepository.save(any())).thenReturn(unsubscribedSubscriber)

        // When
        val result = subscriberService.unsubscribe(email)

        // Then
        assertNotNull(result)
        assertEquals(inactiveStatus, result.status)
        assertNotNull(result.unsubscribedAt)

        // 저장 메서드 호출 확인
        verify(subscriberRepository, times(1)).save(any())

        println("구독 해지 테스트 완료")
    }

    /**
     * 존재하지 않는 이메일로 구독 해지 시 테스트
     */
    @Test
    @DisplayName("존재하지 않는 이메일로 구독 해지 시 예외 발생 테스트")
    fun unsubscribe_WhenEmailNotExists_ShouldThrowException() {
        // Given
        val nonExistingEmail = "nonexisting@example.com"
        `when`(subscriberRepository.findByEmail(nonExistingEmail)).thenReturn(Optional.empty())

        // When & Then
        try {
            subscriberService.unsubscribe(nonExistingEmail)
            assert(false) { "예외가 발생해야 합니다." }
        } catch (e: ResourceNotFoundException) {
            // 예외가 정상적으로 발생
            assert(true)
        }

        // 조회 메서드 호출 확인
        verify(subscriberRepository, times(1)).findByEmail(nonExistingEmail)
        verify(subscriberRepository, never()).save(any()) // save는 호출되지 않아야 함

        println("존재하지 않는 이메일로 구독 해지 테스트 완료")
    }

    /**
     * 모든 활성 구독자 조회 테스트
     */
    @Test
    @DisplayName("모든 활성 구독자 조회 테스트")
    fun getAllActiveSubscribers_ShouldReturnActiveSubscribers() {
        // Given
        val activeSubscribers = listOf(
            sampleSubscriber,
            sampleSubscriber.copy(id = 2L, email = "test2@example.com")
        )
        
        `when`(subscriberRepository.findByStatus(activeStatus)).thenReturn(activeSubscribers)

        // When
        val result = subscriberService.getAllActiveSubscribers()

        // Then
        assertNotNull(result)
        assertEquals(2, result.size)
        assertEquals(activeStatus, result[0].status)
        assertEquals(activeStatus, result[1].status)

        // 조회 메서드 호출 확인
        verify(subscriberRepository, times(1)).findByStatus(activeStatus)

        println("모든 활성 구독자 조회 테스트 완료")
    }

    /**
     * 구독자 상태 변경 테스트
     */
    @Test
    @DisplayName("구독자 상태 변경 테스트")
    fun updateSubscriberStatus_ShouldUpdateStatus() {
        // Given
        `when`(subscriberRepository.findById(id)).thenReturn(Optional.of(sampleSubscriber))
        
        val updatedSubscriber = sampleSubscriber.copy(
            status = inactiveStatus,
            unsubscribedAt = now
        )
        
        `when`(subscriberRepository.save(any())).thenReturn(updatedSubscriber)

        // When
        val result = subscriberService.updateSubscriberStatus(id, inactiveStatus)

        // Then
        assertNotNull(result)
        assertEquals(inactiveStatus, result.status)
        assertNotNull(result.unsubscribedAt)

        // 저장 메서드 호출 확인
        verify(subscriberRepository, times(1)).save(any())

        println("구독자 상태 변경 테스트 완료")
    }
} 