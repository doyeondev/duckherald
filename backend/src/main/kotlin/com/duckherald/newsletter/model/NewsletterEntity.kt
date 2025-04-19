package com.duckherald.newsletter.model 

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.Column
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "newsletters")
data class NewsletterEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(nullable = false)
    var title: String,

    @Column(columnDefinition = "TEXT", nullable = false)
    var content: String,

    @Column(nullable = false)
    var status: String,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "published_at")
    var publishedAt: LocalDateTime? = null,

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime? = null,

    @Column(name = "thumbnail_img")
    var thumbnailImg: UUID? = null,
    
    // 새로 추가한 썸네일 URL 필드
    @Column(columnDefinition = "TEXT")
    var thumbnail: String? = null,
    
    @Column(name = "summary")
    var summary: String? = null,

    @Column(name = "scheduled_at")
    var scheduledAt: LocalDateTime? = null
) {
    constructor() : this(null, "", "", "", LocalDateTime.now(), null, null, null, null)
}