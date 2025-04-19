package com.duckherald.integration

import com.duckherald.newsletter.dto.NewsletterRequest
import com.duckherald.newsletter.model.NewsletterEntity
import com.duckherald.newsletter.repository.NewsletterRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDateTime

/**
 * 뉴스레터 통합 테스트
 * 
 * 이 테스트는 실제 애플리케이션 컨텍스트를 로드하여 컨트롤러, 서비스, 레포지토리 등 
 * 모든 계층이 함께 작동하는 것을 테스트합니다.
 * 
 * 실제 HTTP 요청 처리부터 데이터베이스 액세스까지 전체 흐름을 테스트합니다.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // 테스트 프로필 사용 (H2 DB 등을 활용)
class NewsletterIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var newsletterRepository: NewsletterRepository

    // 테스트 데이터
    private val testTitle = "통합 테스트용 뉴스레터"
    private val testContent = "<p>통합 테스트 내용입니다.</p>"

    @BeforeEach
    fun setup() {
        // 테스트 전 데이터 초기화
        newsletterRepository.deleteAll()
    }

    @AfterEach
    fun cleanup() {
        // 테스트 후 데이터 정리
        newsletterRepository.deleteAll()
    }

    @Test
    @DisplayName("뉴스레터 생성 및 조회 통합 테스트")
    fun createAndGetNewsletter() {
        // 1. 뉴스레터 생성 요청
        val createRequest = NewsletterRequest(
            title = testTitle,
            content = testContent,
            summary = "통합 테스트 요약",
            thumbnail = "http://example.com/image.jpg"
        )

        val createResult = mockMvc.perform(
            post("/api/newsletters")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.title").value(testTitle))
            .andExpect(jsonPath("$.content").value(testContent))
            .andExpect(jsonPath("$.status").value("PUBLISHED"))
            .andReturn()

        // 생성된 ID 추출
        val responseContent = createResult.response.contentAsString
        val createdNewsletter = objectMapper.readTree(responseContent)
        val newsletterId = createdNewsletter.get("id").asInt()

        // 2. 생성된 뉴스레터 조회
        mockMvc.perform(get("/api/newsletters/$newsletterId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(newsletterId))
            .andExpect(jsonPath("$.title").value(testTitle))

        // 3. 모든 뉴스레터 목록 조회
        mockMvc.perform(get("/api/newsletters"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].id").value(newsletterId))
            .andExpect(jsonPath("$[0].title").value(testTitle))

        println("뉴스레터 생성 및 조회 통합 테스트 완료")
    }

    @Test
    @DisplayName("뉴스레터 업데이트 통합 테스트")
    fun updateNewsletter() {
        // 1. 테스트용 뉴스레터 저장
        val newsletterEntity = NewsletterEntity(
            title = testTitle,
            content = testContent,
            summary = "통합 테스트 요약",
            status = "DRAFT",
            createdAt = LocalDateTime.now(),
            thumbnail = "http://example.com/image.jpg"
        )
        val savedNewsletter = newsletterRepository.save(newsletterEntity)
        val newsletterId = savedNewsletter.id

        // 2. 뉴스레터 업데이트 요청
        val updatedTitle = "업데이트된 제목"
        val updateRequest = NewsletterRequest(
            title = updatedTitle,
            content = testContent,
            summary = "업데이트된 요약",
            thumbnail = "http://example.com/updated-image.jpg"
        )

        mockMvc.perform(
            put("/api/newsletters/$newsletterId")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(newsletterId))
            .andExpect(jsonPath("$.title").value(updatedTitle))

        // 3. 업데이트된 뉴스레터 확인
        mockMvc.perform(get("/api/newsletters/$newsletterId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.title").value(updatedTitle))

        println("뉴스레터 업데이트 통합 테스트 완료")
    }

    @Test
    @DisplayName("뉴스레터 삭제 통합 테스트")
    fun deleteNewsletter() {
        // 1. 테스트용 뉴스레터 저장
        val newsletterEntity = NewsletterEntity(
            title = testTitle,
            content = testContent,
            summary = "통합 테스트 요약",
            status = "DRAFT",
            createdAt = LocalDateTime.now(),
            thumbnail = "http://example.com/image.jpg"
        )
        val savedNewsletter = newsletterRepository.save(newsletterEntity)
        val newsletterId = savedNewsletter.id

        // 2. 뉴스레터 삭제 요청
        mockMvc.perform(delete("/api/newsletters/$newsletterId"))
            .andExpect(status().isOk)

        // 3. 삭제된 뉴스레터 조회 시 404 응답 확인
        mockMvc.perform(get("/api/newsletters/$newsletterId"))
            .andExpect(status().isNotFound)

        println("뉴스레터 삭제 통합 테스트 완료")
    }

    @Test
    @DisplayName("뉴스레터 발행 통합 테스트")
    fun publishNewsletter() {
        // 1. 테스트용 임시저장 뉴스레터 저장
        val newsletterEntity = NewsletterEntity(
            title = testTitle,
            content = testContent,
            summary = "통합 테스트 요약",
            status = "DRAFT",
            createdAt = LocalDateTime.now(),
            thumbnail = "http://example.com/image.jpg"
        )
        val savedNewsletter = newsletterRepository.save(newsletterEntity)
        val newsletterId = savedNewsletter.id ?: throw IllegalStateException("Newsletter ID가 null입니다.")

        // 2. 뉴스레터 발행 요청
        mockMvc.perform(post("/api/newsletters/$newsletterId/publish"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("PUBLISHED"))
            .andExpect(jsonPath("$.publishedAt").isNotEmpty)

        // 3. 데이터베이스에서 발행 상태 확인
        val publishedNewsletter = newsletterRepository.findById(newsletterId).get()
        assert(publishedNewsletter.status == "PUBLISHED")
        assert(publishedNewsletter.publishedAt != null)

        println("뉴스레터 발행 통합 테스트 완료")
    }
} 