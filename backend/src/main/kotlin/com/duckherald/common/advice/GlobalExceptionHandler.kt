package com.duckherald.common.advice

import com.duckherald.common.dto.ApiErrorResponse
import com.duckherald.common.exception.BadRequestException
import com.duckherald.common.exception.ResourceNotFoundException
import io.sentry.Sentry
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import java.time.LocalDateTime

/**
 * 글로벌 예외 처리 클래스
 * 
 * 애플리케이션 전체에서 발생하는 예외를 처리하고 통일된 응답 형식을 제공합니다.
 * 예외 발생 시 Sentry로 로깅하여 실시간 모니터링이 가능하도록 구성되어 있습니다.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    /**
     * 리소스를 찾을 수 없을 때 발생하는 예외 처리
     * 
     * @param e ResourceNotFoundException 예외
     * @return 404 응답과 에러 정보
     */
    @ExceptionHandler(ResourceNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleResourceNotFoundException(e: ResourceNotFoundException): ApiErrorResponse {
        logger.error("Resource not found: ${e.message}")
        // 404 오류는 일반적으로 Sentry에 전송하지 않음
        return ApiErrorResponse(
            status = HttpStatus.NOT_FOUND.value(),
            error = "Not Found",
            message = e.message ?: "Requested resource not found",
            timestamp = LocalDateTime.now()
        )
    }

    /**
     * 잘못된 요청 처리 예외
     * 
     * @param e BadRequestException 예외
     * @return 400 응답과 에러 정보
     */
    @ExceptionHandler(BadRequestException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleBadRequestException(e: BadRequestException): ApiErrorResponse {
        logger.error("Bad request: ${e.message}")
        
        // 잘못된 요청 오류는 Sentry에 경고 수준으로 기록
        Sentry.captureException(e)
        
        return ApiErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Bad Request",
            message = e.message ?: "Invalid request parameters",
            timestamp = LocalDateTime.now()
        )
    }

    /**
     * JSON 파싱 등의 메시지 변환 오류 처리
     * 
     * @param e HttpMessageNotReadableException 예외
     * @return 400 응답과 에러 정보
     */
    @ExceptionHandler(HttpMessageNotReadableException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleHttpMessageNotReadableException(e: HttpMessageNotReadableException): ApiErrorResponse {
        logger.error("HTTP message not readable: ${e.message}")
        
        // 메시지 파싱 오류는 Sentry에 경고 수준으로 기록
        Sentry.captureMessage("HTTP Message Not Readable: ${e.message}")
        
        return ApiErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Bad Request",
            message = "Invalid JSON format or request body",
            timestamp = LocalDateTime.now()
        )
    }

    /**
     * 유효성 검사 실패 예외 처리
     * 
     * @param e MethodArgumentNotValidException 예외
     * @return 400 응답과 상세 유효성 오류 메시지
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleMethodArgumentNotValidException(e: MethodArgumentNotValidException): ApiErrorResponse {
        val errors = e.bindingResult.fieldErrors.joinToString(", ") { "${it.field}: ${it.defaultMessage}" }
        logger.error("Validation errors: $errors")
        
        // 유효성 검사 오류는 Sentry에 추가 컨텍스트와 함께 기록
        Sentry.withScope { scope ->
            scope.setExtra("validation_errors", errors)
            Sentry.captureException(e)
        }
        
        return ApiErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Validation Failed",
            message = errors,
            timestamp = LocalDateTime.now()
        )
    }

    /**
     * 파라미터 타입 불일치 오류 처리
     * 
     * @param e MethodArgumentTypeMismatchException 예외
     * @return 400 응답과 에러 정보
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleMethodArgumentTypeMismatchException(e: MethodArgumentTypeMismatchException): ApiErrorResponse {
        val errorMessage = "Parameter '${e.name}' should be of type ${e.requiredType?.simpleName}"
        logger.error("Type mismatch: $errorMessage")
        
        // 파라미터 타입 오류는 Sentry에 기록
        Sentry.captureException(e)
        
        return ApiErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Type Mismatch",
            message = errorMessage,
            timestamp = LocalDateTime.now()
        )
    }

    /**
     * 기타 모든 예외 처리
     * 
     * @param e Exception 객체
     * @return 500 응답과 에러 정보
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(e: Exception): ResponseEntity<ApiErrorResponse> {
        logger.error("Unhandled exception occurred", e)
        
        // 심각한 서버 오류는 높은 우선순위로 Sentry에 기록
        Sentry.withScope { scope ->
            scope.level = io.sentry.SentryLevel.ERROR
            scope.setTag("error_type", "unhandled_exception")
            scope.setExtra("error_class", e.javaClass.name)
            Sentry.captureException(e)
        }
        
        val response = ApiErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            error = "Internal Server Error",
            message = "An unexpected error occurred. Please try again later.",
            timestamp = LocalDateTime.now()
        )
        
        return ResponseEntity(response, HttpStatus.INTERNAL_SERVER_ERROR)
    }
} 