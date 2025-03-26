document.addEventListener("DOMContentLoaded", function () {
  // Select song elements
  const songs = Array.from(document.querySelectorAll(".songs__item"));
  const songName = document.querySelector(".song__name");
  const songArtist = document.querySelector(".song__artist");
  const songCover = document.querySelector(".song__cover");
  const playPauseBtn = document.querySelector(".song__play use");
  const nextBtn = document.querySelector(".song__next");
  const prevBtn = document.querySelector(".song__previous");
  const progressBar = document.querySelector(".song__range");
  const currentTimeEl = document.querySelector(".song__current-time");
  const durationEl = document.querySelector(".song__duration");
  const volumeControl = document.querySelector(".song__volume");
  const muteBtn = document.querySelector(".song__mute use");
  const coverDisplay = document.querySelector(".covers-display");
  const loopBtn = document.querySelector(".song__loop use");
  const shuffleBtn = document.querySelector(".song__shuffle use");

  // Delete functionality
  const deleteSongForm = document.getElementById("deleteSongForm");
  const deleteSongNameInput = document.getElementById("deleteSongName"); // Hidden input for song name
  const deletingSongName = document.querySelector(".deleting__songname"); // Text inside modal
  const deleteModal = document.getElementById("deleteConfirmModal");
  const cancelDeleteBtn = document.getElementById("cancelDelete");



  // Audio player variables
  let audio = new Audio();
  let currentIndex = 0;
  let isPlaying = false;
  let isSongSelected = false;
  let isLooping = false;
  let isShuffled = false;
  let shuffledSongs = [...songs]; // Clone original list

  // 🔄 Shuffle function
  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  // 🔄 Update song list UI after shuffle
  function updateSongListUI() {
    const songList = document.querySelector(".songs__list");
    songList.innerHTML = "";
    shuffledSongs.forEach(song => {
      songList.appendChild(song);
    });
  }

  // 🔀 Shuffle button toggle
  function shuffleSongs() {
    isShuffled = !isShuffled;
    if (isShuffled) {
      shuffledSongs = shuffleArray([...songs]);
      shuffleBtn.setAttribute("href", "/static/img/app.svg#icon-menu");
    } else {
      shuffledSongs = [...songs];
      shuffleBtn.setAttribute("href", "/static/img/newicons.svg#icon-shuffle");
    }
    updateSongListUI();
    document.dispatchEvent(new Event("songListUpdated")); // Update delete buttons
  }

  // 🎵 Play a song
  function playSong(index) {
    const songElement = shuffledSongs[index];
    const songUrl = songElement.getAttribute("data-song-url");
    const coverUrl = songElement.querySelector("img").src;
    const name = songElement.querySelector(".songs__title").textContent;
    const artist = songElement.querySelector(".songs__artist").textContent;

    songName.textContent = name;
    songArtist.textContent = artist;
    songCover.src = coverUrl;

    if (coverDisplay) {
      coverDisplay.src = coverUrl;
      coverDisplay.alt = name;
    }

    audio.src = songUrl;
    audio.play();
    isPlaying = true;
    isSongSelected = true;

    playPauseBtn.setAttribute("href", "/static/img/newicons.svg#icon-pause2");

    audio.addEventListener("loadedmetadata", function () {
      durationEl.textContent = formatTime(audio.duration);
      progressBar.max = Math.floor(audio.duration);
    });

    audio.addEventListener("timeupdate", function () {
      progressBar.value = Math.floor(audio.currentTime);
      currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener("ended", function () {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    });
    deletingSongName.textContent = `Are you sure you want to delete "${songName.textContent}"?`;
  }

  // ▶️ Pause & Play
  function togglePlayPause() {
    if (!isSongSelected) {
      playSong(0);
    } else {
      if (isPlaying) {
        audio.pause();
        playPauseBtn.setAttribute(
          "href",
          "/static/img/newicons.svg#icon-play3"
        );
      } else {
        audio.play();
        playPauseBtn.setAttribute(
          "href",
          "/static/img/newicons.svg#icon-pause2"
        );
      }
      isPlaying = !isPlaying;
    }
  }

  // ⏭ Next Song
  function playNext() {
    currentIndex = (currentIndex + 1) % shuffledSongs.length;
    playSong(currentIndex);
  }

  // ⏮ Previous Song
  function playPrevious() {
    currentIndex =
      (currentIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
    playSong(currentIndex);
    console.log(currentIndex);
  }

  // ⏩ Seek song
  function seekSong() {
    audio.currentTime = progressBar.value;
  }

  // 🔊 Change volume
  function changeVolume() {
    audio.volume = volumeControl.value / 100;
  }

  // 🔇 Mute/Unmute
  function muteUnmute() {
    if (audio.muted) {
      audio.muted = false;
      muteBtn.setAttribute(
        "href",
        "/static/img/newicons.svg#icon-volume-medium"
      );
    } else {
      audio.muted = true;
      muteBtn.setAttribute(
        "href",
        "/static/img/newicons.svg#icon-volume-mute2"
      );
    }
  }

  // 🔁 Loop toggle
  function toggleLoop() {
    isLooping = !isLooping;
    loopBtn.setAttribute(
      "href",
      isLooping
        ? "/static/img/music.svg#icon-repeat_one_on"
        : "/static/img/newicons.svg#icon-loop"
    );
  }

  // ⏳ Format time
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  }

  // delete song  form handling
deleteSongForm.addEventListener("submit", function (event) {
  // event.preventDefault(); // Prevent traditional form submission

  const songName = deleteSongNameInput.value; // Get song name from input
  console.log("Deleting song:", songName);

  fetch(`/delete-song/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
    },
    body: JSON.stringify({ song_name: songName }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const currentSong = document.querySelector(
          `.songs__item[data-name="${songName}"]`
        );
        if (currentSong) currentSong.remove(); // Remove song from UI

        // Reset the playlist after deletion
        const songs = Array.from(document.querySelectorAll(".songs__item"));
        currentPlayingIndex = 0;
        if (songs.length > 0) playSong(0);
      } else {
        alert("Failed to delete song.");
      }

      deleteModal.classList.add("hidden"); // Hide modal after deleting
    })
    .catch(error => console.error("Error:", error));
});

// 🗑️ Delete song button setup
function setupDeleteButtons() {
  const songs = Array.from(document.querySelectorAll(".songs__item"));
  const deleteButtons = document.querySelectorAll(".delete__song");

  deleteButtons.forEach((button, index) => {
    button.addEventListener("click", function () {
      const songElement = songs[index];
      const songName = songElement.querySelector(".songs__title").textContent;

      deleteSongNameInput.value = songName; // Store song name in hidden input
      deletingSongName.textContent = `Are you sure you want to delete "${songName.textContent}"?`;

      deleteModal.classList.remove("hidden"); // Show modal
    });
  });
}

// Reinitialize delete buttons when songs change (e.g., after shuffling)
document.addEventListener("songListUpdated", setupDeleteButtons);

// ❌ Cancel delete
cancelDeleteBtn.addEventListener("click", function () {
  deleteModal.classList.add("hidden"); // Hide modal on cancel
});


  // 🎵 Click event for songs
  songs.forEach((song, index) => {
    song.addEventListener("click", function () {
      currentIndex = shuffledSongs.indexOf(song);
      playSong(currentIndex);
    });
  });

  // 🎛️ Control buttons
  playPauseBtn.closest(".song__btn").addEventListener("click", togglePlayPause);
  nextBtn.closest(".song__btn").addEventListener("click", playNext);
  prevBtn.closest(".song__btn").addEventListener("click", playPrevious);
  progressBar.addEventListener("input", seekSong);
  volumeControl.addEventListener("input", changeVolume);
  muteBtn.closest("svg").addEventListener("click", muteUnmute);
  loopBtn.closest("svg").addEventListener("click", toggleLoop);
  shuffleBtn.closest("svg").addEventListener("click", shuffleSongs);

  // Initialize delete buttons
  setupDeleteButtons();
});
