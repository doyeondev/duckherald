package com.duckherald.common.dto

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalDateTime

/**
 * API 오류 응답 DTO
 * 
 * 모든 API 오류 응답에 대한 통일된 형식을 제공합니다.
 * 오류 코드, 메시지 및 타임스탬프를 포함합니다.
 * 
 * @property status HTTP 상태 코드
 * @property error 오류 유형
 * @property message 오류 메시지
 * @property timestamp 오류 발생 시간
 */
data class ApiErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    val timestamp: LocalDateTime
) 