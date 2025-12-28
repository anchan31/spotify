// Firebase Database Manager
// Handles syncing Favorites and Playlists with Firestore (using compat API)

// Wait for Firebase to be available
let db = null;
let firebaseInitialized = false;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase not loaded yet');
        return false;
    }
    if (!firebaseInitialized) {
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            firebaseInitialized = true;
            console.log('Firebase initialized');
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            return false;
        }
    }
    return true;
}

// Get or create user ID (using localStorage for demo, in production use auth)
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Initialize user document
async function initUser(userId) {
    if (!initFirebase()) return;
    try {
        await db.collection('users').doc(userId).set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("User initialized in Firestore.");
    } catch (error) {
        console.error("Error initializing user:", error);
    }
}

// Sync Favorites
async function saveFavorites(userId, favorites) {
    if (!initFirebase()) {
        // Fallback to localStorage if Firebase not available
        localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
        return;
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('favorites').set({
            favorites: Array.from(favorites),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Favorites synced to Firestore.");
    } catch (error) {
        console.error("Error saving favorites:", error);
        // Fallback to localStorage
        localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    }
}

async function loadFavorites(userId) {
    if (!initFirebase()) {
        // Fallback to localStorage
        const stored = localStorage.getItem('favorites');
        return stored ? JSON.parse(stored) : [];
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('favorites').get();
        if (doc.exists) {
            return doc.data().favorites || [];
        }
        // Try localStorage as fallback
        const stored = localStorage.getItem('favorites');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error loading favorites:", error);
        const stored = localStorage.getItem('favorites');
        return stored ? JSON.parse(stored) : [];
    }
}

// Sync Playlists
async function savePlaylists(userId, playlists) {
    if (!initFirebase()) {
        // Fallback to localStorage
        localStorage.setItem('playlists', JSON.stringify(playlists));
        return;
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('playlists').set({
            playlists: playlists,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Playlists synced to Firestore.");
    } catch (error) {
        console.error("Error saving playlists:", error);
        // Fallback to localStorage
        localStorage.setItem('playlists', JSON.stringify(playlists));
    }
}

async function loadPlaylists(userId) {
    if (!initFirebase()) {
        // Fallback to localStorage
        const stored = localStorage.getItem('playlists');
        return stored ? JSON.parse(stored) : [];
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('playlists').get();
        if (doc.exists) {
            return doc.data().playlists || [];
        }
        // Try localStorage as fallback
        const stored = localStorage.getItem('playlists');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error loading playlists:", error);
        const stored = localStorage.getItem('playlists');
        return stored ? JSON.parse(stored) : [];
    }
}