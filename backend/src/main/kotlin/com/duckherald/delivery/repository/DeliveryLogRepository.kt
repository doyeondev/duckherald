package com.duckherald.delivery.repository

import com.duckherald.delivery.model.DeliveryLog
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface DeliveryLogRepository : JpaRepository<DeliveryLog, Int> {
    fun findByNewsletterIdAndSubscriberId(newsletterId: Int, subscriberId: Long): List<DeliveryLog>
    fun countByNewsletterIdAndStatus(newsletterId: Int, status: String): Long
    
    @Query("SELECT d FROM DeliveryLog d WHERE d.status = 'SENT' OR d.status = 'OPENED' OR d.status = 'CLICKED'")
    fun findAllSentLogs(): List<DeliveryLog>

    fun findBySubscriberId(subscriberId: Long): List<DeliveryLog>
    
    fun findByNewsletterId(newsletterId: Int): List<DeliveryLog>
}