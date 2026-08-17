import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const auth = getAuth();
function ownerLogin(){

let username =
document.getElementById("owner-username").value;


let password =
document.getElementById("owner-password").value;



if(username === "Huzaifa" && password === "Officialmhcubes1"){


localStorage.setItem(
"adminAccess",
"granted"
);


// Show loading message

document.querySelector(".login-box").innerHTML = `

<h1>🔐</h1>

<h2>Access Granted</h2>

<p>Opening Admin Dashboard...</p>

<div class="loader"></div>

`;


// Wait then open admin

setTimeout(function(){

window.location.href="admin.html";

},2000);



}else{


document.getElementById("login-error").innerText =
"❌ Wrong username or password";


}

}
