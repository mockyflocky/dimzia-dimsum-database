
// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
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

// Collection references
export const menuItemsRef = collection(firestore, "menu_items");
export const deliveryZonesRef = collection(firestore, "delivery_zones");
export const adminUsersRef = collection(firestore, "admin_users");

// Helper functions for database operations

// Create or update a document in a collection
export const setDocument = async (collectionName: string, docId: string, data: any) => {
  const docRef = doc(firestore, collectionName, docId);
  return await setDoc(docRef, {
    ...data,
    updated_at: new Date().toISOString()
  }, { merge: true });
};

// Get a document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(firestore, collectionName, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

// Get all documents from a collection with optional ordering
export const getCollection = async (collectionName: string, orderByField?: string, direction: 'asc' | 'desc' = 'asc') => {
  let q;
  if (orderByField) {
    q = query(collection(firestore, collectionName), orderBy(orderByField, direction));
  } else {
    q = collection(firestore, collectionName);
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  return await deleteDoc(doc(firestore, collectionName, docId));
};

export default app;
