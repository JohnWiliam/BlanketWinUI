const SOUNDS = [
  { id: 'birds', name: 'Birds', src: 'data/resources/sounds/birds.ogg' },
  { id: 'boat', name: 'Boat', src: 'data/resources/sounds/boat.ogg' },
  { id: 'city', name: 'City', src: 'data/resources/sounds/city.ogg' },
  { id: 'coffee-shop', name: 'Coffee Shop', src: 'data/resources/sounds/coffee-shop.ogg' },
  { id: 'fireplace', name: 'Fireplace', src: 'data/resources/sounds/fireplace.ogg' },
  { id: 'pink-noise', name: 'Pink Noise', src: 'data/resources/sounds/pink-noise.ogg' },
  { id: 'rain', name: 'Rain', src: 'data/resources/sounds/rain.ogg' },
  { id: 'storm', name: 'Storm', src: 'data/resources/sounds/storm.ogg' },
  { id: 'stream', name: 'Stream', src: 'data/resources/sounds/stream.ogg' },
  { id: 'summer-night', name: 'Summer Night', src: 'data/resources/sounds/summer-night.ogg' },
  { id: 'train', name: 'Train', src: 'data/resources/sounds/train.ogg' },
  { id: 'waves', name: 'Waves', src: 'data/resources/sounds/waves.ogg' },
  { id: 'white-noise', name: 'White Noise', src: 'data/resources/sounds/white-noise.ogg' },
  { id: 'wind', name: 'Wind', src: 'data/resources/sounds/wind.ogg' }
];

const state = { masterVolume: 0.7, playingAll: false, sounds: new Map() };

const grid = document.querySelector('#soundGrid');
const template = document.querySelector('#soundCardTemplate');
const toggleAll = document.querySelector('#toggleAll');
const masterVolume = document.querySelector('#masterVolume');

function createSoundCard(sound) {
  const node = template.content.cloneNode(true);
  const card = node.querySelector('.sound-card');
  const title = node.querySelector('.sound-card__title');
  const status = node.querySelector('.sound-card__status');
  const toggle = node.querySelector('.sound-card__toggle');
  const volume = node.querySelector('.sound-card__volume');

  title.textContent = sound.name;
  volume.value = '70';

  const audio = new Audio(sound.src);
  audio.loop = true;
  audio.preload = 'none';

  const soundState = { audio, playing: false, volume: 0.7, status, toggle, volumeSlider: volume };
  state.sounds.set(sound.id, soundState);

  const refresh = () => {
    soundState.audio.volume = soundState.volume * state.masterVolume;
    status.textContent = soundState.playing ? 'Tocando' : 'Pausado';
    toggle.textContent = soundState.playing ? 'Pausar' : 'Tocar';
  };

  toggle.addEventListener('click', async () => {
    soundState.playing = !soundState.playing;
    if (soundState.playing) {
      try { await audio.play(); } catch { soundState.playing = false; }
    } else {
      audio.pause();
    }
    refresh();
  });

  volume.addEventListener('input', (event) => {
    soundState.volume = Number(event.target.value) / 100;
    refresh();
  });

  refresh();
  grid.append(card);
}

function setAll(playing) {
  state.playingAll = playing;
  for (const soundState of state.sounds.values()) {
    soundState.playing = playing;
    if (playing) soundState.audio.play().catch(() => { soundState.playing = false; });
    else soundState.audio.pause();
    soundState.audio.volume = soundState.volume * state.masterVolume;
    soundState.status.textContent = soundState.playing ? 'Tocando' : 'Pausado';
    soundState.toggle.textContent = soundState.playing ? 'Pausar' : 'Tocar';
  }
  toggleAll.textContent = playing ? '⏸️ Pausar todos' : '▶️ Tocar todos';
}

for (const sound of SOUNDS) createSoundCard(sound);

toggleAll.addEventListener('click', () => setAll(!state.playingAll));

masterVolume.addEventListener('input', (event) => {
  state.masterVolume = Number(event.target.value) / 100;
  for (const soundState of state.sounds.values()) {
    soundState.audio.volume = soundState.volume * state.masterVolume;
  }
});

document.querySelector('#savePreset').addEventListener('click', () => {
  const preset = {
    masterVolume: state.masterVolume,
    sounds: Object.fromEntries([...state.sounds].map(([id, s]) => [id, { volume: s.volume, playing: s.playing }]))
  };
  localStorage.setItem('blanket-web-preset', JSON.stringify(preset));
});

document.querySelector('#loadPreset').addEventListener('click', () => {
  const raw = localStorage.getItem('blanket-web-preset');
  if (!raw) return;
  const preset = JSON.parse(raw);
  state.masterVolume = preset.masterVolume ?? 0.7;
  masterVolume.value = String(Math.round(state.masterVolume * 100));
  for (const [id, values] of Object.entries(preset.sounds ?? {})) {
    const soundState = state.sounds.get(id);
    if (!soundState) continue;
    soundState.volume = values.volume ?? soundState.volume;
    soundState.volumeSlider.value = String(Math.round(soundState.volume * 100));
    soundState.playing = Boolean(values.playing);
    if (soundState.playing) soundState.audio.play().catch(() => { soundState.playing = false; });
    else soundState.audio.pause();
    soundState.audio.volume = soundState.volume * state.masterVolume;
    soundState.status.textContent = soundState.playing ? 'Tocando' : 'Pausado';
    soundState.toggle.textContent = soundState.playing ? 'Pausar' : 'Tocar';
  }
  state.playingAll = [...state.sounds.values()].every((s) => s.playing);
  toggleAll.textContent = state.playingAll ? '⏸️ Pausar todos' : '▶️ Tocar todos';
});

document.querySelector('#resetPreset').addEventListener('click', () => {
  localStorage.removeItem('blanket-web-preset');
  state.masterVolume = 0.7;
  masterVolume.value = '70';
  setAll(false);
  for (const soundState of state.sounds.values()) {
    soundState.volume = 0.7;
    soundState.volumeSlider.value = '70';
    soundState.audio.volume = soundState.volume * state.masterVolume;
  }
});
