// 경로: src/main/kotlin/com/duckherald/controller/NewsletterController.kt

package com.duckherald.newsletter.controller

import com.duckherald.common.R2Uploader
import com.duckherald.newsletter.dto.NewsletterRequest
import com.duckherald.newsletter.dto.NewsletterResponse
import com.duckherald.newsletter.model.NewsletterEntity
import com.duckherald.newsletter.service.NewsletterService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.logging.Logger

@RestController
@RequestMapping("/api/newsletters")
@Tag(name = "Newsletter", description = "뉴스레터 관리 API")
class NewsletterController(
    private val newsletterService: NewsletterService,
    private val r2Uploader: R2Uploader
) {
    private val logger = Logger.getLogger(NewsletterController::class.java.name)

    /**
     * 뉴스레터 목록 조회 (선택적 상태 필터링)
     */
    @Operation(
        summary = "뉴스레터 목록 조회", 
        description = "모든 뉴스레터 목록을 조회하거나 status 파라미터로 필터링합니다."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200", 
                description = "뉴스레터 목록 조회 성공",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = NewsletterResponse::class)
                )]
            )
        ]
    )
    @GetMapping
    fun getNewsletters(
        @Parameter(description = "뉴스레터 상태 필터 (DRAFT, PUBLISHED)")
        @RequestParam(required = false) status: String?
    ): ResponseEntity<List<NewsletterResponse>> {
        val newsletters = if (status != null) {
            newsletterService.findNewslettersByStatus(status)
        } else {
            newsletterService.getAllNewsletters()
        }
        
        return ResponseEntity.ok(NewsletterResponse.fromList(newsletters))
    }

    /**
     * 발행된 뉴스레터만 조회 (status = "PUBLISHED")
     */
    @Operation(
        summary = "발행된 뉴스레터 목록 조회", 
        description = "상태가 PUBLISHED인 뉴스레터만 조회합니다."
    )
    @GetMapping("/published")
    fun getPublishedNewsletters(): ResponseEntity<List<NewsletterResponse>> {
        val publishedNewsletters = newsletterService.findNewslettersByStatus("PUBLISHED")
        return ResponseEntity.ok(NewsletterResponse.fromList(publishedNewsletters))
    }

    /**
     * 특정 ID의 뉴스레터 조회
     */
    @Operation(
        summary = "특정 뉴스레터 조회",

        description = "ID로 특정 뉴스레터의 상세 정보를 조회합니다."
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "뉴스레터 조회 성공"),
            ApiResponse(responseCode = "404", description = "뉴스레터를 찾을 수 없음")
        ]
    )
    @GetMapping("/{id}")
    fun getNewsletterById(
        @Parameter(description = "뉴스레터 ID", required = true)
        @PathVariable id: Int
    ): ResponseEntity<NewsletterResponse> {
        val newsletter = newsletterService.getNewsletterById(id)
        return ResponseEntity.ok(NewsletterResponse.from(newsletter))
    }

    /**
     * 상태별 뉴스레터 조회 (기존 방식 유지 - 하위 호환성)
     */
    @Operation(
        summary = "상태별 뉴스레터 조회", 
        description = "특정 상태의 뉴스레터 목록을 조회합니다."
    )
    @GetMapping("/status/{status}")
    fun getNewslettersByStatus(
        @Parameter(description = "뉴스레터 상태 (DRAFT, PUBLISHED)", required = true)
        @PathVariable status: String
    ): ResponseEntity<List<NewsletterResponse>> {
        val newsletters = newsletterService.findNewslettersByStatus(status)
        return ResponseEntity.ok(NewsletterResponse.fromList(newsletters))
    }

    @Operation(
        summary = "뉴스레터 생성", 
        description = "새 뉴스레터를 생성하고 발행 상태로 설정합니다."
    )
    @PostMapping("/create-json")
    fun createNewsletter(
        @RequestBody request: NewsletterRequest
    ): ResponseEntity<NewsletterResponse> {
        logger.info("Creating newsletter with title: ${request.title}")
        val createdNewsletter = newsletterService.createNewsletter(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNewsletter)
    }

    @Operation(
        summary = "뉴스레터 임시 저장", 
        description = "뉴스레터를 임시 저장(DRAFT) 상태로 저장합니다."
    )
    @PostMapping("/save-draft")
    fun saveDraft(
        @RequestBody request: NewsletterRequest
    ): ResponseEntity<NewsletterResponse> {
        logger.info("Saving draft with title: ${request.title}")
        val savedDraft = newsletterService.saveDraft(request)
        return ResponseEntity.ok(savedDraft)
    }
}