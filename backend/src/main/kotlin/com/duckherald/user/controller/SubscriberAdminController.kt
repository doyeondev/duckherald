package com.duckherald.user.controller

import com.duckherald.user.dto.SubscriberResponse
import com.duckherald.user.service.SubscriberService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/admin/subscribers")
class SubscriberAdminController(
    private val subscriberService: SubscriberService
) {
    private val logger = LoggerFactory.getLogger(SubscriberAdminController::class.java)
    
    /**
     * 모든 구독자 목록 조회 (관리자용)
     */
    @GetMapping
    fun getAllSubscribers(): ResponseEntity<List<SubscriberResponse>> {
        logger.debug("모든 구독자 목록 조회 API 호출")
        val subscribers = subscriberService.getAllSubscribers()
        return ResponseEntity.ok(SubscriberResponse.fromList(subscribers))
    }

    /**
     * 구독자 삭제 (관리자용) - 상태를 DELETED로 변경
     */
    @DeleteMapping("/{id}")
    fun deleteSubscriber(@PathVariable id: Long): ResponseEntity<Void> {
        logger.info("구독자 삭제 API 호출: ID=$id")
        // 실제 삭제 대신 상태를 DELETED로 변경
        subscriberService.updateSubscriberStatus(id, "DELETED")
        return ResponseEntity.noContent().build()
    }
    
    /**
     * 구독자 상태 변경 (관리자용)
     */
    @PutMapping("/{id}/status")
    fun updateSubscriberStatus(
        @PathVariable id: Long,
        @RequestParam status: String
    ): ResponseEntity<SubscriberResponse> {
        logger.info("구독자 상태 변경 API 호출: ID=$id, 상태=$status")
        val subscriber = subscriberService.updateSubscriberStatus(id, status)
        return ResponseEntity.ok(SubscriberResponse.from(subscriber))
    }
    
    /**
     * 활성 구독자 목록 조회 (관리자용)
     */
    @GetMapping("/active")
    fun getAllActiveSubscribers(): ResponseEntity<List<SubscriberResponse>> {
        logger.debug("활성 구독자 목록 조회 API 호출")
        val subscribers = subscriberService.getAllActiveSubscribers()
        return ResponseEntity.ok(SubscriberResponse.fromList(subscribers))
    }

    /**
     * 삭제된 구독자 목록 조회 (관리자용)
     */
    @GetMapping("/deleted")
    fun getAllDeletedSubscribers(): ResponseEntity<List<SubscriberResponse>> {
        logger.debug("삭제된 구독자 목록 조회 API 호출")
        val subscribers = subscriberService.getAllDeletedSubscribers()
        return ResponseEntity.ok(SubscriberResponse.fromList(subscribers))
    }
    
    /**
     * 구독자 통계 조회 (관리자용)
     */
    @GetMapping("/stats")
    fun getSubscriberStats(): ResponseEntity<Map<String, Long>> {
        logger.debug("구독자 통계 조회 API 호출")
        val stats = subscriberService.getSubscriberStats()
        return ResponseEntity.ok(
            mapOf(
                "total" to stats.total,
                "active" to stats.active,
                "inactive" to stats.inactive,
                "deleted" to stats.deleted
            )
        )
    }
} 