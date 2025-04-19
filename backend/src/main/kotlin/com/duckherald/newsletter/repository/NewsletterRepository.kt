package com.duckherald.newsletter.repository

import com.duckherald.newsletter.model.NewsletterEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime
import org.springframework.stereotype.Repository

@Repository
interface NewsletterRepository : JpaRepository<NewsletterEntity, Int> {
    fun findByStatus(status: String): List<NewsletterEntity>
    
    @Query("SELECT n FROM NewsletterEntity n WHERE n.status = 'SCHEDULED' AND n.scheduledAt BETWEEN :startTime AND :endTime")
    fun findNewslettersScheduledBetween(
        @Param("startTime") startTime: LocalDateTime, 
        @Param("endTime") endTime: LocalDateTime
    ): List<NewsletterEntity>
}