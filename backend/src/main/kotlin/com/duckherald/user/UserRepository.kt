package com.duckherald.user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, Long> {
    // 이메일로 사용자 찾기 --> 없앨 예정.
    fun findByEmail(email: String): User?
} 