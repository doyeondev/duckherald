package com.duckherald.user

/**
 * 사용자 유형을 정의하는 열거형 클래스
 * 
 * 시스템 내에서 사용자 역할을 구분합니다.
 * - ADMIN: 관리자 권한을 가진 사용자
 * - SUBSCRIBER: 뉴스레터 구독자
 */
enum class UserType {
    ADMIN,       // 관리자
    SUBSCRIBER   // 구독자
} 