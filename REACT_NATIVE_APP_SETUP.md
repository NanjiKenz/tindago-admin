# React Native App - Store Registration Setup Guide

## 🎯 Critical Information

Your React Native app should save pending store registrations **directly to the `stores` collection** with `status: "pending"`.

The admin dashboard now fetches pending stores from **BOTH** locations:
1. ✅ **`stores` collection** (Primary - where React Native app saves)
2. ✅ **`store_registrations` collection** (Secondary - legacy support)

---

## 📝 React Native Registration Code

### **Save to `stores/{userId}` with status "pending"**

```javascript
import { ref, set } from 'firebase/database';
import { database, auth } from './firebaseConfig';

/**
 * Register a new store
 * Saves directly to stores collection with status "pending"
 */
export const registerStore = async (formData) => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User must be logged in');
    }

    // Prepare store data with EXACT field names
    const storeData = {
      // ============================================
      // REQUIRED FIELDS - EXACT NAMES
      // ============================================
      storeName: formData.storeName,        // ✅ "RK Store"
      name: formData.ownerName,             // ✅ "John Doe" (owner's name)
      email: formData.ownerEmail,           // ✅ "john@example.com"
      phone: formData.ownerPhone,           // ✅ "+63 912 345 6789"
      address: formData.streetAddress,      // ✅ "123 Main Street"
      city: formData.city,                  // ✅ "Davao City"

      // ============================================
      // STATUS & METADATA
      // ============================================
      status: 'pending',                    // ✅ MUST be "pending"
      userId: userId,
      createdAt: new Date().toISOString(),

      // ============================================
      // OPTIONAL FIELDS
      // ============================================
      documents: {
        businessPermit: formData.businessPermitUrl || null,
        validId: formData.validIdUrl || null,
        storePhoto: formData.storePhotoUrl || null
      },
      businessType: 'Sari-Sari Store',
      permitType: 'Business Permit'
    };

    // ✅ Save to stores/{userId}
    const storeRef = ref(database, `stores/${userId}`);
    await set(storeRef, storeData);

    console.log('✅ Store registered successfully to stores collection');
    return { success: true, storeId: userId };

  } catch (error) {
    console.error('❌ Error registering store:', error);
    throw error;
  }
};
```

---

## 🔑 Required Field Names (EXACT)

| Field Purpose | Firebase Field Name | Example Value | Type |
|--------------|---------------------|---------------|------|
| Store Name | `storeName` | "RK Store" | String |
| Owner Name | `name` | "John Doe" | String |
| Owner Email | `email` | "john@example.com" | String |
| Owner Phone | `phone` | "+63 912 345 6789" | String |
| Street Address | `address` | "123 Main Street" | String |
| City | `city` | "Davao City" | String |
| Status | `status` | "pending" | String |
| User ID | `userId` | "[FIREBASE_AUTH_UID]" | String |
| Created Date | `createdAt` | "2025-01-15T10:30:00Z" | ISO 8601 |

---

## 🎨 Admin Dashboard Display

### **How fields appear in admin:**

**Store Management Overview Table:**
```
┌─────────────────────────────────────────────────────────┐
│ Store                 │ Owner           │ Status  │ ... │
├─────────────────────────────────────────────────────────┤
│ RK Store              │ John Doe        │ Pending │     │
│ 123 Main St, Davao City│ john@example.com│         │     │
└─────────────────────────────────────────────────────────┘
```

**Field Mapping:**
- **Store Name** → `stores/{userId}/storeName` → "RK Store"
- **Address** → `stores/{userId}/address` + `city` → "123 Main St, Davao City"
- **Owner Name** → `stores/{userId}/name` → "John Doe"
- **Owner Email** → `stores/{userId}/email` → "john@example.com"

---

## ✅ Verification Checklist

After registering a store from React Native:

### **1. Check Firebase Console**

Go to: Firebase → Realtime Database → `stores` → `{userId}`

You should see:
```json
{
  "stores": {
    "[USER_ID]": {
      "storeName": "RK Store",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+63 912 345 6789",
      "address": "123 Main Street",
      "city": "Davao City",
      "status": "pending",
      "userId": "[USER_ID]",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

### **2. Check Admin Dashboard**

1. Open http://localhost:3010
2. Navigate to Store Management
3. Click on **"Pending Approval"** card (should show count)
4. **OR** Click "View All" on Pending Approval card
5. You should see your store with:
   - ✅ Store Name: "RK Store"
   - ✅ Address: "123 Main St, Davao City"
   - ✅ Owner: "John Doe"
   - ✅ Email: "john@example.com"
   - ✅ Status: Pending

### **3. Check Browser Console Logs**

Press F12 → Console tab, look for:

```
📦 Raw Firebase Data for Store [userId]:
  🏪 Store Name Fields:
    storeName: "RK Store" ✅
  👤 Owner Name Fields:
    name: "John Doe" ✅
  📍 Address Fields:
    address: "123 Main Street" ✅
    city: "Davao City" ✅
    COMBINED: "123 Main Street, Davao City" ✅
  📧 Contact Fields:
    email: "john@example.com" ✅
    phone: "+63 912 345 6789" ✅
  📊 Status: "pending" ✅
```

---

## ❌ Common Mistakes

### **1. Wrong Field Names**
```javascript
// ❌ WRONG
ownerName: "John Doe"  // Should be "name"
businessName: "RK Store"  // Should be "storeName"

// ✅ CORRECT
name: "John Doe"
storeName: "RK Store"
```

### **2. Missing Required Fields**
```javascript
// ❌ WRONG - Missing city
{
  storeName: "RK Store",
  address: "123 Main St"
  // Missing city!
}

// ✅ CORRECT
{
  storeName: "RK Store",
  address: "123 Main St",
  city: "Davao City"  // ✅ Both required
}
```

### **3. Wrong Status Value**
```javascript
// ❌ WRONG
status: "submitted"
status: "awaiting_review"

// ✅ CORRECT
status: "pending"  // Must be exactly "pending"
```

### **4. Wrong Firebase Path**
```javascript
// ❌ WRONG - Saving to store_registrations
const ref = ref(database, `store_registrations/${userId}`);

// ✅ CORRECT - Save to stores
const storeRef = ref(database, `stores/${userId}`);
```

---

## 🔄 Approval Workflow

1. **React Native App** → Saves to `stores/{userId}` with `status: "pending"`
2. **Admin Dashboard** → Shows in "Pending Approval" section
3. **Admin Approves** → Changes `status` to "active"
4. **React Native App** → Store can now operate

---

## 🐛 Troubleshooting

### **Problem:** "Unknown Store" in admin
**Solution:** Check that `storeName` field exists and has a value

### **Problem:** "Unknown Owner" in admin
**Solution:** Check that `name` field exists (not `ownerName`)

### **Problem:** Empty address in admin
**Solution:** Check that BOTH `address` AND `city` fields exist

### **Problem:** Store not showing in pending list
**Solution:** Check that `status` is exactly "pending"

### **Problem:** Still showing as "Unknown Store" even with correct fields
**Solution:**
1. Delete the old store entry from Firebase Console
2. Re-register from React Native app with correct fields
3. Refresh admin dashboard

---

## 📚 Additional Resources

- **Field Mapping Reference:** `FIELD_MAPPING_REFERENCE.md`
- **Detailed Integration Guide:** `REACT_NATIVE_FIREBASE_INTEGRATION.md`
- **Database Schema:** `firebase-database-structure.md`

---

**Last Updated:** 2025-01-15
**Version:** 2.0.0 - Now saves directly to `stores` collection