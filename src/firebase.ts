import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network connection.");
    }
    return false;
  }
}
