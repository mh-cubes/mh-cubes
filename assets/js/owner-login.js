import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { auth } from "./firebase.js";


// =========================================
// OWNER ACCOUNT
// =========================================

const OWNER_UID =
    "UPdmuwyLEcdEyMxFENPGRlAhxwa2";


// =========================================
// DOM ELEMENTS
// =========================================

const loginButton =
    document.getElementById("login-button");

const emailInput =
    document.getElementById("owner-email");

const passwordInput =
    document.getElementById("owner-password");

const errorMessage =
    document.getElementById("login-error");


// =========================================
// OWNER LOGIN
// =========================================

async function ownerLogin() {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    // Empty fields

    if (!email || !password) {

        errorMessage.innerText =
            "❌ Please enter your email and password.";

        return;

    }


    // Loading

    loginButton.disabled = true;

    loginButton.innerText =
        "🔄 Signing in...";

    errorMessage.innerText = "";


    try {

        // Firebase login

        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            result.user;


        console.log(
            "Logged in email:",
            user.email
        );

        console.log(
            "Logged in UID:",
            user.uid
        );


        // =========================================
        // OWNER UID CHECK
        // =========================================

        if (user.uid !== OWNER_UID) {

            await signOut(auth);

            loginButton.disabled = false;

            loginButton.innerText =
                "🔐 Login to Dashboard";

            errorMessage.innerText =
                "❌ This account is not authorized as the owner.";

            return;

        }


        // =========================================
        // OWNER LOGIN SUCCESS
        // =========================================

        localStorage.setItem(
            "adminAccess",
            "granted"
        );


        document.querySelector(".owner-login-box").innerHTML = `

            <div class="success-icon">
                ✓
            </div>

            <h2>
                Welcome, Owner!
            </h2>

            <p>
                Login successful.
            </p>

            <div class="loader"></div>

            <small>
                Opening your dashboard...
            </small>

        `;


        // Open admin panel

        setTimeout(function () {

            window.location.href =
                "admin.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Firebase login error:",
            error
        );


        loginButton.disabled = false;

        loginButton.innerText =
            "🔐 Login to Dashboard";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            errorMessage.innerText =
                "❌ Incorrect email or password.";

        } else {

            errorMessage.innerText =
                "❌ Login failed. Please try again.";

        }

    }

}


// =========================================
// LOGIN BUTTON
// =========================================

loginButton.addEventListener(
    "click",
    ownerLogin
);


// =========================================
// ENTER KEY LOGIN
// =========================================

[emailInput, passwordInput].forEach(
    function (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    ownerLogin();

                }

            }
        );

    }
);
