package com.rafaelmardojai.blanket

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton

class MainActivity : AppCompatActivity() {

    private lateinit var audioPlayerManager: AudioPlayerManager
    private lateinit var soundAdapter: SoundAdapter
    private lateinit var sounds: List<SoundItem>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        audioPlayerManager = AudioPlayerManager(this)

        sounds = listOf(
            SoundItem("birds", "Birds", R.raw.birds, "birds"),
            SoundItem("boat", "Boat", R.raw.boat, "boat"),
            SoundItem("city", "City", R.raw.city, "city"),
            SoundItem("coffee_shop", "Coffee Shop", R.raw.coffee_shop, "coffee_shop"),
            SoundItem("fireplace", "Fireplace", R.raw.fireplace, "fireplace"),
            SoundItem("pink_noise", "Pink Noise", R.raw.pink_noise, "pink_noise"),
            SoundItem("rain", "Rain", R.raw.rain, "rain"),
            SoundItem("storm", "Storm", R.raw.storm, "storm"),
            SoundItem("stream", "Stream", R.raw.stream, "stream"),
            SoundItem("summer_night", "Summer Night", R.raw.summer_night, "summer_night"),
            SoundItem("train", "Train", R.raw.train, "train"),
            SoundItem("waves", "Waves", R.raw.waves, "waves"),
            SoundItem("white_noise", "White Noise", R.raw.white_noise, "white_noise"),
            SoundItem("wind", "Wind", R.raw.wind, "wind")
        )

        val recyclerView = findViewById<RecyclerView>(R.id.recyclerViewSounds)
        recyclerView.layoutManager = LinearLayoutManager(this)

        soundAdapter = SoundAdapter(
            sounds,
            onTogglePlayback = { soundItem ->
                audioPlayerManager.toggleSound(soundItem)
                updateGlobalFabIcon()
            },
            onVolumeChanged = { soundItem, volume ->
                audioPlayerManager.setVolume(soundItem, volume)
            }
        )
        recyclerView.adapter = soundAdapter

        val fabPlayPauseAll = findViewById<FloatingActionButton>(R.id.fabPlayPauseAll)
        fabPlayPauseAll.setOnClickListener {
            val anyPlaying = sounds.any { it.isPlaying }
            if (anyPlaying) {
                audioPlayerManager.stopAll()
                sounds.forEach { it.isPlaying = false }
            }
            soundAdapter.notifyDataSetChanged()
            updateGlobalFabIcon()
        }
    }

    private fun updateGlobalFabIcon() {
        val fab = findViewById<FloatingActionButton>(R.id.fabPlayPauseAll)
        val anyPlaying = sounds.any { it.isPlaying }
        if (anyPlaying) {
            fab.setImageResource(android.R.drawable.ic_media_pause)
        } else {
            fab.setImageResource(android.R.drawable.ic_media_play)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        audioPlayerManager.release()
    }
}
