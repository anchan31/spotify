# Spotify-Like Music Player

A modern, feature-rich web-based music player designed with a premium aesthetic and glassmorphism elements. This project offers a seamless music listening experience with dynamic themes, audio visualization, and synchronized lyrics.


## ✨ Features

- **Modern Glassmorphism UI**: A sleek, translucent design that feels premium and responsive.
- **Dynamic Color Themes**: The app color palette automatically adjusts based on the currently playing song's album art using the `Color Thief` library.
- **Interactive Audio Visualizer**: Real-time frequency visualization with multiple styles (Bars, Waves, Circles, etc.). Double-click the visualizer icon to cycle through styles.
- **Synchronized Lyrics**: Enjoy karaoke-style synchronized lyrics that highlight as the song plays.
- **Queue Management**: "Up Next" queue system allowing users to add individual songs, entire albums, or artist discographies to their play sequence.
- **Smart Search**: Quickly find songs, artists, or albums within your library.
- **Artist & Album Navigation**: Dedicated views to browse your music by artist or album.
- **Custom Themes**: Choose from predefined color themes or pick your own custom accent color.
- **Responsive Design**: Works beautifully on both desktop and mobile browsers.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Icons**: Material Icons
- **Libraries**: 
  - [Color Thief](https://lokeshdhakar.com/projects/color-thief/) - For extracting dominant colors from images.

## 🚀 Getting Started

### Prerequisites

No special installation is required! This is a static web application.

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/anchan31/spotify.git
   ```
2. Open `index.html` in your favorite web browser.

### Adding Your Own Music

To add new songs to the player:

1. Place your audio files (`.mp3`) in the `songs/` folder.
2. Place your album/artist artwork in the `images/` folder (or relevant subfolders like `images/albums/` and `images/artists/`).
3. Update `music-list.js` with the song metadata:
   ```javascript
   {
     name: "Song Name",
     artist: "Artist Name",
     album: "Album Name",
     img: "image-filename", // Without extension
     src: "audio-filename"   // Without extension
   }
   ```

## 🌐 Deployment

This project is automatically deployed to **GitHub Pages**. Every push to the `main` branch triggers a new build.

## 📝 License

This project is for educational and personal use. 

---
*Created with ❤️ by [anchan31](https://github.com/anchan31)*
