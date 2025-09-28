import admin from 'firebase-admin';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

if (!admin.apps.length) {
  const serviceAccount = require(path.join(__dirname, 'serviceAccount.json'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`,
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const messaging = admin.messaging();

export default admin;
