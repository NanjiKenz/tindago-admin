# TindaGo Admin Authentication Setup

This guide explains how to set up admin authentication for the TindaGo Admin system.

## System Overview

The TindaGo Admin system uses Firebase Authentication combined with a custom admin role verification system. Users must be both:
1. Authenticated in Firebase Auth
2. Listed in the Firebase Realtime Database `admins` collection with appropriate role

## Admin User Setup

### Method 1: Manual Setup via Firebase Console

1. **Create user in Firebase Auth Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/) > Authentication > Users
   - Click "Add user"
   - Email: `admin@tindago.com`
   - Password: `admin123`
   - Copy the generated UID

2. **Add admin entry to Realtime Database:**
   - Go to Firebase Console > Realtime Database
   - Navigate to root and create `admins` node if it doesn't exist
   - Add entry under `admins/{UID}`:
   ```json
   {
     "email": "admin@tindago.com",
     "displayName": "TindaGo Administrator",
     "role": "super_admin",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "lastLogin": null,
     "isActive": true
   }
   ```

3. **Test the login:**
   - Navigate to http://localhost:3004/auth/login
   - Email: `admin@tindago.com`
   - Password: `admin123`

### Method 2: Programmatic Setup

Use the helper utilities in `src/lib/adminSetup.ts`:

```typescript
import { createAdminUser, SAMPLE_ADMIN_USERS } from '@/lib/adminSetup';

// After creating user in Firebase Auth, call:
await createAdminUser({
  uid: 'firebase-auth-uid',
  email: 'admin@tindago.com',
  displayName: 'TindaGo Administrator',
  role: 'super_admin'
});
```

## Authentication Flow

1. **First Visit:** User is redirected to `/auth/login`
2. **Login:** User enters credentials, system verifies both Firebase Auth and admin role
3. **Dashboard Access:** Authenticated admin users can access the dashboard
4. **Session Management:** Authentication state is managed via React Context
5. **Logout:** Clears Firebase session and redirects to login

## Admin Roles

- **admin:** Can view and manage store registrations
- **super_admin:** Full access including admin management features

## Security Features

- **Role-based access control** via Firebase Realtime Database
- **Protected routes** using React context and HOCs
- **Session management** with Firebase Auth state persistence
- **Error handling** with user-friendly messages
- **Password reset** functionality

## Development Testing

For development and testing, you can use these sample credentials:

**Super Admin:**
- Email: `admin@tindago.com`
- Password: `admin123`
- Role: `super_admin`

**Regular Admin:**
- Email: `manager@tindago.com`
- Password: `manager123`
- Role: `admin`

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── components/auth/
│   ├── AuthLayout.tsx           # Login page layout
│   ├── LoginForm.tsx            # Login form component
│   ├── ProtectedRoute.tsx       # Route protection wrapper
│   └── index.ts                 # Barrel exports
├── lib/
│   ├── authService.ts           # Authentication business logic
│   ├── adminSetup.ts            # Admin user setup utilities
│   └── firebase.js              # Firebase configuration
├── app/
│   ├── auth/login/page.tsx      # Login page
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── page.tsx                 # Protected dashboard
└── middleware.ts                # Next.js middleware for routing
```

## Troubleshooting

### "Access denied. Admin privileges required."
- Check that the user exists in Firebase Auth
- Verify the user has an entry in `admins/{uid}` in Realtime Database
- Ensure the `role` field is set to `admin` or `super_admin`

### "Authentication failed. Please try again."
- Verify Firebase configuration in `src/lib/firebase.js`
- Check that Firebase Auth is enabled in Firebase Console
- Ensure the email/password is correct

### Page redirects to login repeatedly
- Check browser console for JavaScript errors
- Verify the AuthContext is properly wrapped around the app
- Ensure Firebase Auth is properly initialized

## Next Steps

1. Set up your first admin user using Method 1 above
2. Test the login flow at http://localhost:3004/auth/login
3. Access the dashboard to verify role-based permissions
4. Configure additional admin users as needed