# TindaGo React Native App - Firebase Store Registration Integration Guide

## 🎯 Overview
This guide shows React Native developers the **EXACT** Firebase Realtime Database structure needed for store registration to work with the TindaGo Admin Dashboard.

---

## 📦 Firebase Database Structure for Store Registration

### **Step 1: Store Registration (React Native App → Firebase)**

When a store owner completes registration in your React Native app, save the data to:
```
firebase/realtime-database/store_registrations/{userId}/
```

### **Required Fields Structure**

```javascript
{
  "store_registrations": {
    "[USER_ID_FROM_FIREBASE_AUTH]": {
      // ============================================
      // STORE INFORMATION (REQUIRED)
      // ============================================
      "storeName": "RK Store",              // ✅ EXACT store name

      // ============================================
      // OWNER INFORMATION (REQUIRED)
      // ============================================
      "name": "John Doe",                   // ✅ Owner's full name
      "email": "john@example.com",          // ✅ Owner's email
      "phone": "+63 912 345 6789",          // ✅ Owner's phone number

      // ============================================
      // ADDRESS INFORMATION (REQUIRED)
      // ============================================
      "address": "123 Main Street",         // ✅ Street address/Barangay
      "city": "Davao City",                 // ✅ City name

      // ============================================
      // STATUS & DATES (REQUIRED)
      // ============================================
      "status": "pending",                  // Must be "pending"
      "createdAt": "2025-01-15T10:30:00Z",  // ISO 8601 format
      "userId": "[USER_ID]",                // Same as parent key

      // ============================================
      // DOCUMENTS (OPTIONAL BUT RECOMMENDED)
      // ============================================
      "documents": {
        "businessPermit": "https://storage.googleapis.com/.../permit.pdf",
        "validId": "https://storage.googleapis.com/.../id.jpg",
        "storePhoto": "https://storage.googleapis.com/.../photo.jpg"
      },

      // ============================================
      // ADDITIONAL INFO (OPTIONAL)
      // ============================================
      "businessType": "Sari-Sari Store",
      "permitType": "Business Permit"
    }
  }
}
```

---

## 💻 React Native Implementation Code

### **1. Firebase Setup (firebaseConfig.js)**

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
```

### **2. Store Registration Function**

```javascript
import { ref, set } from 'firebase/database';
import { database, auth } from './firebaseConfig';

/**
 * Register a new store in Firebase
 * @param {Object} storeData - Store registration data
 */
export const registerStore = async (storeData) => {
  try {
    // Get current user ID from Firebase Auth
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User must be logged in to register a store');
    }

    // Prepare store registration data with EXACT field names
    const registrationData = {
      // Store Information
      storeName: storeData.storeName,           // ✅ "RK Store"

      // Owner Information
      name: storeData.ownerName,                // ✅ "John Doe"
      email: storeData.ownerEmail,              // ✅ "john@example.com"
      phone: storeData.ownerPhone,              // ✅ "+63 912 345 6789"

      // Address Information
      address: storeData.streetAddress,         // ✅ "123 Main Street"
      city: storeData.city,                     // ✅ "Davao City"

      // Status & Metadata
      status: 'pending',                        // Always "pending" for new registrations
      userId: userId,                           // Firebase Auth UID
      createdAt: new Date().toISOString(),      // ISO 8601 timestamp

      // Documents (if uploaded)
      documents: {
        businessPermit: storeData.businessPermitUrl || null,
        validId: storeData.validIdUrl || null,
        storePhoto: storeData.storePhotoUrl || null
      },

      // Additional Info
      businessType: storeData.businessType || 'Sari-Sari Store',
      permitType: 'Business Permit'
    };

    // Save to Firebase: store_registrations/{userId}
    const registrationRef = ref(database, `store_registrations/${userId}`);
    await set(registrationRef, registrationData);

    console.log('✅ Store registration submitted successfully');
    return { success: true, registrationId: userId };

  } catch (error) {
    console.error('❌ Error registering store:', error);
    throw error;
  }
};
```

### **3. Example Usage in React Native**

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { registerStore } from './services/storeService';

const StoreRegistrationScreen = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    streetAddress: '',
    city: '',
    businessPermitUrl: null,
    validIdUrl: null,
    storePhotoUrl: null
  });

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.storeName || !formData.ownerName || !formData.ownerEmail) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Submit store registration
      const result = await registerStore(formData);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your store registration has been submitted. An admin will review it shortly.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit registration. Please try again.');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Store Name (e.g., RK Store)"
        value={formData.storeName}
        onChangeText={(text) => setFormData({ ...formData, storeName: text })}
      />
      <TextInput
        placeholder="Owner Name"
        value={formData.ownerName}
        onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
      />
      <TextInput
        placeholder="Email"
        value={formData.ownerEmail}
        onChangeText={(text) => setFormData({ ...formData, ownerEmail: text })}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Phone Number"
        value={formData.ownerPhone}
        onChangeText={(text) => setFormData({ ...formData, ownerPhone: text })}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Street Address"
        value={formData.streetAddress}
        onChangeText={(text) => setFormData({ ...formData, streetAddress: text })}
      />
      <TextInput
        placeholder="City"
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
      />

      {/* Add document upload components here */}

      <Button title="Submit Registration" onPress={handleSubmit} />
    </View>
  );
};
```

