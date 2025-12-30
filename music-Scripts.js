// DOM Elements
const mainAudio = document.getElementById("main-audio");
const crossfadeAudio = document.getElementById("crossfade-audio");
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
let crossfadeDuration = 0; // in seconds
let isCrossfading = false;
let nextMusicIndex = null;

// Enhanced features
let playbackSpeed = 1.0;
let sleepTimer = null;
let sleepTimerDuration = 0;
let playCounts = {}; // {songIndex: count}
let recentlyPlayed = []; // Array of song indices
let gaplessPlayback = false;
let autoPlayNext = true;
let normalizeVolume = false; // Volume normalization setting

// Favorites (synced with Firebase)
let favorites = new Set();
const likedListUl = document.getElementById('liked-list-ul');
let userId = null;

// Playlist Variables
let playlists = [];
const playlistsGrid = document.getElementById('playlists-grid');
const playlistDetailsView = document.getElementById('playlist-details-view');
const playlistBackBtn = document.getElementById('playlist-back');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const playlistSongsUl = document.getElementById('playlist-songs-ul');
const playlistDetailName = document.getElementById('playlist-detail-name');
const playlistDetailInfo = document.getElementById('playlist-detail-info');
const playlistArtwork = document.getElementById('playlist-artwork');
const playlistPlayAll = document.getElementById('playlist-play-all');
const playlistEditBtn = document.getElementById('playlist-edit-btn');
const playlistDeleteBtn = document.getElementById('playlist-delete-btn');

// Queue and Visualizer Variables
let songQueue = [];
let isShuffleOn = false;
let repeatMode = 0; // 0: off, 1: repeat all, 2: repeat one
let shuffleOrder = [];


// Custom Prompt Logic
let modalCallback = null;
const playlistModal = document.getElementById('playlist-modal');
const playlistModalTitle = document.getElementById('playlist-modal-title');
const playlistInput = document.getElementById('playlist-modal-input');
const playlistModalSave = document.getElementById('playlist-modal-save');
const playlistModalCancel = document.getElementById('playlist-modal-cancel');

// Initialize Firebase sync
async function initFirebaseSync() {
    try {
        userId = await getUserId();
        if (typeof initUser === 'function') {
            await initUser(userId);
        }
        // Load favorites from Firebase
        if (typeof loadFavorites === 'function') {
            try {
                const loadedFavorites = await loadFavorites(userId);
                favorites = new Set(loadedFavorites);
            } catch (err) {
                console.error('Error loading favorites from Firebase:', err);
                favorites = new Set([]);
            }
        } else {
            favorites = new Set([]);
        }
        console.log('Loaded favorites:', favorites.size);

        // Load all settings
        await loadAllSettings();
    } catch (err) {
        console.error('Error initializing Firebase sync:', err);
    }
}

// Load all settings from Firebase
async function loadAllSettings() {
    if (!userId || typeof loadSettings !== 'function') return;

    try {
        const settings = await loadSettings(userId);

        // Apply settings
        if (settings.crossfadeDuration !== undefined) {
            crossfadeDuration = parseFloat(settings.crossfadeDuration);
        }
        if (settings.normalizeVolume !== undefined) {
            normalizeVolume = settings.normalizeVolume === true || settings.normalizeVolume === 'true';
        }
        if (settings.playbackSpeed !== undefined) {
            playbackSpeed = parseFloat(settings.playbackSpeed);
            if (mainAudio) mainAudio.playbackRate = playbackSpeed;
        }
        if (settings.gaplessPlayback !== undefined) {
            gaplessPlayback = settings.gaplessPlayback === true || settings.gaplessPlayback === 'true';
        }
        if (settings.autoPlayNext !== undefined) {
            autoPlayNext = settings.autoPlayNext !== false && settings.autoPlayNext !== 'false';
        }
    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

// Save all settings to Firebase
async function saveAllSettings() {
    if (!userId || typeof saveSettings !== 'function') return;

    try {
        const settings = {
            crossfadeDuration: crossfadeDuration,
            normalizeVolume: normalizeVolume,
            playbackSpeed: playbackSpeed,
            gaplessPlayback: gaplessPlayback,
            autoPlayNext: autoPlayNext
        };
        await saveSettings(userId, settings);
    } catch (err) {
        console.error('Error saving settings:', err);
    }
}

async function saveFavoritesToStorage() {
    try {
        if (userId && typeof saveFavorites === 'function') {
            await saveFavorites(userId, favorites);
        }
    } catch (e) {
        console.error('Could not save favorites:', e);
    }
}

function isFavorite(index) {
    return favorites.has(index);
}

function toggleFavorite(index) {
    if (favorites.has(index)) {
        favorites.delete(index);
    } else {
        favorites.add(index);
    }
    saveFavoritesToStorage();
}

function getFavoriteSongs() {
    const ids = new Set(Array.from(favorites));
    return allMusic.filter((_, i) => ids.has(i + 1));
}

function renderLikedView() {
    if (!likedListUl) return;
    const favSongs = getFavoriteSongs();

    // Explicitly update the section title if needed
    const likedPanel = document.getElementById('lib-liked');
    if (likedPanel) {
        const title = likedPanel.querySelector('.section-title h3');
        if (title) title.innerText = `Liked Songs (${favSongs.length})`;
    }

    loadMusicList(favSongs, likedListUl);
}


// Custom Prompt Logic

function openModal(title, defaultValue, callback) {
    if (!playlistModal) return;
    playlistModalTitle.innerText = title;
    if (playlistInput) playlistInput.value = defaultValue || '';
    modalCallback = callback;
    playlistModal.classList.add('active');
    playlistModal.style.display = 'flex'; // Override inline style
    if (playlistInput) playlistInput.focus();
}

function closeModal() {
    if (playlistModal) {
        playlistModal.classList.remove('active');
        playlistModal.style.display = 'none'; // Explicitly set display
    }
    modalCallback = null;
}

if (playlistModalSave) {
    playlistModalSave.onclick = () => {
        const value = playlistInput.value;
        if (value && value.trim()) {
            if (modalCallback) modalCallback(value.trim());
            closeModal();
        } else {
            // Shake animation or error?
            playlistInput.style.borderColor = 'red';
            setTimeout(() => playlistInput.style.borderColor = '', 1000);
        }
    };
}

if (playlistModalCancel) {
    playlistModalCancel.onclick = closeModal;
}

// View Management
function switchView(viewId) {
    // Hide all main section views
    const views = document.querySelectorAll('section.view');
    views.forEach(v => v.classList.remove('active'));

    // Show target view
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        // Scroll to top
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.scrollTop = 0;
    }

    // Explicitly handle Liked View rendering if switching to library liked tab
    if (viewId === 'library-view') {
        const likedTab = document.querySelector('.lib-tab[data-lib-tab="liked"]');
        if (likedTab && likedTab.classList.contains('active')) {
            renderLikedView();
        }
    }
}

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

        // Left Side: Image + Text
        const rowLeft = document.createElement('div');
        rowLeft.className = 'row-left';

        const imgEl = document.createElement('img');
        attemptImageFormats(imgEl, `images/${song.img}`, `images/music-placeholder.webp`);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        infoDiv.innerHTML = `<span>${song.name}</span><p>${song.artist}</p>`;

        rowLeft.appendChild(imgEl);
        rowLeft.appendChild(infoDiv);

        // Right Side: Duration + Actions
        const rowRight = document.createElement('div');
        rowRight.className = 'row-right';

        // Add to queue button
        const queueBtn = document.createElement('i');
        queueBtn.className = 'material-icons add-to-queue';
        queueBtn.title = 'Add to queue';
        queueBtn.innerText = 'queue_music';
        queueBtn.onclick = (e) => {
            e.stopPropagation();
            addToQueue(originalIndex);
        };

        const durationSpan = document.createElement('span');
        durationSpan.className = 'audio-duration';
        durationSpan.id = `duration-${originalIndex}`;
        durationSpan.innerText = '3:30';

        // Heart / favorite button
        const heart = document.createElement('i');
        heart.className = 'material-icons heart ' + (isFavorite(originalIndex) ? 'active' : '');
        heart.title = 'Like';
        heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex);
            heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
            heart.classList.toggle('active', isFavorite(originalIndex));
            // If we're in the Liked view, re-render it to reflect removals
            if (document.getElementById('liked-view') && document.getElementById('liked-view').classList.contains('active')) {
                renderLikedView();
            }
        });

        // Add to playlist button (context menu)
        const playlistBtn = document.createElement('i');
        playlistBtn.className = 'material-icons add-to-playlist-btn';
        playlistBtn.title = 'Add to playlist';
        playlistBtn.innerText = 'playlist_add';
        playlistBtn.style.display = 'none';
        playlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPlaylistMenu(originalIndex, playlistBtn);
        });

        rowRight.appendChild(queueBtn);
        rowRight.appendChild(durationSpan);
        rowRight.appendChild(heart);
        rowRight.appendChild(playlistBtn);

        li.appendChild(rowLeft);
        li.appendChild(rowRight);

        // Show playlist button on hover
        li.addEventListener('mouseenter', () => {
            // always show if playlists exist, or maybe always show?
            // user requested smoother experience. Let's show on hover if playlists exist.
            if (playlists.length > 0) {
                playlistBtn.style.display = 'block';
            }
        });
        li.addEventListener('mouseleave', () => {
            playlistBtn.style.display = 'none';
        });

        // Song click handler
        li.addEventListener("click", (e) => {
            // Prevent play if clicking controls
            const target = e.target;
            if (target.closest('.row-right') && (target.tagName === 'I' || target.classList.contains('add-to-queue'))) {
                return;
            }
            playSongFromList(originalIndex);
        });

        // Check if playing
        if (originalIndex === musicIndex) {
            li.classList.add("playing");
        }

        container.appendChild(li);
    });
}

