// 경로: src/main/kotlin/com/duckherald/newsletter/dto/NewsletterResponse.kt
package com.duckherald.newsletter.dto

import com.duckherald.newsletter.model.NewsletterEntity
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

// 뉴스레터 응답용 DTO
// 프론트엔드에 필요한 정보만 담아서 내려줌
@Schema(description = "뉴스레터 응답 DTO")
data class NewsletterResponse(
    @Schema(description = "뉴스레터 ID", example = "1")
    val id: Int?,
    
    @Schema(description = "뉴스레터 제목", example = "4월의 뉴스레터")
    val title: String,
    
    @Schema(description = "뉴스레터 본문 (HTML)", example = "<p>이번 달 소식을 전해드립니다.</p>")
    val content: String,
    
    @Schema(description = "뉴스레터 요약", example = "4월 소식 요약")
    val summary: String?,
    
    @Schema(description = "썸네일 이미지 URL", example = "https://example.com/images/thumbnail.jpg")
    val thumbnail: String?,
    
    @Schema(description = "뉴스레터 상태 (DRAFT, PUBLISHED)", example = "PUBLISHED")
    val status: String,
    
    @Schema(description = "생성 일시", example = "2023-04-01T09:00:00")
    val createdAt: LocalDateTime,
    
    @Schema(description = "수정 일시", example = "2023-04-02T10:30:00")
    val updatedAt: LocalDateTime?,
    
    @Schema(description = "발행 일시", example = "2023-04-03T12:00:00")
    val publishedAt: LocalDateTime?
) {
    companion object {
        // Entity에서 DTO로 변환하는 편의 메서드
        fun from(entity: NewsletterEntity): NewsletterResponse {
            return NewsletterResponse(
                id = entity.id,
                title = entity.title,
                content = entity.content,
                summary = entity.summary,
                thumbnail = entity.thumbnail,
                status = entity.status,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt,
                publishedAt = entity.publishedAt
            )
        }
        
        // Entity 목록을 DTO 목록으로 변환
        fun fromList(entities: List<NewsletterEntity>): List<NewsletterResponse> {
            return entities.map { from(it) }
        }
    }
}
