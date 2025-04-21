package com.duckherald.newsletter.service

import com.duckherald.newsletter.dto.NewsletterRequest
import com.duckherald.newsletter.dto.NewsletterResponse
import com.duckherald.newsletter.model.NewsletterEntity
import com.duckherald.newsletter.repository.NewsletterRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import org.springframework.data.repository.findByIdOrNull
import java.time.LocalDateTime
import java.util.*
import kotlin.test.assertNull

/**
 * NewsletterService 단위 테스트
 * 
 * 테스트 범위:
 * 1. 뉴스레터 조회 (전체 목록, 단일 항목)
 * 2. 뉴스레터 생성 (발행 및 임시저장)
 * 3. 뉴스레터 업데이트
 * 4. 뉴스레터 삭제
 * 5. 뉴스레터 발행 처리
 * 6. 예외 처리 상황 
 */
class NewsletterServiceTest {

    // 테스트 대상 서비스
    private lateinit var newsletterService: NewsletterService
    
    // 모의 객체(Mock)
    private lateinit var newsletterRepository: NewsletterRepository
    
    // 테스트용 데이터
    private val sampleId = 1
    private val sampleTitle = "테스트 뉴스레터"
    private val sampleContent = "<p>테스트 내용입니다.</p>"
    private val sampleSummary = "테스트 요약"
    private val now = LocalDateTime.now()
    
    // 테스트 설정
    @BeforeEach
    fun setup() {
        // 모의 객체 생성
        newsletterRepository = mock(NewsletterRepository::class.java)
        
        // 서비스 초기화
        newsletterService = NewsletterService(newsletterRepository)
    }
    
    /**
     * 샘플 엔티티 생성 헬퍼 메서드
     */
    private fun createSampleEntity(
        id: Int = sampleId,
        status: String = "DRAFT",
        publishedAt: LocalDateTime? = null,
        summary: String? = sampleSummary,
        thumbnail: String? = "http://example.com/image.jpg"
    ): NewsletterEntity {
        return NewsletterEntity(
            id = id,
            title = sampleTitle,
            content = sampleContent,
            summary = summary,
            status = status,
            createdAt = now,
            publishedAt = publishedAt,
            thumbnail = thumbnail
        )
    }
    
    /**
     * 샘플 요청 DTO 생성 헬퍼 메서드
     */
    private fun createSampleRequest(
        title: String = sampleTitle,
        content: String = sampleContent,
        summary: String? = sampleSummary,
        status: String? = null,
        thumbnail: String? = "http://example.com/image.jpg"
    ): NewsletterRequest {
        return NewsletterRequest(
            title = title,
            content = content,
            summary = summary,
            status = status,
            thumbnail = thumbnail
        )
    }
    
    // 전체 뉴스레터 조회 테스트
    @Test
    @DisplayName("모든 뉴스레터 조회 테스트")
    fun getAllNewsletters_ShouldReturnAllNewsletters() {
        // Given: 테스트 데이터 설정
        val newsletterList = listOf(
            createSampleEntity(id = 1),
            createSampleEntity(id = 2, status = "PUBLISHED", publishedAt = now)
        )
        
        // Mock 동작 설정
        `when`(newsletterRepository.findAll()).thenReturn(newsletterList)
        
        // When: 테스트 대상 메서드 호출
        val result = newsletterService.getAllNewsletters()
        
        // Then: 결과 검증
        assertEquals(2, result.size)
        assertEquals(1, result[0].id)
        assertEquals(2, result[1].id)
        assertEquals("DRAFT", result[0].status)
        assertEquals("PUBLISHED", result[1].status)
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).findAll()
        
