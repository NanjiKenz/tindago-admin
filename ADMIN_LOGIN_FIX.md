# Admin Login Fix Guide

## Problem Identified

The admin login is failing with "Permission denied" because of a **missing database entry** required by Firebase security rules.

### Root Cause

The Firebase security rules require a `roles/{uid}` entry to grant admin permissions, but the original `create-admin-user.js` script didn't create this entry.

**Security Rule (line 7 in database.rules.json):**
```json
".read": "auth != null && root.child('roles').child(auth.uid).val() === 'admin'"
```

This rule checks if `roles/{uid}` equals `'admin'`, but that entry doesn't exist!

**Admin User Details:**
- **Email:** admin@tindago.com
- **Password:** Admin123!
- **UID:** oBNuLagtZ0aUCCIvCrVr5rqRhoQ2

---

## Quick Fix (Option 1): Firebase Console - RECOMMENDED

This is the fastest and safest solution:

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select your project: **tindagoproject**
3. Click on **Realtime Database** in the left sidebar
4. Click on the **Data** tab

### Step 2: Add the Missing Role
1. Look for the root node (the database name at the top)
2. If you DON'T see a `roles` node:
   - Click the **"+"** button next to the root node
   - Enter `roles` as the name
   - Click **Add**

3. Click the **"+"** button next to the `roles` node
4. Enter the admin UID:
   ```
   Name: oBNuLagtZ0aUCCIvCrVr5rqRhoQ2
   Value: "admin"
   ```
   ⚠️ Make sure to enter `"admin"` as a **string** (with quotes in the Firebase UI)

5. Click **Add**

### Step 3: Test Login
1. Start the admin dashboard:
   ```bash
   npm run dev
   ```
2. Go to: http://localhost:3000/auth/login
3. Login with:
   - Email: admin@tindago.com
   - Password: Admin123!

✅ You should now be able to log in successfully!

---

## Alternative Fix (Option 2): Temporary Security Rules

If you can't access Firebase Console, you can temporarily relax the security rules:

### Step 1: Deploy Temporary Rules
```bash
cd C:\CapsProj\TindaGo
firebase deploy --only database
```

When prompted, use the temporary rules file: `database.rules.temp.json`

### Step 2: Run the Fix Script
```bash
cd C:\CapsProj\tindago-admin
node fix-admin-role.js
```

### Step 3: Restore Original Rules
```bash
cd C:\CapsProj\TindaGo
firebase deploy --only database
```

Use the original rules file: `database.rules.json`

---

## Permanent Fix: Updated create-admin-user.js

The `create-admin-user.js` script has been updated to include the `roles/{uid}` entry for future admin users.

**Changes Made:**
```javascript
// NEW: Add to roles collection (REQUIRED for security rules)
await set(ref(database, `roles/${user.uid}`), 'admin');
```

For any new admin users, the script will now work correctly!

---

## ChunkLoadError Fix

The Next.js build cache has been cleared to fix the ChunkLoadError:

```bash
rm -rf .next
```

When you restart the dev server (`npm run dev`), Next.js will rebuild the application fresh.

---

## Verification Checklist

After applying the fix, verify these database entries exist:

### 1. Check `roles/oBNuLagtZ0aUCCIvCrVr5rqRhoQ2`
Should equal: `"admin"` (string)

### 2. Check `users/oBNuLagtZ0aUCCIvCrVr5rqRhoQ2`
Should contain:
```json
{
  "uid": "oBNuLagtZ0aUCCIvCrVr5rqRhoQ2",
  "email": "admin@tindago.com",
  "role": "admin",
  "name": "Admin User",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 3. Check `admins/oBNuLagtZ0aUCCIvCrVr5rqRhoQ2`
Should contain:
```json
{
  "uid": "oBNuLagtZ0aUCCIvCrVr5rqRhoQ2",
  "email": "admin@tindago.com",
  "name": "Admin User",
  "role": "super_admin",
  "status": "active",
  "permissions": {
    "manageStores": true,
    "manageUsers": true,
    "viewAnalytics": true,
    "manageOrders": true
  },
  "createdAt": "...",
  "lastLoginAt": null
}
```

---

## Troubleshooting

### Still Getting Permission Denied?

1. **Clear browser cache and cookies**
2. **Try incognito/private browsing mode**
3. **Verify the role entry exists** in Firebase Console
4. **Check Firebase Auth** - make sure admin@tindago.com exists
5. **Restart the dev server**:
   ```bash
   npm run dev
   ```

### ChunkLoadError Still Occurring?

1. **Clear browser cache**
2. **Delete node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. **Clear Next.js cache again**:
   ```bash
   rm -rf .next
   ```

---

## Summary

**What was wrong:**
- Missing `roles/{uid}` entry in Firebase Realtime Database
- Next.js build cache corruption causing ChunkLoadError

**What was fixed:**
- ✅ Identified admin UID: `oBNuLagtZ0aUCCIvCrVr5rqRhoQ2`
- ✅ Updated `create-admin-user.js` to include roles entry
- ✅ Cleared Next.js build cache
- ✅ Created fix scripts and temporary rules
- ⏳ **Manual step required:** Add role entry in Firebase Console

**Next Step:**
Follow **Option 1 (Firebase Console)** above to add the missing role entry, then test login!
