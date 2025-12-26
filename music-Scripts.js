// DOM Elements
const mainAudio = document.getElementById("main-audio");
const musicListUl = document.getElementById("music-list-ul");
const searchResultsUl = document.getElementById("search-results-ul");
const artistGrid = document.getElementById("artist-grid");
const searchInput = document.getElementById("main-search");

// Mini Player Elements
const miniPlayer = document.querySelector(".player-bar");
const miniImg = document.getElementById("mini-img");
const miniName = document.getElementById("mini-name");
const miniArtist = document.getElementById("mini-artist");
const miniPlayPauseBtn = document.querySelector(".mini-play-pause");
const miniPrevBtn = document.getElementById("mini-prev");
const miniNextBtn = document.getElementById("mini-next");
const miniProgressBar = document.getElementById("mini-progress-bar");
const miniProgressArea = document.getElementById("mini-progress-area");
const miniVolumeSlider = document.getElementById("mini-volume");
const miniShuffleBtn = document.getElementById("mini-shuffle");
const miniRepeatBtn = document.getElementById("mini-repeat");
const expandPlayerBtn = document.getElementById("expand-player");

// Full Screen Player Elements
const fsPlayer = document.querySelector(".full-screen-player");
const collapsePlayerBtn = document.getElementById("collapse-player");
const fsImg = document.getElementById("fs-img");
const fsName = document.getElementById("fs-name");
const fsArtist = document.getElementById("fs-artist");
const fsPlayPauseBtn = document.querySelector(".fs-play-pause");
const fsPrevBtn = document.getElementById("fs-prev");
const fsNextBtn = document.getElementById("fs-next");
const fsProgressBar = document.getElementById("fs-progress-bar");
const fsProgressArea = document.getElementById("fs-progress-area");
const fsCurrentTime = document.getElementById("fs-current-time");
const fsDuration = document.getElementById("fs-max-duration");
const miniCurrentTime = document.getElementById("mini-current");
const miniDuration = document.getElementById("mini-duration");
const fsRepeatBtn = document.getElementById("fs-repeat");
const fsLyricsToggle = document.getElementById("fs-lyrics-toggle");
const lyricsOverlay = document.querySelector(".lyrics-overlay"); // Assuming shared overlay logic
const lyricsContentFs = document.querySelector(".lyrics-content-fs");
const lyricsCloseFs = document.getElementById("lyrics-close-fs");

// Artist Details Elements
const artistDetailsView = document.getElementById("artist-details-view");
const artistBackBtn = document.getElementById("artist-back");
const adImg = document.getElementById("ad-img");
const adName = document.getElementById("ad-name");
const adPlayAll = document.getElementById("ad-play-all");
const artistSongsUl = document.getElementById("artist-songs-ul");

// Album View Elements
const albumGrid = document.getElementById("album-grid");
const albumDetailsView = document.getElementById("album-details-view");
const albumBackBtn = document.getElementById("album-back");
const albumDetailImg = document.getElementById("album-detail-img");
const albumDetailName = document.getElementById("album-detail-name");
const albumDetailArtist = document.getElementById("album-detail-artist");
const albumPlayAll = document.getElementById("album-play-all");
const albumSongsUl = document.getElementById("album-songs-ul");

// Featured Content Elements
const featuredAlbums = document.getElementById("featured-albums");
const featuredArtists = document.getElementById("featured-artists");
const greetingText = document.getElementById("greeting-text");

// Settings Elements
const settingsTabs = document.querySelectorAll(".settings-tab");
const settingsPanels = document.querySelectorAll(".settings-panel");
const themeOptions = document.querySelectorAll(".theme-option");
const customColorPicker = document.getElementById("custom-theme-color");

// Variables
let musicIndex = 1;
let isMusicPaused = true;
let colorThief;

// Initialize
window.addEventListener("load", () => {
    if (typeof ColorThief !== 'undefined') {
        colorThief = new ColorThief();
    }

    // Initialize Theme Manager
    themeManager = new ThemeManager();

    // Load saved theme
    const savedTheme = themeManager.loadTheme();
    if (savedTheme) {
        const themeOption = document.querySelector(`[data-theme="${savedTheme.name}"]`);
        if (themeOption) {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            themeOption.classList.add('active');
        }
    }

    // Update greeting based on time
    updateGreeting();

    // Sort logic? Or just load default
    loadMusicList(allMusic, musicListUl); // Load Home
    loadArtists();
    loadAlbums();
    loadFeaturedContent();

    // Load first song but don't play
    loadMusic(musicIndex);

    // Setup Navigation
    setupNavigation();

    // Setup Settings
    setupSettings();

    // Setup Player Animation
    setupPlayerAnimation();

    // Initialize Queue and Visualizer
    initializeQueueAndVisualizer();

    // Setup Lyrics (Refactored to lyrics.js)
    if (typeof setupLyricsHandlers === 'function') {
        setupLyricsHandlers();
    }
});