function playSongFromList(index) {
    musicIndex = index;
    loadMusic(musicIndex);
    playMusic();
}

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

    const artistGrid = document.getElementById("artist-grid"); // Library Grid
    const circularContainer = document.getElementById("featured-artists"); // Home Circular

    if (artistGrid) artistGrid.innerHTML = "";
    if (circularContainer) circularContainer.innerHTML = "";

    Object.keys(artists).forEach(artist => {
        const firstSong = artists[artist][0];

        // Priority: 1. artistImg override, 2. slugified name, 3. fallback to song image
        const artistSlug = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const override = firstSong.artistImg;
        const artistPaths = [];
        if (override) artistPaths.push(`images/artists/${override}`);
        artistPaths.push(`images/artists/${artistSlug}`);
        artistPaths.push(`images/artists/${artist}`);
        artistPaths.push(`images/${firstSong.img}`);

        // Render to Grid
        if (artistGrid) {
            let div = document.createElement("div");
            div.classList.add("artist-card");
            const imgEl = document.createElement('img');
            attemptImageFormats(imgEl, artistPaths, `images/music-placeholder.webp`);
            const h3 = document.createElement('h3');
            h3.textContent = artist;
            div.appendChild(imgEl);
            div.appendChild(h3);
            div.onclick = () => loadArtistDetails(artist, artists[artist]);
            artistGrid.appendChild(div);
        }

        // Render to Circular List (Home)
        if (circularContainer) {
            let div = document.createElement("div");
            div.classList.add("artist-card");
            // div.style.minWidth = "120px"; // Ensure size
            const imgEl = document.createElement('img');
            attemptImageFormats(imgEl, artistPaths, `images/music-placeholder.webp`);
            // imgEl.style.width = "100px";
            // imgEl.style.height = "100px";
            const h3 = document.createElement('h3');
            h3.textContent = artist;
            h3.style.fontSize = "14px";
            div.appendChild(imgEl);
            div.appendChild(h3);
            div.onclick = () => loadArtistDetails(artist, artists[artist]);
            circularContainer.appendChild(div);
        }
    });
}

function renderTrendingSongs() {
    const container = document.getElementById('trending-scroll');
    if (!container) return;
    container.innerHTML = "";

    // Simulate trending with first 8 songs
    const trending = allMusic.slice(0, 8);

    trending.forEach(song => {
        let originalIndex = allMusic.indexOf(song) + 1;
        const div = document.createElement('div');
        div.className = 'trending-card';

        // Create elements manually to use attemptImageFormats
        const img = document.createElement('img');
        attemptImageFormats(img, `images/${song.img}`, 'images/music-placeholder.webp');

        const h4 = document.createElement('h4');
        h4.innerText = song.name;

        const p = document.createElement('p');
        p.innerText = song.artist;

        div.appendChild(img);
        div.appendChild(h4);
        div.appendChild(p);

        div.onclick = () => playSongFromList(originalIndex);
        container.appendChild(div);
    });
}

function setupLibrary() {
    const libTabs = document.querySelectorAll('.lib-tab');
    const libPanels = document.querySelectorAll('.lib-panel');

    libTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            libTabs.forEach(t => t.classList.remove('active'));
            libPanels.forEach(p => p.classList.remove('active'));

            // Add active to clicked
            tab.classList.add('active');
            const target = tab.getAttribute('data-lib-tab');
            const panel = document.getElementById(`lib-${target}`);
            if (panel) {
                panel.classList.add('active');
                if (target === 'liked') {
                    renderLikedView();
                } else if (target === 'playlists') {
                    renderPlaylists();
                }
            }
        });
    });
}

function loadArtistDetails(artistName, songs) {
    const adName = document.getElementById("ad-name");
    const adImg = document.getElementById("ad-img");

    if (adName) adName.innerText = artistName;

    // Priority: 1. artistImg override, 2. slugified name, 3. fallback to song image
    const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const override = songs[0].artistImg;

    // Cascading fallback: 1. artistImg override, 2. slugified name, 3. exact name, 4. fallback song image, 5. global placeholder
    const artistPaths = [];
    if (override) artistPaths.push(`images/artists/${override}`);
    artistPaths.push(`images/artists/${artistSlug}`);
    artistPaths.push(`images/artists/${artistName}`);
    artistPaths.push(`images/${songs[0].img}`);

    if (adImg) attemptImageFormats(adImg, artistPaths, `images/music-placeholder.webp`);

    // Set header bg
    const artistHeaderBg = document.getElementById('artist-header-bg');
    if (artistHeaderBg) {
        const bgImg = document.createElement('img');
        attemptImageFormats(bgImg, artistPaths, 'images/music-placeholder.webp');
        bgImg.onload = () => {
            artistHeaderBg.style.backgroundImage = `url(${bgImg.src})`;
        };
    }

    // Populate list
    artistSongsUl.innerHTML = "";
    songs.forEach(song => {
        let originalIndex = allMusic.indexOf(song) + 1;
        let li = document.createElement("li");

        // Use same left/right structure as Home
        const rowLeft = document.createElement('div');
        rowLeft.className = 'row-left';

        const imgEl = document.createElement('img');
        attemptImageFormats(imgEl, `images/${song.img}`, `images/music-placeholder.webp`);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        infoDiv.innerHTML = `<span>${song.name}</span><p>${song.artist}</p>`;

        rowLeft.appendChild(imgEl);
        rowLeft.appendChild(infoDiv);

        const rowRight = document.createElement('div');
        rowRight.className = 'row-right';

        const inQueue = songQueue.includes(originalIndex);
        const queueBtn = document.createElement('i');
        queueBtn.className = 'material-icons queue-toggle';
        queueBtn.title = inQueue ? 'Remove from queue' : 'Add to queue';
        queueBtn.innerText = inQueue ? 'remove_circle' : 'queue_music';
        queueBtn.onclick = (e) => {
            e.stopPropagation();
            toggleQueueForSong(originalIndex, li);
        };

        const durationSpan = document.createElement('span');
        durationSpan.className = 'audio-duration';
        durationSpan.id = `duration-${originalIndex}`;
        durationSpan.innerText = '3:30';

        // Heart / favorite button
        const heart = document.createElement('i');
        heart.className = 'material-icons heart ' + (isFavorite(originalIndex) ? 'active' : '');
        heart.title = 'Like';
        heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex);
            heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
            heart.classList.toggle('active', isFavorite(originalIndex));
        });

        rowRight.appendChild(queueBtn);
        rowRight.appendChild(durationSpan);
        rowRight.appendChild(heart);

        li.appendChild(rowLeft);
        li.appendChild(rowRight);

        // Events
        // Keyboard shortcuts removed

        li.addEventListener('click', (e) => {
            if (!e.target.closest('.row-right')) {
                playSongFromList(originalIndex);
            }
        });

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
    switchView("artist-details-view");

    // Play all handler
    adPlayAll.onclick = () => {
        // Play first song
        playSongFromList(allMusic.indexOf(songs[0]) + 1);
    };
}

artistBackBtn.addEventListener("click", () => {
    artistDetailsView.classList.remove("active");
    // Standardized return to Library view
    const libraryView = document.getElementById("library-view");
    if (libraryView) {
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        libraryView.classList.add("active");

        // Activate the Artists tab in Library
        const libTabs = document.querySelectorAll('.lib-tab');
        const libPanels = document.querySelectorAll('.lib-panel');

        libTabs.forEach(t => t.classList.remove('active'));
        libPanels.forEach(p => p.classList.remove('active'));

        const artistsTab = document.querySelector('[data-lib-tab="artists"]');
        const artistsPanel = document.getElementById('lib-artists');

        if (artistsTab) artistsTab.classList.add('active');
        if (artistsPanel) artistsPanel.classList.add('active');
    }

    // Update sidebar active state
    document.querySelectorAll(".sidebar li").forEach(l => l.classList.remove("active"));
    const librarySidebarItem = document.querySelector('[data-view="library"]');
    if (librarySidebarItem) librarySidebarItem.classList.add("active");
});

