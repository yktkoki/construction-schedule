import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBbKZIifmOlZkAqDbCV-jfpTbosSYX2N0",
  authDomain: "construction-schedule-67b61.firebaseapp.com",
  projectId: "construction-schedule-67b61",
  storageBucket: "construction-schedule-67b61.firebasestorage.app",
  messagingSenderId: "365143229041",
  appId: "1:365143229041:web:bee7db587d6654f59dd1d0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
