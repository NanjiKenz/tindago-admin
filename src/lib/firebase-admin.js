// Firebase Admin SDK for server-side operations (bypasses security rules)
import admin from 'firebase-admin';

let adminApp;
let adminAuth;
let adminDb;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Use service account from environment or default credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  if (serviceAccount) {
    // Initialize with service account (production)
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
  } else {
    // Initialize with API key (development - less secure but works)
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: `firebase-adminsdk@${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
  }
  
  adminAuth = admin.auth();
  adminDb = admin.database();
  console.log('[Firebase Admin] Initialized successfully');
} else {
  adminApp = admin.app();
  adminAuth = admin.auth();
  adminDb = admin.database();
}

export { adminApp, adminAuth, adminDb, admin };
export default admin;
