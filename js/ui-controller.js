// UI Controller

// View Switching
function switchView(viewId) {
    const views = document.querySelectorAll('section.view');
    views.forEach(v => v.classList.remove('active'));

    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.scrollTop = 0;
    }

    if (viewId === 'library-view') {
        const likedTab = document.querySelector('.lib-tab[data-lib-tab="liked"]');
        if (likedTab && likedTab.classList.contains('active')) {
            renderLikedView();
        }
    }
}

// Navigation Tabs
function setupNavigation() {
    const navItems = document.querySelectorAll(".sidebar li");
    const views = document.querySelectorAll(".view");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(nav => nav.classList.remove("active"));
            views.forEach(view => view.classList.remove("active"));

            item.classList.add("active");
            const viewId = item.getAttribute("data-view");
            document.getElementById(`${viewId}-view`).classList.add("active");

            if (viewId === 'home') {
                document.querySelector("#home-view .section-title h3").innerText = "Trending Now";
                loadMusicList(allMusic, musicListUl);
            } else if (viewId === 'library') {
                const activeTab = document.querySelector('.lib-tab.active');
                if (activeTab) {
                    const tabType = activeTab.getAttribute('data-lib-tab');
                    if (tabType === 'playlists') renderPlaylists();
                    else if (tabType === 'liked') renderLikedView();
                }
            } else if (viewId === 'settings') {
                setTimeout(() => {
                    if (document.getElementById('stats-panel') && document.getElementById('stats-panel').classList.contains('active')) {
                        updateStatisticsDisplay();
                    }
                }, 100);
            }
        });
    });
}

// Custom Modal (Prompt)
function openModal(title, defaultValue, callback) {
    if (!playlistModal) return;
    playlistModalTitle.innerText = title;
    if (playlistInput) playlistInput.value = defaultValue || '';
    modalCallback = callback;
    playlistModal.classList.add('active');
    playlistModal.style.display = 'flex';
    if (playlistInput) playlistInput.focus();
}

function closeModal() {
    if (playlistModal) {
        playlistModal.classList.remove('active');
        playlistModal.style.display = 'none';
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
            playlistInput.style.borderColor = 'red';
            setTimeout(() => playlistInput.style.borderColor = '', 1000);
        }
    };
}
if (playlistModalCancel) playlistModalCancel.onclick = closeModal;

// Player Animation (Expand/Collapse)
function setupPlayerAnimation() {
    expandPlayerBtn.removeEventListener("click", expandPlayerBtn._clickHandler || null);
    collapsePlayerBtn.removeEventListener("click", collapsePlayerBtn._clickHandler || null);

    const expandHandler = () => {
        fsPlayer.classList.remove("closing");
        fsPlayer.classList.add("active");
    };

    const collapseHandler = () => {
        fsPlayer.classList.add("closing");
        // Stop visualizer if active
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

// Settings Tabs & Theme
function setupSettings() {
    settingsTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetPanel = tab.getAttribute("data-settings-tab");
            settingsTabs.forEach(t => t.classList.remove("active"));
            settingsPanels.forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(`${targetPanel}-panel`).classList.add("active");
        });
    });

    const activeTab = document.querySelector(".settings-tab.active");
    if (activeTab) {
        const targetPanel = activeTab.getAttribute("data-settings-tab");
        settingsPanels.forEach(p => p.classList.remove("active"));
        const panel = document.getElementById(`${targetPanel}-panel`);
        if (panel) panel.classList.add("active");
    }

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

    if (customColorPicker) {
        customColorPicker.addEventListener("input", (e) => {
            themeManager.applyTheme("custom", e.target.value);
        });
    }

    // Settings inputs
    const crossfadeSlider = document.getElementById('crossfade-duration');
    const crossfadeValue = document.getElementById('crossfade-value');
    if (crossfadeSlider && crossfadeValue) {
        crossfadeSlider.value = crossfadeDuration;
        crossfadeValue.textContent = crossfadeDuration + 's';
        crossfadeSlider.addEventListener('input', (e) => {
            crossfadeDuration = parseFloat(e.target.value);
            crossfadeValue.textContent = crossfadeDuration + 's';
            saveAllSettings();
        });
    }

    const normalizeToggle = document.getElementById('normalize-toggle');
    if (normalizeToggle) {
        if (normalizeVolume) {
            normalizeToggle.checked = true;
            enableNormalization();
        }
        normalizeToggle.addEventListener('change', (e) => {
            normalizeVolume = e.target.checked;
            if (normalizeVolume) enableNormalization(); else disableNormalization();
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
        speedSlider.value = playbackSpeed;
        speedValue.textContent = playbackSpeed.toFixed(1) + 'x';
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

    // Gapless
    const gaplessToggle = document.getElementById('gapless-toggle');
    if (gaplessToggle) {
        gaplessToggle.checked = gaplessPlayback;
        gaplessToggle.addEventListener('change', (e) => {
            gaplessPlayback = e.target.checked;
            saveAllSettings();
        });
    }

    // Autoplay
    const autoplayToggle = document.getElementById('autoplay-toggle');
    if (autoplayToggle) {
        autoplayToggle.checked = autoPlayNext;
        autoplayToggle.addEventListener('change', (e) => {
            autoPlayNext = e.target.checked;
            saveAllSettings();
        });
    }
}


// Context Menu Helper
function showContextMenu(options, x, y) {
    // Remove existing
    const existing = document.querySelector('.context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'context-menu-item';
        item.innerHTML = `<i class="material-icons">${opt.icon}</i> <span>${opt.label}</span>`;
        item.onclick = (e) => {
            e.stopPropagation();
            menu.classList.remove('active');
            setTimeout(() => menu.remove(), 200);
            if (opt.action) opt.action();
        };
        menu.appendChild(item);
    });

    document.body.appendChild(menu);

    // Animation
    requestAnimationFrame(() => {
        menu.classList.add('active');

        // Adjust position if out of bounds
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 20}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${y - rect.height}px`;
        }
    });

    // Close on outside click
    const closeHandler = (e) => {
        if (!menu.contains(e.target)) {
            menu.classList.remove('active');
            setTimeout(() => menu.remove(), 200);
            document.removeEventListener('click', closeHandler);
        }
    };
    // Delay adding listener to avoid immediate close
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
}
