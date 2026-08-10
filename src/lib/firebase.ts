import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection initialized successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}

testConnection();

export {
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  orderBy,
  writeBatch
};

