package com.duckherald.user.controller

import com.duckherald.DuckHeraldApplication
import com.duckherald.common.advice.GlobalExceptionHandler
import com.duckherald.exception.ResourceNotFoundException
import com.duckherald.user.dto.SubscriberRequest
import com.duckherald.user.dto.SubscriberResponse
import com.duckherald.user.model.Subscriber
import com.duckherald.user.service.SubscriberService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.Mockito.times
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.anyString
import org.mockito.Mockito.any
import org.mockito.Mockito.eq
import org.mockito.Mockito.doAnswer
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultHandlers
import java.time.LocalDateTime

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
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
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
        
        // Kotlin에서 Mockito 사용 시 any() 대신 직접 요청 객체를 사용하여 회피
        `when`(subscriberService.subscribe(sampleSubscriberRequest)).thenReturn(createdSubscriber)

        // When & Then
        mockMvc.perform(post("/api/subscribers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleSubscriberRequest)))
            .andDo(MockMvcResultHandlers.print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value(activeStatus))
        
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
            .andDo(MockMvcResultHandlers.print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value(inactiveStatus))
        
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
        
        // ResourceNotFoundException이 GlobalExceptionHandler에 의해 404로 처리되도록 설정
        doThrow(com.duckherald.common.exception.ResourceNotFoundException("구독자를 찾을 수 없습니다."))
            .`when`(subscriberService).unsubscribe(nonExistingEmail)

        // When & Then
        mockMvc.perform(post("/api/subscribers/unsubscribe")
                .param("email", nonExistingEmail)
                .contentType(MediaType.APPLICATION_JSON))
            .andDo(MockMvcResultHandlers.print())
            .andExpect(status().isNotFound()) // 404 응답 코드 예상
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"))
            .andExpect(jsonPath("$.message").exists())
        
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
            .andDo(MockMvcResultHandlers.print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.subscribed").value(true))
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value(activeStatus))
        
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
        
        // eq 대신 직접 문자열 사용 - Kotlin에서는 일반적으로 eq()가 필요하지 않음
        `when`(subscriberService.getSubscriberByEmail(email)).thenReturn(inactiveSubscriber)

        // When & Then
        mockMvc.perform(get("/api/subscribers/status")
                .param("email", email))
            .andDo(MockMvcResultHandlers.print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.subscribed").value(false))
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value(inactiveStatus))
        
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
            .andDo(MockMvcResultHandlers.print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.subscribed").value(false))
            .andExpect(jsonPath("$.email").value(nonExistingEmail))
            .andExpect(jsonPath("$.status").value("NOT_FOUND"))
        
        println("구독 상태 확인 API 테스트 - 존재하지 않는 이메일 완료")
    }
} 