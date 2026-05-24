const SOUND_LIBRARY = [
  ['birds', 'Pássaros'],
  ['boat', 'Barco'],
  ['city', 'Cidade'],
  ['coffee-shop', 'Cafeteria'],
  ['fireplace', 'Lareira'],
  ['pink-noise', 'Ruído Rosa'],
  ['rain', 'Chuva'],
  ['storm', 'Tempestade'],
  ['summer-night', 'Noite de Verão'],
  ['train', 'Trem'],
  ['waves', 'Ondas'],
  ['white-noise', 'Ruído Branco'],
  ['wind', 'Vento'],
];

const soundList = document.querySelector('#soundList');
const template = document.querySelector('#soundItemTemplate');
const toggleAll = document.querySelector('#toggleAll');
const stopAll = document.querySelector('#stopAll');
const masterVolume = document.querySelector('#masterVolume');
const masterVolumeValue = document.querySelector('#masterVolumeValue');

let globalVolumeFactor = Number(masterVolume.value) / 100;
let isAudioUnlocked = false;

const players = SOUND_LIBRARY.map(([key, label], index) => {
  const audio = new Audio(`../Projeto/data/resources/sounds/${key}.ogg`);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = globalVolumeFactor;

  const item = template.content.firstElementChild.cloneNode(true);
  const title = item.querySelector('.sound-card__title');
  const btn = item.querySelector('.sound-card__toggle');
  const slider = item.querySelector('.sound-card__volume');
  const sliderValue = item.querySelector('.sound-card__volume-value');

  title.textContent = label;
  item.style.animationDelay = `${Math.min(index * 45, 400)}ms`;

  const applyVolume = () => {
    const individual = Number(slider.value) / 100;
    audio.volume = Math.min(individual * globalVolumeFactor, 1);
    sliderValue.textContent = `${slider.value}%`;
  };

  slider.addEventListener('input', applyVolume);
  applyVolume();

  btn.addEventListener('click', async () => {
    await unlockAudioContext();

    if (audio.paused) {
      const played = await safePlay(audio);
      if (!played) return;
      btn.textContent = 'Pausar';
      btn.classList.add('is-playing');
      item.classList.add('is-playing');
    } else {
      audio.pause();
      btn.textContent = 'Tocar';
      btn.classList.remove('is-playing');
      item.classList.remove('is-playing');
    }

    refreshMasterButton();
  });

  soundList.appendChild(item);

  return { audio, btn, slider, item };
});

async function unlockAudioContext() {
  if (isAudioUnlocked) return;

  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') {
      await context.resume();
    }
    const buffer = context.createBuffer(1, 1, 22050);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
    source.disconnect();
  } catch (_) {
    // fallback silencioso para navegadores sem suporte completo
  }

  isAudioUnlocked = true;
}

async function safePlay(audio) {
  try {
    await audio.play();
    return true;
  } catch (error) {
    console.warn('Falha ao reproduzir som:', error);
    return false;
  }
}

function refreshMasterButton() {
  const isAnythingPlaying = players.some(({ audio }) => !audio.paused);
  toggleAll.textContent = isAnythingPlaying ? 'Pausar tudo' : 'Tocar tudo';
}

toggleAll.addEventListener('click', async () => {
  await unlockAudioContext();
  const isAnythingPlaying = players.some(({ audio }) => !audio.paused);

  if (isAnythingPlaying) {
    players.forEach(({ audio, btn, item }) => {
      audio.pause();
      btn.textContent = 'Tocar';
      btn.classList.remove('is-playing');
      item.classList.remove('is-playing');
    });
  } else {
    for (const { audio, btn, item } of players) {
      const played = await safePlay(audio);
      if (!played) continue;
      btn.textContent = 'Pausar';
      btn.classList.add('is-playing');
      item.classList.add('is-playing');
    }
  }

  refreshMasterButton();
});

stopAll.addEventListener('click', () => {
  players.forEach(({ audio, btn, item }) => {
    audio.pause();
    audio.currentTime = 0;
    btn.textContent = 'Tocar';
    btn.classList.remove('is-playing');
    item.classList.remove('is-playing');
  });

  refreshMasterButton();
});

masterVolume.addEventListener('input', (event) => {
  globalVolumeFactor = Number(event.target.value) / 100;
  masterVolumeValue.textContent = `${event.target.value}%`;
  players.forEach(({ slider }) => slider.dispatchEvent(new Event('input')));
});

masterVolumeValue.textContent = `${masterVolume.value}%`;
refreshMasterButton();