// Render Music List
function loadMusicList(list, container) {
    container.innerHTML = "";
    if (list.length === 0) {
        container.innerHTML = `<li style="justify-content:center;">No songs found</li>`;
        return;
    }

    list.forEach((song, i) => {
        // Find actual index in allMusic to keep correct reference
        let originalIndex = allMusic.indexOf(song) + 1;

        let li = document.createElement("li");
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        const imgEl = document.createElement('img');
        attemptImageFormats(imgEl, `images/${song.img}`, `images/music-placeholder.jpg`);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        infoDiv.innerHTML = `<span>${song.name}</span><p>${song.artist}</p>`;

        rowDiv.appendChild(imgEl);
        rowDiv.appendChild(infoDiv);
        li.appendChild(rowDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'row';
        actionsDiv.innerHTML = `
            <i class="material-icons add-to-queue" title="Add to queue">queue_music</i>
            <span class="audio-duration" id="duration-${originalIndex}">3:30</span>
        `;
        li.appendChild(actionsDiv);

        // Song click handler
        li.addEventListener("click", (e) => {
            if (!e.target.classList.contains('add-to-queue')) {
                playSongFromList(originalIndex);
            }
        });

        // Add to queue button
        const queueBtn = li.querySelector('.add-to-queue');
        queueBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            addToQueue(originalIndex);
        });

        // Check if playing
        if (originalIndex === musicIndex) {
            li.classList.add("playing");
        }

        container.appendChild(li);

        // Attempt to load duration (optional optimization: don't load all audio tags, costly)
        // Just leaving default or loading on demand is better for large lists.
        // For now, we omit the generic duration loading loop to improve performance with large lists.
    });
}

function playSongFromList(index) {
    musicIndex = index;
    loadMusic(musicIndex);
    playMusic();
}

// Artist Logic
// Artist Logic
function loadArtists() {
    // Group by artist
    const artists = {};
    allMusic.forEach(song => {
        const artistName = song.artist || "Unknown Artist";
        if (!artists[artistName]) {
            artists[artistName] = [];
        }
        artists[artistName].push(song);
    });

    artistGrid.innerHTML = "";
    Object.keys(artists).forEach(artist => {
        const firstSong = artists[artist][0];
        let div = document.createElement("div");
        div.classList.add("artist-card");

        const imgEl = document.createElement('img');

        // Priority: 1. artistImg override, 2. slugified name, 3. fallback to song image
        const artistSlug = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const override = firstSong.artistImg;

        // Cascading fallback: 1. artistImg override, 2. slugified name, 3. exact name, 4. fallback song image, 5. global placeholder
        const artistPaths = [];
        if (override) artistPaths.push(`images/artists/${override}`);
        artistPaths.push(`images/artists/${artistSlug}`);
        artistPaths.push(`images/artists/${artist}`);
        artistPaths.push(`images/${firstSong.img}`);

        attemptImageFormats(imgEl, artistPaths, `images/music-placeholder.jpg`);

        const h3 = document.createElement('h3');
        h3.textContent = artist;
        div.appendChild(imgEl);
        div.appendChild(h3);
        div.onclick = () => {
            loadArtistDetails(artist, artists[artist]);
        };
        artistGrid.appendChild(div);
    });
}

function loadArtistDetails(artistName, songs) {
    // Populate details
    adName.innerText = artistName;
    // Priority: 1. artistImg override, 2. slugified name, 3. fallback to song image
    const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const override = songs[0].artistImg;

    // Cascading fallback: 1. artistImg override, 2. slugified name, 3. exact name, 4. fallback song image, 5. global placeholder
    const artistPaths = [];
    if (override) artistPaths.push(`images/artists/${override}`);
    artistPaths.push(`images/artists/${artistSlug}`);
    artistPaths.push(`images/artists/${artistName}`);
    artistPaths.push(`images/${songs[0].img}`);

    attemptImageFormats(adImg, artistPaths, `images/music-placeholder.jpg`);

    // Populate list
    artistSongsUl.innerHTML = "";
    songs.forEach(song => {
        let originalIndex = allMusic.indexOf(song) + 1;
        let li = document.createElement("li");
        // Build song row with queue toggle icon that reflects current queue state
        const inQueue = songQueue.includes(originalIndex);
        li.innerHTML = `
            <div class="row">
                 <span>${song.name}</span>
            </div>
            <div class="row">
                <i class="material-icons queue-toggle" title="${inQueue ? 'Remove from queue' : 'Add to queue'}">${inQueue ? 'remove_circle' : 'queue_music'}</i>
                <span class="audio-duration">${song.artist}</span>
            </div>
        `;

        // Keyboard and click: Enter to play, Q to toggle queue
        li.setAttribute('tabindex', '0');
        li.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'q') {
                e.preventDefault();
                toggleQueueForSong(originalIndex, li);
            } else if (e.key === 'Enter') {
                playSongFromList(originalIndex);
            }
        });

        // Click to play (but not when pressing queue-toggle)
        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('queue-toggle')) {
                playSongFromList(originalIndex);
            }
        });

        // Add/Remove to queue button
        const queueBtn = li.querySelector('.queue-toggle');
        if (queueBtn) {
            queueBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleQueueForSong(originalIndex, li);
            });
        }
        artistSongsUl.appendChild(li);
    });

    // Add artist-level queue actions
    const adAddAll = document.getElementById('ad-add-all-queue');
    const adClear = document.getElementById('ad-clear-artist-queue');
    if (adAddAll) {
        adAddAll.onclick = () => {
            songs.forEach(s => addToQueue(allMusic.indexOf(s) + 1));
            showNotification(`Added ${songs.length} songs by ${artistName} to queue`);
            updateQueueUI();
            // refresh rows to show remove icons
            loadArtistDetails(artistName, songs);
        };
    }
    if (adClear) {
        adClear.onclick = () => {
            songs.forEach(s => removeFromQueue(allMusic.indexOf(s) + 1));
            showNotification(`Removed ${songs.length} songs by ${artistName} from queue`);
            updateQueueUI();
            loadArtistDetails(artistName, songs);
        };
    }

    // Helper to switch view
    document.querySelector(".view.active").classList.remove("active");
    artistDetailsView.classList.add("active");

    // Play all handler
    adPlayAll.onclick = () => {
        // Play first song
        playSongFromList(allMusic.indexOf(songs[0]) + 1);
    };
}

