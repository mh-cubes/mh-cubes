// Firebase configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";


const firebaseConfig = {

    apiKey: "AIzaSyB6MYr13AyziKvvefjNap7qlIh7oGpZq3g",

    authDomain: "mh-cubes-c0d74.firebaseapp.com",

    projectId: "mh-cubes-c0d74",

    storageBucket: "mh-cubes-c0d74.firebasestorage.app",

    messagingSenderId: "348952637524",

    appId: "1:348952637524:web:8b07eef9d23decd332bdc1"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Firestore

const db = getFirestore(app);


// Firebase Storage

const storage = getStorage(app);


// Export

export {
    db,
    storage
};
