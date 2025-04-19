package com.duckherald.delivery.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "delivery_logs")
data class DeliveryLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    
    @Column(name = "newsletter_id")
    val newsletterId: Int,
    
    @Column(name = "subscriber_id")
    val subscriberId: Long,
    
    @Column(name = "status")
    val status: String,
    
    @Column(name = "sent_at")
    val sentAt: LocalDateTime? = LocalDateTime.now(),
    
    @Column(name = "opened_at")
    val openedAt: LocalDateTime? = null,
    
    @Transient
    val totalSent: Int = 0,
    
    @Transient
    val totalOpened: Int = 0,
    
    @Transient
    val newsletterTitle: String? = null
) 