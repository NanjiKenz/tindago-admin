# Xendit Integration Setup Summary

## What Was Added

### 1. Environment Variables Configuration
**File**: `.env` (already exists)
- `EXPO_PUBLIC_XENDIT_SECRET_KEY` - Your Xendit secret API key
- `EXPO_PUBLIC_XENDIT_PUBLIC_KEY` - Your Xendit public API key  
- `EXPO_PUBLIC_XENDIT_MODE` - Operating mode (`test` or `live`)
- `EXPO_PUBLIC_PLATFORM_COMMISSION_RATE` - Platform commission rate (0.01 = 1%)

**File**: `.env.example` (updated)
- Added documentation for all Xendit and commission variables

### 2. Configuration Module
**File**: `src/lib/config.ts` (updated)
- Added `XENDIT_PUBLIC_KEY` export
- Added `XENDIT_MODE` export  
- Updated `XENDIT_SECRET_KEY` to support `EXPO_PUBLIC_XENDIT_SECRET_KEY`
- Added `PLATFORM_COMMISSION_RATE` from environment variable

### 3. Xendit Service Module
**File**: `src/lib/xenditService.ts` (new)

Helper functions for Xendit API interactions:
- `createInvoice()` - Create payment invoices
- `getInvoice()` - Retrieve invoice details
- `expireInvoice()` - Cancel/expire invoices
- `isInvoicePaid()` - Check payment status
- `createAuthHeader()` - Generate auth headers
- `isTestMode()` - Check if in test mode
- `formatInvoiceStatus()` - Format status for display
- `formatPaymentMethod()` - Format payment method names
- `validateWebhookToken()` - Webhook security validation

### 4. Commission System Updates
**File**: `src/lib/commission.ts` (updated)
- Now imports `PLATFORM_COMMISSION_RATE` from config
- Uses environment variable as default commission rate
- Maintains Firebase override capability per store

### 5. API Routes

#### Invoice Creation (updated)
**File**: `src/app/api/payments/invoice/route.ts`
- Refactored to use `xenditService.createInvoice()`
- Cleaner code structure
- Better error handling

#### Payment Status (new)
**File**: `src/app/api/payments/status/route.ts`
- New endpoint: `GET /api/payments/status?invoiceId=xxx`
- Allows mobile app to check payment status
- Returns detailed invoice information

### 6. Documentation
**File**: `XENDIT_INTEGRATION_GUIDE.md` (new)
- Comprehensive setup guide
- API endpoint documentation
- Testing instructions
- Troubleshooting guide
- Security best practices
- Production deployment steps

## Benefits

### ✅ Centralized Configuration
All Xendit settings in one place (config.ts) - easy to manage and update

### ✅ Reusable Service Layer
`xenditService.ts` provides clean, typed functions for all Xendit operations

### ✅ Environment-Based Commission
Commission rate can be set via environment variable, with Firebase override option

### ✅ Better Error Handling
Improved error messages and validation throughout the payment flow

### ✅ Payment Status Checking
New API endpoint allows mobile app to poll payment status

### ✅ Type Safety
Full TypeScript interfaces for all Xendit operations

### ✅ Test/Live Mode Support
Easily switch between test and production with `EXPO_PUBLIC_XENDIT_MODE`

## Quick Start

1. **Add environment variables to `.env`**:
   ```env
   EXPO_PUBLIC_XENDIT_SECRET_KEY=xnd_development_xxx
   EXPO_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_xxx
   EXPO_PUBLIC_XENDIT_MODE=test
   EXPO_PUBLIC_PLATFORM_COMMISSION_RATE=0.01
   ```

2. **Restart your dev server**:
   ```bash
   npm run dev
   ```

3. **Test the integration**:
   - Mobile app calls `POST /api/payments/invoice`
   - Opens returned `invoiceUrl`
   - Customer completes payment
   - Webhook updates order status automatically

## Usage Examples

### Create Invoice (from mobile app)
```javascript
const response = await fetch('http://localhost:3000/api/payments/invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderNumber: 'ORDER-123',
    total: 500,
    method: 'gcash',
    store: { id: 'store123', name: 'My Store' },
    customer: { email: 'test@test.com', name: 'Juan' },
    items: [{ name: 'Product', quantity: 1, price: 500 }]
  })
});
```

### Check Payment Status (from mobile app)
```javascript
const response = await fetch(
  'http://localhost:3000/api/payments/status?invoiceId=inv_xxx'
);
const data = await response.json();
console.log(data.isPaid); // true or false
```

### Use Xendit Service (server-side)
```typescript
import { createInvoice, getInvoice, isInvoicePaid } from '@/lib/xenditService';

// Create invoice
const invoice = await createInvoice({
  externalId: 'ORDER-123',
  amount: 500,
  payerEmail: 'customer@test.com',
  description: 'Order payment',
  customer: { given_names: 'Juan', email: 'customer@test.com' },
  items: [{ name: 'Product', quantity: 1, price: 500 }]
});

// Check if paid
const isPaid = await isInvoicePaid(invoice.id);
```

## Testing Checklist

- [ ] Environment variables are set in `.env`
- [ ] Dev server restarts successfully
- [ ] Can create invoice via API
- [ ] Invoice URL opens and shows payment page
- [ ] Test payment completes successfully (use test mode)
- [ ] Webhook receives payment notification
- [ ] Order status updates in Firebase
- [ ] Payment status API returns correct data
- [ ] Commission is calculated correctly
- [ ] Ledger records are created properly

## Next Steps

1. **Test with the mobile app**: Ensure TindaGo can call the invoice API
2. **Configure webhook**: Set up webhook URL in Xendit dashboard
3. **Monitor payments**: Check Xendit dashboard for transaction logs
4. **Adjust commission**: Update rate in Settings → Payment Settings
5. **Go live**: Switch to production keys when ready

## Files Modified/Created

### Modified:
- `src/lib/config.ts`
- `src/lib/commission.ts`
- `src/app/api/payments/invoice/route.ts`
- `.env.example`

### Created:
- `src/lib/xenditService.ts`
- `src/app/api/payments/status/route.ts`
- `XENDIT_INTEGRATION_GUIDE.md`
- `XENDIT_SETUP_SUMMARY.md`

---

**Need help?** Check `XENDIT_INTEGRATION_GUIDE.md` for detailed documentation.
