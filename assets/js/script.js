/* All Music Information */
const tracks = [
  {
    backgroundImage: "https://c.saavncdn.com/990/83-Hindi-2021-20211223195221-500x500.jpg",
    posterUrl: "https://c.saavncdn.com/990/83-Hindi-2021-20211223195221-500x500.jpg",
    title: "Lehra Do ",
    album: "Arijit Singh",
    year: 2023,
    artist: "Arijit Singh",
    musicPath: "./assets/music/Lehra Do _ Ranveer Singh, Kabir Khan _ Pritam, Arijit Singh, Kausar Munir.mp3"
  }

];

// -- add eventListener on all elements that are passed--//

const addEventListenerToElements = (elements, eventType, callback) => {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}

/* PLAYLIST  add all music in playlist, from 'tracks' */

const playlistElement = document.querySelector("[data-music-list]");

for (let i = 0, len = tracks.length; i < len; i++) {
  playlistElement.innerHTML += `
  <li>
    <button class="music-item ${i === 0 ? "playing" : ""}" data-playlist-toggler data-playlist-item="${i}">
      <img src="${tracks[i].posterUrl}" width="700" height="700" alt="${tracks[i].title} Album Poster"
        class="img-cover">
      <div class="item-icon">
        <span class="material-symbols-rounded">equalizer</span>
      </div>
    </button>
  </li>
  `;
}

/* PLAYLIST MODAL SIDEBAR TOGGLE show 'playlist' modal sidebar when click on playlist button in top app bar and hide when click on overlay or any playlist-item */

const playlistModal = document.querySelector("[data-playlist]");
const playlistToggleButtons = document.querySelectorAll("[data-playlist-toggler]");
const overlayElement = document.querySelector("[data-overlay]");

const togglePlaylistModal = function () {
  playlistModal.classList.toggle("active");
  overlayElement.classList.toggle("active");
  document.body.classList.toggle("modalActive");
}

addEventListenerToElements(playlistToggleButtons, "click", togglePlaylistModal);

/*  PLAYLIST ITEM remove active state from last time played music and add active state in clicked music */
const playlistItems = document.querySelectorAll("[data-playlist-item]");

let currentTrackIndex = 0;
let lastPlayedTrackIndex = 0;

const changePlaylistItem = function () {
  playlistItems[lastPlayedTrackIndex].classList.remove("playing");
  playlistItems[currentTrackIndex].classList.add("playing");
}

addEventListenerToElements(playlistItems, "click", function () {
  lastPlayedTrackIndex = currentTrackIndex;
  currentTrackIndex = Number(this.dataset.playlistItem);
  changePlaylistItem();
});

/* PLAYER change all visual information on player, based on current music */

const playerBanner = document.querySelector("[data-player-banner]");
const playerTitle = document.querySelector("[data-title]");
const playerAlbum = document.querySelector("[data-album]");
const playerYear = document.querySelector("[data-year]");
const playerArtist = document.querySelector("[data-artist]");

const audioPlayer = new Audio(tracks[currentTrackIndex].musicPath);

const updatePlayerInfo = () => {
  playerBanner.src = tracks[currentTrackIndex].posterUrl;
  playerBanner.setAttribute("alt", `${tracks[currentTrackIndex].title} Album Poster`);
  document.body.style.backgroundImage = `url(${tracks[currentTrackIndex].backgroundImage})`;
  playerTitle.textContent = tracks[currentTrackIndex].title;
  playerAlbum.textContent = tracks[currentTrackIndex].album;
  playerYear.textContent = tracks[currentTrackIndex].year;
  playerArtist.textContent = tracks[currentTrackIndex].artist;

  audioPlayer.src = tracks[currentTrackIndex].musicPath;

  audioPlayer.addEventListener("loadeddata", updateDuration);
  playTrack();
}

addEventListenerToElements(playlistItems, "click", updatePlayerInfo);

/** update player duration */
const playerDuration = document.querySelector("[data-duration]");
const playerSeekBar = document.querySelector("[data-seek]");

/** pass seconds and get timecode format */
const formatTimecode = (duration) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.ceil(duration - (minutes * 60));
  const timecode = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  return timecode;
}

const updateDuration = function () {
  playerSeekBar.max = Math.ceil(audioPlayer.duration);
  playerDuration.textContent = formatTimecode(Number(playerSeekBar.max));
}

audioPlayer.addEventListener("loadeddata", updateDuration);

/* PLAY MUSIC  play and pause music when click on play button */
const playButton = document.querySelector("[data-play-btn]");

let playInterval;

const playTrack = function () {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playButton.classList.add("active");
    playInterval = setInterval(updateCurrentTime, 500);
  } else {
    audioPlayer.pause();
    playButton.classList.remove("active");
    clearInterval(playInterval);
  }
}

playButton.addEventListener("click", playTrack);

/** update running time while playing music */
const playerCurrentTime = document.querySelector("[data-running-time]");

const updateCurrentTime = function () {
  playerSeekBar.value = audioPlayer.currentTime;
  playerCurrentTime.textContent = formatTimecode(audioPlayer.currentTime);

  updateSeekBarFill();
  checkIfTrackEnded();
}

