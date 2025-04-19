package com.duckherald.delivery.config

import com.duckherald.delivery.batch.DeliveryJobListener
import com.duckherald.delivery.batch.NewsletterEmailProcessor
import com.duckherald.delivery.batch.NewsletterEmailReader
import com.duckherald.delivery.batch.NewsletterEmailWriter
import com.duckherald.delivery.dto.EmailDeliveryTask
import com.duckherald.user.service.SubscriberService
import org.springframework.batch.core.Job
import org.springframework.batch.core.Step
import org.springframework.batch.core.job.builder.JobBuilder
import org.springframework.batch.core.repository.JobRepository
import org.springframework.batch.core.step.builder.StepBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty

@Configuration
@ConditionalOnProperty(name = ["app.batch.enabled"], havingValue = "true", matchIfMissing = false)
class BatchConfig(
    private val jobRepository: JobRepository,
    private val transactionManager: PlatformTransactionManager,
    private val subscriberService: SubscriberService
) {
    @Bean
    fun newsletterDeliveryJob(newsletterDeliveryStep: Step): Job {
        return JobBuilder("newsletterDeliveryJob", jobRepository)
            .listener(DeliveryJobListener())
            .start(newsletterDeliveryStep)
            .build()
    }

    @Bean
    fun newsletterDeliveryStep(
        reader: NewsletterEmailReader,
        processor: NewsletterEmailProcessor,
        writer: NewsletterEmailWriter
    ): Step {
        return StepBuilder("newsletterDeliveryStep", jobRepository)
            .chunk<EmailDeliveryTask, EmailDeliveryTask>(20, transactionManager) // 청크 사이즈 20
            .reader(reader)
            .processor(processor)
            .writer(writer)
            .build()
    }

    @Bean
    fun newsletterEmailReader(): NewsletterEmailReader {
        return NewsletterEmailReader(subscriberService)
    }

    @Bean
    fun newsletterEmailProcessor(): NewsletterEmailProcessor {
        return NewsletterEmailProcessor()
    }

    @Bean
    fun newsletterEmailWriter(): NewsletterEmailWriter {
        return NewsletterEmailWriter()
    }
} 