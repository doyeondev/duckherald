package com.duckherald.delivery.batch

import com.duckherald.delivery.dto.EmailDeliveryTask
import com.duckherald.delivery.service.DeliveryQueueService
import com.duckherald.user.service.SubscriberService
import org.springframework.batch.core.StepExecution
import org.springframework.batch.core.annotation.BeforeStep
import org.springframework.batch.item.ItemReader
import org.springframework.beans.factory.annotation.Autowired

class NewsletterEmailReader(
    private val subscriberService: SubscriberService
) : ItemReader<EmailDeliveryTask> {

    @Autowired
    private lateinit var deliveryQueueService: DeliveryQueueService
    
    private var newsletterId: Int? = null
    private var title: String? = null
    private var content: String? = null
    
    @BeforeStep
    fun beforeStep(stepExecution: StepExecution) {
        // Job Parameters에서 뉴스레터 정보 추출
        newsletterId = stepExecution.jobParameters.getLong("newsletterId")?.toInt()
        title = stepExecution.jobParameters.getString("title")
        content = stepExecution.jobParameters.getString("content")
    }

    override fun read(): EmailDeliveryTask? {
        // Redis Queue에서 다음 발송 작업 가져오기
        val task = deliveryQueueService.getNextDeliveryTask()
        
        // 큐가 비어있으면 더 이상 처리할 작업이 없음
        if (task != null) {
            return task
        }
        
        // 아직 큐에 작업이 없으면, 뉴스레터 ID를 확인하고 구독자 목록으로 큐 채우기
        if (newsletterId != null && title != null && content != null && deliveryQueueService.isQueueEmpty()) {
            val subscribers = subscriberService.getAllActiveSubscribers()
            
            // 모든 활성 구독자에게 이메일을 보내기 위한 작업을 큐에 추가
            subscribers.forEach { subscriber ->
                val task = EmailDeliveryTask(
                    subscriberId = subscriber.id!!,
                    email = subscriber.email,
                    newsletterId = newsletterId!!,
                    title = title!!,
                    content = content!!
                )
                deliveryQueueService.addDeliveryTask(task)
            }
            
            // 첫 번째 작업 반환
            return deliveryQueueService.getNextDeliveryTask()
        }
        
        return null
    }
} 