/*SEEK BAR FILL WIDTH change 'seekBarFill' width, while changing seek bar value */
const seekBars = document.querySelectorAll("[data-range]");
const seekBarFill = document.querySelector("[data-range-fill]");

const updateSeekBarFill = function () {
  const rangeValue = (playerSeekBar.value / playerSeekBar.max) * 100;
  seekBarFill.style.width = `${rangeValue}%`;
}


addEventListenerToElements(seekBars, "input", updateSeekBarFill);

/* SEEK MUSIC seek music while changing player seek bar*/
const seekTrack = () => {
  audioPlayer.currentTime = playerSeekBar.value;
  playerCurrentTime.textContent = formatTimecode(playerSeekBar.value);
}

playerSeekBar.addEventListener("input", seekTrack);

/* END MUSIC */
const checkIfTrackEnded = function () {
  if (audioPlayer.ended) {
    playButton.classList.remove("active");
    audioPlayer.currentTime = 0;
    playerSeekBar.value = audioPlayer.currentTime;
    playerCurrentTime.textContent = formatTimecode(audioPlayer.currentTime);
    updateSeekBarFill();
  }
}

/*  SKIP TO NEXT MUSIC */
const nextTrackButton = document.querySelector("[data-skip-next]");

const skipToNextTrack = function () {
  lastPlayedTrackIndex = currentTrackIndex;

  if (isShuffleEnabled) {
    shuffleTrack();
  } else {
    currentTrackIndex >= tracks.length - 1 ? currentTrackIndex = 0 : currentTrackIndex++;
  }

  updatePlayerInfo();
  changePlaylistItem();
}

nextTrackButton.addEventListener("click", skipToNextTrack);

/*  SKIP TO PREVIOUS MUSIC  */
const previousTrackButton = document.querySelector("[data-skip-prev]");

const skipToPreviousTrack = function () {
  lastPlayedTrackIndex = currentTrackIndex;

  if (isShuffleEnabled) {
    shuffleTrack();
  } else {
    currentTrackIndex <= 0 ? currentTrackIndex = tracks.length - 1 : currentTrackIndex--;
  }

  updatePlayerInfo();
  changePlaylistItem();
}

previousTrackButton.addEventListener("click", skipToPreviousTrack);

/* SHUFFLE MUSIC  get random number for shuffle */

const getRandomTrackIndex = () => {
  return Math.floor(Math.random() * tracks.length);
}


const shuffleTrack = () => {
  let randomTrackIndex = getRandomTrackIndex();

  while (currentTrackIndex === randomTrackIndex) {
    randomTrackIndex = getRandomTrackIndex();
  }
  currentTrackIndex = randomTrackIndex;
}

const shuffleButton = document.querySelector("[data-shuffle]");
let isShuffleEnabled = false;

const toggleShuffle = function () {
  shuffleButton.classList.toggle("active");
  isShuffleEnabled = !isShuffleEnabled;
}

shuffleButton.addEventListener("click", toggleShuffle);

/*REPEAT MUSIC*/
const repeatButton = document.querySelector("[data-repeat]");

const toggleRepeat = function () {
  if (!audioPlayer.loop) {
    audioPlayer.loop = true;
    this.classList.add("active");
  } else {
    audioPlayer.loop = false;
    this.classList.remove("active");
  }
}

repeatButton.addEventListener("click", toggleRepeat);

//  MUSIC VOLUME  increase or decrease music volume when change the volume range //
const playerVolumeRange = document.querySelector("[data-volume]");
const playerVolumeBtn = document.querySelector("[data-volume-btn]");
const volumeIcon = playerVolumeBtn.children[0];
const volumeRangefill = document.getElementById("volume-range-fill");

// Change volume based on range input
playerVolumeRange.addEventListener("input", () => {
  const volume = playerVolumeRange.value;
  audioPlayer.volume = volume;
  audioPlayer.muted = false;
  updateVolumeIcon(volume);
  updateVolumeRangeFill(volume);
  console.log(playerVolumeRange.value)
});

// Update volume range fill width
const updateVolumeRangeFill = (volume) => {
  volumeRangefill.style.width = `${volume * 100}%`;
};

// Mute the volume
const muteVolume = () => {
  if (audioPlayer.muted) {
    audioPlayer.muted = false;
    volumeIcon.textContent = "volume_up"; // Set the icon to volume_up when unmuted
    changeVolume();
  } else {
    audioPlayer.muted = true;
    volumeIcon.textContent = "volume_off"; // Set the icon to volume_off when muted
  }
};

playerVolumeBtn.addEventListener("click", muteVolume);


// Update volume icon based on volume value
const updateVolumeIcon = (volume) => {
  if (volume <= 0.1) {
    volumeIcon.textContent = "volume_off";
  } else if (volume <= 0.5) {
    volumeIcon.textContent = "volume_down";
  } else {
    volumeIcon.textContent = "volume_up";
  }
};
// Initialize volume icon based on initial value
updateVolumeIcon(playerVolumeRange.value);
updateVolumeRangeFill(volumeRange.value);

