# TindaGo Admin Management - Complete Guide

## Overview

The admin dashboard now has **fully functional admin user management** with proper Firebase Authentication integration. You can easily add new admins through the web interface without any manual Firebase Console steps!

---

## 🎉 What's Fixed

### Problem Before
- "Add Admin" button only created database entry
- No Firebase Authentication account was created
- New admins couldn't log in
- Required manual Firebase Console work

### Solution Now
✅ **Server-side API route** creates complete admin account:
1. Firebase Authentication account (email/password)
2. Database entry in `admins/{uid}`
3. Role entry in `roles/{uid}` = "admin"
4. All permissions set correctly

---

## 🚀 Quick Start Guide

### Step 1: Create First Super Admin

Run the setup script to create your first admin account:

```bash
cd C:\CapsProj\tindago-admin
node create-admin-user.js
```

**Default Credentials Created**:
- Email: `admin@tindago.com`
- Password: `Admin123!`
- Role: `super_admin`
- Status: `active`

**What this script does**:
- Creates Firebase Auth account
- Adds entry to `admins/{uid}` collection
- Sets `roles/{uid}` = "admin"
- Adds to `users/{uid}` (legacy compatibility)

### Step 2: Start the Admin Dashboard

```bash
npm run dev
```

Go to: http://localhost:3000/auth/login

### Step 3: Add Additional Admins

1. Log in with super admin account
2. Navigate to **Admin Management** page (left sidebar)
3. Click **"Add Admin"** button (top right, green button)
4. Fill in the form:
   - **Name**: Full name of the admin
   - **Email**: Valid email address
   - **Password**: Min 6 characters
5. Click **"Create Admin"**
6. ✅ Done! The new admin can immediately log in

---

## 📋 Admin Management Features

### Admin Dashboard Pages

**Dashboard** (`/dashboard`)
- Store registrations overview
- Pending approvals
- Quick stats

**Store Management** (`/stores`)
- All registered stores
- Approve/reject store registrations
- View store details and documents

**Customer Management** (`/customers`)
- All customer accounts
- View customer profiles
- Manage customer status

**Admin Management** (`/admins`) ⭐ **NEW/FIXED**
- All admin accounts
- Add new admins
- Edit admin roles
- Activate/deactivate admins
- Delete admin accounts

**Transaction Management** (`/transactions`)
- Platform transactions
- Commission tracking
- Revenue reports

**Payout Management** (`/payouts`)
- Store owner payout requests
- Approve/reject payouts
- Payout history

**Analytics** (`/analytics`)
- Platform statistics
- Revenue analytics
- User growth metrics

---

## 🔐 Admin Roles & Permissions

### Role Types

**Super Admin** (`super_admin`)
- Full access to all features
- Can add/remove other admins
- Can manage all stores and users
- Access to financial data
- System configuration

**Admin** (`admin`)
- View registrations
- Approve/reject stores
- Manage customers
- Export data
- Limited financial access

**Moderator** (`moderator`)
- View-only access
- Can approve stores
- Cannot delete users
- No financial access

**Viewer** (`viewer`)
- Read-only access
- No approval powers
- Cannot modify data

### Permission System

Permissions are stored in `admins/{uid}/permissions` array:

```typescript
permissions: [
  'manageStores',      // Create/edit/delete stores
  'manageUsers',       // Create/edit/delete users
  'viewAnalytics',     // Access analytics page
  'manageOrders',      // Manage customer orders
  'approvePayouts',    // Approve store owner payouts
  'viewFinancials',    // See revenue and commissions
  'systemSettings'     // Change platform settings
]
```

**Super Admins** automatically get all permissions.

---

## 🛠️ Technical Implementation

### API Route: `/api/admin/users/create`

**File**: `src/app/api/admin/users/create/route.ts`

**Method**: POST

**Request Body**:
```json
{
  "email": "newadmin@tindago.com",
  "displayName": "John Doe",
  "password": "SecurePassword123!",
  "role": "admin"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "uid": "XyZ9AbC123...",
    "email": "newadmin@tindago.com",
    "displayName": "John Doe",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-11-03T..."
  }
}
```

**Response** (Error):
```json
{
  "error": "An account with this email already exists"
}
```

### What Happens Behind the Scenes

1. **Validation** - Checks email format, password length, required fields
2. **Firebase Auth** - Creates authentication account using Admin SDK
3. **Database Entry** - Adds complete admin profile to `admins/{uid}`
4. **Role Entry** - Sets `roles/{uid}` = "admin" for security rules
5. **Cleanup** - If any step fails, rolls back Auth account creation

### Database Structure

**`admins/{uid}`**:
```json
{
  "uid": "XyZ9AbC123...",
  "email": "admin@tindago.com",
  "displayName": "Admin User",
  "role": "super_admin",
  "status": "active",
  "createdAt": "2025-11-03T10:30:00.000Z",
  "lastLoginAt": "2025-11-03T15:45:00.000Z",
  "permissions": [
    "manageStores",
    "manageUsers",
    "viewAnalytics",
    "manageOrders"
  ]
}
```

**`roles/{uid}`**:
```
"admin"  // Simple string value
```

---

## 🧪 Testing Checklist

### Test Admin Creation Flow

- [ ] Click "Add Admin" button on Admin Management page
- [ ] Fill in name, email, password
- [ ] Submit form
- [ ] See success message with login credentials
- [ ] New admin appears in admin list
- [ ] Log out from current admin
- [ ] Log in with newly created admin credentials
- [ ] Verify new admin can access dashboard

