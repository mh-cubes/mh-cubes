import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB6MYr13AyziKvvefjNap7qlIh7oGpZq3g",
    authDomain: "mh-cubes-c0d74.firebaseapp.com",
    projectId: "mh-cubes-c0d74",
    storageBucket: "mh-cubes-c0d74.firebasestorage.app",
    messagingSenderId: "348952637524",
    appId: "1:348952637524:web:8b07eef9d23decd332bdc1"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