artistBackBtn.addEventListener("click", () => {
    artistDetailsView.classList.remove("active");
    // Determine where to go back? For now default to Artists view
    document.getElementById("artists-view").classList.add("active");
    // Also ensure tab is active visually?
    document.querySelectorAll(".sidebar li").forEach(l => l.classList.remove("active"));
    document.querySelector('[data-view="artists"]').classList.add("active");
});

// Core Player Logic
function loadMusic(indexNumb) {
    const song = allMusic[indexNumb - 1];

    mainAudio.src = `songs/${song.src}.mp3`; // scan_songs saves 'src' as just filename usually

    // Update Mini Player
    miniName.innerText = song.name;
    miniArtist.innerText = song.artist;
    attemptImageFormats(miniImg, `images/${song.img}`, `images/music-placeholder.jpg`);

    // Update FS Player
    fsName.innerText = song.name;
    fsArtist.innerText = song.artist;
    attemptImageFormats(fsImg, `images/${song.img}`, `images/music-placeholder.jpg`);

    // Update Media Session Metadata
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artist,
            album: song.album || "",
            artwork: [
                { src: `images/${song.img}.jpg`, sizes: "512x512", type: "image/jpeg" },
                { src: `images/${song.img}.webp`, sizes: "512x512", type: "image/webp" },
                { src: `images/artists/${song.artistImg || 'placeholder'}.jpg`, sizes: "512x512", type: "image/jpeg" }
            ]
        });
    }

    // Update active class in list
    const allLi = musicListUl.querySelectorAll("li");
    allLi.forEach(li => li.classList.remove("playing"));
    // This simple index matching works if showing all songs. 
    // If filtered, we might not find it easily by index, but that's a minor UX detail.

    // Load Lyrics
    loadLyrics(indexNumb);

    // Background Color
    miniImg.onload = () => {
        if (colorThief) {
            try {
                const color = colorThief.getColor(miniImg);
                // document.body.style.background = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                // Keep the light gradient but maybe hint at the color?
                // Let's stick to the CSS gradient for the requested theme.
            } catch (e) { }
        }
    };
}

function playMusic() {
    isMusicPaused = false;
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
    musicIndex++;
    if (musicIndex > allMusic.length) {
        musicIndex = 1;
    }
    loadMusic(musicIndex);
    playMusic();
}

function prevMusic() {
    musicIndex--;
    if (musicIndex < 1) {
        musicIndex = allMusic.length;
    }
    loadMusic(musicIndex);
    playMusic();
}

// Controls Events
[miniPlayPauseBtn, fsPlayPauseBtn].forEach(btn => {
    btn.addEventListener("click", () => {
        const isPaused = mainAudio.paused;
        isPaused ? playMusic() : pauseMusic();
    });
});

[miniNextBtn, fsNextBtn].forEach(btn => {
    btn.addEventListener("click", () => nextMusicWithQueue());
});

[miniPrevBtn, fsPrevBtn].forEach(btn => {
    btn.addEventListener("click", () => prevMusic());
});

// Progress Bar
mainAudio.addEventListener("timeupdate", (e) => {
    const currentTime = e.target.currentTime;
    const duration = e.target.duration;

    if (isNaN(duration)) return;

    let progressWidth = (currentTime / duration) * 100;

    // Update both bars
    miniProgressBar.style.width = `${progressWidth}%`;
    fsProgressBar.style.width = `${progressWidth}%`;

    // Update Timer (Full Screen)
    let currentMin = Math.floor(currentTime / 60);
    let currentSec = Math.floor(currentTime % 60);
    if (currentSec < 10) currentSec = `0${currentSec}`;
    fsCurrentTime.innerText = `${currentMin}:${currentSec}`;

    let totalMin = Math.floor(duration / 60);
    let totalSec = Math.floor(duration % 60);
    if (totalSec < 10) totalSec = `0${totalSec}`;
    fsDuration.innerText = `${totalMin}:${totalSec}`;

    // Update Mini Player Timer
    miniCurrentTime.innerText = `${currentMin}:${currentSec}`;
    miniDuration.innerText = `${totalMin}:${totalSec}`;

    // Sync Lyrics
    updateLyrics(currentTime);
});

// Seek
function seek(e, area) {
    let progressWidthVal = area.clientWidth;
    let clickedOffsetX = e.offsetX;
    let songDuration = mainAudio.duration;

    mainAudio.currentTime = (clickedOffsetX / progressWidthVal) * songDuration;
    playMusic();
}

