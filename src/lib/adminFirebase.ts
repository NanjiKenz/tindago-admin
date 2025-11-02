import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Initialize Admin SDK once per server
export function getAdminDb() {
  if (!getApps().length) {
    const databaseURL = process.env.FIREBASE_DATABASE_URL;

    if (!databaseURL) {
      throw new Error('FIREBASE_DATABASE_URL environment variable is required for Firebase Admin SDK');
    }

    // Try different initialization strategies
    try {
      // Strategy 1: Use service account JSON if provided
      const serviceJson = process.env.FIREBASE_ADMIN_SERVICE_JSON;
      if (serviceJson) {
        initializeApp({
          credential: cert(JSON.parse(serviceJson)),
          databaseURL
        });
      } else {
        // Strategy 2: Use application default credentials (works in Cloud environments)
        // Strategy 3: For development, initialize with minimal config (database URL only)
        try {
          initializeApp({
            credential: applicationDefault(),
            databaseURL
          });
        } catch {
          // Development fallback: Initialize with database URL only
          // This works for read/write operations if Firebase Realtime Database rules allow it
          initializeApp({
            databaseURL,
            projectId: process.env.FIREBASE_PROJECT_ID
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      throw new Error(`Firebase Admin SDK initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  return getDatabase();
}