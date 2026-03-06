// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUE7GsASxFjLXcSjpCANmUDWf_O38Zyj0",
    authDomain: "ordemservicoapk.firebaseapp.com",
    projectId: "ordemservicoapk",
    storageBucket: "ordemservicoapk.firebasestorage.app",
    messagingSenderId: "472414542748",
    appId: "1:472414542748:web:70515180ee3182e0b04659",
    measurementId: "G-TTZ3QX5FVC"
};

// Initialize Firebase using compat mode
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();