miniProgressArea.addEventListener("click", (e) => seek(e, miniProgressArea));
fsProgressArea.addEventListener("click", (e) => seek(e, fsProgressArea));

// Repeat Logic
// Default: repeat list.
// Logic:
// if repeat: nextMusic()
// if repeat_one: currentTime = 0
// if shuffle: random
mainAudio.addEventListener("ended", () => {
    let getText = fsRepeatBtn.innerText;

    switch (getText) {
        case "repeat":
            nextMusic();
            break;
        case "repeat_one":
            mainAudio.currentTime = 0;
            playMusic();
            break;
        case "shuffle":
            let randIndex;
            do {
                randIndex = Math.floor(Math.random() * allMusic.length) + 1;
            } while (musicIndex === randIndex);
            musicIndex = randIndex;
            loadMusic(musicIndex);
            playMusic();
            break;
    }
});

fsRepeatBtn.addEventListener("click", () => {
    let getText = fsRepeatBtn.innerText;
    switch (getText) {
        case "repeat":
            fsRepeatBtn.innerText = "repeat_one";
            break;
        case "repeat_one":
            fsRepeatBtn.innerText = "shuffle";
            break;
        case "shuffle":
            fsRepeatBtn.innerText = "repeat";
            break;
    }
    syncShuffleParams();
});

if (miniShuffleBtn) {
    miniShuffleBtn.addEventListener("click", () => {
        let text = miniShuffleBtn.innerText;
        switch (text) {
            case "shuffle":
                miniShuffleBtn.innerText = "repeat"; // Toggle off? No, cycle like other one
                // Actually user asked for shuffle button. Usually it's a toggle. 
                // But let's keep consistent with cycle: repeat -> repeat_one -> shuffle
                // Or just toggle shuffle?
                // Let's mirror the main one.
                // If main is shuffle, click -> repeat.
                break;
        }
        // Let's just trigger the fsRepeatBtn click to reuse logic?
        fsRepeatBtn.click();
    });
}

if (miniRepeatBtn) {
    miniRepeatBtn.addEventListener("click", () => {
        fsRepeatBtn.click();
    });
}

function syncShuffleParams() {
    // Sync mini buttons with FS buttons
    const state = fsRepeatBtn.innerText;
    if (miniShuffleBtn) miniShuffleBtn.innerText = state === "shuffle" ? "shuffle_on" : "shuffle"; // If icon font supports
    // Material icons: shuffle, shuffle_on (maybe not). 
    // Let's simple reuse the cycle logic visual.
    if (miniRepeatBtn) miniRepeatBtn.innerText = state;
    if (miniShuffleBtn) {
        if (state === 'shuffle') {
            miniShuffleBtn.style.color = "var(--highlight)";
        } else {
            miniShuffleBtn.style.color = "";
        }
    }
}

// Volume sync
miniVolumeSlider.addEventListener("input", (e) => {
    mainAudio.volume = e.target.value / 100;
});

// Expand / Collapse Player
expandPlayerBtn.addEventListener("click", () => {
    fsPlayer.classList.add("active");
});

collapsePlayerBtn.addEventListener("click", () => {
    fsPlayer.classList.remove("active");
});

// Search Logic
searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allMusic.filter(song =>
        song.name.toLowerCase().includes(term) ||
        song.artist.toLowerCase().includes(term)
    );
    loadMusicList(filtered, searchResultsUl);
});

// Tabs Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll(".sidebar li");
    const views = document.querySelectorAll(".view");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            // Remove active
            navItems.forEach(nav => nav.classList.remove("active"));
            views.forEach(view => view.classList.remove("active"));

            // Add active
            item.classList.add("active");
            const viewId = item.getAttribute("data-view");
            document.getElementById(`${viewId}-view`).classList.add("active");

            // Reset Home title if coming back
            if (viewId === 'home') {
                document.querySelector("#home-view .section-title h3").innerText = "Trending Now";
                loadMusicList(allMusic, musicListUl);
            }
        });
    });
}


// Lyrics logic refactored to lyrics.js

// Keyboard Controls
document.addEventListener("keydown", (e) => {
    // Check if user is typing
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
    }

    if (e.code === "Space") {
        e.preventDefault();
        const isPaused = mainAudio.paused;
        isPaused ? playMusic() : pauseMusic();
    } else if (e.code === "ArrowRight") {
        mainAudio.currentTime += 5;
    } else if (e.code === "ArrowLeft") {
        mainAudio.currentTime -= 5;
    }
});

// Media Session Actions (Hardware Keys)
if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", playMusic);
    navigator.mediaSession.setActionHandler("pause", pauseMusic);
    navigator.mediaSession.setActionHandler("previoustrack", prevMusic);
    navigator.mediaSession.setActionHandler("nexttrack", nextMusic);
}
// New functions appended to music-Scripts.js

// Update greeting based on time of day
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 18) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }
    if (greetingText) {
        greetingText.innerText = greeting;
    }
}

