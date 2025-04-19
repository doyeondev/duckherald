package com.duckherald.user.controller

import com.duckherald.user.dto.SubscriberRequest
import com.duckherald.user.dto.SubscriberResponse
import com.duckherald.user.service.SubscriberService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/subscribers")
class SubscriberController(
    private val subscriberService: SubscriberService
) {
    private val logger = LoggerFactory.getLogger(SubscriberController::class.java)

    /**
     * 이메일로 구독 신청
     */
    @PostMapping
    fun subscribe(@RequestBody request: SubscriberRequest): ResponseEntity<SubscriberResponse> {
        logger.info("구독 신청 API 호출: 이메일=${request.email}")
        val subscriber = subscriberService.subscribe(request)
        return ResponseEntity.ok(SubscriberResponse.from(subscriber))
    }

    /**
     * 이메일로 구독 해지
     */
    @PostMapping("/unsubscribe")
    fun unsubscribe(@RequestParam email: String): ResponseEntity<SubscriberResponse> {
        logger.info("구독 해지 API 호출: 이메일=$email")
        val subscriber = subscriberService.unsubscribe(email)
        return ResponseEntity.ok(SubscriberResponse.from(subscriber))
    }

    /**
     * 이메일로 구독 상태 확인
     */
    @GetMapping("/status")
    fun checkSubscriptionStatus(@RequestParam email: String): ResponseEntity<Map<String, Any>> {
        logger.debug("구독 상태 확인 API 호출: 이메일=$email")
        val subscriber = subscriberService.getSubscriberByEmail(email)
        
        return if (subscriber != null) {
            ResponseEntity.ok(
                mapOf(
                    "subscribed" to (subscriber.status == "ACTIVE"),
                    "email" to subscriber.email,
                    "status" to subscriber.status
                )
            )
        } else {
            ResponseEntity.ok(
                mapOf(
                    "subscribed" to false,
                    "email" to email,
                    "status" to "NOT_FOUND"
                )
            )
        }
    }
} 