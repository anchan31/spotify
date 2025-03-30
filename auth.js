// Import and configure Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCDMuiwxLNqH2sbDKIwQnjMc_E27rDPnEI",
  authDomain: "anchan4746.firebaseapp.com",
  projectId: "anchan4746",
  storageBucket: "anchan4746.firebasestorage.app",
  messagingSenderId: "358621818152",
  appId: "1:358621818152:web:2e759be0619d1dd7acb41d",
  measurementId: "G-DKYFD9ZNCL"
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
