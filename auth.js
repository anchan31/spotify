// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get elements
const authContainer = document.getElementById("auth-container");
const musicPlayer = document.getElementById("music-player");
const loginBtn = document.getElementById("login");
const signupBtn = document.getElementById("signup");
const logoutBtn = document.getElementById("logout");

// Login User
loginBtn.addEventListener("click", function () {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("Login Successful!");
        })
        .catch(error => {
            alert(error.message);
        });
});

// Sign Up User
signupBtn.addEventListener("click", function () {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("Account Created!");
        })
        .catch(error => {
            alert(error.message);
        });
});

// Logout User
logoutBtn.addEventListener("click", function () {
    firebase.auth().signOut().then(() => {
        alert("Logged Out!");
    });
});

// Manage User Authentication State
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        authContainer.style.display = "none";
        musicPlayer.style.display = "block";
    } else {
        authContainer.style.display = "block";
        musicPlayer.style.display = "none";
    }
});
