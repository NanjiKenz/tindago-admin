# TindaGo Payment Architecture

## Overview

TindaGo uses a **centralized platform payment model** where the platform (tindago-admin) manages all payments through a single Xendit account. This is the industry-standard approach used by Uber, Grab, Shopee, and other marketplaces.

## Why Centralized Model?

### ✅ Advantages
1. **Simpler for Stores** - No need to create Xendit accounts or manage API keys
2. **Better Security** - Stores don't handle sensitive payment credentials
3. **Easier Compliance** - Single point for refunds, disputes, and regulations
4. **Platform Control** - You control commission and payout timing
5. **Better UX** - Consistent checkout experience for customers
6. **Lower Barrier** - Stores can start selling immediately

### ❌ Multi-Vendor Model (NOT RECOMMENDED)
- Each store needs their own Xendit account
- Stores must be verified and KYC'd
- Complex commission enforcement
- Harder to handle refunds
- More support burden

## Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

1. Customer browses Store (Mobile App - TindaGo)
2. Adds products to cart
3. Goes to checkout
4. Taps "Pay Now"
   ↓
5. App calls: POST /api/payments/invoice (tindago-admin)
   ↓
6. Admin creates Xendit invoice with:
   - Total amount: ₱100
   - Commission (1%): ₱1
   - Store gets: ₱99
   ↓
7. Returns invoice URL to mobile app
   ↓
8. Mobile app opens Xendit payment page
   ↓
9. Customer completes payment (GCash/PayMaya/Card)
   ↓
10. Xendit sends webhook → /api/webhooks/xendit
   ↓
11. Admin updates:
    - Order status → "paid"
    - Ledger record → "PAID"
    - Store wallet → +₱99
   ↓
12. Customer sees "Payment Successful"
```

## Database Structure

### Firebase Realtime Database

```
firebase/
├── orders/
│   └── {orderId}/
│       ├── orderNumber: "ORD-12345"
│       ├── storeId: "store123"
│       ├── customerId: "cust456"
│       ├── total: 100
│       ├── paymentStatus: "paid"  ← Updated by webhook
│       └── createdAt: "2024-..."
│
├── ledgers/
│   └── stores/
│       └── {storeId}/
│           └── transactions/
│               └── {invoiceId}/
│                   ├── orderNumber: "ORD-12345"
│                   ├── amount: 100
│                   ├── commission: 1
│                   ├── commissionRate: 0.01
│                   ├── storeAmount: 99
│                   ├── status: "PAID"  ← Updated by webhook
│                   ├── method: "gcash"
│                   ├── createdAt: "2024-..."
│                   └── paidAt: "2024-..."
│
├── settings/
│   ├── platform/
│   │   └── commissionRate: 0.01  ← Global rate
│   └── stores/
│       └── {storeId}/
│           └── commissionRate: 0.02  ← Optional override
│
└── wallets/  ← Store earnings (to be implemented)
    └── {storeId}/
        ├── balance: 9900  ← In cents
        ├── pending: 0
        └── transactions/
            └── {txnId}/
                ├── type: "credit"
                ├── amount: 99
                ├── source: "order-payment"
                └── timestamp: "2024-..."
```

## Commission System

### How It Works

1. **Default Rate**: Set in `.env` as `EXPO_PUBLIC_PLATFORM_COMMISSION_RATE=0.01` (1%)
2. **Global Rate**: Admin can override via Settings → Payment Settings
3. **Store-Specific Rate**: Admin can set custom rates per store
4. **Fallback**: Environment → Firebase Global → Store-Specific

### Priority Order
```
Store Custom Rate > Global Rate (Firebase) > Environment Default
```

### Example Calculation
```javascript
Order Total: ₱500.00
Commission Rate: 1% (0.01)
Commission: ₱5.00
Store Receives: ₱495.00
```

## Admin Dashboard Features

### 1. Transaction Records (`/transactions`)
- View ALL platform transactions
- **Filters**:
  - Search by order #, store name, invoice ID
  - Filter by status (paid/pending/refunded)
  - Filter by payment method (GCash/PayMaya/Online)
  - Date range
- **Summary Cards**:
  - Total transactions count
  - Total revenue (all payments)
  - Platform commission (your earnings)
  - Store earnings (to be paid out)
- **Export**: Download CSV of filtered data

### 2. Commission Settings (`/settings/payments`)
- **Global Rate**:
  - Set platform-wide commission percentage
  - Shows default from environment
  - Applies to all stores by default
- **Store-Specific Rates**:
  - Override global rate for individual stores
  - Useful for:
    - Partner stores (lower rate)
    - Premium stores (different tier)
    - Promotional periods
  - Shows "custom" or "global" badge
  - Easy edit/clear interface

### 3. Payouts (`/payouts`)
- View store earnings
- Approve payout requests
- Track payout history

## Store Experience

### What Stores See (in their store portal)
- Their own transactions only
- Earnings breakdown:
  - Gross sales
  - Commission deducted
  - Net earnings
- Wallet balance
- Payout request button

### What Stores DON'T Need
- ❌ Xendit account
- ❌ API keys
- ❌ Payment gateway setup
- ❌ PCI compliance
- ❌ Customer payment data

## API Endpoints

### 1. Create Invoice
```
POST /api/payments/invoice

