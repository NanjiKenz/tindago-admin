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
    // Initialize with individual env vars (development/production)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk@${projectId}.iam.gserviceaccount.com`;

    if (!privateKey || !projectId) {
      throw new Error(
        'Firebase Admin: Missing required environment variables. ' +
        'Set FIREBASE_PRIVATE_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID in Vercel.'
      );
    }

    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
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
// Export database as alias for adminDb for compatibility
export const database = adminDb;
export default admin;
