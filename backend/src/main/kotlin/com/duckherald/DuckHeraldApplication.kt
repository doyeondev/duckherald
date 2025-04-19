// 경로: src/main/kotlin/com/duckherald/DuckHeraldApplication.kt
package com.duckherald

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@SpringBootApplication
@EntityScan(basePackages = ["com.duckherald"])
@EnableJpaRepositories(basePackages = ["com.duckherald"])
@EnableBatchProcessing
@EnableAsync
class DuckHeraldApplication

fun main(args: Array<String>) {
    runApplication<DuckHeraldApplication>(*args)
}
