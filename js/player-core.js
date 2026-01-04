// Core Player Logic

function loadMusic(indexNumb) {
    if (!allMusic || !allMusic.length) return;
    const song = allMusic[indexNumb - 1]; // allMusic is 1-based in usage here? No, 0-based array, 1-based index argument

    if (!song) {
        console.error("Song not found for index:", indexNumb);
        return;
    }

    mainAudio.src = `songs/${song.src}.mp3`;
    mainAudio.playbackRate = playbackSpeed;

    // Update play count
    if (!playCounts[indexNumb]) playCounts[indexNumb] = 0;
    playCounts[indexNumb]++;

    // Add to recently played
    recentlyPlayed = recentlyPlayed.filter(idx => idx !== indexNumb);
    recentlyPlayed.unshift(indexNumb);
    if (recentlyPlayed.length > 50) recentlyPlayed.pop();

    saveStatistics();

    // Update Mini Player
    miniName.innerText = song.name;
    miniArtist.innerText = song.artist;
    attemptImageFormats(miniImg, `images/${song.img}`, `images/music-placeholder.webp`);

    // Update FS Player
    fsName.innerText = song.name;
    fsArtist.innerText = song.artist;
    attemptImageFormats(fsImg, `images/${song.img}`, `images/music-placeholder.webp`);

    // Update active class in list
    const allLi = musicListUl.querySelectorAll("li");
    allLi.forEach(li => li.classList.remove("playing"));

    loadLyrics(indexNumb);

    miniImg.onload = () => {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.name,
                artist: song.artist,
                album: song.album || "",
                artwork: [
                    { src: miniImg.src, sizes: "512x512", type: "image/png" },
                ]
            });
        }
        if (colorThief) {
            try {
                // const color = colorThief.getColor(miniImg); // Optional theme color extraction
            } catch (e) { }
        }
    };
}

function playMusic() {
    isMusicPaused = false;
    if (window.equalizer && window.equalizer.audioContext && window.equalizer.audioContext.state === 'suspended') {
        window.equalizer.audioContext.resume();
    }
    mainAudio.play();
    miniPlayPauseBtn.querySelector("i").innerText = "pause";
    fsPlayPauseBtn.querySelector("i").innerText = "pause";
}

function pauseMusic() {
    isMusicPaused = true;
    mainAudio.pause();
    miniPlayPauseBtn.querySelector("i").innerText = "play_arrow";
    fsPlayPauseBtn.querySelector("i").innerText = "play_arrow";
}

function nextMusic() {
    let nextIndex;

    // 1. Check Queue
    if (typeof songQueue !== 'undefined' && songQueue.length > 0) {
        nextIndex = songQueue.shift();
        triggerQueueSave();
        updateQueueUI();
    }
    // 2. Check Shuffle
    else if (isShuffleOn) {
        let randIndex;
        do {
            randIndex = Math.floor((Math.random() * allMusic.length) + 1);
        } while (musicIndex == randIndex && allMusic.length > 1);
        nextIndex = randIndex;
    }
    // 3. Normal Sequential
    else {
        nextIndex = musicIndex + 1;
        if (nextIndex > allMusic.length) {
            nextIndex = 1;
        }
    }

    // Execute Playback
    if (crossfadeDuration > 0 && !isCrossfading) {
        performCrossfade(nextIndex);
    } else {
        musicIndex = nextIndex;
        loadMusic(musicIndex);
        playMusic();
    }
}

function prevMusic() {
    musicIndex--;
    if (musicIndex < 1) {
        musicIndex = allMusic.length;
    }
    loadMusic(musicIndex);
    playMusic();
}

function performCrossfade(nextIndex) {
    if (isCrossfading) return;
    isCrossfading = true;

    // Use nextMusicIndex global if needed, or just local
    nextMusicIndex = nextIndex; // Update global for reference

    const nextSong = allMusic[nextIndex - 1];
    crossfadeAudio.src = `songs/${nextSong.src}.mp3`;
    crossfadeAudio.volume = 0;
    crossfadeAudio.currentTime = 0;

    const fadeOut = () => {
        const fadeInterval = 50;
        const steps = (crossfadeDuration * 1000) / fadeInterval;
        const volumeStep = mainAudio.volume / steps;
        const volumeStepIn = 1 / steps;

        let currentStep = 0;
        const fade = setInterval(() => {
            currentStep++;
            mainAudio.volume = Math.max(0, mainAudio.volume - volumeStep);
            crossfadeAudio.volume = Math.min(1, crossfadeAudio.volume + volumeStepIn);

            if (currentStep >= steps) {
                clearInterval(fade);
                mainAudio.pause();
                mainAudio.currentTime = 0;
                mainAudio.volume = 1;

                // Swap sources
                const temp = mainAudio.src;
                mainAudio.src = crossfadeAudio.src;
                crossfadeAudio.src = temp;

                musicIndex = nextIndex;
                loadMusic(musicIndex);
                mainAudio.play();

                crossfadeAudio.volume = 0;
                isCrossfading = false;
            }
        }, fadeInterval);
    };

    crossfadeAudio.play().then(fadeOut).catch(err => {
        console.error('Crossfade error:', err);
        isCrossfading = false;
        musicIndex = nextIndex;
        loadMusic(musicIndex);
        playMusic();
    });
}
// Alias for backward compatibility if needed, though mostly internal
function startCrossfade() {
    nextMusic();
}

