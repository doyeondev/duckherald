package com.duckherald

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * 애플리케이션 컨텍스트 로드 테스트
 * 테스트 프로필을 활성화하여 실제 외부 서비스 연결을 방지함
 */
@SpringBootTest
@ActiveProfiles("test")
class DuckHeraldApplicationTests {

    @Test
    fun contextLoads() {
        // 컨텍스트가 성공적으로 로드되면 테스트 통과
        println("애플리케이션 컨텍스트가 성공적으로 로드되었습니다.")
    }
} 