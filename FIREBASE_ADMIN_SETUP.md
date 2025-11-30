# Fix Firebase PERMISSION_DENIED with Admin SDK

## Problem
Admin API gets "PERMISSION_DENIED" when writing to Firebase because it's using the regular SDK without authentication.

## Solution: Use Firebase Admin SDK

### Step 1: Install Firebase Admin SDK
```bash
cd C:\CapsProj\tindago-admin
npm install firebase-admin
```

### Step 2: Get Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: **tindagoproject**
3. Click **⚙️ Settings** → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the JSON file as `serviceAccountKey.json` in `tindago-admin` folder
7. **⚠️ NEVER commit this file to Git!**

### Step 3: Update .gitignore
Add to `tindago-admin/.gitignore`:
```
serviceAccountKey.json
*.json
!package.json
!tsconfig.json
```

### Step 4: Create New Firebase Admin Config

Create `src/lib/firebaseAdmin.ts`:
```typescript
/**
 * Firebase Admin SDK Configuration
 * Used for server-side operations that need to bypass security rules
 */
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';

let adminApp: App;
let adminDatabase: Database;

/**
 * Initialize Firebase Admin SDK
 * Uses service account for authentication
 */
export function getAdminApp(): App {
  if (!adminApp) {
    // Check if already initialized
    const apps = getApps();
    if (apps.length > 0) {
      adminApp = apps[0];
    } else {
      // Initialize with service account
      const serviceAccount = require('../../serviceAccountKey.json');
      
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    }
  }
  return adminApp;
}

/**
 * Get Admin Database instance
 * This bypasses Firebase security rules
 */
export function getAdminDatabase(): Database {
  if (!adminDatabase) {
    const app = getAdminApp();
    adminDatabase = getDatabase(app);
  }
  return adminDatabase;
}

// Export for easy import
export const adminDb = () => getAdminDatabase();
```

### Step 5: Update Invoice API Route

Replace the Firebase import in `src/app/api/payments/invoice/route.ts`:

**Before:**
```typescript
import { ref, set, get } from 'firebase/database';
import { database } from '@/lib/firebase.js';
```

**After:**
```typescript
import { ref, set, get } from 'firebase-admin/database';
import { adminDb } from '@/lib/firebaseAdmin';

// In the POST function, replace all `database` with `adminDb()`:
const database = adminDb();
```

### Step 6: Do the Same for Purchase Order API

Update `src/app/api/payments/purchase-order-invoice/route.ts`:
```typescript
import { ref, set, get } from 'firebase-admin/database';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  const database = adminDb();
  // ... rest of the code
}
```

### Step 7: Restart Admin API
```bash
cd C:\CapsProj\tindago-admin
npm run dev
```

### Step 8: Test Payment Flow
1. Add items to cart in mobile app
2. Proceed to checkout
3. Select GCash/PayMaya
4. Should now work without PERMISSION_DENIED ✅

## Alternative: Update Firebase Rules (Quick Fix)

If you don't want to setup Admin SDK immediately, you can temporarily allow writes to specific paths:

Update `database.rules.json`:
```json
{
  "rules": {
    ".read": true,
    "ledgers": {
      ".write": true
    },
    "indexes": {
      ".write": true
    },
    "orders": {
      ".write": true
    },
    "settings": {
      ".write": true
    },
    "admins": {
      ".write": true
    },
    "roles": {
      ".write": true
    }
  }
}
```

⚠️ **Warning:** This is less secure. Admin SDK is the proper solution for production.

## Verify Setup

Create test endpoint: `src/app/api/test-firebase/route.ts`
```typescript
import { ref, set } from 'firebase-admin/database';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const database = adminDb();
    const testRef = ref(database, `test/${Date.now()}`);
    await set(testRef, { test: true, timestamp: new Date().toISOString() });
    
    return Response.json({ 
      success: true, 
      message: 'Firebase Admin SDK working!' 
    });
  } catch (error: any) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
```

Visit: http://localhost:3000/api/test-firebase

Expected: `{ "success": true, "message": "Firebase Admin SDK working!" }`

## Common Issues

### "Cannot find module 'serviceAccountKey.json'"
- Make sure you downloaded the service account key
- Place it in `tindago-admin/` root folder
- Restart the dev server

### "Invalid service account"
- Verify the JSON file is complete and not corrupted
- Re-download from Firebase Console
- Check the databaseURL matches your project

### "Module not found: firebase-admin"
- Run `npm install firebase-admin`
- Restart dev server

## Security Notes

1. **Never commit serviceAccountKey.json**
   - Add to .gitignore
   - Use environment variables for production

2. **Production Deployment**
   - Don't include serviceAccountKey.json in Docker images
   - Use environment variables or secrets manager
   - Example for Vercel:
     ```
     FIREBASE_ADMIN_SERVICE_ACCOUNT='{"type":"service_account",...}'
     ```

3. **Rotate Keys Regularly**
   - Generate new service account keys every 6 months
   - Delete old keys from Firebase Console

## Files Created/Modified

- ✅ `src/lib/firebaseAdmin.ts` (new)
- ✅ `src/app/api/payments/invoice/route.ts` (update imports)
- ✅ `src/app/api/payments/purchase-order-invoice/route.ts` (update imports)
- ✅ `.gitignore` (add serviceAccountKey.json)
- ✅ `serviceAccountKey.json` (download from Firebase)

---

After this setup, your admin API will be able to write to Firebase without permission errors!
