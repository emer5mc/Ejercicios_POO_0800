import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD8bMOno1apIxVqvzCKqUctitGYnA_O1ec",
    authDomain: "proyectofinal-6bdac.firebaseapp.com",
    projectId: "proyectofinal-6bdac",
    storageBucket: "proyectofinal-6bdac.appspot.com",
    messagingSenderId: "377775257077",
    appId: "1:377775257077:web:1f17e0bfbb6cc3c9741cbc"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  export const db= firebase.firestore();