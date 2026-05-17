package com.rafaelmardojai.blanket

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import com.google.android.material.slider.Slider

class SoundAdapter(
    private val sounds: List<SoundItem>,
    private val onTogglePlayback: (SoundItem) -> Unit,
    private val onVolumeChanged: (SoundItem, Float) -> Unit
) : RecyclerView.Adapter<SoundAdapter.SoundViewHolder>() {

    inner class SoundViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val buttonToggle: MaterialButton = view.findViewById(R.id.buttonToggle)
        val textViewTitle: TextView = view.findViewById(R.id.textViewTitle)
        val sliderVolume: Slider = view.findViewById(R.id.sliderVolume)

        fun bind(soundItem: SoundItem) {
            textViewTitle.text = soundItem.title
            sliderVolume.value = soundItem.volume

            updateIcon(soundItem.isPlaying)

            buttonToggle.setOnClickListener {
                onTogglePlayback(soundItem)
                updateIcon(soundItem.isPlaying)
            }

            sliderVolume.addOnChangeListener { _, value, fromUser ->
                if (fromUser) {
                    onVolumeChanged(soundItem, value)
                }
            }
        }

        private fun updateIcon(isPlaying: Boolean) {
            if (isPlaying) {
                buttonToggle.setIconResource(android.R.drawable.ic_media_pause)
            } else {
                buttonToggle.setIconResource(android.R.drawable.ic_media_play)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SoundViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_sound, parent, false)
        return SoundViewHolder(view)
    }

    override fun onBindViewHolder(holder: SoundViewHolder, position: Int) {
        holder.bind(sounds[position])
    }

    override fun getItemCount(): Int = sounds.size
}