// Load Albums
function loadAlbums() {
    // Group by album
    const albums = {};
    allMusic.forEach(song => {
        const albumName = song.album || "Unknown Album";
        if (!albums[albumName]) {
            albums[albumName] = {
                name: albumName,
                artist: song.artist,
                img: song.img,
                albumImg: song.albumImg, // Take from metadata
                songs: []
            };
        }
        albums[albumName].songs.push(song);
    });

    if (!albumGrid) return;
    albumGrid.innerHTML = "";
    Object.keys(albums).forEach(albumName => {
        const album = albums[albumName];
        let div = document.createElement("div");
        div.classList.add("album-card");

        // Fixed: Use innerHTML for structure FIRST, then handle the image
        div.innerHTML = `
            <img class="album-img-target" alt="${album.name}">
            <h3>${album.name}</h3>
            <p>${album.artist}</p>
        `;

        const imgEl = div.querySelector('.album-img-target');
        const albumSlug = album.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Cascading fallback: 1. albumImg override, 2. slugified name, 3. exact name, 4. fallback song image, 5. global placeholder
        const albumPaths = [];
        if (album.albumImg) albumPaths.push(`images/albums/${album.albumImg}`);
        albumPaths.push(`images/albums/${albumSlug}`);
        albumPaths.push(`images/albums/${album.name}`);
        albumPaths.push(`images/${album.img}`);

        attemptImageFormats(imgEl, albumPaths, `images/music-placeholder.jpg`);

        div.onclick = () => {
            loadAlbumDetails(album);
        };
        albumGrid.appendChild(div);
    });
}

// Load Album Details
function loadAlbumDetails(album) {
    albumDetailName.innerText = album.name;
    albumDetailArtist.innerText = album.artist;
    // Priority: 1. albumImg override, 2. slugified name, 3. fallback to song image
    const albumSlug = album.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Cascading fallback: Specific Album Folder -> Song Thumbnail -> Placeholder
    const albumImagePaths = [];
    if (album.albumImg) albumImagePaths.push(`images/albums/${album.albumImg}`);
    albumImagePaths.push(`images/albums/${albumSlug}`);
    albumImagePaths.push(`images/albums/${album.name}`);
    albumImagePaths.push(`images/${album.img}`);
    attemptImageFormats(albumDetailImg, albumImagePaths, `images/music-placeholder.jpg`);

    // Populate list
    albumSongsUl.innerHTML = "";
    album.songs.forEach(song => {
        let originalIndex = allMusic.indexOf(song) + 1;
        let li = document.createElement("li");
        // Use queue-toggle icon same as artist list
        const inQueue = songQueue.includes(originalIndex);
        li.innerHTML = `
            <div class="row">
                 <span>${song.name}</span>
            </div>
            <div class="row">
                <i class="material-icons queue-toggle" title="${inQueue ? 'Remove from queue' : 'Add to queue'}">${inQueue ? 'remove_circle' : 'queue_music'}</i>
                <span class="audio-duration">${song.artist}</span>
            </div>
        `;

        li.setAttribute('tabindex', '0');
        li.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'q') {
                e.preventDefault();
                toggleQueueForSong(originalIndex, li);
            } else if (e.key === 'Enter') {
                playSongFromList(originalIndex);
            }
        });

        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('queue-toggle')) {
                playSongFromList(originalIndex);
            }
        });

        const queueBtn = li.querySelector('.queue-toggle');
        if (queueBtn) {
            queueBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleQueueForSong(originalIndex, li);
            });
        }
        albumSongsUl.appendChild(li);
    });

    // Album-level queue actions
    const albumAddAll = document.getElementById('album-add-all-queue');
    const albumClear = document.getElementById('album-clear-queue');
    if (albumAddAll) {
        albumAddAll.onclick = () => {
            album.songs.forEach(s => addToQueue(allMusic.indexOf(s) + 1));
            showNotification(`Added ${album.songs.length} songs from ${album.name} to queue`);
            updateQueueUI();
            loadAlbumDetails(album);
        };
    }
    if (albumClear) {
        albumClear.onclick = () => {
            album.songs.forEach(s => removeFromQueue(allMusic.indexOf(s) + 1));
            showNotification(`Removed ${album.songs.length} songs from ${album.name} from queue`);
            updateQueueUI();
            loadAlbumDetails(album);
        };
    }

    // Switch view
    document.querySelector(".view.active").classList.remove("active");
    albumDetailsView.classList.add("active");

    // Play all handler
    albumPlayAll.onclick = () => {
        playSongFromList(allMusic.indexOf(album.songs[0]) + 1);
    };
}

// Album back button
if (albumBackBtn) {
    albumBackBtn.addEventListener("click", () => {
        albumDetailsView.classList.remove("active");
        document.getElementById("albums-view").classList.add("active");
        document.querySelectorAll(".sidebar li").forEach(l => l.classList.remove("active"));
        document.querySelector('[data-view="albums"]').classList.add("active");
    });
}

