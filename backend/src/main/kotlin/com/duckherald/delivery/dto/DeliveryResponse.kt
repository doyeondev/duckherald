package com.duckherald.delivery.dto

import com.duckherald.delivery.model.DeliveryLog
import java.time.LocalDateTime

data class DeliveryResponse(
    val id: Int,
    val newsletterId: Int,
    val subscriberId: Long,
    val status: String,
    val sentAt: LocalDateTime?,
    val openedAt: LocalDateTime?,
    val newsletterTitle: String?
) {
    companion object {
        fun from(deliveryLog: DeliveryLog): DeliveryResponse {
            return DeliveryResponse(
                id = deliveryLog.id,
                newsletterId = deliveryLog.newsletterId,
                subscriberId = deliveryLog.subscriberId,
                status = deliveryLog.status,
                sentAt = deliveryLog.sentAt,
                openedAt = deliveryLog.openedAt,
                newsletterTitle = deliveryLog.newsletterTitle ?: "제목 없음"
            )
        }
    }
} 