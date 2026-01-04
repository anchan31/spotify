// Utility Functions

// Mobile Detection Helper
function isMobileDevice() {
    return (window.innerWidth <= 768) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Format Time
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Helper: attempt multiple image extensions on an img element in order
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

// Shuffle Array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
