package com.rafaelmardojai.blanket

import android.content.Context
import android.media.MediaPlayer

class AudioPlayerManager(private val context: Context) {

    private val players = mutableMapOf<String, MediaPlayer>()

    fun toggleSound(soundItem: SoundItem) {
        if (soundItem.isPlaying) {
            stopSound(soundItem)
        } else {
            playSound(soundItem)
        }
    }

    private fun playSound(soundItem: SoundItem) {
        var player = players[soundItem.id]
        if (player == null) {
            player = MediaPlayer.create(context, soundItem.resourceId)
            player?.isLooping = true
            players[soundItem.id] = player!!
        }
        player?.setVolume(soundItem.volume, soundItem.volume)
        player?.start()
        soundItem.isPlaying = true
    }

    fun stopSound(soundItem: SoundItem) {
        val player = players[soundItem.id]
        if (player != null && player.isPlaying) {
            player.pause()
        }
        soundItem.isPlaying = false
    }

    fun setVolume(soundItem: SoundItem, volume: Float) {
        soundItem.volume = volume
        val player = players[soundItem.id]
        if (player != null) {
            player.setVolume(volume, volume)
        }
    }

    fun stopAll() {
        players.values.forEach { player ->
            if (player.isPlaying) {
                player.pause()
            }
        }
    }

    fun release() {
        players.values.forEach { player ->
            player.stop()
            player.release()
        }
        players.clear()
    }
}