### Test Error Handling

- [ ] Try creating admin with existing email → Should show error
- [ ] Try password less than 6 characters → Should show validation error
- [ ] Try invalid email format → Should show validation error
- [ ] Try empty fields → Should show required field errors

### Test Admin Management Actions

- [ ] View admin details (click on admin row)
- [ ] Activate/deactivate admin
- [ ] Change admin role (if super admin)
- [ ] Delete admin account
- [ ] Search/filter admins by status

---

## 🔧 Troubleshooting

### Issue: "Permission Denied" on Login

**Cause**: Missing `roles/{uid}` entry

**Solution**: Run the fix script:
```bash
cd C:\CapsProj\tindago-admin
node fix-admin-role.js
```

Or manually add in Firebase Console:
1. Go to Realtime Database
2. Navigate to `roles/` node
3. Add child with your admin UID as key, `"admin"` as value

### Issue: "Email Already in Use"

**Cause**: Admin account already exists in Firebase Auth

**Solution**:
1. Check Firebase Console → Authentication → Users
2. Delete the existing user if it was created incorrectly
3. Try creating admin again

### Issue: "Cannot Find Module adminFirebase"

**Cause**: Admin SDK not properly configured

**Solution**: Check `src/lib/adminFirebase.ts` exists and exports `getAdminDb()`

### Issue: New Admin Can't Log In

**Cause**: Incomplete account creation

**Check**:
1. Firebase Auth has the user (email/password)
2. `admins/{uid}` entry exists with status: "active"
3. `roles/{uid}` entry exists with value: "admin"

**Fix**: Re-run create admin flow or use `fix-admin-role.js`

---

## 📝 Best Practices

### Password Security

- Use strong passwords (min 8+ characters, mix of letters/numbers/symbols)
- Never share super admin credentials
- Rotate passwords regularly
- Enable 2FA in Firebase Console (if available)

### Admin Account Management

- Create separate admin accounts for each person (no sharing)
- Use appropriate roles (don't give super_admin to everyone)
- Deactivate admin accounts when staff leaves
- Regularly audit admin list
- Document who has access

### Audit Logging

Consider implementing audit logs for:
- Admin account creation
- Admin role changes
- Admin deletion
- Critical actions (store approvals, payout approvals)

### Security Recommendations

1. **Environment Variables**: Keep Firebase credentials in `.env` (never commit)
2. **API Keys**: Use separate Firebase projects for dev/staging/production
3. **Database Rules**: Review `database.rules.json` regularly
4. **Admin SDK**: Only use server-side (never expose service account JSON)
5. **HTTPS Only**: Always use HTTPS in production

---

## 🎯 Common Use Cases

### Adding Support Staff

```
Name: Maria Santos
Email: maria@tindago.com
Password: Generate random password
Role: admin (not super_admin)
```

### Adding View-Only Auditor

```
Name: John Auditor
Email: audit@tindago.com
Password: Generate random password
Role: viewer
```

### Creating Emergency Admin

If you lose access to super admin:

1. Run `create-admin-user.js` to create new super admin
2. Or manually add via Firebase Console (Auth + Database)
3. Use `fix-admin-role.js` to fix permissions

---

## 📊 Admin Statistics

The Admin Management page shows:

- **Total Admins**: All admin accounts
- **Active Admins**: Currently active (can log in)
- **Inactive Admins**: Deactivated accounts

Click on stat cards to filter the admin list.

---

## 🔄 Migration from Old System

If you have old admin accounts without proper Auth:

**Option 1**: Use the fixed "Add Admin" feature (recommended)
1. Click "Add Admin"
2. Enter details with new password
3. Old database entry will be replaced

**Option 2**: Run migration script
```bash
node scripts/migrate-admin-accounts.js
```
(Create this script if needed for bulk migration)

**Option 3**: Manual cleanup
1. Delete old `admins/{uid}` entries
2. Create fresh admin accounts through dashboard

---

## 📞 Support

### Development Issues

Check logs:
- Browser DevTools Console
- Next.js terminal output
- Firebase Console → Realtime Database logs

### Firebase Console Access

- Project: `tindagoproject`
- Region: Asia Southeast (Singapore)
- URL: https://console.firebase.google.com/

### Documentation

- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## ✅ Summary

### What You Can Do Now

✅ Create admin accounts instantly through web interface
✅ No more manual Firebase Console work
✅ Complete Auth + Database + Role setup automatically
✅ New admins can log in immediately
✅ Full CRUD operations on admin accounts
✅ Proper role and permission management

### Files Modified/Created

**Created**:
- `src/app/api/admin/users/create/route.ts` - Server-side admin creation API

**Modified**:
- `src/components/admin/UserCreateModal.tsx` - Updated to call new API

**Unchanged** (still works):
- `create-admin-user.js` - Script for first admin setup
- `fix-admin-role.js` - Script to fix broken admin roles
- `src/lib/userManagementService.ts` - Original service (still used for other operations)
- `src/components/admin/AdminManagement.tsx` - Admin management UI

### Next Steps

1. ✅ Run `create-admin-user.js` to create first super admin
2. ✅ Start dashboard with `npm run dev`
3. ✅ Log in and test "Add Admin" feature
4. ✅ Create additional admin accounts as needed
5. ✅ Set up role-based access control

---

**Guide Last Updated**: 2025-11-03
**Version**: 1.0 - Fully Functional Admin Management System
