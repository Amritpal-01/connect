
// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBWF68nZW1ZiZhcKBhYwFWCAzRgXKikksg",
  authDomain: "file-sharing-app-4087.firebaseapp.com",
  projectId: "file-sharing-app-4087",
  storageBucket: "file-sharing-app-4087.firebasestorage.app",
  messagingSenderId: "195399702885",
  appId: "1:195399702885:web:a7ea3fca32d706e8f5298c",
  measurementId: "G-3DN6G4MMD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
