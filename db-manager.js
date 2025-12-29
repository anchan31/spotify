// Firebase Database Manager
// Handles all data storage with Firestore (using compat API)

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

// Get current authenticated user ID
async function getUserId() {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    return user.uid;
}

// Ensure user document exists in Firestore (called on login)
async function ensureUserInitialized() {
    try {
        const userId = await getUserId();
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            await initUser(userId);

            // For new Google users, we might want to save their display name/email from Auth profile
            const user = firebase.auth().currentUser;
            if (user) {
                await db.collection('users').doc(userId).set({
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                console.log("User profile updated with Google info");
            }
        } else {
            // Update last login
            await db.collection('users').doc(userId).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        return true;
    } catch (error) {
        console.error("Error ensuring user initialized:", error);
        return false;
    }
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
        throw new Error('Firebase not initialized');
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('favorites').set({
            favorites: Array.from(favorites),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Favorites synced to Firestore.");
    } catch (error) {
        console.error("Error saving favorites:", error);
        throw error;
    }
}

async function loadFavorites(userId) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('favorites').get();
        if (doc.exists) {
            return doc.data().favorites || [];
        }
        return [];
    } catch (error) {
        console.error("Error loading favorites:", error);
        throw error;
    }
}

// Sync Playlists
async function savePlaylists(userId, playlists) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('playlists').set({
            playlists: playlists,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Playlists synced to Firestore.");
    } catch (error) {
        console.error("Error saving playlists:", error);
        throw error;
    }
}

async function loadPlaylists(userId) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('playlists').get();
        if (doc.exists) {
            return doc.data().playlists || [];
        }
        return [];
    } catch (error) {
        console.error("Error loading playlists:", error);
        throw error;
    }
}

// Sync Settings
async function saveSettings(userId, settings) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('settings').set({
            settings: settings,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Settings synced to Firestore.");
    } catch (error) {
        console.error("Error saving settings:", error);
        throw error;
    }
}

async function loadSettings(userId) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('settings').get();
        if (doc.exists) {
            return doc.data().settings || {};
        }
        return {};
    } catch (error) {
        console.error("Error loading settings:", error);
        throw error;
    }
}

// Sync Statistics
async function saveStatisticsToDB(userId, statistics) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('statistics').set({
            statistics: statistics,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Statistics synced to Firestore.");
    } catch (error) {
        console.error("Error saving statistics:", error);
        throw error;
    }
}

async function loadStatisticsFromDB(userId) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('statistics').get();
        if (doc.exists) {
            return doc.data().statistics || {};
        }
        return {};
    } catch (error) {
        console.error("Error loading statistics:", error);
        throw error;
    }
}

// Sync Queue
async function saveQueue(userId, queue) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('queue').set({
            queue: queue,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Queue synced to Firestore.");
    } catch (error) {
        console.error("Error saving queue:", error);
        throw error;
    }
}

async function loadQueue(userId) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('queue').get();
        if (doc.exists) {
            return doc.data().queue || [];
        }
        return [];
    } catch (error) {
        console.error("Error loading queue:", error);
        throw error;
    }
}

// Sync Lyrics Settings
async function saveLyricsSettings(userId, lyricsSettings) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('lyricsSettings').set({
            lyricsSettings: lyricsSettings,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Lyrics settings synced to Firestore.");
    } catch (error) {
        console.error("Error saving lyrics settings:", error);
        throw error;
    }
}

async function loadLyricsSettings(userId) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('lyricsSettings').get();
        if (doc.exists) {
            return doc.data().lyricsSettings || {};
        }
        return {};
    } catch (error) {
        console.error("Error loading lyrics settings:", error);
        throw error;
    }
}

// Sync Theme Settings
async function saveThemeSettings(userId, themeSettings) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        await db.collection('users').doc(userId).collection('data').doc('themeSettings').set({
            themeSettings: themeSettings,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Theme settings synced to Firestore.");
    } catch (error) {
        console.error("Error saving theme settings:", error);
        throw error;
    }
}

async function loadThemeSettings(userId) {
    if (!initFirebase()) {
        throw new Error('Firebase not initialized');
    }
    try {
        const doc = await db.collection('users').doc(userId).collection('data').doc('themeSettings').get();
        if (doc.exists) {
            return doc.data().themeSettings || {};
        }
        return {};
    } catch (error) {
        console.error("Error loading theme settings:", error);
        throw error;
    }
}