package com.duckherald.common.exception

/**
 * 리소스를 찾을 수 없을 때 발생하는 예외
 * 
 * 요청한 리소스(예: 사용자, 뉴스레터, 구독자)가 존재하지 않을 때 사용됩니다.
 * 
 * @param message 오류 메시지
 * @param cause 원인 예외 (선택 사항)
 */
class ResourceNotFoundException(
    override val message: String,
    override val cause: Throwable? = null
) : RuntimeException(message, cause)

/**
 * 잘못된 요청 파라미터에 대한 예외
 * 
 * 사용자 입력이 유효하지 않거나 요청 형식이 잘못되었을 때 사용됩니다.
 * 
 * @param message 오류 메시지
 * @param cause 원인 예외 (선택 사항)
 */
class BadRequestException(
    override val message: String,
    override val cause: Throwable? = null
) : RuntimeException(message, cause)

/**
 * 인증 실패 예외
 * 
 * 사용자 인증이 필요하거나 인증이 실패했을 때 사용됩니다.
 * 
 * @param message 오류 메시지
 * @param cause 원인 예외 (선택 사항)
 */
class AuthenticationException(
    override val message: String = "Authentication required or failed",
    override val cause: Throwable? = null
) : RuntimeException(message, cause)

/**
 * 권한 부족 예외
 * 
 * 인증된 사용자가 특정 작업에 대한 권한이 없을 때 사용됩니다.
 * 
 * @param message 오류 메시지
 * @param cause 원인 예외 (선택 사항)
 */
class ForbiddenException(
    override val message: String = "Access denied",
    override val cause: Throwable? = null
) : RuntimeException(message, cause)

/**
 * 중복 리소스 예외
 * 
 * 이미 존재하는 리소스를 중복 생성하려고 할 때 사용됩니다.
 * (예: 이미 등록된 이메일로 구독하려고 할 때)
 * 
 * @param message 오류 메시지
 * @param cause 원인 예외 (선택 사항)
 */
class DuplicateResourceException(
    override val message: String,
    override val cause: Throwable? = null
) : RuntimeException(message, cause)

/**
 * 서비스 내부 오류 예외
 * 
 * 서버 내부 처리 중 발생한 예기치 않은 오류에 사용됩니다.
 * 
 * @param message 오류 메시지
 * @param cause 원인 예외 (필수)
 */
class ServiceException(
    override val message: String = "Internal service error",
    override val cause: Throwable
) : RuntimeException(message, cause) 