        println("모든 뉴스레터 조회 테스트 성공")
    }
    
    // 단일 뉴스레터 조회 테스트
    @Test
    @DisplayName("ID로 뉴스레터 조회 테스트 - 성공 케이스")
    fun getNewsletterById_WithValidId_ShouldReturnNewsletter() {
        // Given: 테스트 데이터 설정
        val newsletter = createSampleEntity()
        
        // Mock 동작 설정
        `when`(newsletterRepository.findById(sampleId)).thenReturn(Optional.of(newsletter))
        
        // When: 테스트 대상 메서드 호출
        val result = newsletterService.getNewsletterById(sampleId)
        
        // Then: 결과 검증
        assertEquals(sampleId, result.id)
        assertEquals(sampleTitle, result.title)
        assertEquals(sampleContent, result.content)
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).findById(sampleId)
        
        println("ID로 뉴스레터 조회 테스트(성공) 완료")
    }
    
    // 존재하지 않는 뉴스레터 조회 테스트
    @Test
    @DisplayName("ID로 뉴스레터 조회 테스트 - 존재하지 않는 경우")
    fun getNewsletterById_WithInvalidId_ShouldThrowException() {
        // Given: 테스트 데이터 설정
        val invalidId = 999
        
        // Mock 동작 설정
        `when`(newsletterRepository.findById(invalidId)).thenReturn(Optional.empty())
        
        // When & Then: 예외 발생 검증
        val exception = assertThrows<NoSuchElementException> {
            newsletterService.getNewsletterById(invalidId)
        }
        
        // 예외 메시지 검증
        assertTrue(exception.message!!.contains("Newsletter not found"))
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).findById(invalidId)
        
        println("ID로 뉴스레터 조회 테스트(실패) 완료")
    }
    
    // 뉴스레터 생성 테스트
    @Test
    @DisplayName("뉴스레터 생성 테스트")
    fun createNewsletter_WithValidData_ShouldCreateAndReturnNewsletter() {
        // Given: 테스트 데이터 설정
        val request = createSampleRequest()
        val savedEntity = createSampleEntity(status = "PUBLISHED", publishedAt = now)
        
        // Mock 동작 설정
        `when`(newsletterRepository.save(any(NewsletterEntity::class.java))).thenReturn(savedEntity)
        
        // When: 테스트 대상 메서드 호출
        val result = newsletterService.createNewsletter(request)
        
        // Then: 결과 검증
        assertEquals(sampleId, result.id)
        assertEquals(sampleTitle, result.title)
        assertEquals("PUBLISHED", result.status)
        assertNotNull(result.publishedAt)
        assertEquals(sampleSummary, result.summary)
        assertEquals("http://example.com/image.jpg", result.thumbnail)
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).save(any(NewsletterEntity::class.java))
        
        println("뉴스레터 생성 테스트 완료")
    }
    
    // 뉴스레터 임시저장 테스트
    @Test
    @DisplayName("뉴스레터 임시저장 테스트")
    fun saveDraft_WithValidData_ShouldSaveAsDraft() {
        // Given: 테스트 데이터 설정
        val request = createSampleRequest()
        val savedEntity = createSampleEntity(status = "DRAFT")
        
        // Mock 동작 설정
        `when`(newsletterRepository.save(any(NewsletterEntity::class.java))).thenReturn(savedEntity)
        
        // When: 테스트 대상 메서드 호출
        val result = newsletterService.saveDraft(request)
        
        // Then: 결과 검증
        assertEquals(sampleId, result.id)
        assertEquals("DRAFT", result.status)
        assertNull(result.publishedAt)
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).save(any(NewsletterEntity::class.java))
        
        println("뉴스레터 임시저장 테스트 완료")
    }
    
    // 뉴스레터 업데이트 테스트
    @Test
    @DisplayName("뉴스레터 업데이트 테스트")
    fun updateNewsletter_WithValidData_ShouldUpdateAndReturnNewsletter() {
        // Given: 테스트 데이터 설정
        val existingNewsletter = createSampleEntity()
        val request = createSampleRequest(title = "업데이트된 제목", content = "업데이트된 내용")
        val updatedNewsletter = existingNewsletter.copy(
            title = "업데이트된 제목",
            content = "업데이트된 내용",
            updatedAt = now
        )
        
        // Mock 동작 설정
        `when`(newsletterRepository.findById(sampleId)).thenReturn(Optional.of(existingNewsletter))
        `when`(newsletterRepository.save(any(NewsletterEntity::class.java))).thenReturn(updatedNewsletter)
        
        // When: 테스트 대상 메서드 호출
        val result = newsletterService.updateNewsletter(sampleId, request)
        
        // Then: 결과 검증
        assertEquals(sampleId, result.id)
        assertEquals("업데이트된 제목", result.title)
        assertEquals("업데이트된 내용", result.content)
        assertNotNull(result.updatedAt)
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).findById(sampleId)
        verify(newsletterRepository, times(1)).save(any(NewsletterEntity::class.java))
        
        println("뉴스레터 업데이트 테스트 완료")
    }
    
    /**
     * 뉴스레터 업데이트 테스트 - summary, thumbnail 필드 포함
     */
    @Test
    @DisplayName("뉴스레터 업데이트 테스트 - Nullable 필드 포함")
    fun updateNewsletter_WithOptionalFields_ShouldUpdateAllFields() {
        // Given: 테스트 데이터 설정
        val existingNewsletter = createSampleEntity()
        val updatedNewsletter = existingNewsletter.copy(
            title = "새 제목",
            content = "새 내용",
            summary = "새 요약",
            thumbnail = "새 썸네일 URL",
            updatedAt = now
        )
        
        // 요청 객체 - 모든 필드 포함
        val request = NewsletterRequest(
            title = "새 제목",
            content = "새 내용",
            summary = "새 요약",
            thumbnail = "새 썸네일 URL"
        )
        
        // Mock 동작 설정
        `when`(newsletterRepository.findById(sampleId)).thenReturn(Optional.of(existingNewsletter))
        `when`(newsletterRepository.save(any(NewsletterEntity::class.java))).thenReturn(updatedNewsletter)
        
        // When: 테스트 대상 메서드 호출
        val result = newsletterService.updateNewsletter(sampleId, request)
        
        // Then: 결과 검증
        assertEquals("새 제목", result.title)
        assertEquals("새 내용", result.content)
        assertEquals("새 요약", result.summary)
        assertEquals("새 썸네일 URL", result.thumbnail)
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).findById(sampleId)
        verify(newsletterRepository, times(1)).save(any(NewsletterEntity::class.java))
        
        println("뉴스레터 업데이트 테스트 (Nullable 필드 포함) 완료")
    }
    
    /**
     * 뉴스레터 업데이트 테스트 - 옵셔널 필드가 null인 경우
     */
    @Test
    @DisplayName("뉴스레터 업데이트 테스트 - Null 값 처리")
    fun updateNewsletter_WithNullValues_ShouldHandleNullsProperly() {
        // Given: 테스트 데이터 설정
        val existingNewsletter = createSampleEntity(
            summary = "기존 요약",
            thumbnail = "기존 썸네일"
        )
        
        // Null 값을 포함한 요청 객체
        val request = NewsletterRequest(
            title = "새 제목",
            content = "새 내용",
            summary = null,
            thumbnail = null
        )
        
        val updatedNewsletter = existingNewsletter.copy(
            title = "새 제목",
            content = "새 내용",
            summary = null,  // 명시적으로 null로 업데이트
            thumbnail = null, // 명시적으로 null로 업데이트
            updatedAt = now
        )
        
        // Mock 동작 설정
        `when`(newsletterRepository.findById(sampleId)).thenReturn(Optional.of(existingNewsletter))
        `when`(newsletterRepository.save(any(NewsletterEntity::class.java))).thenReturn(updatedNewsletter)
        
        // When: 테스트 대상 메서드 호출
        val result = newsletterService.updateNewsletter(sampleId, request)
        
        // Then: 결과 검증
        assertEquals("새 제목", result.title)
        assertEquals("새 내용", result.content)
        assertNull(result.summary)
        assertNull(result.thumbnail)
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).findById(sampleId)
        verify(newsletterRepository, times(1)).save(any(NewsletterEntity::class.java))
        
        println("뉴스레터 업데이트 테스트 (Null 값 처리) 완료")
    }
    
    // 뉴스레터 삭제 테스트
    @Test
    @DisplayName("뉴스레터 삭제 테스트")
    fun deleteNewsletter_WithValidId_ShouldDeleteNewsletter() {
        // Given: 테스트 데이터 설정
        `when`(newsletterRepository.existsById(sampleId)).thenReturn(true)
        doNothing().`when`(newsletterRepository).deleteById(sampleId)
        
        // When: 테스트 대상 메서드 호출
        newsletterService.deleteNewsletter(sampleId)
        
        // Then: 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).existsById(sampleId)
        verify(newsletterRepository, times(1)).deleteById(sampleId)
        
        println("뉴스레터 삭제 테스트 완료")
    }
    
    // 존재하지 않는 뉴스레터 삭제 테스트
    @Test
    @DisplayName("존재하지 않는 뉴스레터 삭제 시 예외 발생 테스트")
    fun deleteNewsletter_WithInvalidId_ShouldThrowException() {
        // Given: 테스트 데이터 설정
        val invalidId = 999
        `when`(newsletterRepository.existsById(invalidId)).thenReturn(false)
        
        // When & Then: 예외 발생 검증
        val exception = assertThrows<NoSuchElementException> {
            newsletterService.deleteNewsletter(invalidId)
        }
        
        // 예외 메시지 검증
        assertTrue(exception.message!!.contains("Newsletter not found"))
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).existsById(invalidId)
        verify(newsletterRepository, never()).deleteById(invalidId)
        
        println("존재하지 않는 뉴스레터 삭제 예외 테스트 완료")
    }
    
    // 뉴스레터 발행 테스트
    @Test
    @DisplayName("뉴스레터 발행 테스트")
    fun publishNewsletter_WithDraftNewsletter_ShouldPublishNewsletter() {
        // Given: 테스트 데이터 설정
        val draftNewsletter = createSampleEntity(status = "DRAFT")
        val publishedNewsletter = draftNewsletter.copy(
            status = "PUBLISHED",
            publishedAt = now
        )
        
        // Mock 동작 설정
        `when`(newsletterRepository.findById(sampleId)).thenReturn(Optional.of(draftNewsletter))
        `when`(newsletterRepository.save(any(NewsletterEntity::class.java))).thenReturn(publishedNewsletter)
        
        // When: 테스트 대상 메서드 호출
        val result = newsletterService.publishNewsletter(sampleId)
        
        // Then: 결과 검증
        assertEquals(sampleId, result.id)
        assertEquals("PUBLISHED", result.status)
        assertNotNull(result.publishedAt)
        
        // 모의 객체 호출 검증
        verify(newsletterRepository, times(1)).findById(sampleId)
        verify(newsletterRepository, times(1)).save(any(NewsletterEntity::class.java))
        
        println("뉴스레터 발행 테스트 완료")
    }
} 