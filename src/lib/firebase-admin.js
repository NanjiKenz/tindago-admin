// Firebase Admin SDK for server-side operations (bypasses security rules)
import admin from 'firebase-admin';

let adminApp;
let adminAuth;
let adminDb;
let initialized = false;

// Lazy initialization - only initialize when actually needed (at runtime, not build time)
function initializeFirebaseAdmin() {
  if (initialized) return;
  
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    adminAuth = admin.auth();
    adminDb = admin.database();
    initialized = true;
    return;
  }

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
  initialized = true;
  console.log('[Firebase Admin] Initialized successfully');
}

// Getter functions that initialize on first access
function getAdminApp() {
  initializeFirebaseAdmin();
  return adminApp;
}

function getAdminAuth() {
  initializeFirebaseAdmin();
  return adminAuth;
}

function getAdminDb() {
  initializeFirebaseAdmin();
  return adminDb;
}

// Create proxy object that initializes on property access
const databaseProxy = new Proxy({}, {
  get(target, prop) {
    initializeFirebaseAdmin();
    return adminDb[prop];
  }
});

export { getAdminApp as adminApp, getAdminAuth as adminAuth, getAdminDb as adminDb, admin };
// Export database as proxy that initializes lazily
export const database = databaseProxy;
export default admin;
