# TindaGo Payment System - Deployment Guide

**Status:** Ready for deployment before capstone defense

---

## Pre-Deployment Checklist

- [ ] All code changes committed to git
- [ ] Firebase security rules deployed ✅ (done)
- [ ] Environment variables configured
- [ ] Admin user ID added to admins list in Firebase
- [ ] Xendit test mode verified working
- [ ] Mobile app tested locally

---

## Step 1: Prepare Environment Variables

### tindago-admin .env.production

Create or update `.env.production` with LIVE Xendit keys:

```env
# XENDIT - SWITCH TO LIVE KEYS FOR PRODUCTION
XENDIT_MODE=live
XENDIT_SECRET_KEY=xnd_live_xxxxx  # Get from Xendit dashboard
XENDIT_PUBLIC_KEY=xnd_public_live_xxxxx
XENDIT_WEBHOOK_TOKEN=your_webhook_token_xxxxx

# Commission
PLATFORM_COMMISSION_RATE=0.05

# Firebase (same as development)
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

**⚠️ CRITICAL:** Use LIVE Xendit keys, not test keys!

---

## Step 2: Configure Xendit Webhooks

**In Xendit Dashboard (https://dashboard.xendit.co):**

1. Go to **Settings** → **Webhooks** (or **Developers** → **Webhooks**)
2. Find **Invoice Callbacks**
3. Set webhook URL to: `https://your-production-domain.com/api/webhooks/xendit`
4. Set callback token to match your `XENDIT_WEBHOOK_TOKEN`
5. Test the webhook configuration
6. Save

**Example production URLs:**
- Vercel: `https://tindago-admin.vercel.app/api/webhooks/xendit`
- Firebase Hosting: `https://your-project.firebaseapp.com/api/webhooks/xendit`
- Custom domain: `https://admin.tindago.com/api/webhooks/xendit`

---

## Step 3: Deploy tindago-admin

### Option A: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod --env-file=.env.production
```

### Option B: Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

### Option C: Deploy to Heroku

```bash
# Install Heroku CLI, then:
heroku login
heroku create your-app-name
git push heroku main
```

---

## Step 4: Set Admin User in Firebase

**In Firebase Console:**

1. Realtime Database → Data tab
2. Click **+** to add new data
3. Path: `admins`
4. Add your admin user ID: `true`

```
admins/
  your_admin_uid: true
```

This allows you to approve/reject payouts and view all transactions.

---

## Step 5: Update TindaGo App Env Variables

**In TindaGo `.env.production`:**

```env
# Point to production admin API
EXPO_PUBLIC_ADMIN_API_BASE=https://your-production-domain.com

# Firebase (same)
EXPO_PUBLIC_FIREBASE_API_KEY=your-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## Step 6: Deploy TindaGo Mobile App

### Option A: Expo Go (Simple - for capstone demo)

```bash
cd TindaGo
npx expo start

# Scan QR code with Expo Go app
```

### Option B: Build for App Stores (Full deployment)

**iOS (requires Mac):**
```bash
eas build --platform ios --auto-submit
```

**Android:**
```bash
eas build --platform android --auto-submit
```

Requires:
- Expo account
- Apple Developer account (iOS)
- Google Play account (Android)
- EAS CLI: `npm i -g eas-cli`

---

## Step 7: Configure Firebase Security Rules for Production

**In Firebase Console → Realtime Database → Rules:**

Replace with proper security rules:

```json
{
  "rules": {
    "ledgers": {
      "stores": {
        "$storeId": {
          "transactions": {
            "$invoiceId": {
              ".read": "auth.uid == $storeId || root.child('admins').child(auth.uid).exists()",
              ".write": false
            }
          }
        }
      }
    },
    "wallets": {
      "$storeId": {
        ".read": "auth.uid == $storeId || root.child('admins').child(auth.uid).exists()",
        ".write": false
      }
    },
    "payouts": {
      "$payoutId": {
        ".read": "data.child('storeId').val() == auth.uid || root.child('admins').child(auth.uid).exists()",
        ".create": "newData.child('storeId').val() == auth.uid",
        ".write": false
      }
    },
    "orders": {
      ".read": true,
      ".write": "auth != null"
    },
    "stores": {
      ".read": true,
      ".write": true
    },
    "store_registrations": {
      ".read": true,
      ".write": true
    },
    "processed_webhooks": {
      ".read": false,
      ".write": true
    },
    "indexes": {
      ".read": true,
      ".write": true
    },
    "settings": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()"
    }
  }
}
```

