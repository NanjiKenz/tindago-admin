# Debug Logging - Table Data Issue

## Problem
Detail page shows all data correctly, but tables (Store Management and Pending Approval list) show blank Store Name and Owner Name columns.

## Debug Logging Added

### 1. API Route Logging
**File:** `src/app/api/admin/registrations/route.ts`

Logs first registration data:
```
📋 [API Sample Registration Data]: {
  "Raw Firebase": {
    hasPersonalInfo: true/false,
    hasBusinessInfo: true/false,
    rawStoreName: "...",
    nestedStoreName: "...",
    nestedOwnerName: "..."
  },
  "Mapped Output": {
    storeName: "Villa Abrille Store",
    ownerName: "Kenz Isuga",
    email: "isugakenji576@gmail.com",
    address: "..."
  }
}
```

### 2. Component API Response Logging
**File:** `src/components/admin/StoreManagement.tsx` (Line 116)

Logs what API returns to component:
```
📦 [API RAW DATA]: {
  userId: "abc123",
  hasPersonalInfo: true,
  hasBusinessInfo: true,
  flatStoreName: "...",        // From API flat field
  flatOwnerName: "...",
  nestedStoreName: "...",      // From API nested field
  nestedOwnerName: "...",
  fullData: {...}              // Complete object
}
```

### 3. Table Data Logging
**File:** `src/components/admin/StoreManagement.tsx` (Line 192)

Logs what table will display:
```
📋 [TABLE DATA SAMPLE]: {
  storeId: "abc123",
  storeName: "Villa Abrille Store",  // Should NOT be blank
  ownerName: "Kenz Isuga",           // Should NOT be blank
  ownerEmail: "isugakenji576@gmail.com",
  address: "Villa Abrille Street...",
  status: "pending"
}
```

## How to Debug

### Step 1: Deploy Changes
```bash
cd C:\CapsProj\tindago-admin
git add .
git commit -m "Add debug logging for table data"
git push
```

### Step 2: Open Admin Dashboard
1. Go to `tindago-admin.vercel.app/stores`
2. Click "View All" on "Pending Approval (1)"
3. Open browser console (F12)

### Step 3: Check Console Logs

**Expected Output:**
```
🔍 PENDING DEBUG: Fetching pending stores...
🔍 Pending stores from stores collection: 0
🔍 Pending registrations from store_registrations collection: 1

📦 [API RAW DATA]: {
  userId: "...",
  hasPersonalInfo: true,
  hasBusinessInfo: true,
  flatStoreName: "Villa Abrille Store",
  flatOwnerName: "Kenz Isuga",
  nestedStoreName: "Villa Abrille Store",
  nestedOwnerName: "Kenz Isuga"
}

📋 [TABLE DATA SAMPLE]: {
  storeId: "...",
  storeName: "Villa Abrille Store",    // ✅ Should show this
  ownerName: "Kenz Isuga",             // ✅ Should show this
  ownerEmail: "isugakenji576@gmail.com",
  address: "Villa Abrille Street, Poblacion District, Davao City"
}

✅ Total pending stores: 1
```

### Step 4: Analyze Results

#### Scenario A: API Returns Empty Fields
```
📦 [API RAW DATA]: {
  flatStoreName: "",           // ❌ Empty
  flatOwnerName: "",
  nestedStoreName: undefined,  // ❌ Missing
  nestedOwnerName: undefined
}
```
**Problem:** Firebase doesn't have the nested structure  
**Solution:** Check Firebase `store_registrations/{userId}` for `personalInfo` and `businessInfo`

#### Scenario B: API Returns Data, But Table Doesn't
```
📦 [API RAW DATA]: {
  flatStoreName: "Villa Abrille Store",  // ✅ Good
  flatOwnerName: "Kenz Isuga"            // ✅ Good
}

📋 [TABLE DATA SAMPLE]: {
  storeName: "",    // ❌ Blank after mapping!
  ownerName: ""
}
```
**Problem:** Data mapping logic is broken  
**Solution:** Check lines 123-135 in StoreManagement.tsx

#### Scenario C: Table Data Good, But Not Displaying
```
📋 [TABLE DATA SAMPLE]: {
  storeName: "Villa Abrille Store",  // ✅ Data is there
  ownerName: "Kenz Isuga"            // ✅ Data is there
}
```
But table still shows blank...

**Problem:** UI rendering issue  
**Solution:** Check lines 1429, 1456 in StoreManagement.tsx

## Quick Fixes

### If Firebase Missing Nested Structure
Your mobile app might not be saving data correctly. Check:
```javascript
// In StoreRegistrationService.ts - should save:
{
  personalInfo: {
    name: "...",
    email: "...",
    mobile: "..."
  },
  businessInfo: {
    storeName: "...",
    address: "...",
    city: "..."
  }
}
```

### If API Not Reading Nested Fields
Check `src/app/api/admin/registrations/route.ts` lines 24-39:
```typescript
const personalInfo = registration.personalInfo || {
  name: registration.ownerName || registration.name || '',
  // ...
};

const businessInfo = registration.businessInfo || {
  storeName: registration.storeName || '',
  // ...
};
```

### If Mapping Not Working
Check `src/components/admin/StoreManagement.tsx` lines 123-135:
```typescript
const storeName = registration.businessInfo?.storeName ||
                 registration.storeName ||
                 'Unknown Store';
```

## Next Steps

1. **Share Console Output** - Copy all 3 log messages (API, RAW DATA, TABLE DATA)
2. **Share Firebase Structure** - Screenshot of `store_registrations/{userId}`
3. **Share Table Screenshot** - Show what's actually displaying

This will pinpoint exactly where the data is being lost.
