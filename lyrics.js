/**
 * lyrics.js - Dedicated module for lyric data and processing logic
 */

// Lyric Data Store - Mapping song source names to their lyrics
const musicLyrics = {
    "music-1": `[00:22.06]Tu Mera Koyi Na
[00:24.19]Hoke Bhi Kuchh Laage
[00:26.84]Tu Mera Koyi Na
[00:29.23]Hoke Bhi Kuchh Laage
[00:31.89]Kiya Re Jo Bhi Toone
[00:33.76]Kaise Kiya Re
[00:37.22]Jiya Ko Mere Baandh
[00:39.61]Aise Liya Re
[00:42.26]Samajh Ke Bhi Na
[00:44.92]Samajh Main Sakun
[00:47.57]Saweron Ka Bhi Mere
[00:49.97]Tu Sooraj Laage
[00:52.62]Tu Mera Koyi Na
[00:55.01]Hoke Bhi Kuchh Laage
[00:57.67]Tu Mera Koyi Na
[01:00.06]Hoke Bhi Kuchh Laage
[01:02.72]Tu Mera Koyi Na
[01:05.11]Hoke Bhi Kuchh Laage
[01:09.89]Apna Bana Le Piya
[01:12.02]Apna Bana Le Piya
[01:14.93]Apna Bana Le Mujhe
[01:16.80]Apna Bana Le Piya
[01:20.25]Apna Bana Le Piya
[01:22.64]Apna Bana Le Piya
[01:25.03]Dil Ke Nagar Mein
[01:28.22]Shehar Tu Basa Le Piya
[01:53.46]Chhoone Se Tere
[01:55.31]Haan Tere Haan Tere
[02:00.36]Feeki Ruton Ko Rang Lage
[02:07.81]Hmm.. Chhoone Se Tere
[02:10.71]Haan Tere Haan Tere
[02:13.90]Feeki Ruton Ko Rang Lage
[02:18.95]Teri Disha Mein Kyun Chalne Se Mere
[02:24.00]Pairon Ko Pankh Lage
[02:27.19]Raha Na Mere Kaam Ka Jag Saara
[02:32.24]Haan Bas Tere Naam Se Hi Guzaara
[02:37.28]Ulajh Ke Yoon Na
[02:41.00]Sulajh Na Sakun
[02:45.25]Zubaaniyan Teri
[02:47.64]Jhoothi Bhi Sach Laage
[02:50.03]Tu Mera Koyi Na
[02:52.42]Hoke Bhi Kuchh Laage
[02:55.08]Tu Mera Koyi Na
[02:59.06]Hoke Bhi Kuchh Laage
[03:00.65]Tu Mera Koyi Na
[03:03.04]Hoke Bhi Kuchh Laage
[03:07.29]Apna Bana Le Piya
[03:09.42]Apna Bana Le Piya
[03:12.07]Apna Bana Le Mujhe
[03:14.20]Apna Bana Le Piya
[03:17.39]Apna Bana Le Piya
[03:19.51]Apna Bana Le Piya
[03:22.17]Dil Ke Nagar Mein
[03:24.29]Shehar Tu Basa Le Piya
[03:29.34]Ho Sab Kuchh Mera Chahe
[03:34.12]Naam Apne Likha Le
[03:39.17]Badle Mein Itni Toh
[03:44.48]Yaari Nibha Le
[03:49.53]Jag Ki Hirasat Se
[03:53.51]Mujhko Chhuda Le
[03:58.29]Apna Bana Le
[04:02.28]Bas Apna Bana Le
[04:08.13]Apna Bana Le
[04:12.90]Apna Bana Le
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
