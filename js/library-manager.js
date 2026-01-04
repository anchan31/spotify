// Library Manager

// Render Music List
function loadMusicList(list, container) {
    container.innerHTML = "";
    if (list.length === 0) {
        container.innerHTML = `<li style="justify-content:center;">No songs found</li>`;
        return;
    }

    list.forEach((song, i) => {
        let originalIndex = allMusic.indexOf(song) + 1;
        let li = document.createElement("li");
        // Staggered Animation
        li.style.opacity = '0';
        li.style.animation = `fadeIn 0.4s ease forwards ${Math.min(i * 0.05, 1.0)}s`;

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

        const queueBtn = document.createElement('i');
        queueBtn.className = 'material-icons add-to-queue';
        queueBtn.title = 'Add to queue';
        queueBtn.innerText = 'queue_music';
        queueBtn.onclick = (e) => { e.stopPropagation(); addToQueue(originalIndex); };

        const durationSpan = document.createElement('span');
        durationSpan.className = 'audio-duration';
        durationSpan.id = `duration-${originalIndex}`;
        durationSpan.innerText = '3:30';

        const heart = document.createElement('i');
        heart.className = 'material-icons heart ' + (isFavorite(originalIndex) ? 'active' : '');
        heart.title = 'Like';
        heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex);
            heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
            heart.classList.toggle('active', isFavorite(originalIndex));
            if (document.getElementById('liked-view') && document.getElementById('liked-view').classList.contains('active')) {
                renderLikedView();
            }
        });

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

        li.addEventListener('mouseenter', () => { if (playlists.length > 0) playlistBtn.style.display = 'block'; });
        li.addEventListener('mouseleave', () => { playlistBtn.style.display = 'none'; });

        li.addEventListener("click", (e) => {
            const target = e.target;
            if (target.closest('.row-right') && (target.tagName === 'I' || target.classList.contains('add-to-queue'))) return;
            playSongFromList(originalIndex);
        });

        if (originalIndex === musicIndex) li.classList.add("playing");

        container.appendChild(li);
    });
}

