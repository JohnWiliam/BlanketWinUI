package com.rafaelmardojai.blanket

import androidx.annotation.RawRes

data class SoundItem(
    val id: String,
    val title: String,
    @RawRes val resourceId: Int,
    val iconName: String,
    var isPlaying: Boolean = false,
    var volume: Float = 0.5f
)