Click **Publish**.

---

## Step 8: Test Production Deployment

### Test Payment Flow

1. **Create test invoice** (if still in test mode):
   ```bash
   curl -X POST https://your-production-domain.com/api/payments/invoice \
     -H "Content-Type: application/json" \
     -d '{...}'
   ```

2. **Complete payment** on Xendit checkout page

3. **Verify webhook processed:**
   - Check Firebase `ledgers/stores/{storeId}` - status should be `PAID`
   - Check Firebase `wallets/{storeId}.available` - should be > 0
   - Check tindago-admin logs - no errors

4. **Check mobile app:**
   - Log in as store owner
   - Go to Earnings dashboard
   - Should see transaction

### Monitor Logs

- **Vercel:** Deployments → Logs
- **Firebase:** Cloud Functions (if using)
- **Heroku:** `heroku logs --tail`

---

## Step 9: Switch from Test to Live Xendit (CRITICAL)

⚠️ **DO THIS ONLY AFTER TESTING WORKS:**

1. Update `.env.production`:
   - Change `XENDIT_MODE=live`
   - Update `XENDIT_SECRET_KEY` to live key
   - Update `XENDIT_PUBLIC_KEY` to live key

2. Re-deploy tindago-admin

3. **Test with real payment** (small amount like ₱10)

4. Verify wallet credits correctly

---

## Step 10: Post-Deployment Checklist

- [ ] Admin dashboard deployed and accessible
- [ ] Mobile app points to production API
- [ ] Xendit webhook configured and tested
- [ ] Firebase security rules in place
- [ ] Admin user ID in Firebase `admins` list
- [ ] Test payment completed successfully
- [ ] Wallet credited correctly
- [ ] Mobile earnings dashboard shows payment
- [ ] No errors in logs
- [ ] Team has production credentials (safely stored)

---

## Troubleshooting

### Webhook not triggering

**Check:**
1. Xendit webhook URL correct in dashboard
2. Webhook token matches `XENDIT_WEBHOOK_TOKEN`
3. Production domain is publicly accessible
4. Check server logs for errors

### Wallet not crediting

**Check:**
1. Ledger status is `PAID` or `SETTLED`
2. Firebase `wallets/{storeId}` exists
3. Firebase security rules allow server writes
4. Check webhook logs for errors

### Mobile app not connecting

**Check:**
1. `EXPO_PUBLIC_ADMIN_API_BASE` points to correct domain
2. CORS enabled on admin API
3. Firebase configuration correct in mobile app
4. No auth token issues

### Payment shows but ledger doesn't update

**Check:**
1. Webhook received (check `processed_webhooks` node)
2. Webhook token valid
3. Check server logs for webhook processing errors
4. Verify metadata in Xendit invoice includes `store_id`

---

## Rollback Plan

If something breaks in production:

1. **Revert to test mode:** Update `.env` to `XENDIT_MODE=test`
2. **Re-deploy:** Push changes to production
3. **Notify users:** Let customers know payments are temporarily disabled
4. **Fix issue:** Debug in development, test locally
5. **Re-deploy:** Push fix to production
6. **Resume:** Switch back to live mode

---

## Security Reminders

- ✅ Never commit `.env.production` to git
- ✅ Store secrets in environment variables only
- ✅ Use Firebase security rules (not open permissions)
- ✅ Monitor webhook logs for suspicious activity
- ✅ Rotate webhook token regularly
- ✅ Keep Xendit keys secret (rotate if compromised)
- ✅ Use HTTPS only for webhook URLs

---

## Production Monitoring

**Setup alerts for:**
- Webhook failures
- Firebase permission errors
- Unusual transaction amounts
- Commission calculation errors
- Wallet balance anomalies

**Daily checks:**
- [ ] No errors in logs
- [ ] Webhooks processing normally
- [ ] Commission rates correct
- [ ] Wallets updating properly

---

## Support & Documentation

- Xendit Docs: https://docs.xendit.co
- Firebase Docs: https://firebase.google.com/docs/database
- Expo Docs: https://docs.expo.dev

---

## Deployment Timeline

| Phase | Time | Status |
|-------|------|--------|
| Development | Complete | ✅ Done |
| Testing (local) | Complete | ✅ Done |
| Staging (test mode) | Before defense | ⏳ TODO |
| Production (live mode) | After defense | ⏳ TODO |

---

**Last Updated:** 2025-10-31
**Next Review:** Before capstone defense
"