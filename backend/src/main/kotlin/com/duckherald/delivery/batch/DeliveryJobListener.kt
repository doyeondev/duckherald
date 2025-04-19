package com.duckherald.delivery.batch

import org.springframework.batch.core.JobExecution
import org.springframework.batch.core.JobExecutionListener
import org.slf4j.LoggerFactory

class DeliveryJobListener : JobExecutionListener {
    private val logger = LoggerFactory.getLogger(DeliveryJobListener::class.java)
    
    override fun beforeJob(jobExecution: JobExecution) {
        logger.info("뉴스레터 발송 작업 시작: ${jobExecution.jobParameters}")
    }
    
    override fun afterJob(jobExecution: JobExecution) {
        logger.info("뉴스레터 발송 작업 완료. 상태: ${jobExecution.status}")
        
        // 발송 결과 집계
        val metrics = jobExecution.executionContext.get("deliveryMetrics") as? Map<String, Int>
        metrics?.let {
            logger.info("발송 성공: ${it["sent"] ?: 0}, 발송 실패: ${it["failed"] ?: 0}")
        }
    }
} 