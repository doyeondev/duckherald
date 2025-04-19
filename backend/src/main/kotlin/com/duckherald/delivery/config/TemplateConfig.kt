package com.duckherald.delivery.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.thymeleaf.TemplateEngine
import org.thymeleaf.spring6.SpringTemplateEngine
import org.thymeleaf.templatemode.TemplateMode
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver

@Configuration
class TemplateConfig {
    
    @Bean
    fun emailTemplateEngine(): TemplateEngine {
        val templateEngine = SpringTemplateEngine()
        templateEngine.addTemplateResolver(htmlTemplateResolver())
        return templateEngine
    }
    
    private fun htmlTemplateResolver(): ClassLoaderTemplateResolver {
        val templateResolver = ClassLoaderTemplateResolver()
        templateResolver.prefix = "templates/"
        templateResolver.suffix = ".html"
        templateResolver.templateMode = TemplateMode.HTML
        templateResolver.characterEncoding = "UTF-8"
        templateResolver.isCacheable = false
        templateResolver.order = 1
        return templateResolver
    }
} 