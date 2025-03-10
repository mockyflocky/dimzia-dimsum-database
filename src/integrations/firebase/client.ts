
// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSR190RRzC9SQtMNUhPhjUqcpVORRh9Ls",
  authDomain: "dimzia.firebaseapp.com",
  projectId: "dimzia",
  storageBucket: "dimzia.firebasestorage.app",
  messagingSenderId: "301556179116",
  appId: "1:301556179116:web:91eba3ab640b8e2fc8ff09",
  measurementId: "G-YG0V4JFB19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
