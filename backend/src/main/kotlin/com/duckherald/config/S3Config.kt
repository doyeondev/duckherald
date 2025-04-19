// R2 클라이언트 설정

package com.duckherald.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.beans.factory.annotation.Value
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import java.net.URI

@Configuration
class S3Config {

    @Value("\${cloudflare.r2.access-key}")
    private lateinit var accessKey: String

    @Value("\${cloudflare.r2.secret-key}")
    private lateinit var secretKey: String

    @Value("\${cloudflare.r2.endpoint}")
    private lateinit var endpoint: String

    @Bean
    fun s3Client(): S3Client {
        return S3Client.builder()
            .region(Region.of("auto"))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
                )
            )
            .endpointOverride(URI.create(endpoint))
            .build()
    }
}
