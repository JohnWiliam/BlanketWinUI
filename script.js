const SOUNDS = [
  { key: 'birds', label: 'Pássaros' },
  { key: 'boat', label: 'Barco' },
  { key: 'city', label: 'Cidade' },
  { key: 'coffee-shop', label: 'Cafeteria' },
  { key: 'fireplace', label: 'Lareira' },
  { key: 'pink-noise', label: 'Ruído rosa' },
  { key: 'rain', label: 'Chuva' },
  { key: 'storm', label: 'Tempestade' },
  { key: 'stream', label: 'Riacho' },
  { key: 'summer-night', label: 'Noite de verão' },
  { key: 'train', label: 'Trem' },
  { key: 'waves', label: 'Ondas' },
  { key: 'white-noise', label: 'Ruído branco' },
  { key: 'wind', label: 'Vento' },
];

const grid = document.getElementById('sounds-grid');
const template = document.getElementById('sound-card-template');
const masterVolume = document.getElementById('master-volume');
const playAllBtn = document.getElementById('play-all');
const pauseAllBtn = document.getElementById('pause-all');
const stopAllBtn = document.getElementById('stop-all');

const state = new Map();

function createSound(sound) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.sound-card');
  const name = fragment.querySelector('.sound-name');
  const toggle = fragment.querySelector('.toggle');
  const volume = fragment.querySelector('.sound-volume');

  name.textContent = sound.label;

  const audio = new Audio(`data/resources/sounds/${sound.key}.ogg`);
  audio.loop = true;
  audio.preload = 'none';

  const data = { audio, toggle, volume, enabled: false, baseVolume: 0.7 };
  state.set(sound.key, data);

  function syncVolume() {
    const master = Number(masterVolume.value) / 100;
    audio.volume = data.baseVolume * master;
  }

  function syncButton() {
    toggle.textContent = data.enabled ? 'Pausar' : 'Tocar';
    toggle.classList.toggle('danger', data.enabled);
  }

  toggle.addEventListener('click', async () => {
    data.enabled = !data.enabled;
    if (data.enabled) {
      syncVolume();
      await audio.play().catch(() => {
        data.enabled = false;
      });
    } else {
      audio.pause();
    }
    syncButton();
    persistState();
  });

  volume.addEventListener('input', () => {
    data.baseVolume = Number(volume.value) / 100;
    syncVolume();
    persistState();
  });

  card.dataset.sound = sound.key;
  grid.appendChild(fragment);
  syncButton();
  return { syncVolume, syncButton };
}

const syncers = SOUNDS.map(createSound);

masterVolume.addEventListener('input', () => {
  syncers.forEach((s) => s.syncVolume());
  persistState();
});

playAllBtn.addEventListener('click', async () => {
  for (const item of state.values()) {
    if (!item.enabled) {
      item.enabled = true;
      item.audio.volume = item.baseVolume * (Number(masterVolume.value) / 100);
      await item.audio.play().catch(() => {
        item.enabled = false;
      });
      item.toggle.textContent = item.enabled ? 'Pausar' : 'Tocar';
      item.toggle.classList.toggle('danger', item.enabled);
    }
  }
  persistState();
});

pauseAllBtn.addEventListener('click', () => {
  for (const item of state.values()) {
    item.audio.pause();
    item.enabled = false;
    item.toggle.textContent = 'Tocar';
    item.toggle.classList.remove('danger');
  }
  persistState();
});

stopAllBtn.addEventListener('click', () => {
  for (const item of state.values()) {
    item.audio.pause();
    item.audio.currentTime = 0;
    item.enabled = false;
    item.toggle.textContent = 'Tocar';
    item.toggle.classList.remove('danger');
  }
  persistState();
});

function persistState() {
  const payload = {
    master: masterVolume.value,
    sounds: Array.from(state.entries()).map(([key, data]) => ({
      key,
      baseVolume: data.baseVolume,
      enabled: data.enabled,
    })),
  };
  localStorage.setItem('blanket-web-state', JSON.stringify(payload));
}

function restoreState() {
  const raw = localStorage.getItem('blanket-web-state');
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.master) {
      masterVolume.value = parsed.master;
    }
    for (const item of parsed.sounds || []) {
      const sound = state.get(item.key);
      if (!sound) continue;
      sound.baseVolume = item.baseVolume ?? sound.baseVolume;
      sound.volume.value = String(Math.round(sound.baseVolume * 100));
      sound.enabled = Boolean(item.enabled);
      sound.audio.volume = sound.baseVolume * (Number(masterVolume.value) / 100);
      sound.toggle.textContent = sound.enabled ? 'Pausar' : 'Tocar';
      sound.toggle.classList.toggle('danger', sound.enabled);
    }
  } catch {
    localStorage.removeItem('blanket-web-state');
  }
}

restoreState();