// Load Featured Content
function loadFeaturedContent() {
    // Featured Albums - random selection
    const albums = {};
    allMusic.forEach(song => {
        const albumName = song.album || "Unknown Album";
        if (!albums[albumName]) {
            albums[albumName] = {
                name: albumName,
                artist: song.artist,
                img: song.img,
                songs: []
            };
        }
        albums[albumName].songs.push(song);
    });

    const albumNames = Object.keys(albums);
    const shuffledAlbums = albumNames.sort(() => 0.5 - Math.random()).slice(0, 6);

    if (featuredAlbums) {
        featuredAlbums.innerHTML = "";
        shuffledAlbums.forEach(albumName => {
            const album = albums[albumName];
            let div = document.createElement("div");
            div.classList.add("featured-album");
            // Use image helper to prefer webp/png/jpg
            const imgEl = document.createElement('img');
            attemptImageFormats(imgEl, `images/${album.img}`, 'images/music-placeholder.jpg');
            const h4 = document.createElement('h4'); h4.textContent = album.name;
            const p = document.createElement('p'); p.textContent = album.artist;
            div.appendChild(imgEl); div.appendChild(h4); div.appendChild(p);
            div.onclick = () => {
                document.querySelector('[data-view="albums"]').click();
                setTimeout(() => loadAlbumDetails(album), 100);
            };
            featuredAlbums.appendChild(div);
        });
    }

    // Featured Artists - random selection
    const artists = {};
    allMusic.forEach(song => {
        const artistName = song.artist || "Unknown Artist";
        if (!artists[artistName]) {
            artists[artistName] = [];
        }
        artists[artistName].push(song);
    });

    const artistNames = Object.keys(artists);
    const shuffledArtists = artistNames.sort(() => 0.5 - Math.random()).slice(0, 6);

    if (featuredArtists) {
        featuredArtists.innerHTML = "";
        shuffledArtists.forEach(artistName => {
            const songs = artists[artistName];
            const firstSong = songs[0];
            let div = document.createElement("div");
            div.classList.add("featured-artist");
            const imgEl = document.createElement('img');
            // artists fallback: try artist-specific
            const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // Cascading fallback: Specific Artist Folder -> Song Thumbnail -> Placeholder
            attemptImageFormats(imgEl, [
                `images/artists/${artistSlug}`,
                `images/artists/${artistName}`,
                `images/${firstSong.img}`
            ], `images/music-placeholder.jpg`);
            const h4 = document.createElement('h4'); h4.textContent = artistName;
            div.appendChild(imgEl); div.appendChild(h4);
            div.onclick = () => {
                document.querySelector('[data-view="artists"]').click();
                setTimeout(() => loadArtistDetails(artistName, artists[artistName]), 100);
            };
            featuredArtists.appendChild(div);
        });
    }
}

// Helper: attempt multiple image extensions on an img element in order: webp -> png -> jpg -> jpeg -> finalFallback
// Now supports an array of basePathsNoExt for cascading fallbacks
function attemptImageFormats(imgEl, basePathsNoExt, finalFallback) {
    const extensions = ['.webp', '.png', '.jpg', '.jpeg'];
    // Ensure basePathsNoExt is an array
    const paths = Array.isArray(basePathsNoExt) ? basePathsNoExt : [basePathsNoExt];

    let pathIndex = 0;
    let extIndex = 0;

    function tryNext() {
        if (pathIndex < paths.length) {
            if (extIndex < extensions.length) {
                const currentPath = `${paths[pathIndex]}${extensions[extIndex]}`;
                extIndex++;
                imgEl.src = currentPath;
            } else {
                // Done with all extensions for this path, move to next path
                pathIndex++;
                extIndex = 0;
                tryNext();
            }
        } else if (finalFallback) {
            imgEl.onerror = null;
            imgEl.src = finalFallback;
        }
    }

    imgEl.onerror = tryNext;
    tryNext();
}

// Setup Settings
function setupSettings() {
    // Settings Tabs
    settingsTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetPanel = tab.getAttribute("data-settings-tab");

            settingsTabs.forEach(t => t.classList.remove("active"));
            settingsPanels.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(`${targetPanel}-panel`).classList.add("active");
        });
    });

    // Initialize default tab panel
    const activeTab = document.querySelector(".settings-tab.active");
    if (activeTab) {
        const targetPanel = activeTab.getAttribute("data-settings-tab");
        settingsPanels.forEach(p => p.classList.remove("active"));
        const panel = document.getElementById(`${targetPanel}-panel`);
        if (panel) panel.classList.add("active");
    }

    // Theme Options
    themeOptions.forEach(option => {
        option.addEventListener("click", () => {
            const themeName = option.getAttribute("data-theme");

            themeOptions.forEach(o => o.classList.remove("active"));
            option.classList.add("active");

            if (themeName === "custom") {
                document.querySelector(".custom-color-picker").style.display = "block";
            } else {
                document.querySelector(".custom-color-picker").style.display = "none";
                themeManager.applyTheme(themeName);
            }
        });
    });

    // Custom Color Picker
    if (customColorPicker) {
        customColorPicker.addEventListener("input", (e) => {
            themeManager.applyTheme("custom", e.target.value);
        });
    }
}