function loadArtists() {
    const artists = {};
    allMusic.forEach(song => {
        const artistName = song.artist || "Unknown Artist";
        if (!artists[artistName]) artists[artistName] = [];
        artists[artistName].push(song);
    });

    const artistGrid = document.getElementById("artist-grid");
    const circularContainer = document.getElementById("featured-artists");
    if (artistGrid) artistGrid.innerHTML = "";
    if (circularContainer) circularContainer.innerHTML = "";

    Object.keys(artists).forEach(artist => {
        const firstSong = artists[artist][0];
        const artistSlug = artist.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const override = firstSong.artistImg;
        const artistPaths = [];
        if (override) artistPaths.push(`images/artists/${override}`);
        artistPaths.push(`images/artists/${artistSlug}`);
        artistPaths.push(`images/artists/${artist}`);
        artistPaths.push(`images/${firstSong.img}`);

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

        if (circularContainer) {
            let div = document.createElement("div");
            div.classList.add("artist-card");
            const imgEl = document.createElement('img');
            attemptImageFormats(imgEl, artistPaths, `images/music-placeholder.webp`);
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

function loadArtistDetails(artistName, songs) {
    if (adName) adName.innerText = artistName;
    const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const override = songs[0].artistImg;
    const artistPaths = [];
    if (override) artistPaths.push(`images/artists/${override}`);
    artistPaths.push(`images/artists/${artistSlug}`);
    artistPaths.push(`images/artists/${artistName}`);
    artistPaths.push(`images/${songs[0].img}`);

    if (adImg) attemptImageFormats(adImg, artistPaths, `images/music-placeholder.webp`);

    const artistHeaderBg = document.getElementById('artist-header-bg');
    if (artistHeaderBg) {
        const bgImg = document.createElement('img');
        attemptImageFormats(bgImg, artistPaths, 'images/music-placeholder.webp');
        bgImg.onload = () => { artistHeaderBg.style.backgroundImage = `url(${bgImg.src})`; };
    }

    artistSongsUl.innerHTML = "";
    songs.forEach((song, i) => {
        let originalIndex = allMusic.indexOf(song) + 1;
        let li = document.createElement("li");
        li.style.opacity = '0';
        li.style.animation = `fadeIn 0.4s ease forwards ${Math.min(i * 0.05, 1.0)}s`;

        const rowLeft = document.createElement('div');
        rowLeft.className = 'row-left';
        const imgEl = document.createElement('img');
        attemptImageFormats(imgEl, `images/${song.img}`, `images/music-placeholder.webp`);
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        infoDiv.innerHTML = `<span>${song.name}</span><p>${song.artist}</p>`;
        rowLeft.appendChild(imgEl); rowLeft.appendChild(infoDiv);

        const rowRight = document.createElement('div');
        rowRight.className = 'row-right';
        const inQueue = songQueue.includes(originalIndex);
        const queueBtn = document.createElement('i');
        queueBtn.className = 'material-icons queue-toggle';
        queueBtn.title = inQueue ? 'Remove from queue' : 'Add to queue';
        queueBtn.innerText = inQueue ? 'remove_circle' : 'queue_music';
        queueBtn.onclick = (e) => { e.stopPropagation(); toggleQueueForSong(originalIndex, li); };

        const durationSpan = document.createElement('span');
        durationSpan.className = 'audio-duration';
        durationSpan.innerText = '3:30';

        const heart = document.createElement('i');
        heart.className = 'material-icons heart ' + (isFavorite(originalIndex) ? 'active' : '');
        heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex);
            heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
            heart.classList.toggle('active', isFavorite(originalIndex));
        });

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

        li.appendChild(rowLeft); li.appendChild(rowRight);

        li.addEventListener('mouseenter', () => { if (playlists.length > 0) playlistBtn.style.display = 'block'; });
        li.addEventListener('mouseleave', () => { playlistBtn.style.display = 'none'; });

        li.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('.row-right') && (target.tagName === 'I' || target.classList.contains('queue-toggle'))) return;
            playSongFromList(originalIndex);
        });
        artistSongsUl.appendChild(li);
    });

    switchView("artist-details-view");
    adPlayAll.onclick = () => playSongFromList(allMusic.indexOf(songs[0]) + 1);
}

if (artistBackBtn) {
    artistBackBtn.addEventListener("click", () => {
        artistDetailsView.classList.remove("active");
        const libraryView = document.getElementById("library-view");
        if (libraryView) {
            document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
            libraryView.classList.add("active");
            // Activate the Artists tab
            const libTabs = document.querySelectorAll('.lib-tab');
            const libPanels = document.querySelectorAll('.lib-panel');
            libTabs.forEach(t => t.classList.remove('active'));
            libPanels.forEach(p => p.classList.remove('active'));
            const artistsTab = document.querySelector('[data-lib-tab="artists"]');
            const artistsPanel = document.getElementById('lib-artists');
            if (artistsTab) artistsTab.classList.add('active');
            if (artistsPanel) artistsPanel.classList.add('active');
        }
        document.querySelectorAll(".sidebar li").forEach(l => l.classList.remove("active"));
        const librarySidebarItem = document.querySelector('[data-view="library"]');
        if (librarySidebarItem) librarySidebarItem.classList.add("active");
    });
}


function loadAlbums() {
    const albums = {};
    allMusic.forEach(song => {
        const albumName = song.album || "Unknown Album";
        if (!albums[albumName]) {
            albums[albumName] = { name: albumName, artist: song.artist, img: song.img, albumImg: song.albumImg, songs: [] };
        }
        albums[albumName].songs.push(song);
    });

    if (!albumGrid) return;
    albumGrid.innerHTML = "";
    Object.keys(albums).forEach(albumName => {
        const album = albums[albumName];
        let div = document.createElement("div");
        div.classList.add("album-card");
        div.innerHTML = `<img class="album-img-target" alt="${album.name}"><h3>${album.name}</h3><p>${album.artist}</p>`;

        const imgEl = div.querySelector('.album-img-target');
        const albumSlug = album.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const albumPaths = [];
        if (album.albumImg) albumPaths.push(`images/albums/${album.albumImg}`);
        albumPaths.push(`images/albums/${albumSlug}`);
        albumPaths.push(`images/albums/${album.name}`);
        albumPaths.push(`images/${album.img}`);

        attemptImageFormats(imgEl, albumPaths, `images/music-placeholder.webp`);
        div.onclick = () => loadAlbumDetails(album);
        albumGrid.appendChild(div);
    });
}

