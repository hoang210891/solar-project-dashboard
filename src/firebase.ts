import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

let db: any;
let auth: any;
let storage: any;

try {
  const app = initializeApp(firebaseConfig);

  // Use named database if provided, otherwise fallback to default
  db = firebaseConfig.firestoreDatabaseId 
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

  auth = getAuth(app);
  storage = getStorage(app);

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  db = {} as any;
  auth = {} as any;
  storage = {} as any;
}

export { db, auth, storage };
