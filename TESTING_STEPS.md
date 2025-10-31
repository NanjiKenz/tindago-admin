# Step-by-Step Testing Guide

## ✅ Step 1: Verify Configuration
Environment variables are set in `.env`:
- ✅ EXPO_PUBLIC_XENDIT_SECRET_KEY
- ✅ EXPO_PUBLIC_XENDIT_PUBLIC_KEY
- ✅ EXPO_PUBLIC_XENDIT_MODE
- ✅ XENDIT_WEBHOOK_TOKEN
- ✅ EXPO_PUBLIC_PLATFORM_COMMISSION_RATE

## Step 2: Start the Admin Server

```bash
cd C:\CapsProj\tindago-admin
npm run dev
```

Wait for:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

## Step 3: Run the Test Script

Open a NEW terminal and run:

```bash
cd C:\CapsProj\tindago-admin
node test-xendit.js
```

### Expected Output:
```
╔════════════════════════════════════════╗
║  TindaGo Xendit Integration Tests     ║
╚════════════════════════════════════════╝

=== Testing Server Health ===
✓ Server is running on http://localhost:3000

=== Testing Invoice Creation ===
Sending request to create invoice...
✓ Invoice created successfully!
Invoice ID: inv_xxxxxxxxxxxxxxx
Invoice URL: https://checkout.xendit.co/web/inv_xxx
Commission: 1
Store Amount: 99

=== Testing Payment Status Check ===
Checking status for invoice: inv_xxx
✓ Status retrieved successfully!
Status: PENDING
Is Paid: false
Amount: 100
Currency: PHP

=== Test Summary ===
✓ All tests passed!
```

## Step 4: Test Manual Payment (Optional)

1. Copy the `Invoice URL` from the test output
2. Open it in your browser
3. You'll see the Xendit payment page (test mode)
4. Try completing a test payment

### Test Payment Methods:
- **GCash**: Use test account in Xendit dashboard
- **Credit Card**: 
  - Card: 4000 0000 0000 0002
  - CVV: 123
  - Expiry: Any future date

## Step 5: Test from Mobile App

1. Start TindaGo mobile app
2. Add items to cart
3. Go to checkout
4. Select payment method
5. Tap "Pay Now"
6. Should open Xendit payment URL
7. Complete payment
8. Order status should update

## Step 6: Configure Webhook (For Production)

When ready for production:

1. **Get your public URL** (use ngrok for testing):
   ```bash
   ngrok http 3000
   ```

2. **Go to Xendit Dashboard**:
   - https://dashboard.xendit.co/settings/developers#webhooks
   
3. **Add webhook URL**:
   ```
   https://your-domain.com/api/webhooks/xendit
   ```

4. **Add verification token header**:
   - Header: `x-callback-token`
   - Value: `tindago_webhook_secret_2024` (from your .env)

5. **Test webhook**:
   - Xendit dashboard has a "Test" button
   - Should return 200 OK

## Troubleshooting

### "Cannot connect to server"
**Fix**: Make sure `npm run dev` is running in tindago-admin

### "Missing required env: XENDIT_SECRET_KEY"
**Fix**: Restart the dev server after adding env variables

### "Xendit API error: 401"
**Fix**: Check that your API keys are valid in Xendit dashboard

### Invoice creation fails
**Fix**: 
1. Check Xendit dashboard for errors
2. Verify keys are correct (development vs production)
3. Check Firebase connection is working

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Test payment flow from mobile app
3. ✅ Configure webhook URL
4. ✅ Monitor first few transactions
5. ✅ Switch to production keys when ready

## Production Checklist

Before going live:

- [ ] Change `EXPO_PUBLIC_XENDIT_MODE=live`
- [ ] Update to production API keys
- [ ] Configure production webhook URL
- [ ] Test with small real amounts first
- [ ] Monitor Xendit dashboard
- [ ] Set up error alerts
- [ ] Document payment flow for support team