// Setup Player Animation
function setupPlayerAnimation() {
    // Override existing expand/collapse handlers
    expandPlayerBtn.removeEventListener("click", expandPlayerBtn._clickHandler || null);
    collapsePlayerBtn.removeEventListener("click", collapsePlayerBtn._clickHandler || null);

    const expandHandler = () => {
        fsPlayer.classList.remove("closing");
        fsPlayer.classList.add("active");
    };

    const collapseHandler = () => {
        fsPlayer.classList.add("closing");

        // If visualizer is active, stop it immediately when collapsing
        try {
            const visualizerCanvas = document.getElementById('audio-visualizer');
            const visualizerToggle = document.getElementById('fs-visualizer-toggle');
            if (window.visualizer && window.visualizer.isActive) {
                window.visualizer.stop();
                if (visualizerCanvas) visualizerCanvas.classList.remove('active');
                if (visualizerToggle) {
                    visualizerToggle.classList.remove('active');
                    visualizerToggle.setAttribute('aria-pressed', 'false');
                }
            }
        } catch (e) {
            console.warn('Error stopping visualizer during collapse:', e);
        }

        setTimeout(() => {
            fsPlayer.classList.remove("active", "closing");
        }, 500);
    };

    expandPlayerBtn._clickHandler = expandHandler;
    collapsePlayerBtn._clickHandler = collapseHandler;

    expandPlayerBtn.addEventListener("click", expandHandler);
    collapsePlayerBtn.addEventListener("click", collapseHandler);
}
// Queue and Visualizer Functions for music-Scripts.js

// Queue Management
let songQueue = [];

// Initialize Queue and Visualizer
function initializeQueueAndVisualizer() {
    // Load saved queue
    const savedQueue = localStorage.getItem('songQueue');
    if (savedQueue) {
        try {
            songQueue = JSON.parse(savedQueue);
            updateQueueUI();
        } catch (e) {
            console.error('Failed to load queue:', e);
        }
    }

    // Initialize visualizer
    const visualizerCanvas = document.getElementById('audio-visualizer');
    if (visualizerCanvas) {
        visualizer = new AudioVisualizer(mainAudio, visualizerCanvas);
    }

    setupQueueHandlers();
    setupVisualizerHandlers();
}

// Setup Queue Event Handlers
function setupQueueHandlers() {
    const queueToggle = document.getElementById('fs-queue-toggle');
    const queuePanel = document.querySelector('.queue-panel');
    const queueClose = document.getElementById('queue-close');
    const clearQueueBtn = document.getElementById('clear-queue');

    if (queueToggle) {
        queueToggle.addEventListener('click', () => {
            queuePanel.classList.toggle('show');
            queueToggle.classList.toggle('active');
        });
    }

    if (queueClose) {
        queueClose.addEventListener('click', () => {
            queuePanel.classList.remove('show');
            queueToggle.classList.remove('active');
        });
    }

    if (clearQueueBtn) {
        clearQueueBtn.addEventListener('click', () => {
            songQueue = [];
            saveQueue();
            updateQueueUI();
        });
    }
}

// Setup Visualizer Event Handlers
function setupVisualizerHandlers() {
    const visualizerToggle = document.getElementById('fs-visualizer-toggle');
    const visualizerCanvas = document.getElementById('audio-visualizer');

    if (visualizerToggle && visualizer) {
        // Remove any existing handlers to avoid duplicate listeners
        visualizerToggle.removeEventListener('click', visualizerToggle._toggleHandler || null);
        visualizerToggle.removeEventListener('dblclick', visualizerToggle._cycleHandler || null);
        visualizerToggle.removeEventListener('keydown', visualizerToggle._keyHandler || null);
        visualizerToggle.removeEventListener('mousedown', visualizerToggle._mouseDownHandler || null);
        // Accessibility hints
        visualizerToggle.setAttribute('title', visualizerToggle.getAttribute('title') || 'Toggle Visualizer (double-click to change style)');
        visualizerToggle.setAttribute('role', 'button');
        visualizerToggle.setAttribute('tabindex', '0');

        const styleNames = {
            'bars': 'Frequency Bars',
            'waveform': 'Waveform',
            'circular': 'Circular'
        };

        // Single click toggles On/Off
        const toggleHandler = (e) => {
            // If turning off, just stop immediately
            if (visualizer.isActive) {
                visualizer.stop();
                visualizerToggle.classList.remove('active');
                visualizerCanvas.classList.remove('active');
                visualizerToggle.setAttribute('aria-pressed', 'false');
                showNotification('Visualizer: Off');
                return;
            }

            // When enabling, ensure full-screen player is open — visualizer should only be visible there
            const startVisualizer = () => {
                // If player got collapsed while waiting, abort
                if (!fsPlayer.classList.contains('active')) {
                    showNotification('Open the player to use the visualizer');
                    return;
                }
                visualizer.start();
                visualizerToggle.classList.add('active');
                visualizerCanvas.classList.add('active');
                visualizerToggle.setAttribute('aria-pressed', 'true');
                showNotification('Visualizer: On');
            };

            if (!fsPlayer.classList.contains('active')) {
                // Expand player first then start the visualizer when animation finishes
                expandPlayerBtn.click();
                // Wait for the expansion animation to finish (matches CSS animation ~600ms)
                setTimeout(startVisualizer, 700);
            } else {
                startVisualizer();
            }
        };

        // Double-click cycles the visualizer style when active
        const cycleHandler = (e) => {
            if (!visualizer.isActive) return;
            const styles = ['bars', 'waveform', 'circular'];
            const currentIndex = styles.indexOf(visualizer.style);
            const nextIndex = (currentIndex + 1) % styles.length;
            visualizer.setStyle(styles[nextIndex]);
            showNotification(`Visualizer: ${styleNames[styles[nextIndex]]}`);
        };

        // Keyboard support (Enter/Space to toggle, D to cycle)
        const keyHandler = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleHandler();
            } else if (e.key.toLowerCase() === 'd') {
                cycleHandler();
            }
        };

        // Attach handlers and keep references for cleanup
        visualizerToggle._toggleHandler = toggleHandler;
        visualizerToggle._cycleHandler = cycleHandler;
        visualizerToggle._keyHandler = keyHandler;

        visualizerToggle.addEventListener('click', toggleHandler);
        visualizerToggle.addEventListener('dblclick', cycleHandler);
        visualizerToggle.addEventListener('keydown', keyHandler);

        // Long press (optional): hold to force stop
        let pressTimer;
        const mouseDownHandler = () => {
            pressTimer = setTimeout(() => {
                if (visualizer.isActive) {
                    visualizer.stop();
                    visualizerToggle.classList.remove('active');
                    visualizerCanvas.classList.remove('active');
                    visualizerToggle.setAttribute('aria-pressed', 'false');
                    showNotification('Visualizer: Off');
                }
            }, 900);
        };

        visualizerToggle.addEventListener('mousedown', mouseDownHandler);

        // Cancel long-press if mouse released or moved away
        ['mouseup', 'mouseleave', 'click'].forEach(ev => {
            visualizerToggle.addEventListener(ev, () => clearTimeout(pressTimer));
        });

        // Save references for later cleanup
        visualizerToggle._mouseDownHandler = mouseDownHandler;

        visualizerToggle.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
        });

        visualizerToggle.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
        });
    }
}