function loadAlbumDetails(album) {
    if (albumDetailName) albumDetailName.innerText = album.name;
    if (albumDetailArtist) albumDetailArtist.innerText = album.artist;

    const albumSlug = album.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const albumImagePaths = [];
    if (album.albumImg) albumImagePaths.push(`images/albums/${album.albumImg}`);
    albumImagePaths.push(`images/albums/${albumSlug}`);
    albumImagePaths.push(`images/albums/${album.name}`);
    albumImagePaths.push(`images/${album.img}`);
    attemptImageFormats(albumDetailImg, albumImagePaths, `images/music-placeholder.webp`);

    const albumHeaderBg = document.getElementById('album-header-bg');
    if (albumHeaderBg) {
        const bgImg = document.createElement('img');
        attemptImageFormats(bgImg, albumImagePaths, 'images/music-placeholder.webp');
        bgImg.onload = () => { albumHeaderBg.style.backgroundImage = `url(${bgImg.src})`; };
    }

    albumSongsUl.innerHTML = "";
    album.songs.forEach((song, i) => {
        let originalIndex = allMusic.indexOf(song) + 1;
        let li = document.createElement("li");
        li.style.opacity = '0';
        li.style.animation = `fadeIn 0.4s ease forwards ${Math.min(i * 0.05, 1.0)}s`;

        const rowLeft = document.createElement('div');
        rowLeft.className = 'row-left';
        const imgEl = document.createElement('img');
        attemptImageFormats(imgEl, `images/${song.img}`, `images/music-placeholder.webp`);
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info';
        infoDiv.innerHTML = `<span>${song.name}</span><p>${song.artist}</p>`;
        rowLeft.appendChild(imgEl); rowLeft.appendChild(infoDiv);

        const rowRight = document.createElement('div');
        rowRight.className = 'row-right';
        const inQueue = songQueue.includes(originalIndex);
        const queueBtn = document.createElement('i');
        queueBtn.className = 'material-icons queue-toggle';
        queueBtn.title = inQueue ? 'Remove from queue' : 'Add to queue';
        queueBtn.innerText = inQueue ? 'remove_circle' : 'queue_music';
        queueBtn.onclick = (e) => { e.stopPropagation(); toggleQueueForSong(originalIndex, li); };

        const durationSpan = document.createElement('span');
        durationSpan.className = 'audio-duration';
        durationSpan.innerText = '3:30';

        const heart = document.createElement('i');
        heart.className = 'material-icons heart ' + (isFavorite(originalIndex) ? 'active' : '');
        heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
        heart.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(originalIndex);
            heart.innerText = isFavorite(originalIndex) ? 'favorite' : 'favorite_border';
            heart.classList.toggle('active', isFavorite(originalIndex));
        });

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

        li.appendChild(rowLeft); li.appendChild(rowRight);

        li.addEventListener('mouseenter', () => { if (playlists.length > 0) playlistBtn.style.display = 'block'; });
        li.addEventListener('mouseleave', () => { playlistBtn.style.display = 'none'; });

        li.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('.row-right') && (target.tagName === 'I' || target.classList.contains('queue-toggle'))) return;
            playSongFromList(originalIndex);
        });
        albumSongsUl.appendChild(li);
    });

    switchView("album-details-view");
    albumPlayAll.onclick = () => playSongFromList(allMusic.indexOf(album.songs[0]) + 1);
}

