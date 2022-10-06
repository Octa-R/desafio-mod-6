import * as admin from "firebase-admin";
import { cert, initializeApp } from "firebase-admin/app";

initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG || "")),
  databaseURL: process.env.DATABASE_URL,
});
const firestore = admin.firestore();
const rtdb = admin.database();

export { rtdb, firestore };
