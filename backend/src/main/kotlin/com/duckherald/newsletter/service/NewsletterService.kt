// 경로: src/main/kotlin/com/duckherald/newsletter/domain/service/NewsletterService.kt

package com.duckherald.newsletter.service

import com.duckherald.exception.ResourceNotFoundException
import com.duckherald.newsletter.model.NewsletterEntity
import com.duckherald.newsletter.repository.NewsletterRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID
import java.io.File
import com.duckherald.newsletter.dto.NewsletterRequest
import org.springframework.web.multipart.MultipartFile
import java.util.NoSuchElementException
import java.lang.RuntimeException
import com.duckherald.newsletter.dto.NewsletterResponse
import java.util.logging.Logger

@Service
@Transactional(readOnly = true)
class NewsletterService(private val newsletterRepository: NewsletterRepository) {
    private val logger = Logger.getLogger(NewsletterService::class.java.name)

    /**
     * ID로 뉴스레터 조회 (DTO 변환 없이 엔티티 그대로 반환)
     */
    fun getNewsletterById(id: Int): NewsletterEntity {
        return newsletterRepository.findById(id)
            .orElseThrow { NoSuchElementException("Newsletter not found with id: $id") }
    }

    /**
     * ID로 뉴스레터 조회 (DTO로 변환하여 반환)
     */
    fun getNewsletterResponseById(id: Int): NewsletterResponse {
        val entity = getNewsletterById(id)
        return NewsletterResponse.from(entity)
    }

    /**
     * 모든 뉴스레터 조회
     */
    fun getAllNewsletters(): List<NewsletterEntity> {
        return newsletterRepository.findAll().toList()
    }

    /**
     * 상태별 뉴스레터 조회
     */
    fun findNewslettersByStatus(status: String): List<NewsletterEntity> {
        return newsletterRepository.findByStatus(status)
    }

    /**
     * 통합된 뉴스레터 저장 메서드
     * status 값에 따라 DRAFT 또는 PUBLISHED로 저장
     */
    @Transactional
    fun createNewsletter(request: NewsletterRequest): NewsletterResponse {
        // DTO → Entity 변환 (request의 extension 함수 사용)
        val entity = request.toEntity().apply {
            // 발행 상태로 설정
            status = "PUBLISHED"
            publishedAt = LocalDateTime.now()
        }
        
        val savedEntity = newsletterRepository.save(entity)
        return NewsletterResponse.from(savedEntity)
    }

    @Transactional
    fun saveDraft(request: NewsletterRequest): NewsletterResponse {
        // DTO → Entity 변환 (request의 extension 함수 사용)
        val entity = request.toEntity().apply {
            status = "DRAFT"
        }
        
        val savedEntity = newsletterRepository.save(entity)
        return NewsletterResponse.from(savedEntity)
    }

    /**
     * 뉴스레터 업데이트
     */
    @Transactional
    fun updateNewsletter(id: Int, request: NewsletterRequest): NewsletterResponse {
        val existingNewsletter = getNewsletterById(id)
        
        // DTO로 Entity 업데이트
        val updatedEntity = request.updateEntity(existingNewsletter)
        
        val savedEntity = newsletterRepository.save(updatedEntity)
        return NewsletterResponse.from(savedEntity)
    }

    @Transactional
    fun deleteNewsletter(id: Int) {
        if (!newsletterRepository.existsById(id)) {
            throw NoSuchElementException("Newsletter not found with id: $id")
        }
        newsletterRepository.deleteById(id)
    }
    
    /**
     * 뉴스레터 발행 (수정버전 - NewsletterResponse 반환)
     */
    @Transactional
    fun publishNewsletter(id: Int): NewsletterResponse {
        val newsletter = getNewsletterById(id)
        val publishedNewsletter = newsletter.copy(
            status = "PUBLISHED",
            publishedAt = LocalDateTime.now()
        )
        val savedNewsletter = newsletterRepository.save(publishedNewsletter)
        return NewsletterResponse.from(savedNewsletter)
    }
    
    fun findNewslettersScheduledBetween(startTime: LocalDateTime, endTime: LocalDateTime): List<NewsletterEntity> {
        return newsletterRepository.findNewslettersScheduledBetween(startTime, endTime)
    }

    /**
     * 이미지 업로드 처리
     */
    fun uploadImage(file: MultipartFile): String? {
        if (file.isEmpty) return null
        
        try {
            // UUID 직접 생성
            val uuid = UUID.randomUUID()
            val originalFilename = file.originalFilename
            val extension = originalFilename?.substringAfterLast('.', "jpg")
            
            // 이미지를 실제로 저장 (업로드 디렉토리에)
            val uploadDir = File("uploads/newsletters")
            if (!uploadDir.exists()) {
                uploadDir.mkdirs()
            }
            
            val filename = "$uuid.$extension"
            val targetFile = File(uploadDir, filename)
            file.transferTo(targetFile)
            
            // UUID 문자열 반환
            return uuid.toString()
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    /**
     * 특정 뉴스레터용 이미지 업로드 처리
     */
    @Transactional
    fun uploadImage(id: Int, file: MultipartFile): String? {
        val newsletter = getNewsletterById(id)
        val imageUrl = uploadImage(file)
        
        if (imageUrl != null) {
            try {
                // String을 UUID로 변환
                val uuid = UUID.fromString(imageUrl.split(".")[0])
                
                val updatedNewsletter = newsletter.copy(
                    thumbnailImg = uuid  // 이제 UUID 타입으로 할당
                )
                newsletterRepository.save(updatedNewsletter)
            } catch (e: Exception) {
                // UUID 변환 실패 시 로그 출력
                println("Failed to convert string to UUID: $imageUrl")
            }
        }
        
        return imageUrl
    }

    fun scheduleNewsletter(id: Int, scheduledAt: LocalDateTime): NewsletterEntity {
        val newsletter = getNewsletterById(id)
        val scheduledNewsletter = newsletter.copy(
            status = "SCHEDULED",
            scheduledAt = scheduledAt
        )
        return newsletterRepository.save(scheduledNewsletter)
    }

    @Transactional
    fun updateThumbnail(newsletterId: Int, thumbnailUrl: String): NewsletterResponse {
        logger.info("Updating thumbnail for newsletter ID: $newsletterId")
        
        val newsletter = newsletterRepository.findById(newsletterId)
            .orElseThrow { RuntimeException("Newsletter not found with ID: $newsletterId") }
        
        newsletter.thumbnail = thumbnailUrl
        
        val updatedNewsletter = newsletterRepository.save(newsletter)
        return NewsletterResponse.from(updatedNewsletter)
    }
}