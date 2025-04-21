// build.gradle.kts

import org.jetbrains.kotlin.gradle.dsl.KotlinJvmCompilerOptions

plugins {
    // Kotlin + Spring + NoArg 플러그인 (버전은 맞춰서 사용 중)
    kotlin("jvm") version "1.9.22"
    kotlin("plugin.spring") version "1.9.22"
    kotlin("plugin.noarg") version "1.9.22" // JPA용 기본 생성자 자동 생성용

    // Spring Boot
    id("org.springframework.boot") version "3.2.3"
    id("io.spring.dependency-management") version "1.1.4"

    // [SENTRY] Gradle Plugin 추가
    id("io.sentry.jvm.gradle") version "5.3.0"
}

// 프로젝트 group & version
group = "com.duckherald"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17)) // Java 17 사용
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-web")
    
    // Spring Security
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    
    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // Spring Batch (뉴스레터 발송용)
    implementation("org.springframework.boot:spring-boot-starter-batch")

    // 이메일 전송용
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("jakarta.mail:jakarta.mail-api") // 추가

    // Redis 캐시/큐 사용 시
    implementation("org.springframework.boot:spring-boot-starter-data-redis")

    // Kotlin 관련
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // DB
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.postgresql:postgresql")

    // 개발용 도구
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

    // 테스트
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testImplementation("com.h2database:h2")

    // 이메일 발송을 위한 Spring Mail
    implementation("org.springframework.boot:spring-boot-starter-mail")
    
    // Thymeleaf 템플릿 엔진
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.thymeleaf.extras:thymeleaf-extras-java8time:3.0.4.RELEASE")

    // AWS S3 사용
    implementation("software.amazon.awssdk:s3:2.20.140")

    // Jakarta Validation 관련 의존성 제거 또는 주석 처리
    // implementation("jakarta.validation:jakarta.validation-api:3.0.2")
    // implementation("org.hibernate.validator:hibernate-validator:8.0.0.Final")

    // .env 파일 로딩 라이브러리
    implementation("me.paulschwarz:spring-dotenv:3.0.0")
    
    // OpenAPI 명세 자동화를 위한 SpringDoc
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")
    implementation("org.springdoc:springdoc-openapi-starter-common:2.5.0")

    // Sentry 의존성 추가
    implementation("io.sentry:sentry-spring-boot-starter-jakarta:7.3.0")
    implementation("io.sentry:sentry-logback:7.3.0")
    // implementation("io.sentry:sentry-spring-boot-starter:6.32.0")
    // implementation("io.sentry:sentry-logback:6.32.0") // 로그도 Sentry에 보내려면

    // 테스트를 위한 추가 의존성
    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
    testImplementation("org.mockito:mockito-core:5.3.1")
    testImplementation("org.mockito:mockito-junit-jupiter:5.3.1")
    testImplementation("org.mockito:mockito-inline:4.11.0")
    testImplementation("com.ninja-squad:springmockk:4.0.2")
    
    // Spring Security Test 의존성 추가
    testImplementation("org.springframework.security:spring-security-test")
}

// JPA Entity 클래스에 자동으로 기본 생성자 삽입
noArg {
    annotation("jakarta.persistence.Entity")
}

// 테스트: JUnit5 사용
tasks.withType<Test> {
    useJUnitPlatform()
    
    // 출력 상세 정보 설정
    testLogging {
        events("passed", "skipped", "failed")
        showExceptions = true
        showCauses = true
        showStackTraces = true
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}

// 테스트 스킵하고 애플리케이션 실행
tasks.register("runWithoutTests") {
    group = "application"
    description = "Run application without tests"
    dependsOn("bootRun")
    tasks.findByName("bootRun")?.mustRunAfter("clean")
    
    doFirst {
        tasks.findByName("test")?.enabled = false
    }
}

// 애플리케이션 메인 클래스 지정
springBoot {
    mainClass.set("com.duckherald.DuckHeraldApplicationKt")
}

// bootRun 설정 (Kotlin entry point)
tasks.named<org.springframework.boot.gradle.tasks.run.BootRun>("bootRun") {
    mainClass.set("com.duckherald.DuckHeraldApplicationKt")
}

// Kotlin 컴파일러 설정 (JSR-305: null safety 강화)
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xjsr305=strict")
    }
}

// [SENTRY] 릴리즈 & 소스맵 자동 업로드용 설정
/**
 * Sentry 설정 관련 문제 해결:
 * 1. 버전 충돌: autoInstallation.sentryVersion.set("7.3.0")로 버전 고정
 * 2. 소스맵 번들링 오류: autoInstallation.enabled.set(false)로 비활성화
 * 3. 인증 오류: 소스맵 업로드 및 커밋 추적 기능 비활성화
 * 
 * 이를 통해 빌드 및 실행 시 SentryBundleSourcesJava 작업 에러 해결
 */
sentry {
    org.set("do-yeon") // Sentry 조직 슬러그
    projectName.set("duckherald-backend") // Sentry 프로젝트 이름
    // authToken.set(System.getenv("SENTRY_AUTH_TOKEN_BACKEND")) // 주석 처리

    // 버전 충돌 방지를 위해 7.3.0 버전 지정
    autoInstallation.sentryVersion.set("7.3.0")
    autoInstallation.enabled.set(false) // 자동 설치 비활성화

    // 소스맵 업로드 비활성화
    includeSourceContext.set(false)
    autoUploadProguardMapping.set(false)
    
    // Git 커밋 정보 자동 추적 비활성화
    tracingInstrumentation.enabled.set(false)
}