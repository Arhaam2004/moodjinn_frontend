// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBRKxnsSI7vUlPKBJKmWAcU9iHI7eTh3GA",
    authDomain: "lahacks-ea492.firebaseapp.com",
    projectId: "lahacks-ea492",
    storageBucket: "lahacks-ea492.appspot.com",
    messagingSenderId: "666753112047",
    appId: "1:666753112047:web:4c405b810918d0935dc81a",
    measurementId: "G-Q3W2Y5M7Y2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

export {app, auth, db};