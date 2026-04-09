import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: import.meta.env.AIzaSyCyE7NcLjZHj3EtTYb2LXZkm2-KmxGx-ZE,
  authDomain: import.meta.env.solar-project-dashboard-3d79d.firebaseapp.com,
  projectId: import.meta.env.solar-project-dashboard-3d79d,
  storageBucket: import.meta.env.solar-project-dashboard-3d79d.firebasestorage.app,
  messagingSenderId: import.meta.env.191105004623,
  appId: import.meta.env.1:191105004623:web:7ce083629c6427bd0aa63a,
};

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
