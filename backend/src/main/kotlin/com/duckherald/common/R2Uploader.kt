// 실질적인 업로드 로직

package com.duckherald.common

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.core.sync.RequestBody
import java.util.*

@Component
class R2Uploader(
    private val s3Client: S3Client,
    @Value("\${cloudflare.r2.bucket}") private val bucket: String,
    @Value("\${cloudflare.r2.custom-domain}") private val customDomain: String
) {
    fun upload(file: MultipartFile): String {
        val key = UUID.randomUUID().toString() + "_" + file.originalFilename

        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.contentType)
                .build(),
            RequestBody.fromInputStream(file.inputStream, file.size)
        )

        return "$customDomain/$key"
    }
}
