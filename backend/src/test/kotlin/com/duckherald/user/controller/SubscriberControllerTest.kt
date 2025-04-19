package com.duckherald.user.controller

import com.duckherald.exception.ResourceNotFoundException
import com.duckherald.user.dto.SubscriberRequest
import com.duckherald.user.dto.SubscriberResponse
import com.duckherald.user.model.Subscriber
import com.duckherald.user.service.SubscriberService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyString
import org.mockito.ArgumentMatchers.eq
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.Mockito.times
import org.mockito.Mockito.doThrow
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import java.time.LocalDateTime
import java.util.*

/**
 * SubscriberController 단위 테스트
 * 
 * 테스트 범위:
 * 1. 구독 신청 API
 * 2. 구독 해지 API
 * 3. 구독 상태 확인 API
 * 
 * 모델 구조 변경 반영 사항:
 * - id 타입: String → Long
 * - name 필드 제거
 * - active 대신 status(String) 필드 사용
 * - verified/verificationToken 필드 제거
 * - unsubscribedAt 필드 추가
 * 
 * API 변경 반영 사항:
 * - POST /api/subscribers: createSubscriber → subscribe
 * - DELETE /api/subscribers/{id} → POST /api/subscribers/unsubscribe (이메일 기반으로 변경)
 * - GET /api/subscribers/verify 삭제 (인증 기능 제거)
 * - GET /api/subscribers/status 추가 (구독 상태 확인)
 */
@WebMvcTest(SubscriberController::class)
class SubscriberControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var subscriberService: SubscriberService

    // 테스트 데이터
    private val now = LocalDateTime.now()
    private val subscriberId = 1L
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
            id = subscriberId,
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
     * 구독 신청 API 테스트
     */
    @Test
    @DisplayName("구독 신청 API 테스트")
    fun subscribe_ShouldReturnCreatedSubscriber() {
        // Given
        val createdSubscriber = sampleSubscriber.copy(
            id = subscriberId,
            email = sampleSubscriberRequest.email,
            status = activeStatus
        )
        
        `when`(subscriberService.subscribe(any())).thenReturn(createdSubscriber)

        // When & Then
        mockMvc.perform(post("/api/subscribers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleSubscriberRequest)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value(activeStatus))

        // 서비스 메서드 호출 검증
        verify(subscriberService, times(1)).subscribe(any())
        
        println("구독 신청 API 테스트 완료")
    }

    /**
     * 구독 해지 API 테스트
     */
    @Test
    @DisplayName("구독 해지 API 테스트")
    fun unsubscribe_ShouldReturnUnsubscribedSubscriber() {
        // Given
        val unsubscribedSubscriber = sampleSubscriber.copy(
            status = inactiveStatus,
            unsubscribedAt = now
        )
        
        `when`(subscriberService.unsubscribe(email)).thenReturn(unsubscribedSubscriber)

        // When & Then
        mockMvc.perform(post("/api/subscribers/unsubscribe")
                .param("email", email)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value(inactiveStatus))

        // 서비스 메서드 호출 검증
        verify(subscriberService, times(1)).unsubscribe(email)
        
        println("구독 해지 API 테스트 완료")
    }

    /**
     * 존재하지 않는 구독자 해지 요청 처리 테스트
     */
    @Test
    @DisplayName("존재하지 않는 구독자 해지 요청 처리 테스트")
    fun unsubscribeNonExistingSubscriber_ShouldReturn404() {
        // Given
        val nonExistingEmail = "nonexisting@example.com"
        doThrow(ResourceNotFoundException("$nonExistingEmail 구독자를 찾을 수 없습니다."))
            .`when`(subscriberService).unsubscribe(nonExistingEmail)

        // When & Then
        mockMvc.perform(post("/api/subscribers/unsubscribe")
                .param("email", nonExistingEmail)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound)

        println("존재하지 않는 구독자 해지 요청 처리 테스트 완료")
    }

    /**
     * 구독 상태 확인 API 테스트 - 구독 중 상태
     */
    @Test
    @DisplayName("구독 상태 확인 API 테스트 - 구독 중 상태")
    fun checkSubscriptionStatus_WhenActive_ShouldReturnActiveStatus() {
        // Given
        `when`(subscriberService.getSubscriberByEmail(email)).thenReturn(sampleSubscriber)

        // When & Then
        mockMvc.perform(get("/api/subscribers/status")
                .param("email", email))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.subscribed").value(true))
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value(activeStatus))

        // 서비스 메서드 호출 검증
        verify(subscriberService, times(1)).getSubscriberByEmail(email)
        
        println("구독 상태 확인 API 테스트 - 구독 중 상태 완료")
    }

    /**
     * 구독 상태 확인 API 테스트 - 구독 취소 상태
     */
    @Test
    @DisplayName("구독 상태 확인 API 테스트 - 구독 취소 상태")
    fun checkSubscriptionStatus_WhenInactive_ShouldReturnInactiveStatus() {
        // Given
        val inactiveSubscriber = sampleSubscriber.copy(
            status = inactiveStatus,
            unsubscribedAt = now
        )
        
        `when`(subscriberService.getSubscriberByEmail(email)).thenReturn(inactiveSubscriber)

        // When & Then
        mockMvc.perform(get("/api/subscribers/status")
                .param("email", email))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.subscribed").value(false))
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value(inactiveStatus))

        // 서비스 메서드 호출 검증
        verify(subscriberService, times(1)).getSubscriberByEmail(email)
        
        println("구독 상태 확인 API 테스트 - 구독 취소 상태 완료")
    }

    /**
     * 구독 상태 확인 API 테스트 - 존재하지 않는 이메일
     */
    @Test
    @DisplayName("구독 상태 확인 API 테스트 - 존재하지 않는 이메일")
    fun checkSubscriptionStatus_WhenNotFound_ShouldReturnNotFoundStatus() {
        // Given
        val nonExistingEmail = "nonexisting@example.com"
        `when`(subscriberService.getSubscriberByEmail(nonExistingEmail)).thenReturn(null)

        // When & Then
        mockMvc.perform(get("/api/subscribers/status")
                .param("email", nonExistingEmail))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.subscribed").value(false))
            .andExpect(jsonPath("$.email").value(nonExistingEmail))
            .andExpect(jsonPath("$.status").value("NOT_FOUND"))

        // 서비스 메서드 호출 검증
        verify(subscriberService, times(1)).getSubscriberByEmail(nonExistingEmail)
        
        println("구독 상태 확인 API 테스트 - 존재하지 않는 이메일 완료")
    }
} 