---

## 🔍 Field Mapping Reference

### **Admin Dashboard ← → React Native App**

| Admin Display Column | React Native Field | Firebase Path | Required |
|---------------------|-------------------|---------------|----------|
| **Store Name** | `storeName` | `store_registrations/{userId}/storeName` | ✅ Yes |
| **Owner Name** | `name` | `store_registrations/{userId}/name` | ✅ Yes |
| **Owner Email** | `email` | `store_registrations/{userId}/email` | ✅ Yes |
| **Owner Phone** | `phone` | `store_registrations/{userId}/phone` | ✅ Yes |
| **Address** | `address` + `city` | `store_registrations/{userId}/address` + `/city` | ✅ Yes |
| **Status** | `status` | `store_registrations/{userId}/status` | ✅ Yes |
| **Created Date** | `createdAt` | `store_registrations/{userId}/createdAt` | ✅ Yes |

---

## 📝 Important Notes

### ✅ **Do's**
1. **Always use EXACT field names** listed above
2. **Set status to "pending"** for new registrations
3. **Use ISO 8601 format** for timestamps: `new Date().toISOString()`
4. **Combine address + city** for full address display
5. **Save under userId** from Firebase Authentication

### ❌ **Don'ts**
1. Don't use different field names (e.g., `ownerName` instead of `name`)
2. Don't skip required fields
3. Don't use local timestamps - use ISO 8601
4. Don't save to `stores` collection directly (admin approves first)

---

## 🔄 Approval Workflow

1. **React Native App** → Saves to `store_registrations/{userId}` with status "pending"
2. **Admin Dashboard** → Reviews registration in "Pending Approval" section
3. **Admin Approves** → Moves data to `stores/{userId}` with status "active"
4. **Store Active** → Store can now operate on the platform

---

## 🐛 Debugging

### Check if registration was saved correctly:

```javascript
import { ref, get } from 'firebase/database';

const checkRegistration = async (userId) => {
  const regRef = ref(database, `store_registrations/${userId}`);
  const snapshot = await get(regRef);

  if (snapshot.exists()) {
    console.log('Registration data:', snapshot.val());
  } else {
    console.log('Registration not found');
  }
};
```

### Common Issues:
- **"Unknown Store"** → Check `storeName` field exists and has a value
- **"Unknown Owner"** → Check `name` field (not `ownerName`)
- **Empty Address** → Check both `address` AND `city` fields exist
- **Not showing in admin** → Check `status` is "pending"

---

## 📚 Additional Resources

- Firebase Realtime Database Docs: https://firebase.google.com/docs/database
- Firebase Auth Docs: https://firebase.google.com/docs/auth
- TindaGo Admin Dashboard Repo: [Your repo URL]

---

## 🆘 Need Help?

If you encounter issues:
1. Check Firebase Console → Realtime Database to verify data structure
2. Check browser console in admin dashboard for detailed logs (look for 📦 and ✅ emojis)
3. Contact admin dashboard team with userId for debugging

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0