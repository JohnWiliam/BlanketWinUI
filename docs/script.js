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

let globalVolumeFactor = 0.7;

const players = SOUND_LIBRARY.map(([key, label], index) => {
  const audio = new Audio(`../data/resources/sounds/${key}.ogg`);
  audio.loop = true;
  audio.preload = 'metadata';
  audio.volume = 0.7;

  const item = template.content.firstElementChild.cloneNode(true);
  const title = item.querySelector('.sound-card__title');
  const btn = item.querySelector('.sound-card__toggle');
  const slider = item.querySelector('.sound-card__volume');

  title.textContent = label;
  item.style.animationDelay = `${Math.min(index * 45, 420)}ms`;

  const applyVolume = () => {
    const individual = Number(slider.value) / 100;
    audio.volume = Math.min(individual * globalVolumeFactor, 1);
  };

  slider.addEventListener('input', () => {
    applyVolume();
  });

  applyVolume();

  btn.addEventListener('click', async () => {
    if (audio.paused) {
      await audio.play();
      btn.textContent = 'Pausar';
      btn.classList.add('is-playing');
    } else {
      audio.pause();
      btn.textContent = 'Tocar';
      btn.classList.remove('is-playing');
    }

    refreshMasterButton();
  });

  soundList.appendChild(item);

  return { audio, btn, slider };
});

function refreshMasterButton() {
  const isAnythingPlaying = players.some(({ audio }) => !audio.paused);
  toggleAll.textContent = isAnythingPlaying ? 'Pausar tudo' : 'Tocar tudo';
}

toggleAll.addEventListener('click', async () => {
  const isAnythingPlaying = players.some(({ audio }) => !audio.paused);

  if (isAnythingPlaying) {
    players.forEach(({ audio, btn }) => {
      audio.pause();
      btn.textContent = 'Tocar';
      btn.classList.remove('is-playing');
    });
  } else {
    for (const { audio, btn } of players) {
      await audio.play();
      btn.textContent = 'Pausar';
      btn.classList.add('is-playing');
    }
  }

  refreshMasterButton();
});

stopAll.addEventListener('click', () => {
  players.forEach(({ audio, btn }) => {
    audio.pause();
    audio.currentTime = 0;
    btn.textContent = 'Tocar';
    btn.classList.remove('is-playing');
  });

  refreshMasterButton();
});

masterVolume.addEventListener('input', (event) => {
  globalVolumeFactor = Number(event.target.value) / 100;
  players.forEach(({ slider }) => {
    slider.dispatchEvent(new Event('input'));
  });
});

refreshMasterButton();
