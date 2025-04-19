package com.duckherald.auth

import com.duckherald.config.JwtTokenProvider
import com.duckherald.user.UserType
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["http://localhost:3000"])
class AuthController(
    private val authService: AuthService,
    private val jwtTokenProvider: JwtTokenProvider
) {
    private val logger = LoggerFactory.getLogger(AuthController::class.java)

    data class LoginRequest(
        val email: String,
        val password: String
    )

    data class LoginResponse(
        val token: String?,
        val email: String,
        val type: String
    )
    
    data class CreateAdminRequest(
        val email: String,
        val password: String
    )
    
    data class CreateAdminResponse(
        val email: String,
        val type: String,
        val success: Boolean
    )

    data class TokenRequest(
        val token: String
    )

    data class SetupAdminRequest(
        val email: String,
        val password: String
    )

    data class UpdatePasswordRequest(
        val email: String,
        val newPassword: String
    )

    data class HashPasswordRequest(
        val password: String
    )

    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): ResponseEntity<Any> {
        logger.info("로그인 시도: email=${loginRequest.email}")
        println("===== 로그인 시도 =====")
        println("이메일: ${loginRequest.email}")
        println("비밀번호: ${loginRequest.password.take(2)}...")

        return try {
            // 사용자 검증
            val user = authService.validateAdminUser(loginRequest.email, loginRequest.password)
            println("사용자 검증 결과: ${user != null}")
            
            if (user != null) {
                println("사용자 정보: id=${user.id}, email=${user.email}, type=${user.type}")
                
                // 토큰 생성
                val token = jwtTokenProvider.createToken(user.id.toString(), listOf(user.type))
                println("토큰 생성 완료: ${token.substring(0, 20)}...")
                
                // 응답 객체 생성
                val response = mapOf(
                    "token" to token,
                    "user" to mapOf(
                        "id" to user.id,
                        "email" to user.email,
                        "type" to user.type
                    )
                )
                
                logger.info("로그인 성공: email=${loginRequest.email}, userId=${user.id}")
                println("로그인 성공!")
                ResponseEntity.ok(response)
            } else {
                logger.warn("로그인 실패: 사용자 검증 실패 - email=${loginRequest.email}")
                println("로그인 실패: 사용자 검증 실패")
                ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(mapOf("message" to "이메일 또는 비밀번호가 올바르지 않습니다."))
            }
        } catch (e: Exception) {
            logger.error("로그인 처리 중 예외 발생: ${e.message}", e)
            println("로그인 오류: ${e.message}")
            e.printStackTrace()
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("message" to "로그인 처리 중 오류가 발생했습니다."))
        }
    }
    
    // 관리자 계정 생성 (개발용, 실제 배포에서는 비활성화 필요)
    @PostMapping("/admin/create")
    fun createAdmin(@RequestBody request: CreateAdminRequest): ResponseEntity<CreateAdminResponse> {
        logger.info("관리자 계정 생성 요청: email=${request.email}")
        println("\n===== 관리자 계정 생성 요청 =====")
        println("이메일: ${request.email}")
        println("비밀번호: ${request.password.take(2)}...")
        
        val existingUser = authService.findByEmail(request.email)
        
        // 이미 존재하는 이메일인 경우
        if (existingUser != null) {
            logger.warn("이미 존재하는 이메일로 계정 생성 시도: ${request.email}")
            println("계정 생성 실패: 이미 존재하는 이메일")
            return ResponseEntity.badRequest().body(CreateAdminResponse(
                email = request.email,
                type = "ERROR",
                success = false
            ))
        }
        
        // 새 관리자 계정 생성
        val newAdmin = authService.createAdminUser(request.email, request.password)
        
        logger.info("새 관리자 계정 생성 완료: ${newAdmin.email}, id=${newAdmin.id}")
        println("관리자 계정 생성 성공: ${newAdmin.email}, id=${newAdmin.id}")
        println("===== 관리자 계정 생성 완료 =====\n")
        
        return ResponseEntity.ok(CreateAdminResponse(
            email = newAdmin.email,
            type = newAdmin.type,
            success = true
        ))
    }

    @PostMapping("/validate-token")
    fun validateToken(@RequestBody tokenRequest: TokenRequest): ResponseEntity<Any> {
        // 토큰 검증 로직
        val isValid = jwtTokenProvider.validateToken(tokenRequest.token)
        return ResponseEntity.ok(mapOf("valid" to isValid))
    }
    
    /**
     * 테스트용: 관리자 계정 생성 API
     * 
     * 주의: 개발/테스트 환경에서만 활성화해야 합니다.
     */
    @PostMapping("/admin/setup")
    fun setupAdmin(@RequestBody setupRequest: SetupAdminRequest): ResponseEntity<Any> {
        logger.info("관리자 계정 설정 요청")
        println("관리자 계정 설정 요청: ${setupRequest.email}")
        
        try {
            val user = authService.createAdminUser(setupRequest.email, setupRequest.password)
            println("관리자 계정 설정 완료: ID=${user.id}, 이메일=${user.email}")
            
            return ResponseEntity.ok(mapOf(
                "message" to "관리자 계정이 성공적으로 생성되었습니다.",
                "id" to user.id,
                "email" to user.email
            ))
        } catch (e: Exception) {
            logger.error("관리자 계정 설정 중 오류 발생: ${e.message}")
            println("관리자 계정 설정 중 오류: ${e.message}")
            e.printStackTrace()
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "관리자 계정 설정 중 오류가 발생했습니다."))
        }
    }

    /**
     * 테스트용: 관리자 비밀번호 업데이트 API
     * 
     * 주의: 개발/테스트 환경에서만 활성화해야 합니다.
     */
    @PostMapping("/admin/update-password")
    fun updateAdminPassword(@RequestBody updateRequest: UpdatePasswordRequest): ResponseEntity<Any> {
        logger.info("관리자 비밀번호 업데이트 요청: ${updateRequest.email}")
        println("관리자 비밀번호 업데이트 요청: ${updateRequest.email}")
        
        try {
            val success = authService.updateAdminPassword(updateRequest.email, updateRequest.newPassword)
            
            if (success) {
                println("관리자 비밀번호 업데이트 성공")
                return ResponseEntity.ok(mapOf(
                    "message" to "관리자 비밀번호가 성공적으로 업데이트되었습니다."
                ))
            } else {
                println("관리자 비밀번호 업데이트 실패: 사용자를 찾을 수 없거나 관리자가 아님")
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(mapOf("error" to "해당 이메일의 관리자 계정을 찾을 수 없습니다."))
            }
        } catch (e: Exception) {
            logger.error("관리자 비밀번호 업데이트 중 오류 발생: ${e.message}")
            println("관리자 비밀번호 업데이트 중 오류: ${e.message}")
            e.printStackTrace()
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "관리자 비밀번호 업데이트 중 오류가 발생했습니다."))
        }
    }

    /**
     * 테스트용: 비밀번호 해싱 API
     * 
     * 평문 비밀번호를 해싱하여 반환합니다. 테스트 및 디버깅 용도로만 사용해야 합니다.
     */
    @PostMapping("/admin/hash-password")
    fun hashPassword(@RequestBody hashRequest: HashPasswordRequest): ResponseEntity<Any> {
        println("비밀번호 해싱 요청")
        
        try {
            // 테스트용 사용자 생성 후 해시된 비밀번호만 반환
            val user = authService.createAdminUser("temp@example.com", hashRequest.password)
            val hashedPassword = user.password
            
            println("비밀번호 해싱 결과: ${hashedPassword.take(20)}...")
            
            return ResponseEntity.ok(mapOf(
                "hashedPassword" to hashedPassword
            ))
        } catch (e: Exception) {
            logger.error("비밀번호 해싱 중 오류 발생: ${e.message}")
            println("비밀번호 해싱 중 오류: ${e.message}")
            e.printStackTrace()
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "비밀번호 해싱 중 오류가 발생했습니다."))
        }
    }
} 