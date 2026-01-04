// Main Entry Point - Glue Code

// App Initialization
async function initializeApp(user) {
    userId = user.uid;
    console.log("Initializing app for user:", userId);

    if (typeof ColorThief !== 'undefined') {
        colorThief = new ColorThief();
    }

    // Initialize Theme Manager
    themeManager = new ThemeManager();

    // Parallelize Independent Async Tasks
    const initPromises = [];

    // 1. Ensure User Doc Exists
    if (typeof ensureUserInitialized === 'function') {
        initPromises.push(ensureUserInitialized());
    }

    // 2. Load User Data (Favorites, Settings)
    if (typeof initFirebaseSync === 'function') {
        initPromises.push(initFirebaseSync());
    }

    // 3. Init Dark Mode
    initPromises.push(themeManager.initDarkMode());

    // Wait for all essential data
    await Promise.all(initPromises);

    // Apply Theme UI Update
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

    // Update greeting
    updateGreeting(user.displayName || 'Friend');

    // Load UI components
    loadMusicList(allMusic, musicListUl);
    renderTrendingSongs();
    loadArtists();
    loadAlbums();
    loadFeaturedContent();
    loadPlaylistsFromStorage();

    // Random Initial Song (1-based index)
    let randomIndex = Math.floor(Math.random() * allMusic.length) + 1;
    loadMusic(randomIndex);

    // Setup Handlers
    setupNavigation();
    setupLibrary();
    setupSearch();
    setupSettings();
    setupPlayerAnimation();
    setupPlayerControls(); // Setup player listeners
    setupProfile();
    loadStatistics();
    initializeQueueAndVisualizer();

    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', createPlaylist);
    }

    if (typeof setupLyricsHandlers === 'function') {
        setupLyricsHandlers();
    }

    // Hide Loading Screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.classList.remove('visible');
            loadingScreen.classList.remove('fade-out');
        }, 500);
    }
}

// Listen for user authentication
window.addEventListener('user-authenticated', async (e) => {
    await initializeApp(e.detail.user);
});
