/**
 * lyrics.js - Dedicated module for lyric data and processing logic
 */

// Lyric Data Store - Mapping song source names to their lyrics
const musicLyrics = {
    "music-1": `
[00:00.00]Tu meri zindagi hai
[00:04.00]Tu meri bandagi hai
[00:08.00]Tu hi mera jahan hai
[00:12.00]Tera mera naam hai
[00:16.00]Dil mera yahaan hai
[00:20.00]Apna bana le
[00:24.00]Piya apna bana le
[00:28.00]Saansein meri ab
[00:32.00]Teri raah takein
[00:36.00]Main rahoon jahan both
[00:40.00]Teri yaad aaye
`,
    "music-2": [
        { time: 0, text: "We are the players" },
        { time: 3, text: "Badshah on the beat" },
        { time: 6, text: "Making hits all day" },
        { time: 10, text: "From the streets to the charts" },
        { time: 15, text: "This is how we play" }
    ],
    "music-3": [
        { time: 0, text: "Kesariya tera" },
        { time: 5, text: "Closer to you" },
        { time: 10, text: "Be my love" },
        { time: 15, text: "Stay with me tonight" }
    ]
};

// Lyrics Logic (Legacy + Sync support)
function parseLyrics(lrc) {
    const lines = lrc.split('\n');
    const result = [];
    const timeReg = /\[(\d{2}):(\d{2}(?:\.\d+)?)\]/;

    lines.forEach(line => {
        const match = timeReg.exec(line);
        if (match) {
            const min = parseInt(match[1]);
            const sec = parseFloat(match[2]);
            const time = min * 60 + sec;
            const text = line.replace(timeReg, '').trim();
            if (text) {
                result.push({ time, text });
            }
        }
    });
    return result;
}

function loadLyrics(indexNumb) {
    const song = allMusic[indexNumb - 1];
    if (!song) return;

    lyricsContentFs.innerHTML = "";

    // Fetch lyrics from the new musicLyrics data store
    const lyrics = musicLyrics[song.src];

    if (lyrics) {
        let lyricsData = [];

        // Check format
        if (typeof lyrics === 'string') {
            // LRC String format
            lyricsData = parseLyrics(lyrics);
        } else if (Array.isArray(lyrics)) {
            if (typeof lyrics[0] === 'object') {
                // Pre-parsed Object format
                lyricsData = lyrics;
            } else {
                // Array of strings (unsynced)
                lyrics.forEach(line => {
                    const p = document.createElement("p");
                    p.classList.add("lyrics-line");
                    p.innerText = line;
                    lyricsContentFs.appendChild(p);
                });
                return;
            }
        }

        // Render synced lyrics
        lyricsData.forEach(line => {
            const p = document.createElement("p");
            p.classList.add("lyrics-line");
            p.innerText = line.text;
            p.setAttribute("data-time", line.time);
            p.onclick = () => {
                mainAudio.currentTime = line.time;
                playMusic();
            };
            lyricsContentFs.appendChild(p);
        });

    } else {
        lyricsContentFs.innerHTML = "<p>No lyrics available.</p>";
    }
}

let lastActiveLine = null;

function updateLyrics(time) {
    const lines = document.querySelectorAll(".lyrics-line");
    if (!lines.length) return;

    let activeLine = null;
    // Find the current line
    for (let i = 0; i < lines.length; i++) {
        const t = parseFloat(lines[i].getAttribute("data-time"));
        if (!isNaN(t) && time >= t) {
            activeLine = lines[i];
        }
    }

    if (activeLine) {
        // Only update if changed
        if (lastActiveLine !== activeLine) {
            lines.forEach(l => l.classList.remove("active"));
            activeLine.classList.add("active");
            activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
            lastActiveLine = activeLine;
        }
    }
}

// Setup Lyrics Event Listeners
function setupLyricsHandlers() {
    if (fsLyricsToggle) {
        fsLyricsToggle.addEventListener("click", () => {
            lyricsOverlay.classList.add("show");
        });
    }
    if (lyricsCloseFs) {
        lyricsCloseFs.addEventListener("click", () => {
            lyricsOverlay.classList.remove("show");
        });
    }
}

// Auto-setup when script loads (variables like fsLyricsToggle must be global)
document.addEventListener("DOMContentLoaded", () => {
    // We'll call this from music-Scripts.js instead to ensure global vars are ready
    // setupLyricsHandlers(); 
});
