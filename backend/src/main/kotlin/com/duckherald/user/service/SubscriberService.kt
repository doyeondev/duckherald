package com.duckherald.user.service

import com.duckherald.exception.ResourceNotFoundException
import com.duckherald.user.dto.SubscriberRequest
import com.duckherald.user.dto.SubscriberStats
import com.duckherald.user.model.Subscriber
import com.duckherald.user.repository.SubscriberRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.Optional
import org.slf4j.LoggerFactory

@Service
class SubscriberService(
    private val subscriberRepository: SubscriberRepository
) {
    private val logger = LoggerFactory.getLogger(SubscriberService::class.java)
    
    /**
     * 이메일로 구독 신청
     * @return 저장된 구독자 엔티티
     */
    @Transactional
    fun subscribe(request: SubscriberRequest): Subscriber {
        // 이미 존재하는 구독자인지 확인
        val existingSubscriber = subscriberRepository.findByEmail(request.email)
        
        if (existingSubscriber.isPresent) {
            val subscriber = existingSubscriber.get()
            
            // 이미 활성화된 구독자면 그대로 반환
            if (subscriber.status == "ACTIVE") {
                logger.info("이미 활성화된 구독자: ${subscriber.email}")
                return subscriber
            }
            
            // 비활성화된 구독자면 다시 활성화 (재구독)
            val reactivatedSubscriber = Subscriber(
                id = subscriber.id,
                email = subscriber.email,
                status = "ACTIVE",
                createdAt = subscriber.createdAt,
                unsubscribedAt = null
            )
            
            logger.info("재구독 처리: ${subscriber.email}")
            return subscriberRepository.save(reactivatedSubscriber)
        }
        
        // 새 구독자 생성
        val newSubscriber = Subscriber(
            email = request.email,
            status = "ACTIVE",
            createdAt = LocalDateTime.now()
        )
        
        logger.info("새로운 구독자 생성: ${request.email}")
        return subscriberRepository.save(newSubscriber)
    }
    
    /**
     * 이메일로 구독 해지
     * @return 업데이트된 구독자 엔티티
     */
    @Transactional
    fun unsubscribe(email: String): Subscriber {
        val subscriber = subscriberRepository.findByEmail(email)
            .orElseThrow { ResourceNotFoundException("$email 구독자를 찾을 수 없습니다.") }
        
        // 이미 해지된 구독자면 그대로 반환
        if (subscriber.status == "INACTIVE") {
            logger.info("이미 해지된 구독자: $email")
            return subscriber
        }
        
        // 활성화된 구독자면 비활성화 (구독 해지)
        val unsubscribedSubscriber = Subscriber(
            id = subscriber.id,
            email = subscriber.email,
            status = "INACTIVE",
            createdAt = subscriber.createdAt,
            unsubscribedAt = LocalDateTime.now()
        )
        
        logger.info("구독 해지 처리: $email")
        return subscriberRepository.save(unsubscribedSubscriber)
    }

    /**
     * 모든 활성 구독자 조회
     * @return 활성 상태인 구독자 리스트
     */
    fun getAllActiveSubscribers(): List<Subscriber> {
        logger.debug("모든 활성 구독자 조회")
        return subscriberRepository.findByStatus("ACTIVE")
    }

    /**
     * 모든 삭제된 구독자 조회
     * @return 삭제된 구독자 리스트
     */
    fun getAllDeletedSubscribers(): List<Subscriber> {
        logger.debug("모든 삭제된 구독자 조회")
        return subscriberRepository.findByStatus("DELETED")
    }

    /**
     * 구독자 통계 정보
     * @return 구독자 통계 정보
     */
    fun getSubscriberStats(): SubscriberStats {
        val totalCount = subscriberRepository.count()
        val activeCount = subscriberRepository.countByStatus("ACTIVE")
        val inactiveCount = subscriberRepository.countByStatus("INACTIVE")
        val deletedCount = subscriberRepository.countByStatus("DELETED")
        
        logger.debug("구독자 통계 조회: 전체=$totalCount, 활성=$activeCount, 비활성=$inactiveCount, 삭제=$deletedCount")
        
        return SubscriberStats(
            total = totalCount,
            active = activeCount,
            inactive = inactiveCount,
            deleted = deletedCount
        )
    }

    /**
     * 모든 구독자 조회 (삭제된 구독자 제외)
     * @return 삭제되지 않은 구독자 리스트
     */
    fun getAllSubscribers(): List<Subscriber> {
        logger.debug("모든 구독자 조회 (삭제된 구독자 제외)")
        return subscriberRepository.findByStatusNot("DELETED")
    }

    /**
     * 모든 구독자 조회 (삭제된 구독자 포함)
     * @return 모든 구독자 리스트
     */
    fun getAllSubscribersIncludingDeleted(): List<Subscriber> {
        logger.debug("모든 구독자 조회 (삭제된 구독자 포함)")
        return subscriberRepository.findAll()
    }

    /**
     * 이메일로 구독자 찾기
     * @return 구독자 엔티티 또는 null
     */
    fun getSubscriberByEmail(email: String): Subscriber? {
        logger.debug("이메일로 구독자 조회: $email")
        return subscriberRepository.findByEmail(email)
            .orElse(null)
    }

    /**
     * ID로 구독자 찾기
     * @return 구독자 엔티티
     * @throws ResourceNotFoundException 구독자가 존재하지 않을 경우
     */
    fun getSubscriberById(id: Long): Subscriber {
        logger.debug("ID로 구독자 조회: $id")
        return subscriberRepository.findById(id).orElseThrow { 
            ResourceNotFoundException("Subscriber not found with ID: $id") 
        }
    }

    /**
     * 구독자 삭제
     */
    @Transactional
    fun deleteSubscriber(id: Long) {
        logger.info("구독자 삭제: $id")
        subscriberRepository.deleteById(id)
    }

    /**
     * 구독자 상태 변경
     * @return 업데이트된 구독자 엔티티
     */
    @Transactional
    fun updateSubscriberStatus(id: Long, status: String): Subscriber {
        val subscriber = getSubscriberById(id)
        
        val updatedSubscriber = subscriber.copy(
            status = status,
            unsubscribedAt = when (status) {
                "INACTIVE" -> LocalDateTime.now()
                "DELETED" -> LocalDateTime.now() 
                else -> null
            }
        )
        
        logger.info("구독자 상태 변경: ID=$id, 상태=$status")
        return subscriberRepository.save(updatedSubscriber)
    }

    /**
     * 이메일로 구독자 찾기 (Optional 반환)
     * @return 구독자 Optional
     */
    fun findByEmailOptional(email: String): Optional<Subscriber> {
        logger.debug("이메일로 구독자 Optional 조회: $email")
        return subscriberRepository.findByEmail(email)
    }
} 