// Core Player Logic
function loadMusic(indexNumb) {
    const song = allMusic[indexNumb - 1];

    mainAudio.src = `songs/${song.src}.mp3`; // scan_songs saves 'src' as just filename usually
    mainAudio.playbackRate = playbackSpeed; // Apply playback speed

    // Update play count and recently played
    if (!playCounts[indexNumb]) playCounts[indexNumb] = 0;
    playCounts[indexNumb]++;

    // Add to recently played (remove if already exists, then add to front)
    recentlyPlayed = recentlyPlayed.filter(idx => idx !== indexNumb);
    recentlyPlayed.unshift(indexNumb);
    if (recentlyPlayed.length > 50) recentlyPlayed.pop(); // Keep last 50

    // Save statistics
    saveStatistics();

    // Update Mini Player
    miniName.innerText = song.name;
    miniArtist.innerText = song.artist;
    attemptImageFormats(miniImg, `images/${song.img}`, `images/music-placeholder.webp`);

    // Update FS Player
    fsName.innerText = song.name;
    fsArtist.innerText = song.artist;
    attemptImageFormats(fsImg, `images/${song.img}`, `images/music-placeholder.webp`);


    // Media Session Metadata is now updated in miniImg.onload to ensure correct image source is used.

    // Update active class in list
    const allLi = musicListUl.querySelectorAll("li");
    allLi.forEach(li => li.classList.remove("playing"));
    // This simple index matching works if showing all songs. 
    // If filtered, we might not find it easily by index, but that's a minor UX detail.

    // Load Lyrics
    loadLyrics(indexNumb);

    // Background Color
    // Background Color & Media Session Update
    // We bind onload before calling attemptImageFormats (effectively, though here it's after, but effectively async)
    // Actually, to be safe, we should probably set onload before src, but attemptImageFormats handles src setting.
    // Since attemptImageFormats is called above (line 648), we might miss it if it's instant (cached).
    // Better practice: Defining onload is idempotent if we assume the image eventually loads.

    miniImg.onload = () => {
        // Update Media Session Metadata with the actual loaded image
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.name,
                artist: song.artist,
                album: song.album || "",
                artwork: [
                    { src: miniImg.src, sizes: "512x512", type: "image/png" }, // Using the resolved src
                    // Fallback to placeholder just in case? No, miniImg.src is what loaded.
                ]
            });
        }

        if (colorThief) {
            try {
                const color = colorThief.getColor(miniImg);
                // document.body.style.background = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            } catch (e) { }
        }
    };
}

function playMusic() {
    isMusicPaused = false;

    // Resume AudioContext if it's suspended (crucial for mobile)
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
    if (crossfadeDuration > 0 && !isCrossfading) {
        startCrossfade();
    } else {
        musicIndex++;
        if (musicIndex > allMusic.length) {
            musicIndex = 1;
        }
        loadMusic(musicIndex);
        playMusic();
    }
}

// Crossfade functionality
function startCrossfade() {
    if (isCrossfading) return;

    isCrossfading = true;
    nextMusicIndex = musicIndex + 1;
    if (nextMusicIndex > allMusic.length) {
        nextMusicIndex = 1;
    }

    const nextSong = allMusic[nextMusicIndex - 1];
    crossfadeAudio.src = `songs/${nextSong.src}.mp3`;
    crossfadeAudio.volume = 0;
    crossfadeAudio.currentTime = 0;

    const fadeOut = () => {
        const fadeInterval = 50; // Update every 50ms
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
                // Switch to next song
                mainAudio.pause();
                mainAudio.currentTime = 0;
                mainAudio.volume = 1;

                // Swap audio elements
                const temp = mainAudio.src;
                mainAudio.src = crossfadeAudio.src;
                crossfadeAudio.src = temp;

                musicIndex = nextMusicIndex;
                loadMusic(musicIndex);
                mainAudio.play();

                crossfadeAudio.volume = 0;
                isCrossfading = false;
            }
        }, fadeInterval);
    };

    crossfadeAudio.play().then(() => {
        fadeOut();
    }).catch(err => {
        console.error('Crossfade error:', err);
        isCrossfading = false;
        // Fallback to normal next
        musicIndex = nextMusicIndex;
        loadMusic(musicIndex);
        playMusic();
    });
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

// Previous Buttons
[miniPrevBtn, fsPrevBtn].forEach(btn => {
    if (btn) {
        btn.addEventListener("click", () => {
            prevMusic();
        });
    }
});

// Next Buttons
[miniNextBtn, fsNextBtn].forEach(btn => {
    if (btn) {
        btn.addEventListener("click", () => {
            nextMusic();
        });
    }
});

// Shuffle Button
if (miniShuffleBtn) {
    miniShuffleBtn.addEventListener("click", () => {
        isShuffleOn = !isShuffleOn;
        miniShuffleBtn.classList.toggle("active", isShuffleOn);
        if (isShuffleOn) {
            shuffleOrder = [...Array(allMusic.length).keys()].sort(() => Math.random() - 0.5);
        }
    });
}

// Repeat Buttons
[miniRepeatBtn, fsRepeatBtn].forEach(btn => {
    if (btn) {
        btn.addEventListener("click", () => {
            repeatMode = (repeatMode + 1) % 3; // 0: off, 1: repeat all, 2: repeat one
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

// ==================== END CORE PLAYER ====================

// Progress Bar - Click to seek
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
            if (mainAudio.volume === 0) {
                volumeIcon.innerText = "volume_off";
            } else if (mainAudio.volume < 0.5) {
                volumeIcon.innerText = "volume_down";
            } else {
                volumeIcon.innerText = "volume_up";
            }
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

// Audio Time Update - Update progress bars and time displays
mainAudio.addEventListener("timeupdate", () => {
    const currentTime = mainAudio.currentTime;
    const duration = mainAudio.duration;

    // Update progress bars
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        if (miniProgressBar) miniProgressBar.style.width = `${progressPercent}%`;

        const fsProgressFill = document.getElementById("fs-progress-bar-fill");
        if (fsProgressFill) fsProgressFill.style.width = `${progressPercent}%`;
    }

    // Update time displays
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    if (miniCurrentTime) miniCurrentTime.innerText = formatTime(currentTime);
    if (fsCurrentTime) fsCurrentTime.innerText = formatTime(currentTime);
    if (miniDuration && duration) miniDuration.innerText = formatTime(duration);
    if (fsDuration && duration) fsDuration.innerText = formatTime(duration);
});

// Audio Ended - Handle next song
mainAudio.addEventListener("ended", () => {
    if (repeatMode === 2) {
        // Repeat one - replay current song
        mainAudio.currentTime = 0;
        playMusic();
    } else {
        // Move to next song
        nextMusic();
    }
});



// (Duplicate sections removed to restore file integrity)

function performSearch() {
    if (!searchInput) return;
    const term = (searchInput.value || "").toLowerCase();

    if (!term) {
        searchResultsUl.innerHTML = "";
        return;
    }

    // Filter Songs
    let filteredSongs = allMusic.filter(song =>
        song.name.toLowerCase().includes(term) ||
        song.artist.toLowerCase().includes(term) ||
        (song.album && song.album.toLowerCase().includes(term))
    );

    // Sort songs
    if (searchFilters.sortBy === 'plays') {
        filteredSongs.sort((a, b) => {
            const aIdx = allMusic.indexOf(a) + 1;
            const bIdx = allMusic.indexOf(b) + 1;
            return (playCounts[bIdx] || 0) - (playCounts[aIdx] || 0);
        });
    } else if (searchFilters.sortBy === 'name') {
        filteredSongs.sort((a, b) => a.name.localeCompare(b.name));
    } else if (searchFilters.sortBy === 'artist') {
        filteredSongs.sort((a, b) => a.artist.localeCompare(b.artist));
    }

    // Filter Artists
    const artists = [...new Set(allMusic.map(s => s.artist))];
    let filteredArtists = artists.filter(a => a.toLowerCase().includes(term));

    // Filter Albums
    const albums = [...new Set(allMusic.map(s => s.album).filter(Boolean))];
    let filteredAlbums = albums.filter(al => al.toLowerCase().includes(term));

    // Apply type filter
    if (searchFilters.type === 'songs') {
        filteredArtists = [];
        filteredAlbums = [];
    } else if (searchFilters.type === 'artists') {
        filteredSongs = [];
        filteredAlbums = [];
    } else if (searchFilters.type === 'albums') {
        filteredSongs = [];
        filteredArtists = [];
    }

    // Render logic
    searchResultsUl.innerHTML = "";

    if (filteredSongs.length > 0) {
        const title = document.createElement('div');
        title.className = 'search-group-title';
        title.innerText = `Songs (${filteredSongs.length})`;
        searchResultsUl.appendChild(title);
        loadMusicList(filteredSongs, searchResultsUl);
    }

    if (filteredArtists.length > 0) {
        const title = document.createElement('div');
        title.className = 'search-group-title';
        title.innerText = `Artists (${filteredArtists.length})`;
        searchResultsUl.appendChild(title);

        filteredArtists.forEach(artistName => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="row">
                    <i class="material-icons" style="margin-right: 15px; color: var(--highlight);">person</i>
                    <div class="info">
                        <span>${artistName}</span>
                        <p>Artist</p>
                    </div>
                </div>
            `;
            li.onclick = () => {
                const artistSongs = allMusic.filter(s => s.artist === artistName);
                loadArtistDetails(artistName, artistSongs);
            };
            searchResultsUl.appendChild(li);
        });
    }

    if (filteredAlbums.length > 0) {
        const title = document.createElement('div');
        title.className = 'search-group-title';
        title.innerText = `Albums (${filteredAlbums.length})`;
        searchResultsUl.appendChild(title);

        filteredAlbums.forEach(albumName => {
            const albumData = allMusic.find(s => s.album === albumName);
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="row">
                    <i class="material-icons" style="margin-right: 15px; color: var(--highlight);">album</i>
                    <div class="info">
                        <span>${albumName}</span>
                        <p>${albumData.artist}</p>
                    </div>
                </div>
            `;
            li.onclick = () => {
                const albumSongs = allMusic.filter(s => s.album === albumName);
                loadAlbumDetails({
                    name: albumName,
                    artist: albumData.artist,
                    img: albumData.img,
                    albumImg: albumData.albumImg,
                    songs: albumSongs
                });
            };
            searchResultsUl.appendChild(li);
        });
    }

    if (filteredSongs.length === 0 && filteredArtists.length === 0 && filteredAlbums.length === 0) {
        searchResultsUl.innerHTML = `<li style="justify-content:center;">No results found</li>`;
    }
}

// Search Logic
searchInput.addEventListener("input", (e) => {
    performSearch();
});

// Mobile Detection Helper
function isMobileDevice() {
    return (window.innerWidth <= 768) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

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
            } else if (viewId === 'library') {
                // When entering library, ensure current tab content is rendered
                const activeTab = document.querySelector('.lib-tab.active');
                if (activeTab) {
                    const tabType = activeTab.getAttribute('data-lib-tab');
                    if (tabType === 'playlists') renderPlaylists();
                    else if (tabType === 'liked') renderLikedView();
                    // Artists and Albums are handled by their respective load functions which are called in initializeApp
                    // and typically don't need frequent re-rendering of the entire grid unless data changes.
                }
            } else if (viewId === 'settings') {
                // Update statistics if stats panel is active
                setTimeout(() => {
                    if (document.getElementById('stats-panel') &&
                        document.getElementById('stats-panel').classList.contains('active')) {
                        updateStatisticsDisplay();
                    }
                }, 100);
            }
        });
    });
}


