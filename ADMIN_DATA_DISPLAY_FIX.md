# Admin Dashboard Data Display - Complete Fix

## Status
✅ **API Fixed** - Now reads nested structure  
✅ **Document Detection Fixed** - Now checks for Cloudinary `url` field  
🔍 **Debug Logging Added** - To identify data mapping issues

## What Was Fixed

### 1. API Route - Nested Structure Support
**File:** `src/app/api/admin/registrations/route.ts`

**Before:**
```typescript
storeName: registration.storeName || '',  // ❌ Only flat field
ownerName: registration.ownerName || '',
```

**After:**
```typescript
const personalInfo = registration.personalInfo || {
  name: registration.ownerName || registration.name || '',
  email: registration.email || '',
  mobile: registration.phone || ''
};

const businessInfo = registration.businessInfo || {
  storeName: registration.storeName || '',
  address: registration.address || '',
  city: registration.city || ''
};

return {
  // Nested structure
  personalInfo,
  businessInfo,
  // Flat fields
  storeName: businessInfo.storeName,  // ✅ Reads from nested
  ownerName: personalInfo.name,       // ✅ Reads from nested
  email: personalInfo.email,
  address: businessInfo.address
};
```

### 2. Document Detection - Cloudinary URL Support
**File:** `tindago-admin/src/components/admin/PendingApprovalDetail.tsx`

**Before:**
```typescript
if (typeof docData === 'object' && 'uri' in docData) {
  return !!(docData.uri && docData.uri.trim().length > 0);  // ❌ Only base64
}
```

**After:**
```typescript
if (typeof docData === 'object') {
  // Check for Cloudinary URL (new)
  if ('url' in docData && docData.url) {
    return docData.url.trim().length > 0;  // ✅ Cloudinary
  }
  // Check for base64 URI (legacy)
  if ('uri' in docData && docData.uri) {
    return docData.uri.trim().length > 0;  // ✅ Legacy
  }
}
```

### 3. Debug Logging Added
The API now logs the first registration to help debug:

```
📋 [API Sample Registration Data]: {
  userId: "abc123",
  "Raw Firebase": {
    hasPersonalInfo: true/false,
    hasBusinessInfo: true/false,
    rawStoreName: "...",
    rawOwnerName: "...",
    nestedStoreName: "...",
    nestedOwnerName: "..."
  },
  "Mapped Output": {
    storeName: "Villa Abrille Store",
    ownerName: "Kenz Isuga",
    email: "isugakenji576@gmail.com",
    address: "Villa Abrille Street, Poblacion District, Davao City"
  }
}
```

## Expected Firebase Structure

### From Mobile App (store_registrations/{userId})
```json
{
  "personalInfo": {
    "name": "Kenz Isuga",
    "email": "isugakenji576@gmail.com",
    "mobile": "09944528509"
  },
  "businessInfo": {
    "storeName": "Villa Abrille Store",
    "description": "A local sari-sari store",
    "address": "Villa Abrille Street, Poblacion District",
    "city": "Davao City",
    "zipCode": "8000",
    "businessType": "Sari-Sari Store",
    "logo": "https://res.cloudinary.com/dkkfzpmtt/...",
    "coverImage": "https://res.cloudinary.com/dkkfzpmtt/..."
  },
  "documents": {
    "businessPermit": {
      "name": "permit.pdf",
      "url": "https://res.cloudinary.com/dkkfzpmtt/...",
      "type": "application/pdf",
      "uploaded": true
    },
    "validId": {
      "name": "valid-id.jpg",
      "url": "https://res.cloudinary.com/dkkfzpmtt/...",
      "type": "image/jpeg",
      "uploaded": true
    }
  },
  "status": "pending",
  "createdAt": "2025-11-17T00:00:00.000Z"
}
```

## How to Debug

### 1. Check Vercel Logs
Go to tindago-admin Vercel deployment → Functions → `/api/admin/registrations` → View logs

Look for:
```
📋 [API Sample Registration Data]: {
  "Mapped Output": {
    storeName: "...",    // Should show store name
    ownerName: "...",    // Should show owner name
    email: "...",
    address: "..."       // Should show address
  }
}
```

### 2. Check Browser Console
Open browser console (F12) when visiting admin dashboard → Stores → Pending

Look for:
```
🔍 PENDING DEBUG: Fetching pending stores...
🔍 Pending registrations from store_registrations collection: 1
✅ Total pending stores: 1
```

### 3. Check Data in Table
The table should display:
- **Store Column**: Store name + address
- **Owner Column**: Owner name + email
- **Status Column**: "Pending" badge
- **Joined Column**: Date

## If Data Still Not Showing

### Scenario 1: Store Name Shows Address
**Problem:** `storeName` field contains address instead of store name

**Solution:** Check Firebase `store_registrations/{userId}/businessInfo/storeName`

### Scenario 2: All Fields Blank
**Problem:** Data not being fetched from API

**Check:**
1. API logs show "✅ Returning X store registrations"
2. Browser console shows pending stores count
3. Check if `personalInfo` and `businessInfo` exist in Firebase

### Scenario 3: Documents Not Showing
**Problem:** Cloudinary URLs not detected

**Check:**
1. Firebase has `documents.businessPermit.url` (not `.uri`)
2. URL starts with `https://res.cloudinary.com/`
3. Browser console shows document validation logs

## Testing Checklist

### Mobile App
- [ ] Register new store with all details
- [ ] Upload logo to Cloudinary
- [ ] Upload cover image to Cloudinary
- [ ] Set location on map
- [ ] Upload business permit (PDF or image)
- [ ] Upload valid ID (image)
- [ ] Complete registration

### Admin Dashboard
- [ ] Go to Store Management
- [ ] See "Pending Approval (1)" card
- [ ] Click "View All" on Pending
- [ ] **Verify Table Shows:**
  - [ ] Store name in "Store" column
  - [ ] Owner name in "Owner" column
  - [ ] Owner email below owner name
  - [ ] Address below store name
  - [ ] "Pending" status badge
  - [ ] Join date
- [ ] Click on pending store row
- [ ] **Verify Detail Page Shows:**
  - [ ] Business Owner: Name, Email, Phone
  - [ ] Business Details: Address, Business Type, Permit Type
  - [ ] Business Description
  - [ ] Submitted Documents: Business Permit, Valid ID (with "View" links)
- [ ] Click "View" on each document
- [ ] **Verify:** Document opens in new tab from Cloudinary

## Files Modified

1. **API Route** - `tindago-admin/src/app/api/admin/registrations/route.ts`
   - Added nested structure support
   - Added debug logging
   - Returns both nested and flat fields

2. **Document Detection** - `tindago-admin/src/components/admin/PendingApprovalDetail.tsx`
   - Fixed `hasValidUri()` to check for `url` field (Cloudinary)
   - Updated logging to show both `url` and `uri` fields

## Next Steps

1. **Deploy to Vercel** - Push changes to trigger redeployment
2. **Test with Real Data** - Register a store from mobile app
3. **Check Vercel Logs** - Verify API is returning correct data structure
4. **Verify Table Display** - All fields should show correctly
5. **Test Documents** - Click "View" to open Cloudinary URLs

## Support

If data still not showing after these fixes:
1. Share Vercel API logs (first registration sample)
2. Share browser console logs (pending data fetch)
3. Share Firebase screenshot of `store_registrations/{userId}` structure
4. Share screenshot of admin dashboard table

This will help identify exact issue in data flow.
