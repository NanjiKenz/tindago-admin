# Xendit Integration Guide - TindaGo Admin

## Overview
TindaGo Admin handles all Xendit payment processing for the platform. The mobile app (TindaGo) calls the admin API endpoints, which then communicate with Xendit's API to create invoices, process payments, and handle webhooks.

## Environment Variables

### Required Variables
Add these to your `.env` file:

```env
# Xendit Payment Configuration
EXPO_PUBLIC_XENDIT_SECRET_KEY=xnd_development_xxx     # Your Xendit secret key
EXPO_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_xxx  # Your Xendit public key
EXPO_PUBLIC_XENDIT_MODE=test                          # 'test' or 'live'
XENDIT_WEBHOOK_TOKEN=your_webhook_token_here          # Webhook verification token

# Platform Settings
EXPO_PUBLIC_PLATFORM_COMMISSION_RATE=0.01             # 1% commission (0.01 = 1%)
```

### Getting Xendit Keys

1. **Sign up for Xendit**: https://dashboard.xendit.co/register
2. **Get API Keys**:
   - Go to Settings → Developers → API Keys
   - For testing: Use Development keys (prefix: `xnd_development_`)
   - For production: Use Live keys (prefix: `xnd_production_`)
3. **Set Webhook Token**:
   - Create a secure random token for webhook verification
   - Add it to your `.env` as `XENDIT_WEBHOOK_TOKEN`

## Architecture

### Payment Flow

```
Mobile App (TindaGo)
    ↓
    POST /api/payments/invoice
    ↓
Admin API (tindago-admin)
    ↓
    Xendit API
    ↓
    Returns invoice URL
    ↓
Mobile App opens URL
    ↓
Customer completes payment
    ↓
Xendit Webhook → /api/webhooks/xendit
    ↓
Updates order status in Firebase
```

## API Endpoints

### 1. Create Invoice
**Endpoint**: `POST /api/payments/invoice`

Creates a payment invoice with Xendit and returns the payment URL.

**Request Body**:
```json
{
  "orderNumber": "ORDER-123",
  "total": 500.00,
  "method": "gcash",  // or "paymaya" or "online"
  "store": {
    "id": "store123",
    "name": "Store Name",
    "email": "store@example.com"
  },
  "customer": {
    "email": "customer@example.com",
    "name": "Juan Dela Cruz",
    "phone": "+639123456789"
  },
  "items": [
    {
      "name": "Product 1",
      "quantity": 2,
      "price": 250.00
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "invoiceId": "inv_xxx",
  "invoiceUrl": "https://checkout.xendit.co/web/inv_xxx",
  "expiryDate": "2024-01-01T00:00:00Z",
  "commission": 5.00,
  "storeAmount": 495.00
}
```

### 2. Check Payment Status
**Endpoint**: `GET /api/payments/status?invoiceId=inv_xxx`

Check the current status of a payment invoice.

**Response**:
```json
{
  "success": true,
  "invoiceId": "inv_xxx",
  "status": "PAID",
  "isPaid": true,
  "amount": 500.00,
  "currency": "PHP",
  "externalId": "ORDER-123",
  "invoiceUrl": "https://checkout.xendit.co/web/inv_xxx",
  "expiryDate": "2024-01-01T00:00:00Z",
  "created": "2024-01-01T00:00:00Z",
  "updated": "2024-01-01T00:00:00Z"
}
```

### 3. Webhook Endpoint
**Endpoint**: `POST /api/webhooks/xendit`

Receives payment status updates from Xendit.

**Headers Required**:
```
x-callback-token: your_webhook_token_here
```

## Xendit Service Functions

The `xenditService.ts` module provides helper functions:

### Core Functions

```typescript
import { 
  createInvoice, 
  getInvoice, 
  expireInvoice, 
  isInvoicePaid,
  formatInvoiceStatus,
  formatPaymentMethod 
} from '@/lib/xenditService';

// Create an invoice
const invoice = await createInvoice({
  externalId: 'ORDER-123',
  amount: 500,
  payerEmail: 'customer@example.com',
  description: 'Order from Store',
  customer: {
    given_names: 'Juan Dela Cruz',
    email: 'customer@example.com',
    mobile_number: '+639123456789'
  },
  items: [
    { name: 'Product 1', quantity: 2, price: 250, category: 'Groceries' }
  ],
  paymentMethods: ['GCASH', 'PAYMAYA'],
  fees: [{ type: 'PLATFORM_FEE', value: 5 }],
  metadata: { orderId: 'order123' }
});

// Get invoice details
const invoice = await getInvoice('inv_xxx');

// Check if paid
const isPaid = await isInvoicePaid('inv_xxx');

// Expire/cancel an invoice
await expireInvoice('inv_xxx');

// Format for display
const statusText = formatInvoiceStatus('PAID'); // "Paid"
const methodText = formatPaymentMethod('GCASH'); // "GCash"
```

