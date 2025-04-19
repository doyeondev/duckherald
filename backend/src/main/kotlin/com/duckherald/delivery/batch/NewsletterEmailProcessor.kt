package com.duckherald.delivery.batch

import com.duckherald.delivery.dto.EmailDeliveryTask
import org.springframework.batch.item.ItemProcessor

class NewsletterEmailProcessor : ItemProcessor<EmailDeliveryTask, EmailDeliveryTask> {
    override fun process(item: EmailDeliveryTask): EmailDeliveryTask {
        // 여기서 이메일 콘텐츠를 가공하거나 개인화하는 작업을 수행할 수 있습니다.
        // 예: 구독자 이름 추가, 추적 픽셀 삽입, 링크 변환 등
        
        // 이 예시에서는 간단히 HTML 형식으로 콘텐츠 래핑
        val processedContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${item.title}</title>
            </head>
            <body>
                ${item.content}
                <br><br>
                <p style="font-size: 12px; color: #666;">
                    본 메일은 Duck Herald 뉴스레터 구독자에게 발송되었습니다.<br>
                    구독 해지를 원하시면 <a href="http://localhost:3000/unsubscribe?email=${item.email}">여기</a>를 클릭하세요.
                </p>
                <img src="http://localhost:8080/api/delivery/track/${item.newsletterId}/${item.subscriberId}" width="1" height="1" />
            </body>
            </html>
        """.trimIndent()
        
        return item.copy(content = processedContent)
    }
} 