// Lyrics logic refactored to lyrics.js

// Keyboard Controls - REMOVED

// Media Session Actions (Hardware Keys)
if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", playMusic);
    navigator.mediaSession.setActionHandler("pause", pauseMusic);
    navigator.mediaSession.setActionHandler("previoustrack", prevMusic);
    navigator.mediaSession.setActionHandler("nexttrack", nextMusic);
}
// New functions appended to music-Scripts.js

// Update greeting based on time of day
// Update greeting based on time of day
function updateGreeting(name) {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 18) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }

    if (name) {
        greeting += `, ${name}`;
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

        attemptImageFormats(imgEl, albumPaths, `images/music-placeholder.webp`);

        div.onclick = () => {
            loadAlbumDetails(album);
        };
        albumGrid.appendChild(div);
    });
}

// Load Album Details
function loadAlbumDetails(album) {
    const albumDetailName = document.getElementById("album-detail-name");
    const albumDetailArtist = document.getElementById("album-detail-artist");
    const albumDetailImg = document.getElementById("album-detail-img");

    if (albumDetailName) albumDetailName.innerText = album.name;
    if (albumDetailArtist) albumDetailArtist.innerText = album.artist;

    // Priority: 1. albumImg override, 2. slugified name, 3. fallback to song image
    const albumSlug = album.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Cascading fallback: Specific Album Folder -> Song Thumbnail -> Placeholder
    const albumImagePaths = [];
    if (album.albumImg) albumImagePaths.push(`images/albums/${album.albumImg}`);
    albumImagePaths.push(`images/albums/${albumSlug}`);
    albumImagePaths.push(`images/albums/${album.name}`);
    albumImagePaths.push(`images/${album.img}`);
    attemptImageFormats(albumDetailImg, albumImagePaths, `images/music-placeholder.webp`);

    // Set header bg
    const albumHeaderBg = document.getElementById('album-header-bg');
    if (albumHeaderBg) {
        const bgImg = document.createElement('img');
        attemptImageFormats(bgImg, albumImagePaths, 'images/music-placeholder.webp');
        bgImg.onload = () => {
            albumHeaderBg.style.backgroundImage = `url(${bgImg.src})`;
        };
    }

    // Populate list
    albumSongsUl.innerHTML = "";
    album.songs.forEach(song => {
        let originalIndex = allMusic.indexOf(song) + 1;
        let li = document.createElement("li");

        // Use same left/right structure as Home
        const rowLeft = document.createElement('div');
        rowLeft.className = 'row-left';

        const imgEl = document.createElement('img');
        attemptImageFormats(imgEl, `images/${song.img}`, `images/music-placeholder.webp`);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        infoDiv.innerHTML = `<span>${song.name}</span><p>${song.artist}</p>`;

        rowLeft.appendChild(imgEl);
        rowLeft.appendChild(infoDiv);

        const rowRight = document.createElement('div');
        rowRight.className = 'row-right';

        const inQueue = songQueue.includes(originalIndex);
        const queueBtn = document.createElement('i');
        queueBtn.className = 'material-icons queue-toggle';
        queueBtn.title = inQueue ? 'Remove from queue' : 'Add to queue';
        queueBtn.innerText = inQueue ? 'remove_circle' : 'queue_music';
        queueBtn.onclick = (e) => {
            e.stopPropagation();
            toggleQueueForSong(originalIndex, li);
        };

        const durationSpan = document.createElement('span');
        durationSpan.className = 'audio-duration';
        durationSpan.id = `duration-${originalIndex}`;
        durationSpan.innerText = '3:30';

        // Heart / favorite button
        const heart = document.createElement('i');
        heart.className = 'material-icons heart ' + (isFavorite(originalIndex) ? 'active' : '');
        heart.title = 'Like';
        heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex);
            heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
            heart.classList.toggle('active', isFavorite(originalIndex));
        });

        rowRight.appendChild(queueBtn);
        rowRight.appendChild(durationSpan);
        rowRight.appendChild(heart);

        li.appendChild(rowLeft);
        li.appendChild(rowRight);

        // Events
        // Keyboard shortcuts removed

        li.addEventListener('click', (e) => {
            if (!e.target.closest('.row-right')) {
                playSongFromList(originalIndex);
            }
        });

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
    switchView("album-details-view");

    // Play all handler
    albumPlayAll.onclick = () => {
        playSongFromList(allMusic.indexOf(album.songs[0]) + 1);
    };
}