if (albumBackBtn) {
    albumBackBtn.addEventListener("click", () => {
        albumDetailsView.classList.remove("active");
        const libraryView = document.getElementById("library-view");
        if (libraryView) {
            document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
            libraryView.classList.add("active");
            // Activate the Albums tab
            const libTabs = document.querySelectorAll('.lib-tab');
            const libPanels = document.querySelectorAll('.lib-panel');
            libTabs.forEach(t => t.classList.remove('active'));
            libPanels.forEach(p => p.classList.remove('active'));
            const albumsTab = document.querySelector('[data-lib-tab="albums"]');
            const albumsPanel = document.getElementById('lib-albums');
            if (albumsTab) albumsTab.classList.add('active');
            if (albumsPanel) albumsPanel.classList.add('active');
        }
        document.querySelectorAll(".sidebar li").forEach(l => l.classList.remove("active"));
        const librarySidebarItem = document.querySelector('[data-view="library"]');
        if (librarySidebarItem) librarySidebarItem.classList.add("active");
    });
}

function loadFeaturedContent() {
    // Featured Albums
    const albums = {};
    allMusic.forEach(song => {
        const albumName = song.album || "Unknown Album";
        if (!albums[albumName]) albums[albumName] = { name: albumName, artist: song.artist, img: song.img, songs: [] };
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

    // Featured Artists
    const artists = {};
    allMusic.forEach(song => {
        const artistName = song.artist || "Unknown Artist";
        if (!artists[artistName]) artists[artistName] = [];
        artists[artistName].push(song);
    });
    const artistNames = Object.keys(artists);
    const shuffledArtists = artistNames.sort(() => 0.5 - Math.random()).slice(0, 6);
    if (featuredArtists) {
        featuredArtists.innerHTML = "";
        shuffledArtists.forEach(artistName => {
            const songs = artists[artistName];
            let div = document.createElement("div");
            div.classList.add("featured-artist");
            const imgEl = document.createElement('img');
            const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            attemptImageFormats(imgEl, [`images/artists/${artistSlug}`, `images/artists/${artistName}`, `images/${songs[0].img}`], `images/music-placeholder.webp`);
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

function renderTrendingSongs() {
    const container = document.getElementById('trending-scroll');
    if (!container) return;
    container.innerHTML = "";
    const trending = allMusic.slice(0, 8); // Simulate trending

    trending.forEach(song => {
        let originalIndex = allMusic.indexOf(song) + 1;
        const div = document.createElement('div');
        div.className = 'trending-card';
        const img = document.createElement('img');
        attemptImageFormats(img, `images/${song.img}`, 'images/music-placeholder.webp');
        const h4 = document.createElement('h4'); h4.innerText = song.name;
        const p = document.createElement('p'); p.innerText = song.artist;
        div.appendChild(img); div.appendChild(h4); div.appendChild(p);
        div.onclick = () => playSongFromList(originalIndex);
        container.appendChild(div);
    });
}

function setupLibrary() {
    const libTabs = document.querySelectorAll('.lib-tab');
    const libPanels = document.querySelectorAll('.lib-panel');

    libTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            libTabs.forEach(t => t.classList.remove('active'));
            libPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.getAttribute('data-lib-tab');
            const panel = document.getElementById(`lib-${target}`);
            if (panel) {
                panel.classList.add('active');
                if (target === 'liked') renderLikedView();
                else if (target === 'playlists') renderPlaylists();
            }
        });
    });
}

// Setup Search
function setupSearch() {
    if (!searchInput || !searchResultsUl) return;

    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        if (!term) {
            searchResultsUl.innerHTML = "";
            return;
        }

        const filtered = allMusic.filter(song =>
            song.name.toLowerCase().includes(term) ||
            song.artist.toLowerCase().includes(term) ||
            (song.album && song.album.toLowerCase().includes(term))
        );

        if (filtered.length === 0) {
            searchResultsUl.innerHTML = `<li style="justify-content:center;">No results found</li>`;
        } else {
            loadMusicList(filtered, searchResultsUl);
        }
    });
}
