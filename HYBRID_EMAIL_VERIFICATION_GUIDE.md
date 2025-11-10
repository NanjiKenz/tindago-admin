# Hybrid Email Verification Implementation Guide

## 📋 Overview

This guide provides step-by-step instructions to implement hybrid email verification for TindaGo Admin Dashboard. The hybrid approach allows admins to log in immediately after creation while restricting critical actions until email verification.

**Status**: Not yet implemented (prepared for future implementation)

---

## 🎯 What This Implements

### User Flow:
1. Super admin creates new admin via "Add Admin" button
2. System sends verification email automatically
3. New admin can log in immediately (no blocking)
4. Dashboard shows verification banner with reminder
5. Critical actions (approve stores, delete users, etc.) are disabled
6. After verifying email, all features unlock

### Benefits:
- ✅ No login friction - admins start working immediately
- ✅ Security maintained - critical actions require verification
- ✅ Better UX - gentle nudge instead of hard block
- ✅ Flexible - admins can verify when convenient

---

## 🛠️ Implementation Steps

### Step 1: Update Admin Creation API

**File**: `src/app/api/admin/create/route.ts`

**Add after line 57 (after getting userId from Firebase Auth):**

```typescript
// Send verification email
try {
  const verifyEmailUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;

  const verifyResponse = await fetch(verifyEmailUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'VERIFY_EMAIL',
      idToken: authData.idToken // From the signUp response
    })
  });

  if (verifyResponse.ok) {
    console.log(`📧 Verification email sent to: ${email}`);
  } else {
    console.warn('⚠️ Failed to send verification email, but account created');
  }
} catch (emailError) {
  console.error('Email verification send error:', emailError);
  // Don't fail admin creation if email sending fails
}
```

**Add to adminData object (around line 73):**

```typescript
const adminData = {
  email,
  displayName: displayName || '',
  role: role || 'admin',
  status: status || 'active',
  createdAt: now,
  permissions: permissions || [],
  phone: phone || '',
  department: department || '',
  notes: notes || '',
  dateOfBirth: dateOfBirth || '',
  country: country || '',
  city: city || '',
  postalCode: postalCode || '',
  lastLogin: null,
  lastLoginAt: null,
  statusUpdatedAt: now,
  emailVerified: false, // ADD THIS LINE
  emailVerificationSentAt: now // ADD THIS LINE
};
```

---

### Step 2: Update Login to Check Verification Status

**File**: `src/app/auth/login/page.tsx`

**Replace the login success handler (around line 34-54) with:**

```typescript
const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

// Update last login timestamp in admin record
const user = userCredential.user;
if (user) {
  try {
    const { ref, update } = await import('firebase/database');
    const { database } = await import('@/lib/firebase');
    const adminRef = ref(database, `admins/${user.uid}`);

    // Update lastLoginAt and sync emailVerified status from Firebase Auth
    await update(adminRef, {
      lastLoginAt: new Date().toISOString(),
      status: 'active',
      emailVerified: user.emailVerified // Sync from Firebase Auth
    });

    // Store verification status in sessionStorage for quick access
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('emailVerified', user.emailVerified.toString());
      sessionStorage.setItem('userEmail', user.email || '');
    }
  } catch (updateError) {
    console.error('Error updating last login:', updateError);
    // Don't block login if update fails
  }
}

// Redirect to Dashboard page
router.push('/dashboard');
```

---

### Step 3: Create Verification Banner Component

**File**: `src/components/admin/EmailVerificationBanner.tsx` (NEW FILE)