// Album back button
if (albumBackBtn) {
    albumBackBtn.addEventListener("click", () => {
        albumDetailsView.classList.remove("active");
        // Standardized return to Library view
        const libraryView = document.getElementById("library-view");
        if (libraryView) {
            document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
            libraryView.classList.add("active");

            // Activate the Albums tab in Library
            const libTabs = document.querySelectorAll('.lib-tab');
            const libPanels = document.querySelectorAll('.lib-panel');

            libTabs.forEach(t => t.classList.remove('active'));
            libPanels.forEach(p => p.classList.remove('active'));

            const albumsTab = document.querySelector('[data-lib-tab="albums"]');
            const albumsPanel = document.getElementById('lib-albums');

            if (albumsTab) albumsTab.classList.add('active');
            if (albumsPanel) albumsPanel.classList.add('active');
        }

        // Update sidebar active state
        document.querySelectorAll(".sidebar li").forEach(l => l.classList.remove("active"));
        const librarySidebarItem = document.querySelector('[data-view="library"]');
        if (librarySidebarItem) librarySidebarItem.classList.add("active");
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
            attemptImageFormats(imgEl, `images/${album.img}`, 'images/music-placeholder.webp');
            const h4 = document.createElement('h4'); h4.textContent = album.name;
            const p = document.createElement('p'); p.textContent = album.artist;
            div.appendChild(imgEl); div.appendChild(h4); div.appendChild(p);
            div.onclick = () => {
                const libViewBtn = document.querySelector('[data-view="library"]');
                if (libViewBtn) libViewBtn.click();
                const albumTab = document.querySelector('[data-lib-tab="albums"]');
                if (albumTab) albumTab.click();
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
            ], `images/music-placeholder.webp`);
            const h4 = document.createElement('h4'); h4.textContent = artistName;
            div.appendChild(imgEl); div.appendChild(h4);
            div.onclick = () => {
                const libViewBtn = document.querySelector('[data-view="library"]');
                if (libViewBtn) libViewBtn.click();
                const artistTab = document.querySelector('[data-lib-tab="artists"]');
                if (artistTab) artistTab.click();
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

    // Crossfade Duration Slider
    const crossfadeSlider = document.getElementById('crossfade-duration');
    const crossfadeValue = document.getElementById('crossfade-value');
    if (crossfadeSlider && crossfadeValue) {
        // Value loaded from Firebase in loadAllSettings
        crossfadeSlider.value = crossfadeDuration;
        crossfadeValue.textContent = crossfadeDuration + 's';

        crossfadeSlider.addEventListener('input', (e) => {
            crossfadeDuration = parseFloat(e.target.value);
            crossfadeValue.textContent = crossfadeDuration + 's';
            saveAllSettings();
        });
    }

    // Normalization Toggle
    const normalizeToggle = document.getElementById('normalize-toggle');
    if (normalizeToggle) {
        // Value loaded from Firebase in loadAllSettings
        if (normalizeVolume) {
            normalizeToggle.checked = true;
            enableNormalization();
        }

        normalizeToggle.addEventListener('change', (e) => {
            normalizeVolume = e.target.checked;
            if (normalizeVolume) {
                enableNormalization();
            } else {
                disableNormalization();
            }
            saveAllSettings();
        });
    }

    // EQ Sliders
    const eqSliders = document.querySelectorAll('.eq-slider');
    eqSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const band = parseInt(e.target.dataset.band);
            const gain = parseFloat(e.target.value);
            if (window.equalizer) {
                window.equalizer.setBandGain(band, gain);
            }
        });
    });

    // EQ Presets
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const preset = btn.dataset.preset;
            applyEQPreset(preset);
        });
    });

    // Playback Speed
    const speedSlider = document.getElementById('playback-speed');
    const speedValue = document.getElementById('speed-value');
    if (speedSlider && speedValue) {
        // Value loaded from Firebase in loadAllSettings
        speedSlider.value = playbackSpeed;
        speedValue.textContent = playbackSpeed.toFixed(1) + 'x';
        if (mainAudio) mainAudio.playbackRate = playbackSpeed;

        speedSlider.addEventListener('input', (e) => {
            playbackSpeed = parseFloat(e.target.value);
            speedValue.textContent = playbackSpeed.toFixed(1) + 'x';
            if (mainAudio) mainAudio.playbackRate = playbackSpeed;
            saveAllSettings();
        });
    }

    // Sleep Timer
    const sleepTimerSelect = document.getElementById('sleep-timer');
    const sleepTimerStatus = document.getElementById('sleep-timer-status');
    if (sleepTimerSelect && sleepTimerStatus) {
        sleepTimerSelect.addEventListener('change', (e) => {
            const minutes = parseInt(e.target.value);
            setSleepTimer(minutes);
        });
    }

    // Gapless Playback
    const gaplessToggle = document.getElementById('gapless-toggle');
    if (gaplessToggle) {
        // Value loaded from Firebase in loadAllSettings
        gaplessToggle.checked = gaplessPlayback;
        gaplessToggle.addEventListener('change', (e) => {
            gaplessPlayback = e.target.checked;
            saveAllSettings();
        });
    }

    // Auto-play Next
    const autoplayToggle = document.getElementById('autoplay-toggle');
    if (autoplayToggle) {
        // Value loaded from Firebase in loadAllSettings
        autoplayToggle.checked = autoPlayNext;
        autoplayToggle.addEventListener('change', (e) => {
            autoPlayNext = e.target.checked;
            saveAllSettings();
        });
    }
}

// Enhanced Features Setup
function setupEnhancedFeatures() {
    // Load statistics
    loadStatistics();


    // Setup queue reordering
    setupQueueReordering();

    // Setup advanced keyboard shortcuts
    setupAdvancedKeyboardShortcuts();

    // Setup quick access
    setupQuickAccess();
}

// Sleep Timer
function setSleepTimer(minutes) {
    if (sleepTimer) {
        clearTimeout(sleepTimer);
        sleepTimer = null;
    }

    if (minutes === 0) {
        sleepTimerStatus.textContent = '';
        return;
    }

    sleepTimerDuration = minutes * 60 * 1000;
    const endTime = Date.now() + sleepTimerDuration;

    sleepTimerStatus.textContent = `Timer set: ${minutes} min`;

    sleepTimer = setTimeout(() => {
        pauseMusic();
        showNotification('Sleep timer: Playback stopped');
        sleepTimerStatus.textContent = '';
        sleepTimer = null;
    }, sleepTimerDuration);

    // Update status every minute
    const updateInterval = setInterval(() => {
        const remaining = Math.ceil((endTime - Date.now()) / 1000 / 60);
        if (remaining > 0) {
            sleepTimerStatus.textContent = `Timer: ${remaining} min remaining`;
        } else {
            clearInterval(updateInterval);
        }
    }, 60000);
}


// Statistics
async function loadStatistics() {
    if (!userId) return;

    try {
        if (typeof loadStatisticsFromDB === 'function') {
            const stats = await loadStatisticsFromDB(userId);
            if (stats.playCounts) playCounts = stats.playCounts;
            if (stats.recentlyPlayed) recentlyPlayed = stats.recentlyPlayed;
        }
    } catch (err) {
        console.error('Error loading statistics:', err);
    }
    updateStatisticsDisplay();
}

async function saveStatistics() {
    if (!userId) return;

    try {
        const stats = {
            playCounts: playCounts,
            recentlyPlayed: recentlyPlayed
        };
        if (typeof saveStatisticsToDB === 'function') {
            await saveStatisticsToDB(userId, stats);
        }
    } catch (err) {
        console.error('Error saving statistics:', err);
    }
}

function updateStatisticsDisplay() {
    // Update stat cards
    const totalSongs = document.getElementById('total-songs');
    const totalFavorites = document.getElementById('total-favorites');
    const totalPlaylists = document.getElementById('total-playlists');
    const totalPlays = document.getElementById('total-plays');

    if (totalSongs) totalSongs.textContent = allMusic.length;
    if (totalFavorites) totalFavorites.textContent = favorites.size;
    if (totalPlaylists) totalPlaylists.textContent = playlists.length;
    if (totalPlays) {
        const total = Object.values(playCounts).reduce((a, b) => a + b, 0);
        totalPlays.textContent = total;
    }

    // Update most played list
    updateMostPlayedList();

    // Update recently played list
    updateRecentlyPlayedList();
}

function updateMostPlayedList() {
    const mostPlayedList = document.getElementById('most-played-list');
    if (!mostPlayedList) return;

    const sorted = Object.entries(playCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([index]) => parseInt(index));

    if (sorted.length === 0) {
        mostPlayedList.innerHTML = '<li style="justify-content:center;">No plays yet</li>';
        return;
    }

    const songs = sorted.map(idx => allMusic[idx - 1]).filter(Boolean);
    loadMusicList(songs, mostPlayedList);
}

function updateRecentlyPlayedList() {
    const recentlyPlayedList = document.getElementById('recently-played-list');
    if (!recentlyPlayedList) return;

    if (recentlyPlayed.length === 0) {
        recentlyPlayedList.innerHTML = '<li style="justify-content:center;">No recent plays</li>';
        return;
    }

    const songs = recentlyPlayed.slice(0, 10).map(idx => allMusic[idx - 1]).filter(Boolean);
    loadMusicList(songs, recentlyPlayedList);
}

// Queue Reordering
function setupQueueReordering() {
    const shuffleQueueBtn = document.getElementById('shuffle-queue');
    if (shuffleQueueBtn) {
        shuffleQueueBtn.addEventListener('click', () => {
            // Shuffle queue
            for (let i = songQueue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [songQueue[i], songQueue[j]] = [songQueue[j], songQueue[i]];
            }
            saveQueue();
            updateQueueUI();
            showNotification('Queue shuffled');
        });
    }
}

