const SOUNDS = [
  { id: 'birds', name: 'Pássaros', file: 'data/resources/sounds/birds.ogg' },
  { id: 'boat', name: 'Barco', file: 'data/resources/sounds/boat.ogg' },
  { id: 'city', name: 'Cidade', file: 'data/resources/sounds/city.ogg' },
  { id: 'coffee-shop', name: 'Cafeteria', file: 'data/resources/sounds/coffee-shop.ogg' },
  { id: 'fireplace', name: 'Lareira', file: 'data/resources/sounds/fireplace.ogg' },
  { id: 'pink-noise', name: 'Ruído rosa', file: 'data/resources/sounds/pink-noise.ogg' },
  { id: 'rain', name: 'Chuva', file: 'data/resources/sounds/rain.ogg' },
  { id: 'storm', name: 'Tempestade', file: 'data/resources/sounds/storm.ogg' },
  { id: 'stream', name: 'Riacho', file: 'data/resources/sounds/stream.ogg' },
  { id: 'summer-night', name: 'Noite de verão', file: 'data/resources/sounds/summer-night.ogg' },
  { id: 'train', name: 'Trem', file: 'data/resources/sounds/train.ogg' },
  { id: 'waves', name: 'Ondas', file: 'data/resources/sounds/waves.ogg' },
  { id: 'white-noise', name: 'Ruído branco', file: 'data/resources/sounds/white-noise.ogg' },
  { id: 'wind', name: 'Vento', file: 'data/resources/sounds/wind.ogg' }
];

const players = new Map();
const states = new Map();
const grid = document.getElementById('soundsGrid');
const template = document.getElementById('soundCardTemplate');
const masterVolume = document.getElementById('masterVolume');

function renderSounds() {
  SOUNDS.forEach((sound) => {
    const card = template.content.firstElementChild.cloneNode(true);
    const audio = new Audio(sound.file);
    audio.loop = true;
    audio.preload = 'none';

    players.set(sound.id, audio);
    states.set(sound.id, { playing: false, volume: 0.5 });

    card.querySelector('.sound-name').textContent = sound.name;
    const status = card.querySelector('.status');
    const toggleBtn = card.querySelector('.toggle-btn');
    const volumeSlider = card.querySelector('.volume-slider');

    const sync = () => {
      const st = states.get(sound.id);
      audio.volume = st.volume * Number(masterVolume.value);
      toggleBtn.textContent = st.playing ? 'Pausar' : 'Tocar';
      status.textContent = st.playing ? 'Tocando' : 'Pausado';
    };

    toggleBtn.addEventListener('click', async () => {
      const st = states.get(sound.id);
      st.playing = !st.playing;
      if (st.playing) {
        await audio.play().catch(() => { st.playing = false; });
      } else {
        audio.pause();
      }
      sync();
    });

    volumeSlider.addEventListener('input', () => {
      states.get(sound.id).volume = Number(volumeSlider.value);
      sync();
    });

    sync();
    grid.appendChild(card);
  });
}

function forEachSound(action) {
  SOUNDS.forEach(({ id }) => action(id, players.get(id), states.get(id)));
}

document.getElementById('playAllBtn').addEventListener('click', () => {
  forEachSound(async (_, audio, state) => {
    state.playing = true;
    await audio.play().catch(() => { state.playing = false; });
  });
  refreshUI();
});

document.getElementById('pauseAllBtn').addEventListener('click', () => {
  forEachSound((_, audio, state) => {
    state.playing = false;
    audio.pause();
  });
  refreshUI();
});

document.getElementById('stopAllBtn').addEventListener('click', () => {
  forEachSound((_, audio, state) => {
    state.playing = false;
    audio.pause();
    audio.currentTime = 0;
  });
  refreshUI();
});

masterVolume.addEventListener('input', refreshUI);

function refreshUI() {
  const cards = [...document.querySelectorAll('.sound-card')];
  SOUNDS.forEach((sound, i) => {
    const state = states.get(sound.id);
    const audio = players.get(sound.id);
    audio.volume = state.volume * Number(masterVolume.value);

    const card = cards[i];
    card.querySelector('.toggle-btn').textContent = state.playing ? 'Pausar' : 'Tocar';
    card.querySelector('.status').textContent = state.playing ? 'Tocando' : 'Pausado';
  });
}

const PRESET_KEY = 'blanket-web-presets-v1';
const presetList = document.getElementById('presetList');

function loadPresets() {
  return JSON.parse(localStorage.getItem(PRESET_KEY) || '{}');
}
function savePresets(presets) {
  localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
}
function fillPresetList() {
  const presets = loadPresets();
  presetList.innerHTML = '';
  Object.keys(presets).forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    presetList.appendChild(opt);
  });
}

document.getElementById('savePresetBtn').addEventListener('click', () => {
  const name = document.getElementById('presetName').value.trim();
  if (!name) return;

  const sounds = {};
  SOUNDS.forEach(({ id }) => {
    sounds[id] = { ...states.get(id) };
  });

  const presets = loadPresets();
  presets[name] = { masterVolume: Number(masterVolume.value), sounds };
  savePresets(presets);
  fillPresetList();
  presetList.value = name;
});

document.getElementById('loadPresetBtn').addEventListener('click', async () => {
  const selected = presetList.value;
  const preset = loadPresets()[selected];
  if (!preset) return;

  masterVolume.value = preset.masterVolume;
  for (const { id } of SOUNDS) {
    const soundState = preset.sounds[id];
    if (!soundState) continue;
    states.set(id, soundState);

    const audio = players.get(id);
    audio.pause();
    if (soundState.playing) {
      await audio.play().catch(() => { states.get(id).playing = false; });
    }
  }
  refreshUI();
});

document.getElementById('deletePresetBtn').addEventListener('click', () => {
  const selected = presetList.value;
  const presets = loadPresets();
  delete presets[selected];
  savePresets(presets);
  fillPresetList();
});

renderSounds();
fillPresetList();
