const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');
const musicListFile = path.join(__dirname, 'music-list.js');
const imagesDir = path.join(__dirname, 'images');

// Helper to get formatted name strings
function formatName(filename) {
    // Remove extension
    let name = filename.replace(/\.[^/.]+$/, "");
    // Replace dashes/underscores with spaces
    name = name.replace(/[-_]/g, " ");
    // Capitalize first letter of each word
    return name.replace(/\b\w/g, l => l.toUpperCase());
}

// Read existing music-list.js to preserve manual edits (lyrics, artist names if changed)
// This is a simple parser. For robust usage, a proper database or JSON is better, 
// but we must stick to the existing format: let allMusic = [...]
let existingMusic = [];
if (fs.existsSync(musicListFile)) {
    const content = fs.readFileSync(musicListFile, 'utf8');
    // Extract the array content using a regex
    const match = content.match(/let allMusic = (\[[\s\S]*?\]);/);
    if (match) {
        try {
            // Unqoute non-quoted keys to make it valid JSON for parsing if needed, 
            // but relying on eval is risky. Let's try to parse strict JSON if possible,
            // or just regex parse.
            // Since the file is JS, we can just require it if we export it, but we can't easily export it without modifying it first.
            // We'll use a safer approach: Parse filenames from the directory and ONLY add new ones.
            // We won't delete entries to avoid losing manual data like Lyrics.

            // Actually, let's just read the file and extract 'src' values to check for existence.
            // The user wants "automatically creates a new music lis... rest detail will be filled later"
            // So we just append.
        } catch (e) {
            console.log("Error parsing existing list, starting fresh-ish.");
        }
    }
}

// Scan directory
fs.readdir(songsDir, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    // Filter music files
    const musicFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.m4a') || file.endsWith('.wav'));

    let newMusicList = [];

    // We need to construct the JS content manually to keep it in the formatting the frontend expects
    // We will attempt to read the existing file to see which "src" are already there.
    let existingSrcs = new Set();
    let fileContent = "";

    if (fs.existsSync(musicListFile)) {
        fileContent = fs.readFileSync(musicListFile, 'utf8');
        // Simple regex to find src: "something" or src: 'something'
        const srcMatches = fileContent.match(/src:\s*["']([^"']+)["']/g);
        if (srcMatches) {
            srcMatches.forEach(m => {
                const src = m.replace(/src:\s*["']|["']/g, '');
                existingSrcs.add(src);
            });
        }
    }

    let entriesToAdd = [];

    musicFiles.forEach(file => {
        const ext = path.extname(file);
        const baseName = path.basename(file, ext); // filename without extension

        if (!existingSrcs.has(baseName)) {
            // It's a new file!
            const fancyName = formatName(baseName);

            // Try to find a matching image? For now, default to regex matching or default
            // If we have "End of beginning - Djo.mp3", maybe look for "End of beginning - Djo.jpg"
            let img = "music-placeholder"; // Default placeholder
            if (fs.existsSync(path.join(imagesDir, baseName + ".jpg"))) {
                img = baseName;
            } else if (fs.existsSync(path.join(imagesDir, "img-" + baseName.replace('music-', '') + ".jpg"))) {
                // heuristic for existing files like music-1 -> img-1
                img = "img-" + baseName.replace('music-', '');
            } else {
                // Check if it follows the pattern music-X -> img-X
                const numMatch = baseName.match(/music-(\d+)/);
                if (numMatch) {
                    const potentialImg = `img-${numMatch[1]}`;
                    if (fs.existsSync(path.join(imagesDir, potentialImg + ".jpg"))) {
                        img = potentialImg;
                    }
                }
            }

            entriesToAdd.push({
                name: fancyName,
                artist: "Unknown Artist", // Placeholder
                img: img,
                src: baseName
            });
            console.log(`Found new song: ${file}`);
        }
    });

    if (entriesToAdd.length === 0) {
        console.log("No new songs found.");
        return;
    }

    // Generate the JS string
    // If the file exists, we insert before the closing ];
    // If not, we create it.

    if (fs.existsSync(musicListFile) && fileContent.includes('];')) {
        const lastBracketIndex = fileContent.lastIndexOf('];');
        let insertion = "";

        entriesToAdd.forEach(song => {
            insertion += `
  {
    name: "${song.name}",
    artist: "${song.artist}",
    img: "${song.img}",
    src: "${song.src}"
  },`;
        });

        // Remove trailing comma if it's the last item? JS allows trailing commas.

        const newContent = fileContent.substring(0, lastBracketIndex) + "," + insertion + "\n];";
        // Clean up double commas if the list was empty or ended with one
        const cleanedContent = newContent.replace(/,(\s*,)+/g, ',');

        fs.writeFileSync(musicListFile, cleanedContent);
        console.log(`Added ${entriesToAdd.length} songs to music-list.js`);

    } else {
        // Create new file
        let content = `let allMusic = [`;
        entriesToAdd.forEach(song => {
            content += `
  {
    name: "${song.name}",
    artist: "${song.artist}",
    img: "${song.img}",
    src: "${song.src}"
  },`;
        });
        content += `\n];`;
        fs.writeFileSync(musicListFile, content);
        console.log(`Created music-list.js with ${entriesToAdd.length} songs.`);
    }

});
