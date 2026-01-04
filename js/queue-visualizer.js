// Queue and Visualizer

function initializeQueueAndVisualizer() {
    const visualizerCanvas = document.getElementById('audio-visualizer');
    if (visualizerCanvas && typeof AudioVisualizer !== 'undefined') {
        visualizer = new AudioVisualizer(mainAudio, visualizerCanvas);
    }
    setupQueueHandlers();
    setupVisualizerHandlers();
}

function addToQueue(songIndex) {
    if (!songQueue.includes(songIndex)) {
        songQueue.push(songIndex);
        triggerQueueSave();
        updateQueueUI();
        showNotification(`Added to queue: ${allMusic[songIndex - 1].name}`);
    }
}

function toggleQueueForSong(songIndex, rowElement) {
    if (songQueue.includes(songIndex)) {
        removeFromQueue(songIndex);
        if (rowElement) {
            const icon = rowElement.querySelector('.queue-toggle');
            if (icon) { icon.textContent = 'queue_music'; icon.title = 'Add to queue'; }
        }
    } else {
        addToQueue(songIndex);
        if (rowElement) {
            const icon = rowElement.querySelector('.queue-toggle');
            if (icon) { icon.textContent = 'remove_circle'; icon.title = 'Remove from queue'; }
        }
    }
}

function removeFromQueue(songIndex) {
    const index = songQueue.indexOf(songIndex);
    if (index > -1) {
        songQueue.splice(index, 1);
        triggerQueueSave();
        updateQueueUI();
    }
}

// Trigger Queue Save
function triggerQueueSave() {
    saveQueueToFirebase().catch(err => {
        console.error('Error saving queue:', err);
    });
}

// Internal async save
async function saveQueueToFirebase() {
    if (!userId) {
        userId = await getUserId();
        window.userId = userId;
    }
    try {
        // Assume saveQueue is global from db-manager.js
        if (typeof saveQueue === 'function' && saveQueue.length === 2) {
            await saveQueue(userId, songQueue);
        }
    } catch (e) {
        console.error('Failed to save queue:', e);
    }
}

function setupQueueReordering() {
    const shuffleQueueBtn = document.getElementById('shuffle-queue');
    if (shuffleQueueBtn) {
        shuffleQueueBtn.addEventListener('click', () => {
            // Shuffle queue
            for (let i = songQueue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [songQueue[i], songQueue[j]] = [songQueue[j], songQueue[i]];
            }
            triggerQueueSave();
            updateQueueUI();
            showNotification('Queue shuffled');
        });
    }
}

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
        if (songIndex === musicIndex) queueItem.classList.add('playing');

        const qImg = document.createElement('img');
        attemptImageFormats(qImg, `images/${song.img}`, `images/music-placeholder.webp`);

        const qInfo = document.createElement('div');
        qInfo.className = 'queue-item-info';
        qInfo.innerHTML = `<div class="name">${song.name}</div><div class="artist">${song.artist}</div>`;

        const qActions = document.createElement('div');
        qActions.className = 'queue-item-actions';

        const qRemove = document.createElement('i');
        qRemove.className = 'material-icons queue-item-remove';
        qRemove.innerText = 'close';
        qRemove.addEventListener('click', (e) => { e.stopPropagation(); removeFromQueue(songIndex); });

        qActions.appendChild(qRemove);
        queueItem.appendChild(qImg);
        queueItem.appendChild(qInfo);
        queueItem.appendChild(qActions);

        queueItem.addEventListener('click', (e) => {
            if (!e.target.closest('.queue-item-remove')) {
                playSongFromList(songIndex);
            }
        });

        // Drag and drop implementation details omitted for brevity but should be here...
        // ... (Simpler reordering logic for now, standard DnD)
        queueItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', queueIndex);
            queueItem.classList.add('dragging');
        });
        queueItem.addEventListener('dragend', () => queueItem.classList.remove('dragging'));
        queueItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(queueList, e.clientY);
            if (afterElement == null) queueList.appendChild(queueItem);
            else queueList.insertBefore(queueItem, afterElement);
        });
        queueItem.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const targetIndex = parseInt(queueItem.dataset.queueIndex);
            if (draggedIndex !== targetIndex) {
                [songQueue[draggedIndex], songQueue[targetIndex]] = [songQueue[targetIndex], songQueue[draggedIndex]];
                triggerQueueSave();
                updateQueueUI();
            }
        });

        queueList.appendChild(queueItem);
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.queue-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
        else return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function setupQueueHandlers() {
    const queueToggle = document.getElementById('fs-queue-toggle');
    const queuePanel = document.querySelector('.queue-panel');
    const queueClose = document.getElementById('queue-close');
    const clearQueueBtn = document.getElementById('clear-queue');

    if (queueToggle) queueToggle.addEventListener('click', () => { queuePanel.classList.toggle('show'); queueToggle.classList.toggle('active'); });
    if (queueClose) queueClose.addEventListener('click', () => { queuePanel.classList.remove('show'); queueToggle.classList.remove('active'); });
    if (clearQueueBtn) clearQueueBtn.addEventListener('click', () => { songQueue = []; triggerQueueSave(); updateQueueUI(); });
}

function setupVisualizerHandlers() {
    if (isMobileDevice()) return;

    const visualizerToggle = document.getElementById('fs-visualizer-toggle');
    const visualizerCanvas = document.getElementById('audio-visualizer');

    if (visualizerToggle && visualizer) {
        visualizerToggle.removeEventListener('click', visualizerToggle._toggleHandler || null);
        visualizerToggle.removeEventListener('dblclick', visualizerToggle._cycleHandler || null);

        const toggleHandler = () => {
            if (visualizer.isActive) {
                visualizer.stop();
                visualizerToggle.classList.remove('active');
                visualizerCanvas.classList.remove('active');
            } else {
                if (!fsPlayer.classList.contains('active')) {
                    expandPlayerBtn.click();
                    setTimeout(() => {
                        visualizer.start();
                        visualizerToggle.classList.add('active');
                        visualizerCanvas.classList.add('active');
                    }, 700);
                } else {
                    visualizer.start();
                    visualizerToggle.classList.add('active');
                    visualizerCanvas.classList.add('active');
                }
            }
        };

        const cycleHandler = () => {
            if (!visualizer.isActive) return;
            const styles = ['bars', 'waveform', 'circular'];
            const currentIndex = styles.indexOf(visualizer.style);
            const nextIndex = (currentIndex + 1) % styles.length;
            visualizer.setStyle(styles[nextIndex]);
            showNotification(`Visualizer: ${styles[nextIndex]}`);
        };

        visualizerToggle._toggleHandler = toggleHandler;
        visualizerToggle._cycleHandler = cycleHandler;

        visualizerToggle.addEventListener('click', toggleHandler);
        visualizerToggle.addEventListener('dblclick', cycleHandler);
    }
}
