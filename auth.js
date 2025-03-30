document.getElementById("login").addEventListener("click", function () {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Logged in successfully!");
            document.getElementById("logout").style.display = "block";
        })
        .catch((error) => {
            alert(error.message);
        });
});

document.getElementById("signup").addEventListener("click", function () {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Account created successfully!");
        })
        .catch((error) => {
            alert(error.message);
        });
});

document.getElementById("logout").addEventListener("click", function () {
    firebase.auth().signOut().then(() => {
        alert("Logged out!");
        document.getElementById("logout").style.display = "none";
    });
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("logout").style.display = "block";
    } else {
        document.getElementById("logout").style.display = "none";
    }
});
