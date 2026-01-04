// Playlist Manager

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

        const artworkDiv = document.createElement('div');
        artworkDiv.className = 'playlist-artwork-preview';

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
        const h3 = document.createElement('h3'); h3.textContent = playlist.name;
        div.appendChild(h3);
        const p = document.createElement('p'); p.textContent = `${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}`;
        div.appendChild(p);
        div.onclick = () => loadPlaylistDetails(index);
        playlistsGrid.appendChild(div);
    });
}

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

function loadPlaylistDetails(index) {
    const playlist = playlists[index];
    if (!playlist) return;

    playlistDetailName.textContent = playlist.name;
    playlistDetailInfo.textContent = `${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}`;

    playlistArtwork.innerHTML = '';
    const headerBg = document.getElementById('playlist-header-bg');

    if (playlist.songs.length > 0) {
        const song = allMusic.find(m => m.src === playlist.songs[0]);
        const imgSrc = song ? `images/${song.img}` : 'images/music-placeholder.webp';
        const img = document.createElement('img');
        attemptImageFormats(img, imgSrc, 'images/music-placeholder.webp');
        playlistArtwork.appendChild(img);
        if (headerBg) {
            const bgImg = document.createElement('img');
            attemptImageFormats(bgImg, imgSrc, 'images/music-placeholder.webp');
            bgImg.onload = () => { headerBg.style.backgroundImage = `url(${bgImg.src})`; };
        }
    } else {
        playlistArtwork.innerHTML = '<i class="material-icons">queue_music</i>';
        if (headerBg) headerBg.style.backgroundImage = '';
    }

    playlistSongsUl.innerHTML = '';
    playlist.songs.forEach((songSrc, i) => {
        const song = allMusic.find(m => m.src === songSrc);
        if (!song) return;

        const originalIndex = allMusic.indexOf(song) + 1;
        const li = document.createElement('li');
        li.style.opacity = '0';
        li.style.animation = `fadeIn 0.4s ease forwards ${Math.min(i * 0.05, 1.0)}s`;
        li.className = 'playlist-song-item';
        li.draggable = true;
        li.dataset.songSrc = songSrc;

        const rowLeft = document.createElement('div');
        rowLeft.className = 'row-left';
        const imgEl = document.createElement('img');
        attemptImageFormats(imgEl, `images/${song.img}`, `images/music-placeholder.webp`);
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        infoDiv.innerHTML = `<span>${song.name}</span><p>${song.artist}</p>`;
        rowLeft.appendChild(imgEl); rowLeft.appendChild(infoDiv);
        li.appendChild(rowLeft);

        const rowRight = document.createElement('div');
        rowRight.className = 'row-right';
        const heart = document.createElement('i');
        heart.className = 'material-icons heart ' + (isFavorite(originalIndex) ? 'active' : '');
        heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex);
            heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
            heart.classList.toggle('active', isFavorite(originalIndex));
        });

        const removeBtn = document.createElement('i');
        removeBtn.className = 'material-icons remove-from-playlist';
        removeBtn.innerText = 'close';
        removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeFromPlaylist(index, songSrc); });

        const playlistBtn = document.createElement('i');
        playlistBtn.className = 'material-icons add-to-playlist-btn';
        playlistBtn.title = 'Add to playlist';
        playlistBtn.innerText = 'playlist_add';
        playlistBtn.style.display = 'none';
        playlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPlaylistMenu(originalIndex, playlistBtn);
        });

        // Show on hover
        li.addEventListener('mouseenter', () => {
            // Don't check playlists.length > 0 strictly if we want to allow creating new? 
            // But existing logic does. Keep consistent.
            if (playlists.length > 0) playlistBtn.style.display = 'block';
        });
        li.addEventListener('mouseleave', () => { playlistBtn.style.display = 'none'; });

        rowRight.appendChild(heart);
        rowRight.appendChild(playlistBtn);
        rowRight.appendChild(removeBtn);
        li.appendChild(rowRight);

        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-from-playlist') && !e.target.classList.contains('heart')) {
                playSongFromList(originalIndex);
            }
        });
        playlistSongsUl.appendChild(li);
    });

    switchView("playlist-details-view");
    playlistDetailsView.dataset.playlistIndex = index;

    playlistPlayAll.onclick = () => {
        if (playlist.songs.length > 0) {
            const firstSong = allMusic.find(m => m.src === playlist.songs[0]);
            if (firstSong) {
                playSongFromList(allMusic.indexOf(firstSong) + 1);
                playlist.songs.slice(1).forEach(songSrc => {
                    const song = allMusic.find(m => m.src === songSrc);
                    if (song) addToQueue(allMusic.indexOf(song) + 1);
                });
            }
        }
    };

    playlistEditBtn.onclick = () => {
        openModal('Edit Playlist', playlist.name, (newName) => {
            playlist.name = newName;
            savePlaylistsToStorage();
            loadPlaylistDetails(index);
            renderPlaylists();
            showNotification('Playlist updated');
        });
    };

    playlistDeleteBtn.onclick = () => {
        if (confirm(`Delete playlist "${playlist.name}"?`)) {
            playlists.splice(index, 1);
            savePlaylistsToStorage();
            renderPlaylists();
            switchView("library-view");
            // Tab switch logic to 'playlists' inside library-manager or here?
            // Reusing ui-controller logic or library setup?
            // Let's rely on switchView showing library-view.
            // But we need to activate "Playlists" tab.
            const playlistsTab = document.querySelector('[data-lib-tab="playlists"]');
            if (playlistsTab) playlistsTab.click();
        }
    };
}

function removeFromPlaylist(playlistIndex, songSrc) {
    const playlist = playlists[playlistIndex];
    if (!playlist) return;
    playlist.songs = playlist.songs.filter(s => s !== songSrc);
    savePlaylistsToStorage();
    loadPlaylistDetails(playlistIndex);
    renderPlaylists();
    showNotification('Removed from playlist');
}

function showPlaylistMenu(songIndex, buttonElement) {
    if (playlists.length === 0) {
        showNotification('Create a playlist first!');
        return;
    }
    const menu = document.createElement('div');
    menu.className = 'playlist-menu';
    menu.style.cssText = `position: absolute; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 8px 0; z-index: 10000; min-width: 200px; max-height: 300px; overflow-y: auto;`;
    const rect = buttonElement.getBoundingClientRect();
    menu.style.top = (rect.bottom + 5) + 'px';
    menu.style.left = (rect.left - 150) + 'px';

    playlists.forEach((playlist, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-menu-item';
        item.style.cssText = `padding: 10px 20px; cursor: pointer; transition: background 0.2s;`;
        item.textContent = playlist.name;
        item.onmouseenter = () => item.style.background = '#f5f5f5';
        item.onmouseleave = () => item.style.background = 'transparent';
        item.onclick = () => { addToPlaylist(index, songIndex); document.body.removeChild(menu); };
        menu.appendChild(item);
    });

    document.body.appendChild(menu);
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== buttonElement) {
            if (document.body.contains(menu)) {
                document.body.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

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

// Setup listeners
function setupPlaylistListeners() {
    if (playlistBackBtn) {
        playlistBackBtn.addEventListener('click', () => {
            switchView("library-view");
            const playlistsTab = document.querySelector('[data-lib-tab="playlists"]');
            if (playlistsTab) playlistsTab.click();
        });
    }
    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', createPlaylist);
    }
}

// Auto-run if elements exist (script is loaded at end of body)
setupPlaylistListeners();
