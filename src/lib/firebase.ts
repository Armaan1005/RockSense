// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "snowtrace",
  "appId": "1:749080357555:web:1aa1deddae9713755f9ec6",
  "storageBucket": "snowtrace.firebasestorage.app",
  "apiKey": "AIzaSyCmIcHFYN_YDqbE6I9_XPvFlCMa2bvd5q0",
  "authDomain": "snowtrace.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "749080357555"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
