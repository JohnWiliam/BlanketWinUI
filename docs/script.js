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

const SOUND_BASE_PATH = '../Projeto/data/resources/sounds';

const soundList = document.querySelector('#soundList');
const template = document.querySelector('#soundItemTemplate');
const toggleAll = document.querySelector('#toggleAll');
const stopAll = document.querySelector('#stopAll');
const masterVolume = document.querySelector('#masterVolume');
const masterVolumeValue = document.querySelector('#masterVolumeValue');

let globalVolumeFactor = Number(masterVolume.value) / 100;

const players = SOUND_LIBRARY.map(([key, label], index) => {
  const audio = new Audio(`${SOUND_BASE_PATH}/${key}.ogg`);
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
    if (audio.paused) {
      try {
        await audio.play();
        btn.textContent = 'Pausar';
        btn.classList.add('is-playing');
        item.classList.add('is-playing');
      } catch (error) {
        console.error(`Não foi possível tocar ${key}.`, error);
      }
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

function refreshMasterButton() {
  const isAnythingPlaying = players.some(({ audio }) => !audio.paused);
  toggleAll.textContent = isAnythingPlaying ? 'Pausar tudo' : 'Tocar tudo';
}

toggleAll.addEventListener('click', async () => {
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
      try {
        await audio.play();
        btn.textContent = 'Pausar';
        btn.classList.add('is-playing');
        item.classList.add('is-playing');
      } catch (error) {
        console.error('Não foi possível tocar um dos sons.', error);
      }
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
