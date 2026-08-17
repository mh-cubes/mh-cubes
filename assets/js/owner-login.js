import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { auth } from "./firebase.js";


function ownerLogin() {

   const email =
    document.getElementById("owner-email").value.trim();

    const password =
        document.getElementById("owner-password").value;


    if (!email || !password) {

        document.getElementById("login-error").innerText =
            "❌ Please enter your email and password.";

        return;

    }


    signInWithEmailAndPassword(
        auth,
        email,
        password
    )

    .then(function () {

        localStorage.setItem(
            "adminAccess",
            "granted"
        );


        document.querySelector(".login-box").innerHTML = `

            <h1>🔐</h1>

            <h2>Access Granted</h2>

            <p>Opening Admin Dashboard...</p>

            <div class="loader"></div>

        `;


        setTimeout(function () {

            window.location.href = "admin.html";

        }, 2000);

    })

    .catch(function (error) {

        console.error(
            "Firebase login error:",
            error
        );


        document.getElementById("login-error").innerText =
            "❌ Invalid email or password.";

    });

}


window.ownerLogin = ownerLogin;
