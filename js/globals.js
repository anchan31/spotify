// Global Variables and DOM Elements

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
const lyricsOverlay = document.querySelector(".lyrics-overlay");
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

// Playlist Elements
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

// Prompt Elements
const playlistModal = document.getElementById('playlist-modal');
const playlistModalTitle = document.getElementById('playlist-modal-title');
const playlistInput = document.getElementById('playlist-modal-input');
const playlistModalSave = document.getElementById('playlist-modal-save');
const playlistModalCancel = document.getElementById('playlist-modal-cancel');


// Global State Variables
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
let normalizeVolume = false;

// Favorites
let favorites = new Set();
const likedListUl = document.getElementById('liked-list-ul');
let userId = null;

// Playlists
let playlists = [];

// Queue and Visualizer
let songQueue = [];
let isShuffleOn = false;
let repeatMode = 0; // 0: off, 1: repeat all, 2: repeat one
let shuffleOrder = [];
// Visualizer handled in visualizer.js

// Prompt Callback
let modalCallback = null;
