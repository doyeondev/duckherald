package com.duckherald.user.dto

import com.duckherald.user.model.Subscriber
import java.time.LocalDateTime

/**
 * 구독 요청을 위한 DTO
 */
data class SubscriberRequest(
    val email: String
)

/**
 * 구독자 정보를 응답하기 위한 DTO
 */
data class SubscriberResponse(
    val id: Long?,
    val email: String,
    val status: String,
    val createdAt: LocalDateTime,
    val unsubscribedAt: LocalDateTime?
) {
    companion object {
        /**
         * Subscriber 엔티티를 SubscriberResponse DTO로 변환
         */
        fun from(subscriber: Subscriber): SubscriberResponse {
            return SubscriberResponse(
                id = subscriber.id,
                email = subscriber.email,
                status = subscriber.status,
                createdAt = subscriber.createdAt,
                unsubscribedAt = subscriber.unsubscribedAt
            )
        }
        
        /**
         * Subscriber 엔티티 리스트를 SubscriberResponse DTO 리스트로 변환
         */
        fun fromList(subscribers: List<Subscriber>): List<SubscriberResponse> {
            return subscribers.map { from(it) }
        }
    }
}

/**
 * 구독자 통계 정보를 위한 DTO
 */
data class SubscriberStats(
    val total: Long,
    val active: Long,
    val inactive: Long,
    val deleted: Long = 0
) 