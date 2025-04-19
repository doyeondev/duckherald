// 경로: src/main/kotlin/com/duckherald/newsletter/dto/NewsletterRequest.kt
package com.duckherald.newsletter.dto

import com.duckherald.newsletter.model.NewsletterEntity
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "뉴스레터 생성/수정 요청 DTO")
data class NewsletterRequest(
    @Schema(description = "뉴스레터 제목", example = "5월의 뉴스레터", required = true)
    val title: String,
    
    @Schema(description = "뉴스레터 본문 (HTML)", example = "<p>이번 달 소식을 전해드립니다.</p>", required = true)
    val content: String,
    
    @Schema(description = "뉴스레터 요약", example = "5월 소식 요약")
    val summary: String? = null,
    
    @Schema(description = "썸네일 이미지 URL", example = "https://example.com/images/thumbnail-may.jpg")
    val thumbnail: String? = null,
    
    @Schema(description = "뉴스레터 상태 (DRAFT, PUBLISHED)", example = "DRAFT")
    val status: String? = "DRAFT",
    
    @Schema(description = "예약 발송 일시 (null인 경우 즉시 발행)", example = "2023-05-01T09:00:00")
    val scheduledAt: LocalDateTime? = null
) {
    /**
     * DTO에서 Entity로 변환
     * 신규 생성 시 사용
     */
    fun toEntity(): NewsletterEntity {
        return NewsletterEntity(
            title = this.title,
            content = this.content,
            status = this.status ?: "DRAFT",
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
            summary = this.summary,
            thumbnail = this.thumbnail,
            scheduledAt = this.scheduledAt
        )
    }
    
    /**
     * 기존 엔티티 업데이트
     * 수정 시 사용
     */
    fun updateEntity(entity: NewsletterEntity): NewsletterEntity {
        entity.title = this.title
        entity.content = this.content
        entity.status = this.status ?: entity.status
        entity.updatedAt = LocalDateTime.now()
        entity.summary = this.summary
        entity.thumbnail = this.thumbnail
        entity.scheduledAt = this.scheduledAt
        return entity
    }
}