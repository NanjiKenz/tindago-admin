# TindaGo Admin - Firebase Field Mapping Reference

## Quick Reference: React Native App → Admin Dashboard

This document shows **EXACTLY** how fields from the React Native app registration appear in the Admin Dashboard.

---

## 📊 Field Mapping Table

| **Admin Display** | **React Native Field** | **Firebase Path** | **Data Type** | **Example Value** |
|-------------------|------------------------|-------------------|---------------|-------------------|
| **Store Column → Name** | `storeName` | `store_registrations/{userId}/storeName` | String | "RK Store" |
| **Store Column → Address** | `address` + `city` | `store_registrations/{userId}/address` + `/city` | String | "123 Main St, Davao City" |
| **Owner Column → Name** | `name` | `store_registrations/{userId}/name` | String | "John Doe" |
| **Owner Column → Email** | `email` | `store_registrations/{userId}/email` | String | "john@example.com" |
| **Owner Column → Phone** | `phone` | `store_registrations/{userId}/phone` | String | "+63 912 345 6789" |
| **Status Badge** | `status` | `store_registrations/{userId}/status` | String | "pending" |
| **Joined Date** | `createdAt` | `store_registrations/{userId}/createdAt` | ISO 8601 | "2025-01-15T10:30:00Z" |

---

## 🔍 Detailed Field Extraction Logic

### **1. Store Name**
```javascript
// Priority Order (First available wins):
storeName = registration.storeName       // ✅ "RK Store"
         || registration.businessName    // Fallback
         || registration.name            // Last resort
         || 'Unknown Store'              // Error state
```

**Admin Display:** Store Management → Store Column → "RK Store"

---

### **2. Owner Name**
```javascript
// Priority Order (First available wins):
ownerName = registration.name            // ✅ "John Doe" (React Native field)
         || registration.personalInfo?.name  // Legacy field
         || registration.ownerName       // Fallback
         || registration.owner           // Fallback
         || registration.displayName     // Last resort
         || 'Unknown Owner'              // Error state
```

**Admin Display:** Store Management → Owner Column → "John Doe"

---

### **3. Address (Combined)**
```javascript
// Primary: Combine address + city
if (registration.address && registration.city) {
  address = `${registration.address}, ${registration.city}`;
  // ✅ "123 Main St, Davao City"
}
// Fallback: Just address
else if (registration.address) {
  address = registration.address;
}
// Fallback: Just city
else if (registration.city) {
  address = registration.city;
}
// Fallback: Alternative fields
else {
  address = registration.storeAddress || 'Address not provided';
}
```

**Admin Display:** Store Management → Store Column (subtitle) → "123 Main St, Davao City"

---

### **4. Email**
```javascript
// Priority Order (First available wins):
email = registration.email               // ✅ "john@example.com"
     || registration.personalInfo?.email // Legacy field
     || registration.ownerEmail          // Fallback
     || 'Email Not Available'            // Error state
```

**Admin Display:** Store Management → Owner Column (subtitle) → "john@example.com"

---

### **5. Phone**
```javascript
// Priority Order (First available wins):
phone = registration.phone               // ✅ "+63 912 345 6789"
     || registration.personalInfo?.mobile // Legacy field
     || registration.ownerPhone          // Fallback
     || ''                               // Optional field
```

**Admin Display:** Pending Approval Detail → Business Owner → Phone

---

## 🎯 React Native App Requirements

### **Minimum Required Fields:**
```javascript
{
  storeName: "RK Store",           // ✅ REQUIRED
  name: "John Doe",                // ✅ REQUIRED
  email: "john@example.com",       // ✅ REQUIRED
  phone: "+63 912 345 6789",       // ✅ REQUIRED
  address: "123 Main Street",      // ✅ REQUIRED
  city: "Davao City",              // ✅ REQUIRED
  status: "pending",               // ✅ REQUIRED
  userId: "[FIREBASE_AUTH_UID]",   // ✅ REQUIRED
  createdAt: "2025-01-15T10:30:00Z" // ✅ REQUIRED
}
```

### **Optional But Recommended:**
```javascript
{
  documents: {
    businessPermit: "https://storage.url/permit.pdf",
    validId: "https://storage.url/id.jpg",
    storePhoto: "https://storage.url/photo.jpg"
  },
  businessType: "Sari-Sari Store",
  permitType: "Business Permit"
}
```

---

## ❌ Common Mistakes & Fixes

### **Problem:** "Unknown Store" appears in admin
**Cause:** Missing `storeName` field
**Fix:** Ensure React Native app saves to `storeName` (not `businessName` or `name`)
```javascript
// ❌ WRONG
registration.businessName = "RK Store";

// ✅ CORRECT
registration.storeName = "RK Store";
```

---

### **Problem:** "Unknown Owner" appears in admin
**Cause:** Missing `name` field
**Fix:** Ensure React Native app saves to `name` (not `ownerName`)
```javascript
// ❌ WRONG
registration.ownerName = "John Doe";

// ✅ CORRECT
registration.name = "John Doe";
```

---

### **Problem:** Empty address in admin
**Cause:** Missing `address` or `city` fields
**Fix:** Ensure BOTH fields are saved
```javascript
// ❌ WRONG - Only one field
registration.address = "123 Main St";
// Missing city!

// ✅ CORRECT - Both fields
registration.address = "123 Main St";
registration.city = "Davao City";
// Admin displays: "123 Main St, Davao City"
```

---

### **Problem:** Registration not showing in admin
**Cause:** Wrong status value
**Fix:** Always use "pending" for new registrations
```javascript
// ❌ WRONG
registration.status = "submitted";
registration.status = "awaiting_review";

// ✅ CORRECT
registration.status = "pending";
```

---

## 🔎 Debugging Checklist

Open browser console (F12) and look for these logs:

### **1. Check Store Data (Existing Stores)**
```
📦 Raw Firebase Data for Store [storeId]:
  🏪 Store Name Fields:
    storeName: "RK Store" ✅
  👤 Owner Name Fields:
    name: "John Doe" ✅
  📍 Address Fields:
    address: "123 Main St" ✅
    city: "Davao City" ✅
    COMBINED: "123 Main St, Davao City" ✅
```

### **2. Check Pending Registrations**
```
📋 ===== PENDING REGISTRATIONS FROM FIREBASE =====
🔍 Registration #1 (User ID: SHqmYVQFLxOInQfaj4NgIp6lz003):
  🏪 Store Name Fields:
    storeName: "RK Store" ✅
  👤 Owner Name Fields:
    name: "John Doe" ✅
```

### **3. Check Extracted Data**
```
✅ Extracted store data for [storeId]:
  storeName: "RK Store"
  ownerName: "John Doe"
  ownerEmail: "john@example.com"
  address: "123 Main St, Davao City"
  status: "pending"
```

---

## 📞 Support

If you see **❌ MISSING** in console logs:
1. Check Firebase Realtime Database console
2. Verify the field exists in `store_registrations/{userId}`
3. Check field name matches EXACTLY (case-sensitive)
4. Contact React Native team to update registration code

---

## 📝 Version History

- **v1.0.0** (2025-01-15): Initial field mapping documentation
- Compatible with TindaGo Admin v1.0.0
- Compatible with React Native App v1.0.0+

---

**See Also:**
- `REACT_NATIVE_FIREBASE_INTEGRATION.md` - Complete integration guide for React Native developers
- `firebase-database-structure.md` - Full Firebase database schema