## Commission System

The platform automatically calculates and applies commission fees to each transaction.

### How It Works

1. **Default Rate**: Set via `EXPO_PUBLIC_PLATFORM_COMMISSION_RATE` (e.g., 0.01 = 1%)
2. **Store-Specific Rate**: Can be overridden per store in Firebase
3. **Calculation**: Happens automatically in the invoice creation

### Managing Commission Rates

**Global Rate** (via Admin UI):
- Navigate to Settings → Payment Settings
- Update the commission percentage
- Saved to Firebase: `settings/platform/commissionRate`

**Per-Store Rate** (via API):
```typescript
import { setStoreCommissionRate, clearStoreCommissionRate } from '@/lib/commission';

// Set custom rate for a store (2%)
await setStoreCommissionRate('store123', 0.02);

// Remove custom rate (reverts to global)
await clearStoreCommissionRate('store123');
```

## Payment Methods

Supported payment methods:
- **GCash**: E-wallet
- **PayMaya**: E-wallet
- **Credit Card**: Visa, Mastercard, etc.
- **Debit Card**: Online banking cards
- **Bank Transfer**: BPI, BDO, etc.

Set specific methods in the invoice request:
```typescript
paymentMethods: ['GCASH']           // GCash only
paymentMethods: ['PAYMAYA']         // PayMaya only
paymentMethods: ['GCASH', 'PAYMAYA', 'CREDIT_CARD', 'DEBIT_CARD']  // All
```

## Testing

### Test Mode
When `EXPO_PUBLIC_XENDIT_MODE=test`:
- Uses development API keys
- No real money is charged
- Test payment methods available

### Test Cards (Credit/Debit)
```
Success: 4000 0000 0000 0002
CVV: 123
Expiry: Any future date
```

### Webhook Testing
Use ngrok to expose your local server:
```bash
ngrok http 3000
```

Then set webhook URL in Xendit dashboard:
```
https://your-ngrok-url.ngrok.io/api/webhooks/xendit
```

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook tokens** before processing
3. **Use HTTPS** in production
4. **Rotate keys** periodically
5. **Monitor transactions** in Xendit dashboard
6. **Enable 2FA** on Xendit account

## Monitoring & Debugging

### Check Logs
```bash
# View Next.js logs
npm run dev

# Check specific errors
tail -f .next/server.log
```

### Xendit Dashboard
- View all transactions: https://dashboard.xendit.co/transactions
- Check webhook logs: Settings → Webhooks
- Monitor test payments: Development → Test Data

### Firebase Database
Payment records are stored at:
```
ledgers/stores/{storeId}/transactions/{invoiceId}
indexes/invoice_to_store/{invoiceId}
orders/{orderId}/paymentStatus
```

## Troubleshooting

### Issue: "Missing required env: XENDIT_SECRET_KEY"
**Solution**: Ensure `.env` file has `EXPO_PUBLIC_XENDIT_SECRET_KEY` set

### Issue: Webhook returns 401 Unauthorized
**Solution**: Check that `XENDIT_WEBHOOK_TOKEN` matches the token sent by Xendit

### Issue: Invoice creation fails with 502
**Solution**: 
- Verify API key is valid
- Check Xendit dashboard for API errors
- Ensure amount is greater than 0
- Verify email format is valid

### Issue: Payment shows as PENDING but was completed
**Solution**: 
- Check webhook is configured correctly
- Verify webhook token matches
- Check Firebase for webhook processing logs

## Production Deployment

1. **Update environment variables**:
   ```env
   EXPO_PUBLIC_XENDIT_MODE=live
   EXPO_PUBLIC_XENDIT_SECRET_KEY=xnd_production_xxx
   EXPO_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_production_xxx
   ```

2. **Set production webhook URL** in Xendit dashboard:
   ```
   https://your-domain.com/api/webhooks/xendit
   ```

3. **Test thoroughly** with small amounts first

4. **Monitor** transactions closely for the first few days

## Support

- **Xendit Support**: https://help.xendit.co
- **Xendit API Docs**: https://developers.xendit.co
- **TindaGo Issues**: Contact development team