// Update queue UI with reordering
function updateQueueUI() {
    const queueList = document.getElementById('queue-list');
    if (!queueList) return;

    if (songQueue.length === 0) {
        queueList.innerHTML = '<p class="empty-queue">Queue is empty. Add songs to get started!</p>';
        return;
    }

    queueList.innerHTML = '';
    songQueue.forEach((songIndex, queueIndex) => {
        const song = allMusic[songIndex - 1];
        if (!song) return;

        const queueItem = document.createElement('div');
        queueItem.classList.add('queue-item');
        queueItem.draggable = true;
        queueItem.dataset.queueIndex = queueIndex;
        if (songIndex === musicIndex) {
            queueItem.classList.add('playing');
        }

        const qImg = document.createElement('img');
        attemptImageFormats(qImg, `images/${song.img}`, `images/music-placeholder.webp`);

        const qInfo = document.createElement('div');
        qInfo.className = 'queue-item-info';
        qInfo.innerHTML = `
            <div class="name">${song.name}</div>
            <div class="artist">${song.artist}</div>
        `;

        const qActions = document.createElement('div');
        qActions.className = 'queue-item-actions';

        const qMoveUp = document.createElement('i');
        qMoveUp.className = 'material-icons queue-move';
        qMoveUp.innerText = 'arrow_upward';
        qMoveUp.title = 'Move up';
        qMoveUp.style.display = queueIndex === 0 ? 'none' : 'block';

        const qMoveDown = document.createElement('i');
        qMoveDown.className = 'material-icons queue-move';
        qMoveDown.innerText = 'arrow_downward';
        qMoveDown.title = 'Move down';
        qMoveDown.style.display = queueIndex === songQueue.length - 1 ? 'none' : 'block';

        const qRemove = document.createElement('i');
        qRemove.className = 'material-icons queue-item-remove';
        qRemove.innerText = 'close';
        qRemove.title = 'Remove';

        qActions.appendChild(qMoveUp);
        qActions.appendChild(qMoveDown);
        qActions.appendChild(qRemove);

        queueItem.appendChild(qImg);
        queueItem.appendChild(qInfo);
        queueItem.appendChild(qActions);

        queueItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('queue-item-remove') &&
                !e.target.classList.contains('queue-move')) {
                playSongFromList(songIndex);
            }
        });

        qMoveUp.addEventListener('click', (e) => {
            e.stopPropagation();
            if (queueIndex > 0) {
                [songQueue[queueIndex], songQueue[queueIndex - 1]] =
                    [songQueue[queueIndex - 1], songQueue[queueIndex]];
                saveQueue();
                updateQueueUI();
            }
        });

        qMoveDown.addEventListener('click', (e) => {
            e.stopPropagation();
            if (queueIndex < songQueue.length - 1) {
                [songQueue[queueIndex], songQueue[queueIndex + 1]] =
                    [songQueue[queueIndex + 1], songQueue[queueIndex]];
                saveQueue();
                updateQueueUI();
            }
        });

        queueItem.querySelector('.queue-item-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromQueue(songIndex);
        });

        // Drag and drop
        queueItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', queueIndex);
            queueItem.classList.add('dragging');
        });

        queueItem.addEventListener('dragend', () => {
            queueItem.classList.remove('dragging');
        });

        queueItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(queueList, e.clientY);
            if (afterElement == null) {
                queueList.appendChild(queueItem);
            } else {
                queueList.insertBefore(queueItem, afterElement);
            }
        });

        queueItem.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const targetIndex = parseInt(queueItem.dataset.queueIndex);
            if (draggedIndex !== targetIndex) {
                [songQueue[draggedIndex], songQueue[targetIndex]] =
                    [songQueue[targetIndex], songQueue[draggedIndex]];
                saveQueue();
                updateQueueUI();
            }
        });

        queueList.appendChild(queueItem);
    });
}

// Advanced Keyboard Shortcuts
function setupAdvancedKeyboardShortcuts() {
    // Global keyboard shortcuts removed
}

