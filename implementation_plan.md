# Implementation Plan - Spotify Features & Firebase Integration

Implement a suite of advanced features for the music player, enhancing playback, organization, and personalization, while migrating state to Firebase for cloud synchronization.

## User Review Required

> [!IMPORTANT]
> **Firebase Configuration**: I will implement the Firebase integration using placeholders. You will need to provide your `firebaseConfig` (apiKey, authDomain, etc.) in a new `firebase-config.js` file for it to work.
> **Crossfade Implementation**: To support smooth crossfading, I will add a second `<audio>` element. This allows pre-loading the next track and overlapping audio.

## Proposed Changes

### [NEW] Firebase Integration
- Create `firebase-config.js` with boilerplate for Firebase initialization.
- Create `db-manager.js` to handle data syncing (Favorites, Playlists) between local state and Firestore/Realtime Database.

### [MODIFY] [index.html](file:///c:/Users/Anchan/Documents/GitHub/spotify/index.html)
- Add Firebase SDK scripts.
- Add "Liked Songs" and "Playlists" items to the sidebar.
- Add "Liked Songs" view (similar to home view).
- Add "Playlist" view with support for custom playlists.
- Add Equalizer UI in Settings.
- Add "Heart" icons to song list items (in templates if injected by JS).
- Add crossfade duration slider in Settings.

### [MODIFY] [style.css](file:///c:/Users/Anchan/Documents/GitHub/spotify/style.css)
- Add styles for the heart icon (active/inactive).
- Add styles for the Equalizer sliders and labels.
- Add styles for the new "Liked Songs" and "Playlist" views.
- Implement responsive layout for playlist artwork (4-image grid).
- Add styles for drag-and-drop indicators.

### [MODIFY] [music-Scripts.js](file:///c:/Users/Anchan/Documents/GitHub/spotify/music-Scripts.js)
- **Favorites**: Implement `toggleFavorite` logic, sync with Firebase.
- **Playlists**: Implement playlist creation, editing, and deletion.
- **Shuffle**: Update `nextMusic` to support "Artist Shuffle" and "Album Shuffle".
- **Advanced Queue**: Implement insert-at-position and reordering logic.
- **Crossfade**: Integrate second audio element logic for transitions.
- **Normalization**: Connect gain nodes for leveling.

### [MODIFY] [visualizer.js](file:///c:/Users/Anchan/Documents/GitHub/spotify/visualizer.js)
- Update code to handle the shared `AudioContext`.
- Implement a 10-band equalizer using `BiquadFilterNode` chain.
- Expose methods to update EQ gains based on UI sliders.

### [MODIFY] [lyrics.js](file:///c:/Users/Anchan/Documents/GitHub/spotify/lyrics.js)
- Enhance lyrics display with better synchronization and scrolling.
- Add settings for font size and color customization.

---

## Verification Plan

### Automated Tests
- Since the project doesn't have a test suite, I will verify via browser interaction.

### Manual Verification
1.  **Favorites**: Click heart icon on multiple songs, switch to "Liked Songs" view, and verify they appear. Reload page to verify persistence.
2.  **EQ**: Adjust 60Hz and 14kHz sliders during playback and listen for change in bass/treble.
3.  **Crossfade**: Set crossfade to 3s, play a song, skip to next, and listen for the overlap.
4.  **Shuffle Modes**: Test "Artist Shuffle" and verify that songs from the same artist play together before moving to the next artist.
5.  **Smart Playlists**: Create a playlist, add songs, reorder them via drag-and-drop, and verify the order is saved.
6.  **Normalization**: Play a quiet song and a loud song sequentially to verify volume jump reduction.
