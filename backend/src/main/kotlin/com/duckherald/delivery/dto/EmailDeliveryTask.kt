package com.duckherald.delivery.dto

import java.io.Serializable

data class EmailDeliveryTask(
    val subscriberId: Long,
    val email: String,
    val newsletterId: Int,
    val title: String,
    val content: String,
    var status: String = "PENDING" // PENDING, SENT, FAILED
) : Serializable 