// Quick Access
function setupQuickAccess() {
    const recentlyPlayedQuick = document.getElementById('recently-played-quick');
    const mostPlayedQuick = document.getElementById('most-played-quick');

    if (recentlyPlayedQuick) {
        recentlyPlayedQuick.addEventListener('click', () => {
            // Show recently played in a modal or switch to stats view
            document.querySelector('[data-view="settings"]').click();
            setTimeout(() => {
                document.querySelector('[data-settings-tab="stats"]').click();
                document.getElementById('recently-played-list').scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });
    }

    if (mostPlayedQuick) {
        mostPlayedQuick.addEventListener('click', () => {
            document.querySelector('[data-view="settings"]').click();
            setTimeout(() => {
                document.querySelector('[data-settings-tab="stats"]').click();
                document.getElementById('most-played-list').scrollIntoView({ behavior: 'smooth' });
            }, 100);
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

    // Make song info clickable to expand on mobile
    if (miniImg) {
        miniImg.style.cursor = 'pointer';
        miniImg.addEventListener('click', expandHandler);
    }
    const miniDetails = document.querySelector('.player-bar .details');
    if (miniDetails) {
        miniDetails.style.cursor = 'pointer';
        miniDetails.addEventListener('click', expandHandler);
    }
}
// Queue and Visualizer Functions for music-Scripts.js

// Queue Management

// Initialize Queue and Visualizer
async function initializeQueueAndVisualizer() {
    // Load saved queue from Firebase
    if (!userId) {
        userId = await getUserId();
        window.userId = userId;
    }
    try {
        if (typeof loadQueue === 'function') {
            songQueue = await loadQueue(userId);
            updateQueueUI();
        }
    } catch (e) {
        console.error('Failed to load queue:', e);
    }

    // Initialize visualizer and equalizer
    const visualizerCanvas = document.getElementById('audio-visualizer');
    if (visualizerCanvas) {
        visualizer = new AudioVisualizer(mainAudio, visualizerCanvas);
        // Initialize equalizer (will be created in visualizer.js)
        if (window.initEqualizer) {
            window.initEqualizer(mainAudio);
        }
    }

    setupQueueHandlers();
    setupVisualizerHandlers();
}

// Normalization
let gainNode = null;
let audioContextForNormalization = null;
let sourceNodeForNormalization = null;

function enableNormalization() {
    if (!audioContextForNormalization) {
        audioContextForNormalization = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!gainNode) {
        gainNode = audioContextForNormalization.createGain();
        gainNode.connect(audioContextForNormalization.destination);
    }

    // Analyze audio and adjust gain
    const analyser = audioContextForNormalization.createAnalyser();
    analyser.fftSize = 2048;

    // Connect main audio to analyser
    if (mainAudio.src) {
        if (!sourceNodeForNormalization) {
            sourceNodeForNormalization = audioContextForNormalization.createMediaElementSource(mainAudio);
        }
        sourceNodeForNormalization.connect(analyser);
        analyser.connect(gainNode);

        // Analyze and adjust
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function analyze() {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            // Target level (adjust based on your preference)
            const targetLevel = 100;
            const adjustment = targetLevel / (average || 1);
            gainNode.gain.value = Math.min(2, Math.max(0.1, adjustment * 0.8));
            requestAnimationFrame(analyze);
        }

        analyze();
    }
}

function disableNormalization() {
    if (gainNode) {
        gainNode.gain.value = 1;
    }
}

// EQ Presets
function applyEQPreset(preset) {
    if (!window.equalizer) return;

    const presets = {
        normal: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        'bass-boost': [6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
        'treble-boost': [0, 0, 0, 0, 0, 0, 2, 4, 6, 6],
        pop: [2, 1, 0, -1, -1, 0, 1, 2, 3, 3],
        rock: [3, 2, -1, -2, -1, 1, 2, 3, 2, 2],
        classical: [0, 0, 0, 0, 0, 0, -1, -1, -1, 0]
    };

    const gains = presets[preset] || presets.normal;
    gains.forEach((gain, index) => {
        window.equalizer.setBandGain(index, gain);
        const slider = document.querySelector(`.eq-slider[data-band="${index}"]`);
        if (slider) {
            slider.value = gain;
        }
    });
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
    if (isMobileDevice()) {
        console.log('Mobile device detected: skipping visualizer handlers setup');
        return;
    }
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

            // When enabling, ensure full-screen player is open â€” visualizer should only be visible there
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



// Store reference to db-manager's saveQueue before we shadow it
// This must be done before our local saveQueue function is defined
let dbSaveQueueFn = null;
if (typeof saveQueue === 'function' && saveQueue.length === 2) {
    // This is likely the db-manager version (takes userId, queue)
    dbSaveQueueFn = saveQueue;
}

// Save queue to Firebase (internal async function)
async function saveQueueToFirebase() {
    if (!userId) {
        userId = await getUserId();
        window.userId = userId;
    }
    try {
        // Use stored reference or try to find it at runtime
        let saveFn = dbSaveQueueFn;
        if (!saveFn) {
            // Try to find it - check if there's a function with 2 parameters
            // This is a workaround for the shadowing issue
            const possibleFn = window.saveQueue || (typeof saveQueue === 'function' && saveQueue.length === 2 ? saveQueue : null);
            if (possibleFn && possibleFn !== saveQueueToFirebase) {
                saveFn = possibleFn;
            }
        }

        if (saveFn && typeof saveFn === 'function') {
            await saveFn(userId, songQueue);
        }
    } catch (e) {
        console.error('Failed to save queue:', e);
    }
}

// Wrapper function for compatibility with existing code
function saveQueue() {
    // Call the async function but don't block
    saveQueueToFirebase().catch(err => {
        console.error('Error saving queue:', err);
    });
}

// Modified next music to check queue first
function nextMusicWithQueue() {
    if (songQueue.length > 0) {
        const nextIndex = songQueue.shift(); // Get and remove first item
        saveQueue();
        updateQueueUI();

        if (crossfadeDuration > 0 && !isCrossfading) {
            // Use crossfade for queue too
            isCrossfading = true;
            nextMusicIndex = nextIndex;

            const nextSong = allMusic[nextMusicIndex - 1];
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

                        const temp = mainAudio.src;
                        mainAudio.src = crossfadeAudio.src;
                        crossfadeAudio.src = temp;

                        musicIndex = nextMusicIndex;
                        loadMusic(musicIndex);
                        mainAudio.play();

                        crossfadeAudio.volume = 0;
                        isCrossfading = false;
                    }
                }, fadeInterval);
            };

            crossfadeAudio.play().then(() => {
                fadeOut();
            }).catch(err => {
                console.error('Crossfade error:', err);
                isCrossfading = false;
                musicIndex = nextIndex;
                loadMusic(musicIndex);
                playMusic();
            });
        } else {
            musicIndex = nextIndex;
            loadMusic(musicIndex);
            playMusic();
        }
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

// ==================== PLAYLISTS FUNCTIONALITY ====================

// Load playlists from Firebase
async function loadPlaylistsFromStorage() {
    if (!userId) {
        userId = await getUserId();
        window.userId = userId;
    }
    try {
        if (typeof loadPlaylists === 'function') {
            playlists = await loadPlaylists(userId);
        } else {
            playlists = [];
        }
    } catch (err) {
        console.error('Error loading playlists:', err);
        playlists = [];
    }
    renderPlaylists();
}

// Save playlists to Firebase
async function savePlaylistsToStorage() {
    if (!userId) {
        userId = await getUserId();
        window.userId = userId;
    }
    try {
        if (typeof savePlaylists === 'function') {
            await savePlaylists(userId, playlists);
        }
    } catch (err) {
        console.error('Error saving playlists:', err);
    }
}

// Render playlists grid
function renderPlaylists() {
    if (!playlistsGrid) return;
    playlistsGrid.innerHTML = '';

    if (playlists.length === 0) {
        playlistsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No playlists yet. Create one to get started!</p>';
        return;
    }

    playlists.forEach((playlist, index) => {
        const div = document.createElement('div');
        div.className = 'playlist-card';

        // Create artwork (Grid of 4 or first song)
        const artworkDiv = document.createElement('div');
        artworkDiv.className = 'playlist-artwork-preview';

        // Filter and get unique song images for the grid
        const uniqueThumbnails = [];
        const seenThumbnails = new Set();

        for (const songSrc of playlist.songs) {
            const song = allMusic.find(m => m.src === songSrc);
            if (song && !seenThumbnails.has(song.img)) {
                uniqueThumbnails.push(song);
                seenThumbnails.add(song.img);
            }
            if (uniqueThumbnails.length >= 4) break;
        }

        if (uniqueThumbnails.length >= 4) {
            artworkDiv.classList.add('grid-artwork');
            uniqueThumbnails.forEach(song => {
                const img = document.createElement('img');
                attemptImageFormats(img, `images/${song.img}`, 'images/music-placeholder.webp');
                artworkDiv.appendChild(img);
            });
        } else if (playlist.songs.length > 0) {
            const firstSong = allMusic.find(m => m.src === playlist.songs[0]);
            const img = document.createElement('img');
            attemptImageFormats(img, firstSong ? `images/${firstSong.img}` : 'images/music-placeholder.webp', 'images/music-placeholder.webp');
            artworkDiv.appendChild(img);
        } else {
            artworkDiv.innerHTML = '<i class="material-icons">queue_music</i>';
        }

        div.appendChild(artworkDiv);

        const h3 = document.createElement('h3');
        h3.textContent = playlist.name;
        div.appendChild(h3);

        const p = document.createElement('p');
        p.textContent = `${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}`;
        div.appendChild(p);

        div.onclick = () => loadPlaylistDetails(index);
        playlistsGrid.appendChild(div);
    });
}

// Create new playlist
function createPlaylist() {
    openModal('Create Playlist', '', (name) => {
        const newPlaylist = {
            id: Date.now().toString(),
            name: name,
            songs: [],
            createdAt: new Date().toISOString()
        };

        playlists.push(newPlaylist);
        savePlaylistsToStorage();
        renderPlaylists();
        showNotification(`Created playlist: ${name}`);
    });
}

// Load playlist details
function loadPlaylistDetails(index) {
    const playlist = playlists[index];
    if (!playlist) return;

    playlistDetailName.textContent = playlist.name;
    playlistDetailInfo.textContent = `${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}`;

    // Render artwork and header background
    playlistArtwork.innerHTML = '';
    const headerBg = document.getElementById('playlist-header-bg');

    if (playlist.songs.length > 0) {
        const song = allMusic.find(m => m.src === playlist.songs[0]);
        const imgSrc = song ? `images/${song.img}` : 'images/music-placeholder.webp';

        const img = document.createElement('img');
        attemptImageFormats(img, imgSrc, 'images/music-placeholder.webp');
        playlistArtwork.appendChild(img);

        // Set header bg to first song image
        if (headerBg) {
            const bgImg = document.createElement('img');
            attemptImageFormats(bgImg, imgSrc, 'images/music-placeholder.webp');
            bgImg.onload = () => {
                headerBg.style.backgroundImage = `url(${bgImg.src})`;
            };
        }
    } else {
        playlistArtwork.innerHTML = '<i class="material-icons">queue_music</i>';
        if (headerBg) headerBg.style.backgroundImage = '';
    }

    // Render songs
    playlistSongsUl.innerHTML = '';
    playlist.songs.forEach(songSrc => {
        const song = allMusic.find(m => m.src === songSrc);
        if (!song) return;

        const originalIndex = allMusic.indexOf(song) + 1;
        const li = document.createElement('li');
        li.className = 'playlist-song-item';
        li.draggable = true;
        li.dataset.songSrc = songSrc;

        // Standardized Left Side: Image + Text
        const rowLeft = document.createElement('div');
        rowLeft.className = 'row-left';

        const imgEl = document.createElement('img');
        attemptImageFormats(imgEl, `images/${song.img}`, `images/music-placeholder.webp`);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        infoDiv.innerHTML = `<span>${song.name}</span><p>${song.artist}</p>`;

        rowLeft.appendChild(imgEl);
        rowLeft.appendChild(infoDiv);
        li.appendChild(rowLeft);

        // Standardized Right Side: Actions
        const rowRight = document.createElement('div');
        rowRight.className = 'row-right';

        // Action: Heart icon
        const heart = document.createElement('i');
        heart.className = 'material-icons heart ' + (isFavorite(originalIndex) ? 'active' : '');
        heart.title = 'Like';
        heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex);
            heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
            heart.classList.toggle('active', isFavorite(originalIndex));
        });

        // Action: Remove from playlist
        const removeBtn = document.createElement('i');
        removeBtn.className = 'material-icons remove-from-playlist';
        removeBtn.title = 'Remove from playlist';
        removeBtn.innerText = 'close';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromPlaylist(index, songSrc);
        });

        rowRight.appendChild(heart);
        rowRight.appendChild(removeBtn);
        li.appendChild(rowRight);

        // Click to play
        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-from-playlist') && !e.target.classList.contains('heart')) {
                playSongFromList(originalIndex);
            }
        });


        // Drag and drop
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', songSrc);
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(playlistSongsUl, e.clientY);
            if (afterElement == null) {
                playlistSongsUl.appendChild(li);
            } else {
                playlistSongsUl.insertBefore(li, afterElement);
            }
        });

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedSrc = e.dataTransfer.getData('text/plain');
            reorderPlaylistSongs(index, draggedSrc, songSrc);
        });

        if (originalIndex === musicIndex) {
            li.classList.add('playing');
        }

        playlistSongsUl.appendChild(li);
    });

    // Switch view
    switchView("playlist-details-view");

    // Store current playlist index
    playlistDetailsView.dataset.playlistIndex = index;

    // Play all handler
    playlistPlayAll.onclick = () => {
        if (playlist.songs.length > 0) {
            const firstSong = allMusic.find(m => m.src === playlist.songs[0]);
            if (firstSong) {
                playSongFromList(allMusic.indexOf(firstSong) + 1);
                // Add rest to queue
                playlist.songs.slice(1).forEach(songSrc => {
                    const song = allMusic.find(m => m.src === songSrc);
                    if (song) {
                        addToQueue(allMusic.indexOf(song) + 1);
                    }
                });
            }
        }
    };

    // Edit handler
    playlistEditBtn.onclick = () => {
        openModal('Edit Playlist', playlist.name, (newName) => {
            playlist.name = newName;
            savePlaylistsToStorage();
            loadPlaylistDetails(index);
            renderPlaylists();
            showNotification('Playlist updated');
        });
    };

    // Delete handler
    playlistDeleteBtn.onclick = () => {
        if (confirm(`Delete playlist "${playlist.name}"?`)) {
            playlists.splice(index, 1);
            savePlaylistsToStorage();
            renderPlaylists();
            // Go back to library playlists view
            const libraryView = document.getElementById('library-view');
            if (libraryView) {
                switchView("library-view");

                // Activate Playlists tab in Library
                const libTabs = document.querySelectorAll('.lib-tab');
                const libPanels = document.querySelectorAll('.lib-panel');
                libTabs.forEach(t => t.classList.remove('active'));
                libPanels.forEach(p => p.classList.remove('active'));

                const playlistsTab = document.querySelector('[data-lib-tab="playlists"]');
                const playlistsPanel = document.getElementById('lib-playlists');
                if (playlistsTab) playlistsTab.classList.add('active');
                if (playlistsPanel) playlistsPanel.classList.add('active');

                // Update sidebar active state
                document.querySelectorAll(".sidebar li").forEach(l => l.classList.remove("active"));
                const librarySidebarItem = document.querySelector('[data-view="library"]');
                if (librarySidebarItem) librarySidebarItem.classList.add("active");
            }
        }
    };
}