// Media Session Actions
if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", playMusic);
    navigator.mediaSession.setActionHandler("pause", pauseMusic);
    navigator.mediaSession.setActionHandler("previoustrack", prevMusic);
    navigator.mediaSession.setActionHandler("nexttrack", nextMusic);
}

// Global Play From List Wrapper
function playSongFromList(index) {
    musicIndex = index;
    loadMusic(musicIndex);
    playMusic();
}

// Event Listeners for Player Controls
function setupPlayerControls() {
    [miniPlayPauseBtn, fsPlayPauseBtn].forEach(btn => {
        btn.addEventListener("click", () => {
            const isPaused = mainAudio.paused;
            isPaused ? playMusic() : pauseMusic();
        });
    });

    [miniPrevBtn, fsPrevBtn].forEach(btn => {
        if (btn) btn.addEventListener("click", prevMusic);
    });

    [miniNextBtn, fsNextBtn].forEach(btn => {
        if (btn) btn.addEventListener("click", nextMusic);
    });

    if (miniShuffleBtn) {
        miniShuffleBtn.addEventListener("click", () => {
            isShuffleOn = !isShuffleOn;
            miniShuffleBtn.classList.toggle("active", isShuffleOn);
            // Shuffle logic (basic)
        });
    }

    [miniRepeatBtn, fsRepeatBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", () => {
                repeatMode = (repeatMode + 1) % 3;
                if (repeatMode === 0) {
                    btn.innerText = "repeat";
                    btn.classList.remove("active");
                } else if (repeatMode === 1) {
                    btn.innerText = "repeat";
                    btn.classList.add("active");
                } else {
                    btn.innerText = "repeat_one";
                    btn.classList.add("active");
                }
            });
        }
    });

    // Audio Events
    mainAudio.addEventListener("timeupdate", () => {
        const currentTime = mainAudio.currentTime;
        const duration = mainAudio.duration;

        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            if (miniProgressBar) miniProgressBar.style.width = `${progressPercent}%`;
            const fsProgressFill = document.getElementById("fs-progress-bar-fill");
            if (fsProgressFill) fsProgressFill.style.width = `${progressPercent}%`;
        }

        if (miniCurrentTime) miniCurrentTime.innerText = formatTime(currentTime);
        if (fsCurrentTime) fsCurrentTime.innerText = formatTime(currentTime);
        if (miniDuration && duration) miniDuration.innerText = formatTime(duration);
        if (fsDuration && duration) fsDuration.innerText = formatTime(duration);
    });

    mainAudio.addEventListener("ended", () => {
        if (repeatMode === 2) {
            mainAudio.currentTime = 0;
            playMusic();
        } else {
            nextMusic();
        }
    });

    // Progress Bar Click
    [miniProgressArea, fsProgressArea].forEach(area => {
        if (area) {
            area.addEventListener("click", (e) => {
                const progressWidth = area.clientWidth;
                const clickX = e.offsetX;
                const duration = mainAudio.duration;
                mainAudio.currentTime = (clickX / progressWidth) * duration;
            });
        }
    });

    // Volume Slider
    if (miniVolumeSlider) {
        miniVolumeSlider.addEventListener("input", (e) => {
            mainAudio.volume = e.target.value / 100;
            const volumeIcon = document.getElementById("mini-volume-icon");
            if (volumeIcon) {
                if (mainAudio.volume === 0) icon = "volume_off";
                else if (mainAudio.volume < 0.5) icon = "volume_down";
                else icon = "volume_up";
                volumeIcon.innerText = icon;
            }
        });
    }

    // Volume Icon - Click to mute/unmute
    const volumeIcon = document.getElementById("mini-volume-icon");
    if (volumeIcon) {
        let previousVolume = 1;
        volumeIcon.addEventListener("click", () => {
            if (mainAudio.volume > 0) {
                previousVolume = mainAudio.volume;
                mainAudio.volume = 0;
                miniVolumeSlider.value = 0;
                volumeIcon.innerText = "volume_off";
            } else {
                mainAudio.volume = previousVolume;
                miniVolumeSlider.value = previousVolume * 100;
                if (previousVolume < 0.5) {
                    volumeIcon.innerText = "volume_down";
                } else {
                    volumeIcon.innerText = "volume_up";
                }
            }
        });
    }
}
