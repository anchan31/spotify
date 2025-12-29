// Firebase Authentication Manager

// Wait for Firebase to be available and initialized
let auth = null;

function initAuth() {
    if (typeof firebase === 'undefined') {
        console.warn('Firebase not loaded for Auth');
        return false;
    }

    // Ensure Firebase is initialized (db-manager or here)
    if (!firebase.apps.length) {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized by Auth Manager');
        } catch (error) {
            console.error('Error initializing Firebase in Auth Manager:', error);
            return false;
        }
    }

    auth = firebase.auth();

    // Set persistence to LOCAL (so user stays logged in)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log("Auth persistence set to LOCAL");
        })
        .catch((error) => {
            console.error("Error setting auth persistence:", error);
        });

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User signed in:", user.uid);
            handleUserSignedIn(user);
        } else {
            console.log("User signed out");
            handleUserSignedOut();
        }
    });

    return true;
}

// Sign in with Google
function signInWithGoogle() {
    if (!auth) initAuth();

    const provider = new firebase.auth.GoogleAuthProvider();

    // Show loading state if UI element exists
    const loginBtn = document.getElementById('google-login-btn');
    const btnText = loginBtn ? loginBtn.querySelector('span') : null;
    const originalText = btnText ? btnText.textContent : 'Sign in with Google';

    if (btnText) btnText.textContent = 'Signing in...';

    auth.signInWithPopup(provider)
        .then((result) => {
            // User signed in
            console.log("Google Sign-In Successful");
            // The onAuthStateChanged listener will handle the transition
        })
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            if (btnText) btnText.textContent = originalText;

            // Show error to user
            const errorDisplay = document.getElementById('login-error-msg');
            if (errorDisplay) {
                errorDisplay.textContent = errorMessage;
                errorDisplay.style.display = 'block';
                setTimeout(() => errorDisplay.style.display = 'none', 5000);
            }
        });
}

// Sign Out
function signOutUser() {
    if (!auth) return;
    auth.signOut().then(() => {
        console.log("Sign-out successful");
        // Reload page to reset state or handled by onAuthStateChanged
        window.location.reload();
    }).catch((error) => {
        console.error("Sign-out error:", error);
    });
}

// UI Handlers
function handleUserSignedIn(user) {
    // Hide login page
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.querySelector('.app-container');

    if (loginOverlay) {
        loginOverlay.classList.add('fade-out');
        setTimeout(() => {
            loginOverlay.style.display = 'none';
        }, 500); // Match transition duration
    }

    if (appContainer) {
        appContainer.style.display = 'grid'; // Restore grid display
        appContainer.classList.add('fade-in');
    }

    // Initialize the App if it hasn't been already
    // We dispatch a custom event that main-scripts.js can listen to
    window.dispatchEvent(new CustomEvent('user-authenticated', { detail: { user: user } }));
}

function handleUserSignedOut() {
    // Show login page
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.querySelector('.app-container');

    if (appContainer) {
        appContainer.style.display = 'none';
    }

    if (loginOverlay) {
        loginOverlay.style.display = 'flex';
        loginOverlay.classList.remove('fade-out');
    }
}

// Initialize on load? No, let main script or sequential loading handle it.
// Actually, we can just call initAuth() when this script loads if firebase is ready,
// but firebase-config is before this, and firebase libs are before this.
// So safe to call:

// Initialize Auth immediately since scripts are at end of body
initAuth();
