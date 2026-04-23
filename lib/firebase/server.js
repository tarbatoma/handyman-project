import * as admin from 'firebase-admin';

// Protect against multiple initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace literal \n with actual newlines if necessary
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminAuth, adminDb, adminStorage, admin };
