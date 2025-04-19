package com.duckherald.user.model

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * 구독자 엔티티 클래스
 */
@Entity
@Table(name = "subscribers")
data class Subscriber(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(nullable = false, unique = true)
    val email: String,
    
    @Column(nullable = false)
    val status: String = "ACTIVE", // ACTIVE, INACTIVE, DELETED
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "unsubscribed_at")
    val unsubscribedAt: LocalDateTime? = null
) {
    // JPA 기본 생성자
    constructor() : this(null, "", "ACTIVE", LocalDateTime.now(), null)
} 