const CACHE_NAME = 'spotify-v3-cache';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './music-Scripts.js',
    './theme-manager.js',
    './music-list.js',
    './lyrics.js',
    './visualizer.js',
    './Favicon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
