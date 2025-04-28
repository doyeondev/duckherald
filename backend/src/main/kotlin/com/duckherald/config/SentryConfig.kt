package com.duckherald.config

/**
 * Sentry 설정 클래스
 * 
 * 백엔드 애플리케이션의 오류 모니터링 및 추적을 위한 Sentry 설정을 담당합니다.
 * 개발 및 프로덕션 환경에 따라 다르게 구성됩니다.
 * 
 * 해결된 문제:
 * 1. beforeSend 콜백에서 코틀린 스마트 캐스트 이슈: 변수 분리로 해결
 * 2. SentryExceptionResolver 생성자 호환성 문제: Bean 등록 주석 처리로 해결
 * 3. 빌드 오류: build.gradle.kts에서 소스맵 작업 비활성화로 해결
 */

import io.sentry.Sentry
import io.sentry.spring.jakarta.SentryExceptionResolver
import io.sentry.spring.jakarta.SentryTaskDecorator
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.servlet.ServletContextInitializer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered
import org.springframework.web.servlet.HandlerExceptionResolver
import jakarta.servlet.ServletContext
import org.slf4j.LoggerFactory
import java.util.concurrent.Executor
import org.springframework.core.task.TaskDecorator
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.stereotype.Component;

/**
 * Sentry 설정 클래스
 * 
 * 백엔드 애플리케이션의 오류 모니터링 및 추적을 위한 Sentry 설정을 담당합니다.
 * 개발 및 프로덕션 환경에 따라 다르게 구성됩니다.
 */
@Profile("!test")
@Configuration
class SentryConfig {

    private val logger = LoggerFactory.getLogger(SentryConfig::class.java)

    @Value("\${sentry.dsn:}")
    private lateinit var sentryDsn: String

    @Value("\${sentry.environment:development}")
    private lateinit var environment: String

    @Value("\${sentry.traces-sample-rate:1.0}")
    private var tracesSampleRate: Double = 1.0

    /**
     * Sentry 초기화를 수행하는 서블릿 컨텍스트 초기화 Bean
     * 
     * @return ServletContextInitializer
     */
    @Bean
    @Profile("!test") // 테스트 환경에서는 실행하지 않음
    fun sentryServletContextInitializer(): ServletContextInitializer {
        return ServletContextInitializer { servletContext: ServletContext ->
            try {
                Sentry.init { options ->
                    // Sentry DSN 설정
                    options.dsn = sentryDsn
                    
                    // 환경 설정 (development, staging, production)
                    options.environment = environment
                    
                    // 성능 트래킹을 위한 샘플링 비율
                    options.tracesSampleRate = tracesSampleRate
                    
                    // 디버그 모드 설정 (개발 환경에서만)
                    options.isDebug = environment == "development"
                    
                    // 특정 예외는 보고하지 않도록 필터링
                    options.beforeSend = io.sentry.SentryOptions.BeforeSendCallback { event, hint ->
                        // 404 예외는 Sentry에 보고하지 않음
                        // 코틀린 스마트 캐스트 이슈 해결: 'event.exceptions'는 mutable 속성이므로
                        // 로컬 변수로 분리하여 안전하게 처리
                        val exceptions = event.exceptions
                        if (exceptions != null && exceptions.any { 
                            it.value?.contains("404") == true || it.value?.contains("Not Found") == true 
                        }) {
                            null
                        } else {
                            event
                        }
                    }
                }
                
                logger.info("Sentry initialized successfully with environment: {}", environment)
            } catch (e: Exception) {
                logger.error("Failed to initialize Sentry", e)
            }
        }
    }

    /**
     * Sentry 예외 리졸버 Bean
     * 
     * 처리되지 않은 예외를 Sentry로 보내는 역할.
     * @return HandlerExceptionResolver
     */
    // @Bean
    // @Profile("!test")
    // fun sentryExceptionResolver(): HandlerExceptionResolver {
    //     return SentryExceptionResolver().apply {
    //         setOrder(Ordered.HIGHEST_PRECEDENCE)
    //     }
    // }

    /**
     * Sentry 비동기 태스크 데코레이터
     * 
     * 비동기 작업에서 예외 발생 시 Sentry로 보고하는 역할.
     * @return TaskDecorator
     */
    @Bean
    @Profile("!test")
    fun sentryTaskDecorator(): TaskDecorator {
        return SentryTaskDecorator()
    }

    /**
     * Sentry 데코레이터가 적용된 스레드 풀 실행기
     * 
     * 비동기 작업에서의 오류 추적을 위한 실행기.
     * @return Executor
     */
    @Bean
    @Profile("!test")
    fun taskExecutor(): Executor {
        val executor = ThreadPoolTaskExecutor()
        executor.corePoolSize = 10
        executor.maxPoolSize = 20
        executor.queueCapacity = 50
        executor.setThreadNamePrefix("sentry-async-")
        executor.setTaskDecorator(sentryTaskDecorator())
        executor.initialize()
        return executor
    }
} 