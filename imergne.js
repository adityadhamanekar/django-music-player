document.addEventListener("DOMContentLoaded", function () {
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
  const deleteBtn = document.querySelector(".delete__song"); // Delete button
  const deleteModal = document.getElementById("deleteConfirmModal");
  const deleteForm = document.getElementById("deleteSongForm");
  const deleteSongIdInput = document.getElementById("deleteSongId");
  const cancelDeleteBtn = document.getElementById("cancelDelete");

  let audio = new Audio();
  let currentIndex = 0;
  let isPlaying = false;
  let isSongSelected = false;
  let isLooping = false;
  let isShuffled = false;
  let shuffledSongs = [...songs]; // Clone the song list
  let selectedSongId = null; // Stores the selected song ID

  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function updateSongListUI() {
    const songList = document.querySelector(".songs__list");
    songList.innerHTML = "";
    shuffledSongs.forEach(song => {
      songList.appendChild(song);
    });
  }

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
  }

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

    selectedSongId = songElement.getAttribute("data-song-id"); // Store song ID

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
  }

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

  function playNext() {
    currentIndex = (currentIndex + 1) % shuffledSongs.length;
    playSong(currentIndex);
  }

  function playPrevious() {
    currentIndex =
      (currentIndex - 1 + shuffledSongs.length) % shuffledSongs.length;
    playSong(currentIndex);
  }

  function seekSong() {
    audio.currentTime = progressBar.value;
  }

  function changeVolume() {
    audio.volume = volumeControl.value / 100;
  }

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

  function toggleLoop() {
    isLooping = !isLooping;
    loopBtn.setAttribute(
      "href",
      isLooping
        ? "/static/img/music.svg#icon-repeat_one_on"
        : "/static/img/newicons.svg#icon-loop"
    );
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  }

  // Handle song selection
  songs.forEach((song, index) => {
    song.addEventListener("click", function () {
      currentIndex = shuffledSongs.indexOf(song);
      playSong(currentIndex);
    });
  });

  // Handle delete button click (opens modal)
  deleteBtn.addEventListener("click", function () {
    if (!selectedSongId) {
      alert("No song selected for deletion.");
      return;
    }

    deleteSongIdInput.value = selectedSongId;
    deleteModal.classList.remove("hidden");
  });

  // Confirm deletion
  deleteForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const songToDelete = document.querySelector(
      `[data-song-id="${selectedSongId}"]`
    );

    if (songToDelete) {
      // Send delete request to Django
      fetch("/delete-song/", {
        method: "POST",
        body: new FormData(deleteForm),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            songToDelete.remove(); // Remove from DOM
            shuffledSongs = shuffledSongs.filter(song => song !== songToDelete);
            deleteModal.classList.add("hidden");

            // Auto-play next song if the deleted song was playing
            if (
              selectedSongId ===
              songs[currentIndex].getAttribute("data-song-id")
            ) {
              playNext();
            }
          } else {
            alert("Error deleting song.");
          }
        })
        .catch(error => console.error("Error:", error));
    }
  });

  // Cancel delete
  cancelDeleteBtn.addEventListener("click", function () {
    deleteModal.classList.add("hidden");
  });

  // Attach event listeners
  playPauseBtn.closest(".song__btn").addEventListener("click", togglePlayPause);
  nextBtn.closest(".song__btn").addEventListener("click", playNext);
  prevBtn.closest(".song__btn").addEventListener("click", playPrevious);
  progressBar.addEventListener("input", seekSong);
  volumeControl.addEventListener("input", changeVolume);
  muteBtn.closest("svg").addEventListener("click", muteUnmute);
  loopBtn.closest("svg").addEventListener("click", toggleLoop);
  shuffleBtn.closest("svg").addEventListener("click", shuffleSongs);
});
