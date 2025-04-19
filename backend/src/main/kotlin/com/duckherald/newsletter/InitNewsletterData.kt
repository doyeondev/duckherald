// // // 경로: src/main/kotlin/com/duckherald/newsletter/InitNewsletterData.kt
// // package com.duckherald.newsletter

// // import com.duckherald.newsletter.domain.model.NewsletterDocument
// // import com.duckherald.newsletter.domain.model.NewsletterMeta
// // import com.duckherald.newsletter.domain.repository.NewsletterMetaRepository
// // import com.duckherald.newsletter.domain.repository.NewsletterMongoRepository
// // import org.springframework.boot.CommandLineRunner
// // import org.springframework.stereotype.Component
// // import java.time.LocalDateTime

// // @Component
// // class InitNewsletterData(
// //     // private val newsletterMongoRepository: NewsletterMongoRepository,
// //     private val newsletterMetaRepository: NewsletterMetaRepository
// // ) : CommandLineRunner {

// //     // CommandLineRunner를 implements 했으면 반드시 override fun run(vararg args: String?) 메서드를 구현해야 한다.
// //     override fun run(vararg args: String?) {
// //         val dummyList = listOf(
// //             NewsletterDocument(title = "Jimin in Paris", contentHtml = "<p>아름다운 파리</p>"),
// //             NewsletterDocument(title = "Lisa's Solo", contentHtml = "<p>리사의 솔로 데뷔</p>")
// //         )
// //         // val saved = newsletterMongoRepository.save(it)
// //         dummyList.forEach {
// //             newsletterMetaRepository.save(
// //                 NewsletterMeta(
// //                     title = saved.title,
// //                     status = "DRAFT",
// //                     scheduledAt = null,
// //                     createdAt = LocalDateTime.now()
// //                 )
// //             )
// //         }
// //     }
// // }

// // 경로: src/main/kotlin/com/duckherald/newsletter/InitNewsletterData.kt
// package com.duckherald.newsletter

// import com.duckherald.newsletter.domain.model.NewsletterMeta
// import com.duckherald.newsletter.domain.repository.NewsletterMetaRepository
// import org.springframework.boot.CommandLineRunner
// import org.springframework.stereotype.Component
// import java.time.LocalDateTime

// @Component
// class InitNewsletterData(
//     private val newsletterMetaRepository: NewsletterMetaRepository
// ) : CommandLineRunner {

//     override fun run(vararg args: String?) {
//         val dummyList = listOf(
//             "Jimin in Paris",
//             "Lisa's Solo"
//         )
//         dummyList.forEach { title ->
//             newsletterMetaRepository.save(
//                 NewsletterMeta(
//                     title = title,
//                     status = "Draft",
//                     scheduledAt = null,
//                     createdAt = LocalDateTime.now(),
//                     publishedAt = null
//                 )
//             )
//         }
//     }
// }
