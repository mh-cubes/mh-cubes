```js
import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { auth } from "./firebase.js";


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


    // Loading state

    loginButton.disabled = true;

    loginButton.innerText =
        "🔄 Signing in...";

    errorMessage.innerText = "";


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        localStorage.setItem(
            "adminAccess",
            "granted"
        );


        // Success screen

        document.querySelector(".login-box").innerHTML = `

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


        errorMessage.innerText =
            "❌ Invalid owner email or password.";

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
```
