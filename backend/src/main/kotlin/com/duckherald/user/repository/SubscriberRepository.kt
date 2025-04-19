package com.duckherald.user.repository

import com.duckherald.user.model.Subscriber
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface SubscriberRepository : JpaRepository<Subscriber, Long> {
    /**
     * 이메일로 구독자 찾기
     */
    fun findByEmail(email: String): Optional<Subscriber>
    
    /**
     * 특정 상태인 구독자 목록 찾기
     */
    fun findByStatus(status: String): List<Subscriber>
    
    /**
     * 특정 상태가 아닌 구독자 목록 찾기
     */
    fun findByStatusNot(status: String): List<Subscriber>
    
    /**
     * 특정 상태인 구독자 수 카운트
     */
    fun countByStatus(status: String): Long
} 