Request:
{
  "orderNumber": "ORD-12345",
  "total": 500.00,
  "method": "gcash",  // or "paymaya" or "online"
  "store": {
    "id": "store123",
    "name": "Sari-Sari Store"
  },
  "customer": {
    "email": "customer@email.com",
    "name": "Juan Dela Cruz",
    "phone": "+639123456789"
  },
  "items": [
    { "name": "Product 1", "quantity": 2, "price": 250 }
  ]
}

Response:
{
  "success": true,
  "invoiceId": "inv_abc123",
  "invoiceUrl": "https://checkout.xendit.co/web/inv_abc123",
  "expiryDate": "2024-01-02T00:00:00Z",
  "commission": 5.00,
  "storeAmount": 495.00
}
```

### 2. Check Payment Status
```
GET /api/payments/status?invoiceId=inv_abc123

Response:
{
  "success": true,
  "invoiceId": "inv_abc123",
  "status": "PAID",
  "isPaid": true,
  "amount": 500.00,
  "currency": "PHP"
}
```

### 3. Webhook (Xendit → Admin)
```
POST /api/webhooks/xendit
Headers:
  x-callback-token: tindago_webhook_secret_2024

Body: (Xendit invoice data)
```

## Security

### API Keys (Never Exposed)
- `EXPO_PUBLIC_XENDIT_SECRET_KEY` - Server-side only
- `XENDIT_WEBHOOK_TOKEN` - Validates webhook requests

### Mobile App
- Only calls `/api/payments/invoice`
- Never sees API keys
- Never handles payment data
- Just opens the invoice URL

### Webhook Verification
```typescript
const token = request.headers.get('x-callback-token');
if (token !== XENDIT_WEBHOOK_TOKEN) {
  return 401 Unauthorized;
}
```

## Money Flow

```
Customer pays ₱100
      ↓
Xendit receives ₱100
      ↓
Platform (tindago-admin) account
      ↓
Auto-split:
  ├─ Platform commission: ₱1 (stays in platform Xendit)
  └─ Store earnings: ₱99 (tracked in Firebase wallet)
      ↓
Store requests payout
      ↓
Admin approves
      ↓
Platform transfers to store's bank
```

## Payout System (Recommended)

### Option 1: Manual Payouts
- Store requests payout
- Admin reviews and approves
- Admin transfers via bank/GCash manually
- Marks as paid in system

### Option 2: Automated Payouts
- Store balance reaches threshold (e.g. ₱1000)
- Auto-create Xendit disbursement
- Transfer to store's registered account
- Instant notification

### Option 3: Scheduled Payouts
- Weekly/bi-weekly/monthly schedule
- Auto-transfer all pending balances
- Generate payout reports

## Testing

### Test Mode
```env
EXPO_PUBLIC_XENDIT_MODE=test
```
- No real money
- Use test payment methods
- Perfect for development

### Test Accounts
- **GCash**: Use Xendit test credentials
- **Credit Card**: 4000 0000 0000 0002

### Webhook Testing
```bash
# Use ngrok for local testing
ngrok http 3000

# Set webhook in Xendit dashboard
https://your-ngrok-url.ngrok.io/api/webhooks/xendit
```

## Production Checklist

- [ ] Switch to production Xendit keys
- [ ] Set `EXPO_PUBLIC_XENDIT_MODE=live`
- [ ] Configure production webhook URL
- [ ] Test with small real amounts first
- [ ] Monitor Xendit dashboard daily
- [ ] Set up error alerts
- [ ] Document payout process
- [ ] Train support team
- [ ] Prepare refund procedures

## Support Scenarios

### Refund Process
1. Customer requests refund
2. Admin verifies in Xendit dashboard
3. Issue refund through Xendit
4. Update order status to "refunded"
5. Deduct from store's next payout

### Dispute Resolution
1. Customer disputes charge
2. Admin reviews order details
3. Contact store for evidence
4. Provide evidence to Xendit
5. Await Xendit decision

### Failed Payments
1. Customer complains payment failed
2. Check Xendit dashboard for invoice status
3. If expired: Create new invoice
4. If pending: Wait for webhook
5. If error: Check error message in Xendit

## Future Enhancements

### Phase 2
- [ ] Wallet system UI
- [ ] Payout requests and approvals
- [ ] Payout history page
- [ ] Store earnings analytics

### Phase 3
- [ ] Automated payouts
- [ ] Bulk payout processing
- [ ] Payout scheduling
- [ ] Tax reporting

### Phase 4
- [ ] Subscription payments
- [ ] Installment plans
- [ ] Loyalty points integration
- [ ] Multi-currency support

## FAQs

**Q: Why not let stores use their own Xendit accounts?**
A: Too complex. Stores would need to:
- Create accounts
- Get verified
- Manage API keys
- Handle compliance
- Deal with support issues

The centralized model is simpler and industry-standard.

**Q: How do we enforce commission with centralized payments?**
A: Automatically! We calculate and deduct commission on every invoice creation. Stores receive net amount in their wallet.

**Q: What if a store wants a different commission rate?**
A: Admin can set store-specific rates in Settings → Payment Settings.

**Q: How do stores get their money?**
A: Via payout system. They request, admin approves, money transferred to their bank/GCash.

**Q: Is this scalable?**
A: Yes! Shopee, Lazada, Grab all use this model with millions of transactions.

---

**Need help?** See `XENDIT_INTEGRATION_GUIDE.md` for technical details.