```typescript
/**
 * Email Verification Banner Component
 *
 * Shows a persistent banner at the top of the dashboard when admin email is not verified.
 * Provides options to resend verification email and refresh verification status.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { sendEmailVerification, reload } from 'firebase/auth';

export const EmailVerificationBanner: React.FC = () => {
  const [isVerified, setIsVerified] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check verification status from session storage
    const verified = sessionStorage.getItem('emailVerified') === 'true';
    const email = sessionStorage.getItem('userEmail') || '';

    setIsVerified(verified);
    setUserEmail(email);
  }, []);

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;

    setSending(true);
    setMessage('');

    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('✅ Verification email sent! Check your inbox.');

      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      console.error('Error sending verification email:', error);

      if (error.code === 'auth/too-many-requests') {
        setMessage('⚠️ Too many requests. Please wait a few minutes.');
      } else {
        setMessage('❌ Failed to send email. Try again later.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!auth.currentUser) return;

    setRefreshing(true);
    setMessage('');

    try {
      // Reload user to get fresh emailVerified status
      await reload(auth.currentUser);

      const verified = auth.currentUser.emailVerified;

      if (verified) {
        // Update session storage
        sessionStorage.setItem('emailVerified', 'true');
        setIsVerified(true);
        setMessage('🎉 Email verified successfully!');

        // Update database
        const { ref, update } = await import('firebase/database');
        const { database } = await import('@/lib/firebase');
        const adminRef = ref(database, `admins/${auth.currentUser.uid}`);
        await update(adminRef, {
          emailVerified: true,
          emailVerifiedAt: new Date().toISOString()
        });

        // Reload page after 2 seconds to update UI
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage('⚠️ Email not yet verified. Check your inbox and click the link.');
      }
    } catch (error) {
      console.error('Error refreshing verification status:', error);
      setMessage('❌ Failed to check status. Try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDismiss = () => {
    // Temporarily hide banner (will reappear on page reload if still unverified)
    setIsVerified(true);
  };

  // Don't show banner if verified
  if (isVerified) return null;

  return (
    <div
      style={{
        backgroundColor: '#FEF3C7',
        borderBottom: '2px solid #F59E0B',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {/* Left side - Warning message */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <div>
          <p
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 600,
              fontSize: '14px',
              color: '#92400E',
              margin: 0
            }}
          >
            Verify your email ({userEmail}) to unlock all features
          </p>
          {message && (
            <p
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '13px',
                color: '#92400E',
                margin: '4px 0 0 0'
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handleResendEmail}
          disabled={sending}
          style={{
            padding: '8px 16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #F59E0B',
            borderRadius: '8px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 600,
            fontSize: '13px',
            color: '#92400E',
            cursor: sending ? 'not-allowed' : 'pointer',
            opacity: sending ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {sending ? 'Sending...' : 'Resend Email'}
        </button>

        <button
          onClick={handleRefreshStatus}
          disabled={refreshing}
          style={{
            padding: '8px 16px',
            backgroundColor: '#F59E0B',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 600,
            fontSize: '13px',
            color: '#FFFFFF',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {refreshing ? 'Checking...' : "I've Verified - Refresh"}
        </button>

        <button
          onClick={handleDismiss}
          style={{
            padding: '4px 8px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#92400E',
            opacity: 0.6,
            transition: 'opacity 0.2s ease'
          }}
          title="Dismiss (will reappear on refresh)"
        >
          ×
        </button>
      </div>
    </div>
  );
};
```

---

### Step 4: Add Banner to Dashboard Layout

**File**: `src/app/dashboard/layout.tsx` or create a wrapper component

Add the banner to the top of your dashboard layout:

```typescript
import { EmailVerificationBanner } from '@/components/admin/EmailVerificationBanner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EmailVerificationBanner />
      {children}
    </>
  );
}
```

---

### Step 5: Create Permission Guard Utility

**File**: `src/lib/verificationGuard.ts` (NEW FILE)

```typescript
/**
 * Verification Guard Utility
 *
 * Checks if current user has verified email for critical actions
 */

export function isEmailVerified(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('emailVerified') === 'true';
}

export function requireVerification(action: string): boolean {
  const verified = isEmailVerified();

  if (!verified) {
    alert(`⚠️ Email verification required to ${action}.\n\nPlease verify your email using the banner at the top of the page.`);
  }

  return verified;
}

// List of actions that require verification
export const VERIFICATION_REQUIRED_ACTIONS = [
  'approve_store',
  'reject_store',
  'suspend_store',
  'deactivate_user',
  'delete_user',
  'process_payout',
  'modify_critical_settings',
  'delete_record',
  'ban_user'
];
```

---

### Step 6: Add Guards to Critical Actions

**Example for Store Approval Button** in `StoreManagement.tsx`:

```typescript
import { requireVerification, isEmailVerified } from '@/lib/verificationGuard';

// In your component
const verified = isEmailVerified();

// Approve button
<button
  onClick={() => {
    if (!requireVerification('approve this store')) return;
    handleApprove(store);
  }}
  disabled={!verified}
  title={verified ? 'Approve store' : 'Email verification required'}
  style={{
    backgroundColor: verified ? '#3BB77E' : '#E5E7EB',
    cursor: verified ? 'pointer' : 'not-allowed',
    opacity: verified ? 1 : 0.6
  }}
>
  {verified ? '✓ Approve' : '🔒 Approve'}
</button>
```

**Apply similar pattern to:**
- `AdminManagement.tsx` - Deactivate/Delete buttons
- `UserManagement.tsx` - Deactivate/Ban buttons
- `CustomerManagement.tsx` - Deactivate/Ban buttons
- `StoreManagement.tsx` - Approve/Reject/Suspend buttons
- Any other critical action buttons

---

### Step 7: Add Verification Status Column (Optional)

**In AdminManagement table**, add a verification status column:

```typescript
// In table header
<th>Email Verified</th>

// In table row
<td>
  {admin.emailVerified ? (
    <span style={{ color: '#10B981', fontWeight: 600 }}>✓ Verified</span>
  ) : (
    <span style={{ color: '#F59E0B', fontWeight: 600 }}>⚠️ Pending</span>
  )}
</td>
```

---

## 🧪 Testing Checklist

### Test Plan:

1. **Create New Admin**
   - [ ] Verification email is sent
   - [ ] Admin account created in both `admins` and `users` collections
   - [ ] `emailVerified: false` in database

2. **Login Flow**
   - [ ] New admin can login with email/password
   - [ ] No blocking or error
   - [ ] Redirects to dashboard successfully

3. **Banner Display**
   - [ ] Yellow verification banner appears at top
   - [ ] Shows correct email address
   - [ ] "Resend Email" button works
   - [ ] "I've Verified" button works

4. **Permission Gating**
   - [ ] Critical action buttons are disabled (grayed out)
   - [ ] Clicking shows alert: "Email verification required"
   - [ ] View/Read actions still work
   - [ ] Non-critical features accessible

5. **Email Verification**
   - [ ] Click link in verification email
   - [ ] Click "I've Verified - Refresh" in dashboard
   - [ ] Banner disappears
   - [ ] All buttons become enabled
   - [ ] `emailVerified: true` in database

6. **Edge Cases**
   - [ ] Resend email works (with rate limiting)
   - [ ] Banner persists across page navigation
   - [ ] Verification status syncs on login
   - [ ] Dismiss button temporarily hides banner

---

## 📁 Files to Create/Modify

### New Files:
- `src/components/admin/EmailVerificationBanner.tsx`
- `src/lib/verificationGuard.ts`

### Modified Files:
- `src/app/api/admin/create/route.ts` - Send verification email
- `src/app/auth/login/page.tsx` - Check and sync verification status
- `src/app/dashboard/layout.tsx` - Add banner
- `src/components/admin/AdminManagement.tsx` - Add guards
- `src/components/admin/UserManagement.tsx` - Add guards
- `src/components/admin/CustomerManagement.tsx` - Add guards
- `src/components/admin/StoreManagement.tsx` - Add guards

---

## 🚀 Quick Implementation Command

When ready to implement, search this file in Claude Code and say:

> "Implement the hybrid email verification system following the HYBRID_EMAIL_VERIFICATION_GUIDE.md"

---

## 🔧 Configuration Options

### Customize which actions require verification:

Edit `VERIFICATION_REQUIRED_ACTIONS` in `verificationGuard.ts`:

```typescript
// Strict mode - most actions locked
export const VERIFICATION_REQUIRED_ACTIONS = [
  'approve_store', 'reject_store', 'suspend_store',
  'deactivate_user', 'delete_user', 'ban_user',
  'process_payout', 'modify_settings', 'delete_record',
  'create_admin', 'update_permissions'
];

// Lenient mode - only critical actions locked
export const VERIFICATION_REQUIRED_ACTIONS = [
  'delete_user', 'process_payout', 'delete_record'
];
```

---

## 📊 Database Schema Changes

### admins/{uid}:
```json
{
  "emailVerified": false,          // NEW FIELD
  "emailVerificationSentAt": "...", // NEW FIELD
  "emailVerifiedAt": null          // NEW FIELD (set when verified)
}
```

### No migration needed - fields are added on new admin creation

---

## 🎯 Success Criteria

Implementation is successful when:

1. ✅ New admins receive verification email
2. ✅ New admins can login immediately
3. ✅ Banner shows for unverified admins
4. ✅ Critical actions are disabled until verified
5. ✅ Verification process works smoothly
6. ✅ No errors or blocking behavior
7. ✅ Existing admins are not affected

---

## 📝 Notes

- **Backward Compatible**: Existing admins without `emailVerified` field are treated as verified
- **No Breaking Changes**: Current functionality remains unchanged
- **Gradual Rollout**: Can enable feature flag per admin role
- **Future-Proof**: Easy to add more granular permissions later

---

## 🆘 Troubleshooting

### Issue: Verification email not sent
- Check Firebase project settings → Authentication → Templates
- Ensure email domain is verified in Firebase console
- Check Firebase quota limits

### Issue: Banner doesn't show
- Clear browser session storage
- Check if `EmailVerificationBanner` is imported in layout
- Verify sessionStorage has `emailVerified` key

### Issue: Buttons still enabled after verification
- Reload page to refresh verification status
- Check if guards are applied to button onClick handlers
- Verify `isEmailVerified()` returns correct value

---

**Last Updated**: 2025-11-10
**Status**: Ready for implementation when needed
**Estimated Implementation Time**: 30-45 minutes