// Remove song from playlist
function removeFromPlaylist(playlistIndex, songSrc) {
    const playlist = playlists[playlistIndex];
    if (!playlist) return;

    playlist.songs = playlist.songs.filter(s => s !== songSrc);
    savePlaylistsToStorage();
    loadPlaylistDetails(playlistIndex);
    renderPlaylists();
    showNotification('Removed from playlist');
}

// Reorder playlist songs
function reorderPlaylistSongs(playlistIndex, draggedSrc, targetSrc) {
    const playlist = playlists[playlistIndex];
    if (!playlist) return;

    const draggedIndex = playlist.songs.indexOf(draggedSrc);
    const targetIndex = playlist.songs.indexOf(targetSrc);

    if (draggedIndex === -1 || targetIndex === -1) return;

    playlist.songs.splice(draggedIndex, 1);
    playlist.songs.splice(targetIndex, 0, draggedSrc);

    savePlaylistsToStorage();
    loadPlaylistDetails(playlistIndex);
}

// Helper for drag and drop
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Show playlist menu
function showPlaylistMenu(songIndex, buttonElement) {
    if (playlists.length === 0) {
        showNotification('Create a playlist first!');
        return;
    }

    // Create menu
    const menu = document.createElement('div');
    menu.className = 'playlist-menu';
    menu.style.cssText = `
        position: absolute;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 8px 0;
        z-index: 10000;
        min-width: 200px;
        max-height: 300px;
        overflow-y: auto;
    `;

    const rect = buttonElement.getBoundingClientRect();
    menu.style.top = (rect.bottom + 5) + 'px';
    menu.style.left = (rect.left - 150) + 'px';

    playlists.forEach((playlist, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-menu-item';
        item.style.cssText = `
            padding: 10px 20px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        item.textContent = playlist.name;
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f5f5f5';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
        });
        item.addEventListener('click', () => {
            addToPlaylist(index, songIndex);
            document.body.removeChild(menu);
        });
        menu.appendChild(item);
    });

    document.body.appendChild(menu);

    // Close on outside click
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== buttonElement) {
            document.body.removeChild(menu);
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

// Add song to playlist (called from context menu or button)
function addToPlaylist(playlistIndex, songIndex) {
    const playlist = playlists[playlistIndex];
    const song = allMusic[songIndex - 1];
    if (!playlist || !song) return;

    if (!playlist.songs.includes(song.src)) {
        playlist.songs.push(song.src);
        savePlaylistsToStorage();
        renderPlaylists();
        showNotification(`Added to ${playlist.name}`);
    } else {
        showNotification('Song already in playlist');
    }
}

// Playlist back button
if (playlistBackBtn) {
    playlistBackBtn.addEventListener('click', () => {
        playlistDetailsView.classList.remove('active');
        // Standardized return to Library view
        const libraryView = document.getElementById('library-view');

        if (libraryView) {
            document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
            libraryView.classList.add('active');

            // Activate Playlists tab in Library
            const libTabs = document.querySelectorAll('.lib-tab');
            const libPanels = document.querySelectorAll('.lib-panel');
            libTabs.forEach(t => t.classList.remove('active'));
            libPanels.forEach(p => p.classList.remove('active'));

            const playlistsTab = document.querySelector('[data-lib-tab="playlists"]');
            const playlistsPanel = document.getElementById('lib-playlists');
            if (playlistsTab) playlistsTab.classList.add('active');
            if (playlistsPanel) playlistsPanel.classList.add('active');

            // Update sidebar active state
            document.querySelectorAll(".sidebar li").forEach(l => l.classList.remove("active"));
            const librarySidebarItem = document.querySelector('[data-view="library"]');
            if (librarySidebarItem) librarySidebarItem.classList.add("active");
        }
    });
}

// Create playlist button
// Redundant listener removed - handled in initializeApp

// Profile Logic
function setupProfile() {
    const profileName = document.getElementById('settings-profile-name');
    const profileEmail = document.getElementById('settings-profile-email');
    const profileImg = document.getElementById('settings-profile-img');
    const editNameInput = document.getElementById('edit-display-name');
    const saveBtn = document.getElementById('save-profile-btn');
    const signOutBtn = document.getElementById('sign-out-btn');

    // Sidebar Elements
    const sidebarName = document.getElementById('sidebar-profile-name');
    const sidebarImg = document.getElementById('sidebar-profile-img');
    const sidebarSignOutBtn = document.getElementById('sidebar-sign-out-btn');

    // Populate from Auth
    const user = firebase.auth().currentUser;
    if (user) {
        const displayName = user.displayName || 'Friend';
        const photoURL = user.photoURL || 'images/music-placeholder.webp';

        if (profileName) profileName.innerText = displayName;
        if (profileEmail) profileEmail.innerText = user.email || '';
        if (profileImg) profileImg.src = photoURL;
        if (editNameInput) editNameInput.value = user.displayName || '';

        // Sidebar
        if (sidebarName) sidebarName.innerText = displayName;
        if (sidebarImg) sidebarImg.src = photoURL;
    }

    // Save Profile
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const newName = editNameInput.value.trim();
            if (newName) {
                try {
                    saveBtn.innerText = 'Saving...';
                    await user.updateProfile({
                        displayName: newName
                    });

                    // Update DB doc
                    if (userId) {
                        try {
                            await db.collection('users').doc(userId).set({
                                displayName: newName
                            }, { merge: true });
                        } catch (e) { console.error(e); }
                    }

                    if (profileName) profileName.innerText = newName;
                    if (sidebarName) sidebarName.innerText = newName; // Update sidebar too

                    // Update greeting immediately
                    updateGreeting(newName);

                    saveBtn.innerText = 'Saved!';
                    setTimeout(() => saveBtn.innerText = 'Save', 2000);
                } catch (error) {
                    console.error("Error updating profile:", error);
                    saveBtn.innerText = 'Error';
                }
            }
        });
    }

    // Sign Out Buttons
    const handleSignOut = () => {
        if (typeof signOutUser === 'function') {
            signOutUser();
        } else {
            console.error("signOutUser function not found");
            if (firebase.auth()) firebase.auth().signOut().then(() => window.location.reload());
        }
    };

    if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
    if (sidebarSignOutBtn) sidebarSignOutBtn.addEventListener('click', handleSignOut);
}

// ==================== APP INITIALIZATION ====================

// Initialize App after Authentication
async function initializeApp(user) {
    // Determine userId from the authenticated user
    userId = user.uid;
    console.log("Initializing app for user:", userId);

    if (typeof ColorThief !== 'undefined') {
        colorThief = new ColorThief();
    }

    // Initialize Firebase sync (db-manager has ensureUserInitialized)
    if (typeof ensureUserInitialized === 'function') {
        await ensureUserInitialized();
    }

    // Using existing initFirebaseSync loggic but adapted
    if (typeof initFirebaseSync === 'function') {
        await initFirebaseSync();
    }

    // Initialize Theme Manager
    themeManager = new ThemeManager();
    // Initialize dark mode and load theme from Firebase
    await themeManager.initDarkMode();

    // Wait for theme to load and update UI
    const savedTheme = await themeManager.loadTheme();
    if (savedTheme) {
        const themeOption = document.querySelector(`[data-theme="${savedTheme.name}"]`);
        if (themeOption) {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            themeOption.classList.add('active');
            if (savedTheme.name === 'custom' && savedTheme.customColor) {
                const customPicker = document.querySelector('.custom-color-picker');
                if (customPicker) customPicker.style.display = 'block';
                const colorInput = document.getElementById('custom-theme-color');
                if (colorInput) colorInput.value = savedTheme.customColor;
            }
        }
    }

    // Update greeting based on time
    updateGreeting(user.displayName || 'Friend');

    // Load UI components
    loadMusicList(allMusic, musicListUl);
    renderTrendingSongs();
    loadArtists();
    loadAlbums();
    loadFeaturedContent();
    loadPlaylistsFromStorage();

    // Load first song but don't play
    loadMusic(musicIndex);

    // Setup Handlers
    setupNavigation();
    setupLibrary();
    setupSettings();
    setupPlayerAnimation();
    setupEnhancedFeatures();
    setupProfile();
    loadStatistics();
    initializeQueueAndVisualizer();

    // Create playlist button listener
    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', createPlaylist);
    }

    if (typeof setupLyricsHandlers === 'function') {
        setupLyricsHandlers();
    }
}

// Listen for user authentication
window.addEventListener('user-authenticated', async (e) => {
    await initializeApp(e.detail.user);
});
