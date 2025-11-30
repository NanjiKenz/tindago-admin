# Fixing Xendit "PERMISSION_DENIED" Error

## Problem
When trying to checkout with GCash/PayMaya, you get:
```
ERROR [XenditService] Admin API error response: {"error":"PERMISSION_DENIED: Permission denied"}
```

## Root Cause
The **tindago-admin** API doesn't have valid Xendit API credentials configured.

## Solution: Setup Xendit API Keys

### Step 1: Get Your Xendit API Keys

1. **Sign up for Xendit** (if you haven't already)
   - Go to https://dashboard.xendit.co/register
   - Complete registration
   - Verify your email

2. **Get your Test Mode API keys**
   - Login to https://dashboard.xendit.co
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **Developers** → **API Keys**
   - You'll see two keys:
     - **Secret Key** (starts with `xnd_development_` for test mode)
     - **Public Key** (starts with `xnd_public_development_` for test mode)

3. **Copy both keys** - you'll need them in the next step

### Step 2: Configure Admin API Environment Variables

1. **Navigate to tindago-admin folder**
   ```bash
   cd C:\CapsProj\tindago-admin
   ```

2. **Create `.env.local` file** (or `.env` if .env.local doesn't work)
   ```bash
   # Copy from example
   copy .env.example .env.local
   ```

3. **Edit `.env.local`** and replace the placeholder values with your actual Xendit keys:

   ```env
   # Xendit Payment Configuration
   EXPO_PUBLIC_XENDIT_SECRET_KEY=xnd_development_YOUR_ACTUAL_SECRET_KEY_HERE
   EXPO_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_YOUR_ACTUAL_PUBLIC_KEY_HERE
   EXPO_PUBLIC_XENDIT_MODE=test
   XENDIT_WEBHOOK_TOKEN=your_webhook_token_here
   
   # Platform Settings
   EXPO_PUBLIC_PLATFORM_COMMISSION_RATE=0.01
   ```

   **Example with real format:**
   ```env
   EXPO_PUBLIC_XENDIT_SECRET_KEY=xnd_development_O46JfOtygfd9kD+18fmrGpBwi+Zu9j2I/bAo0ZiPVZ6LxTchxgEaD4POhGdXA
   EXPO_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_P4qDfg80IQ2Ql3LfN/TkdBLu0YwqD1ggAQ9V
   EXPO_PUBLIC_XENDIT_MODE=test
   ```

### Step 3: Configure Admin API Base URL in Mobile App

1. **Navigate to TindaGo folder**
   ```bash
   cd C:\CapsProj\TindaGo
   ```

2. **Create or edit `.env`** file and add:
   ```env
   # Admin API Configuration
   EXPO_PUBLIC_ADMIN_API_BASE=http://localhost:3000
   ```

   **For testing on physical device**, use your computer's IP:
   ```env
   EXPO_PUBLIC_ADMIN_API_BASE=http://192.168.1.100:3000
   ```

   To find your IP on Windows:
   ```bash
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   ```

### Step 4: Restart Admin API

1. **Stop the admin API** if it's running (Ctrl+C in terminal)

2. **Start it again:**
   ```bash
   cd C:\CapsProj\tindago-admin
   npm run dev
   ```

3. **Verify it's running:**
   - Open browser: http://localhost:3000
   - You should see the admin dashboard

4. **Check environment variables loaded:**
   - Add a test endpoint to verify (optional):
   ```typescript
   // In src/app/api/test-xendit/route.ts
   export async function GET() {
     return Response.json({
       hasSecretKey: !!process.env.EXPO_PUBLIC_XENDIT_SECRET_KEY,
       keyPreview: process.env.EXPO_PUBLIC_XENDIT_SECRET_KEY?.substring(0, 20) + '...',
       mode: process.env.EXPO_PUBLIC_XENDIT_MODE,
     });
   }
   ```
   - Visit: http://localhost:3000/api/test-xendit

### Step 5: Restart Mobile App

1. **Stop the mobile app** (Ctrl+C in terminal where Expo is running)

2. **Clear cache and restart:**
   ```bash
   cd C:\CapsProj\TindaGo
   npx expo start -c
   ```

3. **Press 'a'** for Android or 'i' for iOS

### Step 6: Test Payment

1. **Add items to cart**
2. **Proceed to checkout**
3. **Select GCash or PayMaya**
4. **Click "Proceed to Checkout"**
5. **✅ Should now open Xendit payment page** (no more PERMISSION_DENIED error)

## Important Notes

### Test Mode vs Live Mode

**Test Mode** (Development):
- Keys start with `xnd_development_` and `xnd_public_development_`
- No real money is charged
- Use test payment methods:
  - GCash: Use test account credentials from Xendit docs
  - PayMaya: Use test card numbers from Xendit docs
- Set `EXPO_PUBLIC_XENDIT_MODE=test`

**Live Mode** (Production):
- Keys start with `xnd_production_` and `xnd_public_production_`
- Real money is charged
- Requires business verification on Xendit
- Set `EXPO_PUBLIC_XENDIT_MODE=live`

⚠️ **Always start with test mode!**

### Security Best Practices

1. **Never commit `.env` or `.env.local` to Git**
   - Already in `.gitignore` - verify this
   - These files contain secret keys

2. **Use different keys for test/production**
   - Test keys for development
   - Production keys only on deployed servers

3. **Rotate keys regularly**
   - Generate new keys every 3-6 months
   - Revoke old keys after rotation

4. **Restrict key permissions**
   - In Xendit dashboard, limit what each key can do
   - Use separate keys for different services if needed

## Troubleshooting

### Error: "Module not found" after creating .env.local
**Solution:** Restart the admin API server

### Error: Still getting PERMISSION_DENIED
**Check:**
1. Keys are correct (no extra spaces, complete key)
2. Keys are from the correct mode (test vs live)
3. `.env.local` file is in the root of `tindago-admin` folder
4. Admin API was restarted after creating .env.local

### Error: "Cannot connect to admin API"
**Check:**
1. Admin API is running (`npm run dev` in tindago-admin)
2. `EXPO_PUBLIC_ADMIN_API_BASE` is set correctly
3. If using physical device, use computer's IP, not localhost
4. Firewall isn't blocking port 3000

### Error: "Invoice created but payment page doesn't open"
**Check:**
1. `Linking.canOpenURL()` permissions in mobile app
2. Browser app installed on device/emulator
3. Check console for URL format issues

## Verifying Setup

### Test Xendit API Connection

Create this test file to verify Xendit keys work:

```typescript
// tindago-admin/src/app/api/test-xendit/route.ts
import { createInvoice } from '@/lib/xenditService';
import { XENDIT_SECRET_KEY } from '@/lib/config';

export async function GET() {
  try {
    // Check if key exists
    if (!XENDIT_SECRET_KEY || XENDIT_SECRET_KEY.length < 10) {
      return Response.json({ 
        error: 'Xendit secret key not configured',
        keyLength: XENDIT_SECRET_KEY?.length || 0 
      }, { status: 500 });
    }

    // Try creating a test invoice
    const testInvoice = await createInvoice({
      externalId: `TEST-${Date.now()}`,
      amount: 100,
      payerEmail: 'test@example.com',
      description: 'Test Invoice',
      customer: {
        given_names: 'Test User',
        email: 'test@example.com',
      },
      items: [{
        name: 'Test Item',
        quantity: 1,
        price: 100,
      }],
    });

    return Response.json({ 
      success: true,
      invoiceId: testInvoice.id,
      status: testInvoice.status,
      message: 'Xendit connection successful!'
    });
  } catch (error: any) {
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
```

Visit: http://localhost:3000/api/test-xendit

**Expected result:** `{ "success": true, "invoiceId": "...", "status": "PENDING" }`

## Next Steps

After fixing the permission error:

1. **Setup Webhook** - So payment status updates automatically
   - See `XENDIT_INTEGRATION_GUIDE.md` in tindago-admin

2. **Test Payment Flow**
   - Complete a test payment with test credentials
   - Verify order status updates in Firebase
   - Check ledger entries are created

3. **Configure Commission Rates**
   - Set platform commission in Firebase: `settings/platform/commissionRate`
   - Set store-specific rates: `settings/commissions/stores/{storeId}`

4. **Setup for Production**
   - Get live API keys from Xendit (requires business verification)
   - Update .env.local with live keys
   - Change `EXPO_PUBLIC_XENDIT_MODE=live`
   - Test thoroughly before going live

## Reference Links

- **Xendit Dashboard:** https://dashboard.xendit.co
- **Xendit API Docs:** https://developers.xendit.co/api-reference
- **Xendit Test Credentials:** https://developers.xendit.co/api-reference/#test-scenarios
- **Xendit Invoices API:** https://developers.xendit.co/api-reference/#create-invoice

---

**Need Help?**
- Check Xendit status: https://status.xendit.co
- Xendit Support: support@xendit.co
- Developer Slack: https://xendit-community.slack.com
