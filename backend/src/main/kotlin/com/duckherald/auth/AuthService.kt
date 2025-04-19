package com.duckherald.auth

import com.duckherald.config.JwtTokenProvider
import com.duckherald.user.User
import com.duckherald.user.UserRepository
import com.duckherald.user.UserType
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val passwordEncoder: PasswordEncoder
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)
    
    @Transactional(readOnly = true)
    fun findByEmail(email: String): User? {
        return userRepository.findByEmail(email)
    }

    /**
     * 관리자 사용자를 검증합니다.
     * 
     * @param email 이메일
     * @param password 비밀번호
     * @return 검증된 사용자 또는 null
     */
    fun validateAdminUser(email: String, password: String): User? {
        logger.info("관리자 사용자 검증 시작: email=$email")
        println("\n===== 관리자 사용자 검증 시작 =====")
        println("이메일: $email")
        println("비밀번호: ${password.take(2)}...")
        
        try {
            // 이메일로 사용자 조회
            val user = userRepository.findByEmail(email)
            println("사용자 조회 결과: ${user != null}")
            
            if (user != null) {
                println("사용자 정보: id=${user.id}, email=${user.email}, type=${user.type}")
                println("저장된 비밀번호: ${user.password.take(10)}...")
                
                // 어드민 타입인지 확인
                val isAdmin = user.type == UserType.ADMIN.name
                println("어드민 타입 여부: $isAdmin")
                
                // 비밀번호 검증
                val passwordMatches = passwordEncoder.matches(password, user.password)
                println("비밀번호 일치 여부: $passwordMatches")
                
                // 어드민이고 비밀번호가 일치하면 사용자 반환
                if (isAdmin && passwordMatches) {
                    logger.info("관리자 사용자 검증 성공: email=$email")
                    println("관리자 사용자 검증 성공!")
                    return user
                } else {
                    if (!isAdmin) {
                        logger.warn("관리자 사용자 검증 실패: 어드민 타입이 아님 - email=$email, type=${user.type}")
                        println("관리자 사용자 검증 실패: 어드민 타입이 아님")
                    } else {
                        logger.warn("관리자 사용자 검증 실패: 비밀번호 불일치 - email=$email")
                        println("관리자 사용자 검증 실패: 비밀번호 불일치")
                    }
                }
            } else {
                logger.warn("관리자 사용자 검증 실패: 사용자를 찾을 수 없음 - email=$email")
                println("관리자 사용자 검증 실패: 사용자를 찾을 수 없음")
            }
        } catch (e: Exception) {
            logger.error("관리자 사용자 검증 중 예외 발생: ${e.message}", e)
            println("관리자 사용자 검증 중 오류: ${e.message}")
            e.printStackTrace()
        }
        
        println("===== 관리자 사용자 검증 종료 =====\n")
        return null
    }

    /**
     * 관리자 로그인을 처리하고 JWT 토큰을 생성합니다.
     *
     * @param email 사용자 이메일
     * @param password 비밀번호
     * @return JWT 토큰, 로그인 실패 시 null
     */
    @Transactional(readOnly = true)
    fun loginAdmin(email: String, password: String): String? {
        println("\n===== 관리자 로그인 시도: $email =====")
        
        // 1. 관리자 사용자 검증
        val user = validateAdminUser(email, password)
        
        // 2. 검증 실패 시 null 반환
        if (user == null) {
            println("관리자 인증 실패로 로그인 거부됨")
            return null
        }
        
        // 3. JWT 토큰 생성 (권한 정보 리스트 전달)
        val token = jwtTokenProvider.createToken(user.id.toString(), listOf("ADMIN"))
        println("JWT 토큰 생성 완료: ${token.take(20)}...")
        println("===== 관리자 로그인 완료 =====\n")
        
        return token
    }

    /**
     * 테스트용: 관리자 계정 생성
     * 
     * 주의: 개발/테스트 환경에서만 사용해야 합니다.
     */
    @Transactional
    fun createAdminUser(email: String, rawPassword: String): User {
        // 이미 존재하는 사용자 확인
        val existingUser = userRepository.findByEmail(email)
        if (existingUser != null) {
            logger.info("이미 존재하는 관리자 계정: $email")
            return existingUser
        }
        
        // 비밀번호 해싱
        val hashedPassword = passwordEncoder.encode(rawPassword)
        logger.info("새 관리자 계정 비밀번호 해싱 완료")
        
        // 관리자 계정 생성
        val user = User(
            email = email,
            password = hashedPassword,
            type = UserType.ADMIN.name
        )
        
        val savedUser = userRepository.save(user)
        logger.info("새 관리자 계정 생성 완료: $email (ID: ${savedUser.id})")
        
        return savedUser
    }
    
    /**
     * 테스트용: 기존 관리자 계정의 비밀번호 업데이트
     * 
     * 주의: 개발/테스트 환경에서만 사용해야 합니다.
     */
    @Transactional
    fun updateAdminPassword(email: String, newRawPassword: String): Boolean {
        // 기존 사용자 조회
        val user = userRepository.findByEmail(email)
        if (user == null) {
            logger.warn("비밀번호 업데이트 실패: 사용자를 찾을 수 없음 ($email)")
            return false
        }
        
        if (user.type != UserType.ADMIN.name) {
            logger.warn("비밀번호 업데이트 실패: 관리자 계정이 아님 ($email)")
            return false
        }
        
        // 새 비밀번호 해싱
        val hashedPassword = passwordEncoder.encode(newRawPassword)
        logger.info("관리자 계정 새 비밀번호 해싱 완료")
        
        // 비밀번호 업데이트
        user.password = hashedPassword
        userRepository.save(user)
        
        logger.info("관리자 비밀번호 업데이트 완료: $email")
        return true
    }

    /**
     * 사용자 비밀번호를 안전하게 업데이트합니다.
     * 
     * @param user 비밀번호를 변경할 사용자 객체
     * @param rawPassword 새 비밀번호 (평문)
     * @return 업데이트된 사용자 객체
     */
    @Transactional
    fun updateUserPassword(user: User, rawPassword: String): User {
        logger.info("사용자 비밀번호 업데이트: ${user.email}")
        val hashedPassword = passwordEncoder.encode(rawPassword)
        
        // User 엔티티에 추가된 updatePassword 메서드 사용
        user.updatePassword(hashedPassword)
        
        // 변경사항 저장
        return userRepository.save(user)
    }
} 