// Add song to queue
function addToQueue(songIndex) {
    if (!songQueue.includes(songIndex)) {
        songQueue.push(songIndex);
        saveQueue();
        updateQueueUI();

        // Show brief notification
        showNotification(`Added to queue: ${allMusic[songIndex - 1].name}`);
    }
}

// Toggle queued status for a song and update the icon in the list row
function toggleQueueForSong(songIndex, rowElement) {
    if (songQueue.includes(songIndex)) {
        removeFromQueue(songIndex);
        // update icon if provided
        if (rowElement) {
            const icon = rowElement.querySelector('.queue-toggle');
            if (icon) {
                icon.textContent = 'queue_music';
                icon.title = 'Add to queue';
            }
        }
        showNotification(`Removed from queue: ${allMusic[songIndex - 1].name}`);
    } else {
        addToQueue(songIndex);
        if (rowElement) {
            const icon = rowElement.querySelector('.queue-toggle');
            if (icon) {
                icon.textContent = 'remove_circle';
                icon.title = 'Remove from queue';
            }
        }
    }
    updateQueueUI();
}

// Remove from queue
function removeFromQueue(songIndex) {
    const index = songQueue.indexOf(songIndex);
    if (index > -1) {
        songQueue.splice(index, 1);
        saveQueue();
        updateQueueUI();
    }
}

// Update Queue UI
function updateQueueUI() {
    const queueList = document.getElementById('queue-list');
    if (!queueList) return;

    if (songQueue.length === 0) {
        queueList.innerHTML = '<p class="empty-queue">Queue is empty. Add songs to get started!</p>';
        return;
    }

    queueList.innerHTML = '';
    songQueue.forEach((songIndex) => {
        const song = allMusic[songIndex - 1];
        if (!song) return;

        const queueItem = document.createElement('div');
        queueItem.classList.add('queue-item');
        if (songIndex === musicIndex) {
            queueItem.classList.add('playing');
        }

        const qImg = document.createElement('img');
        attemptImageFormats(qImg, `images/${song.img}`, `images/music-placeholder.jpg`);

        const qInfo = document.createElement('div');
        qInfo.className = 'queue-item-info';
        qInfo.innerHTML = `
            <div class="name">${song.name}</div>
            <div class="artist">${song.artist}</div>
        `;

        const qRemove = document.createElement('i');
        qRemove.className = 'material-icons queue-item-remove';
        qRemove.innerText = 'close';

        queueItem.appendChild(qImg);
        queueItem.appendChild(qInfo);
        queueItem.appendChild(qRemove);

        queueItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('queue-item-remove')) {
                playSongFromList(songIndex);
            }
        });

        queueItem.querySelector('.queue-item-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromQueue(songIndex);
        });

        queueList.appendChild(queueItem);
    });
}

// Save queue to localStorage
function saveQueue() {
    localStorage.setItem('songQueue', JSON.stringify(songQueue));
}

// Modified next music to check queue first
function nextMusicWithQueue() {
    if (songQueue.length > 0) {
        const nextIndex = songQueue.shift(); // Get and remove first item
        saveQueue();
        updateQueueUI();
        musicIndex = nextIndex;
        loadMusic(musicIndex);
        playMusic();
    } else {
        nextMusic(); // Use original next logic
    }
}

// Show notification (simple toast)
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 110px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 10000;
        animation: slideUpFade 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideDownFade 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add inline notification animations
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideUpFade {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        @keyframes slideDownFade {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
}
