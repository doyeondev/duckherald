package com.duckherald.newsletter.controller

import com.duckherald.common.R2Uploader
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/newsletters/images")
class ImageUploadController(
    private val r2Uploader: R2Uploader
) {

    @PostMapping("/upload")
    fun uploadImage(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("type", required = false, defaultValue = "body") type: String
    ): ResponseEntity<String> {
        // type 파라미터로 body/thumbnail 구분 가능 (지금은 단순하게 처리)
        val url = r2Uploader.upload(file)
        return ResponseEntity.ok(url)
    }
}
