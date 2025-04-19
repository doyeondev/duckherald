package com.duckherald.newsletter.controller

import com.duckherald.newsletter.model.NewsletterEntity
import com.duckherald.newsletter.dto.NewsletterRequest
import com.duckherald.newsletter.dto.NewsletterResponse
import com.duckherald.newsletter.service.NewsletterService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/admin/newsletters")
class NewsletterAdminController(private val newsletterService: NewsletterService) {

    /**
     * 뉴스레터 생성 (멀티파트 폼 데이터 처리)
     * @deprecated R2 이미지 업로드 방식으로 대체됨, /create-json 사용 권장
     */
    @PostMapping("/create")
    fun createNewsletterWithMultipart(
        @RequestParam("title") title: String,
        @RequestParam("content") content: String,
        @RequestParam(value = "thumbnail", required = false) thumbnail: MultipartFile?,
        @RequestParam(value = "summary", required = false) summary: String?
    ): ResponseEntity<NewsletterResponse> {
        try {
            // 썸네일 이미지 처리 - 이 부분은 R2 업로드로 변경되어 사용하지 않음
            var thumbnailUrl: String? = null
            if (thumbnail != null && !thumbnail.isEmpty) {
                // 향후 R2 업로드 코드로 대체 가능
                // thumbnailUrl = r2Uploader.upload(thumbnail)
            }
            
            // 뉴스레터 생성 - Request 객체로 변환
            val request = NewsletterRequest(
                title = title,
                content = content,
                summary = summary,
                thumbnail = thumbnailUrl,
                status = "PUBLISHED"
            )
            
            val response = newsletterService.createNewsletter(request)
            return ResponseEntity.ok(response)
        } catch (e: Exception) {
            e.printStackTrace()
            throw ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, 
                "뉴스레터 생성 중 오류: ${e.message}", 
                e
            )
        }
    }
    
    /**
     * 뉴스레터 생성 (JSON 방식 - 기존 엔드포인트)
     * @deprecated /create-json 엔드포인트로 통합됨
     */
    @Deprecated("Use /create-json instead")
    @PostMapping
    fun createNewsletter(@RequestBody request: NewsletterRequest): ResponseEntity<NewsletterResponse> {
        val response = newsletterService.createNewsletter(request)
        return ResponseEntity.ok(response)
    }
    
    /**
     * 뉴스레터 수정
     */
    @PutMapping("/{id}")
    fun updateNewsletter(
        @PathVariable id: Int,
        @RequestBody request: NewsletterRequest
    ): ResponseEntity<NewsletterResponse> {
        // 수정된 방식: 모든 필드를 요청으로부터 가져옴
        val response = newsletterService.updateNewsletter(
            id = id,
            request = request
        )
        return ResponseEntity.ok(response)
    }
    
    /**
     * 뉴스레터 삭제
     */
    @DeleteMapping("/{id}")
    fun deleteNewsletter(@PathVariable id: Int): ResponseEntity<Void> {
        newsletterService.deleteNewsletter(id)
        return ResponseEntity.noContent().build()
    }
    
    /**
     * 이미지 업로드
     * @deprecated R2 업로드 방식으로 대체되었음, /api/newsletters/images/upload 사용 권장
     */
    @Deprecated("Use /api/newsletters/images/upload instead")
    @PostMapping("/{id}/image")
    fun uploadImage(
        @PathVariable id: Int,
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<String> {
        // 먼저 게시물이 존재하는지 확인
        val newsletter = newsletterService.getNewsletterById(id)
        
        // 이미지 업로드 처리 - 이 부분은 R2 업로드로 대체됨
        val imageUrl = newsletterService.uploadImage(file)
        
        // 업로드된 이미지 URL을 뉴스레터에 저장
        if (imageUrl != null) {
            // updateNewsletter 메서드 시그니처 변경에 맞게 수정
            val updateRequest = NewsletterRequest(
                title = newsletter.title,
                content = newsletter.content,
                summary = newsletter.summary,
                thumbnail = imageUrl,
                status = newsletter.status
            )
            
            newsletterService.updateNewsletter(id, updateRequest)
        }
        
        return ResponseEntity.ok(imageUrl ?: "")
    }
    
    /**
     * 뉴스레터 발행
     */
    @PostMapping("/{id}/publish")
    fun publishNewsletter(@PathVariable id: Int): ResponseEntity<NewsletterResponse> {
        val publishedNewsletter = newsletterService.publishNewsletter(id)
        return ResponseEntity.ok(publishedNewsletter)
    }

    /**
     * 간단 뉴스레터 생성
     * @deprecated /create-json 엔드포인트로 통합됨
     */
    @Deprecated("Use /create-json instead")
    @PostMapping("/create-simple")
    fun createNewsletterSimple(
        @RequestParam("title") title: String,
        @RequestParam("content") content: String
    ): ResponseEntity<NewsletterResponse> {
        println("Creating simple newsletter - Title: $title, Content length: ${content.length}")
        
        val request = NewsletterRequest(
            title = title,
            content = content,
            summary = null,
            thumbnail = null,
            status = "PUBLISHED"
        )
        
        val response = newsletterService.createNewsletter(request)
        return ResponseEntity.ok(response)
    }

    /**
     * 통합된 뉴스레터 저장 엔드포인트
     * mode 파라미터에 따라 draft 또는 publish로 처리
     */
    @PostMapping("/save")
    fun saveNewsletter(
        @RequestBody request: NewsletterRequest,
        @RequestParam(required = false, defaultValue = "draft") mode: String
    ): ResponseEntity<NewsletterResponse> {
        val isPublishing = mode.equals("publish", ignoreCase = true)
        
        println("Saving newsletter as ${if (isPublishing) "published" else "draft"} - Title: ${request.title}")
        println("Thumbnail URL: ${request.thumbnail}")
        
        val response = if (isPublishing) {
            newsletterService.createNewsletter(request)
        } else {
            newsletterService.saveDraft(request)
        }
        
        return ResponseEntity.status(if (isPublishing) HttpStatus.CREATED else HttpStatus.OK).body(response)
    }

    /**
     * JSON 방식 뉴스레터 생성 (주요 사용 엔드포인트)
     */
    @PostMapping("/create-json")
    fun createNewsletterJson(@RequestBody request: NewsletterRequest): ResponseEntity<NewsletterResponse> {
        println("Creating newsletter from JSON - Title: ${request.title}")
        println("Thumbnail URL: ${request.thumbnail}")
        
        val response = newsletterService.createNewsletter(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
    
    /**
     * 임시 저장 (드래프트) 기능
     */
    @PostMapping("/save-draft")
    fun saveDraft(@RequestBody request: NewsletterRequest): ResponseEntity<NewsletterResponse> {
        println("Saving draft - Title: ${request.title}")
        println("Thumbnail URL: ${request.thumbnail}")
        
        val response = newsletterService.saveDraft(request)
        return ResponseEntity.ok(response)
    }
} 