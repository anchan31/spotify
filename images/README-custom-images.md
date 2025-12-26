# Custom Images for Artists and Albums

This directory structure has been created for custom images:

## Directory Structure
- `images/artists/` - For custom artist images (e.g., `arjit-singh.jpg`)  
- `images/albums/` - For custom album artwork (e.g., `bhediya.jpg`)

## Usage
Currently, the system falls back to the existing song images from `images/` directory. To use custom images:

1. **For Artists**: Add artist photos to `images/artists/` folder
   - Name format: lowercase with hyphens (e.g., `arjit-singh.jpg`)
   - Update the `loadArtists()` function in `music-Scripts.js` to use these custom images

2. **For Albums**: Add album artwork to `images/albums/` folder
   - Name format: lowercase album name with hyphens (e.g., `bhediya.jpg`)
   - The system will automatically use these if they match the album name

## Current Behavior
The application currently uses the song's `img` property for both artists and albums as a fallback. You can manually add images to these directories and they will be used once the code is updated to reference them.
