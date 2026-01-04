// Profile and Statistics Manager

function setupProfile() {
    const profileName = document.getElementById('settings-profile-name');
    const profileEmail = document.getElementById('settings-profile-email');
    const profileImg = document.getElementById('settings-profile-img');
    const editNameInput = document.getElementById('edit-display-name');
    const saveBtn = document.getElementById('save-profile-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const sidebarName = document.getElementById('sidebar-profile-name');
    const sidebarImg = document.getElementById('sidebar-profile-img');
    const sidebarSignOutBtn = document.getElementById('sidebar-sign-out-btn');

    const user = firebase.auth().currentUser;
    if (user) {
        const displayName = user.displayName || 'Friend';
        const photoURL = user.photoURL || 'images/music-placeholder.webp';

        if (profileName) profileName.innerText = displayName;
        if (profileEmail) profileEmail.innerText = user.email || '';
        if (profileImg) profileImg.src = photoURL;
        if (editNameInput) editNameInput.value = user.displayName || '';
        if (sidebarName) sidebarName.innerText = displayName;
        if (sidebarImg) sidebarImg.src = photoURL;

        const sidebarProfile = document.getElementById('sidebar-profile');
        if (sidebarProfile) {
            sidebarProfile.style.cursor = 'pointer';
            sidebarProfile.onclick = () => {
                switchView('profile-view');
                document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
            };
        }
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const newName = editNameInput.value.trim();
            if (newName) {
                try {
                    saveBtn.innerText = 'Saving...';
                    await user.updateProfile({ displayName: newName });
                    if (userId) {
                        try { await db.collection('users').doc(userId).set({ displayName: newName }, { merge: true }); }
                        catch (e) { console.error(e); }
                    }
                    if (profileName) profileName.innerText = newName;
                    if (sidebarName) sidebarName.innerText = newName;
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

    const handleSignOut = () => {
        if (typeof signOutUser === 'function') signOutUser();
        else if (firebase.auth()) firebase.auth().signOut().then(() => window.location.reload());
    };
    if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
    if (sidebarSignOutBtn) sidebarSignOutBtn.addEventListener('click', handleSignOut);
}

function updateGreeting(name) {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    if (name) greeting += `, ${name}`;
    if (greetingText) greetingText.innerText = greeting;
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
    } catch (err) { console.error(err); }
    updateStatisticsDisplay();
}

async function saveStatistics() {
    if (!userId) return;
    try {
        const stats = { playCounts: playCounts, recentlyPlayed: recentlyPlayed };
        if (typeof saveStatisticsToDB === 'function') await saveStatisticsToDB(userId, stats);
    } catch (err) { console.error(err); }
}

function updateStatisticsDisplay() {
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
    updateMostPlayedList();
    updateRecentlyPlayedList();
}

function updateMostPlayedList() {
    const mostPlayedList = document.getElementById('most-played-list');
    if (!mostPlayedList) return;
    const sorted = Object.entries(playCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([index]) => parseInt(index));

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

// Favorites Sync
async function initFirebaseSync() {
    try {
        userId = await getUserId();
        if (typeof initUser === 'function') await initUser(userId);
        if (typeof loadFavorites === 'function') {
            try {
                const loadedFavorites = await loadFavorites(userId);
                favorites = new Set(loadedFavorites);
            } catch (err) {
                console.error('Error loading favorites from Firebase:', err);
                favorites = new Set([]);
            }
        }
        await loadAllSettings();
    } catch (err) { console.error(err); }
}

async function loadAllSettings() {
    if (!userId || typeof loadSettings !== 'function') return;
    try {
        const settings = await loadSettings(userId);
        if (settings.crossfadeDuration !== undefined) crossfadeDuration = parseFloat(settings.crossfadeDuration);
        if (settings.normalizeVolume !== undefined) normalizeVolume = settings.normalizeVolume === true || settings.normalizeVolume === 'true';
        if (settings.playbackSpeed !== undefined) {
            playbackSpeed = parseFloat(settings.playbackSpeed);
            if (mainAudio) mainAudio.playbackRate = playbackSpeed;
        }
        if (settings.gaplessPlayback !== undefined) gaplessPlayback = settings.gaplessPlayback === true || settings.gaplessPlayback === 'true';
        if (settings.autoPlayNext !== undefined) autoPlayNext = settings.autoPlayNext !== false && settings.autoPlayNext !== 'false';
    } catch (err) { console.error(err); }
}

async function saveAllSettings() {
    if (!userId || typeof saveSettings !== 'function') return;
    try {
        const settings = { crossfadeDuration, normalizeVolume, playbackSpeed, gaplessPlayback, autoPlayNext };
        await saveSettings(userId, settings);
    } catch (err) { console.error(err); }
}

function isFavorite(index) { return favorites.has(index); }
function toggleFavorite(index) {
    if (favorites.has(index)) favorites.delete(index); else favorites.add(index);
    saveFavoritesToStorage();
}
async function saveFavoritesToStorage() {
    try { if (userId && typeof saveFavorites === 'function') await saveFavorites(userId, favorites); }
    catch (e) { console.error(e); }
}

function renderLikedView() {
    if (!likedListUl) return;
    const ids = new Set(Array.from(favorites));
    const favSongs = allMusic.filter((_, i) => ids.has(i + 1));
    const likedPanel = document.getElementById('lib-liked');
    if (likedPanel) {
        const title = likedPanel.querySelector('.section-title h3');
        if (title) title.innerText = `Liked Songs (${favSongs.length})`;
    }
    loadMusicList(favSongs, likedListUl);
}
