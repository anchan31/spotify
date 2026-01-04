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
    const usernameInput = document.getElementById('login-username');
    const customUsername = (usernameInput && !isLoginMode) ? usernameInput.value.trim() : null;

    // Show loading state if UI element exists
    const loginBtn = document.getElementById('google-login-btn');
    const btnText = loginBtn ? loginBtn.querySelector('span') : null;
    const originalText = btnText ? btnText.textContent : 'Sign in with Google';

    if (btnText) btnText.textContent = 'Signing in...';

    auth.signInWithPopup(provider)
        .then(async (result) => {
            // User signed in
            console.log("Google Sign-In Successful");

            // Handle Custom Username for New Users
            if (result.additionalUserInfo && result.additionalUserInfo.isNewUser && customUsername) {
                try {
                    await result.user.updateProfile({ displayName: customUsername });
                    // Also update Firestore if needed (db-manager handles this usually, but we can double check)
                    // The ensureUserInitialized in db-manager might run on auth state change.
                    // We can explicitly update the doc here to be safe.
                    if (typeof db !== 'undefined') {
                        await db.collection('users').doc(result.user.uid).set({
                            displayName: customUsername
                        }, { merge: true });
                    }
                    console.log("Applied custom username to Google account:", customUsername);
                } catch (err) {
                    console.error("Error setting custom username for Google user:", err);
                }
            }

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
    // Show Loading Screen first
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('visible');
    }

    // Hide login page
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.querySelector('.app-container');

    if (loginOverlay) {
        loginOverlay.style.display = 'none'; // Hide immediately behind loading screen
        loginOverlay.classList.remove('fade-out'); // Reset class
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

// Email/Password Auth State
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;

    const title = document.querySelector('.login-card h1');
    const subtitle = document.querySelector('.login-card p');
    const submitBtn = document.getElementById('email-login-btn');
    const toggleBtn = document.getElementById('toggle-auth-mode');
    const toggleText = toggleBtn.parentElement; // The <p> containing the span
    const errorMsg = document.getElementById('login-error-msg');
    const usernameInput = document.getElementById('login-username');

    if (errorMsg) errorMsg.style.display = 'none';

    if (isLoginMode) {
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Sign in to access your music library';
        submitBtn.textContent = 'Log In';
        toggleBtn.textContent = 'Sign Up';
        toggleText.childNodes[0].nodeValue = "Don't have an account? ";
        if (usernameInput) usernameInput.style.display = 'none';
    } else {
        title.textContent = 'Create Account';
        subtitle.textContent = 'Sign up to start listening';
        submitBtn.textContent = 'Sign Up';
        toggleBtn.textContent = 'Log In';
        toggleText.childNodes[0].nodeValue = "Already have an account? ";
        if (usernameInput) {
            usernameInput.style.display = 'block';
            usernameInput.focus();
        }
    }
}

function signInWithEmail() {
    if (!auth) initAuth();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const usernameInput = document.getElementById('login-username');
    const username = usernameInput ? usernameInput.value.trim() : '';

    const errorDisplay = document.getElementById('login-error-msg');
    const submitBtn = document.getElementById('email-login-btn');

    if (!email || !password || (!isLoginMode && !username)) {
        if (errorDisplay) {
            errorDisplay.textContent = !isLoginMode && !username ? 'Please enter a username.' : 'Please enter both email and password.';
            errorDisplay.style.display = 'block';
        }
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = isLoginMode ? 'Logging in...' : 'Signing up...';
    submitBtn.disabled = true;

    if (isLoginMode) {
        // Log In
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Email Sign-In Successful");
                // onAuthStateChanged will handle the rest
            })
            .catch((error) => {
                console.error("Email Sign-In Error:", error);
                handleAuthError(error, submitBtn, originalText);
            });
    } else {
        // Sign Up
        auth.createUserWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                console.log("Email Sign-Up Successful");
                const user = userCredential.user;
                // Set Display Name immediately
                if (username) {
                    try {
                        await user.updateProfile({ displayName: username });
                        console.log("Display name set to:", username);
                    } catch (err) {
                        console.error("Error setting display name:", err);
                    }
                }
                // onAuthStateChanged will handle the rest
            })
            .catch((error) => {
                console.error("Email Sign-Up Error:", error);
                handleAuthError(error, submitBtn, originalText);
            });
    }
}

function handleAuthError(error, btn, originalText) {
    const errorDisplay = document.getElementById('login-error-msg');
    if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
    }

    if (errorDisplay) {
        let msg = error.message;
        if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
        if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
        if (error.code === 'auth/email-already-in-use') msg = 'Email already in use.';
        if (error.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';

        errorDisplay.textContent = msg;
        errorDisplay.style.display = 'block';
    }
}

// Initialize Auth immediately since scripts are at end of body
initAuth();
