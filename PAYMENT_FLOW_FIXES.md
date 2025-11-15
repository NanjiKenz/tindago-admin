# 🔧 PAYMENT FLOW FIXES - Order ID & Customer Info

## ✅ **ISSUES FIXED**

### **Issue 1: Order ID Mismatch** 
**Problem:** App listener was using Firebase auto-generated key (`-Oe8TE5MO-thiae85KsF`), but webhook was searching by `external_id` (order number like `ORD-2025-1763242996111`).

**Solution:** 
- Invoice API now stores `order_id` (Firebase key) in metadata
- Webhook now has **3 lookup strategies** (in order):
  1. Try `metadata.order_id` (direct Firebase key lookup) ✅ **FAST**
  2. Try `indexes/invoice_to_order/{invoiceId}` (index lookup) ✅ **FAST**
  3. Try direct lookup at `orders/{orderNumber}` ✅ **MEDIUM**
  4. Fallback: Query by `orderNumber` child (slow, requires index) ⚠️ **SLOW**

**Result:** Real-time listener now receives updates correctly!

---

### **Issue 2: Missing Customer Info in Ledgers**
**Problem:** Transaction records in `ledgers/stores/{storeId}/transactions/{invoiceId}` were missing:
- Customer name
- Customer ID  
- Customer email
- Customer phone

**Solution:** Now storing customer info in **3 places**:

#### **1. Invoice Creation (`/api/payments/invoice`)**
```json
{
  "invoiceId": "6918f3f626d6bc37164cfeb4",
  "orderNumber": "ORD-2025-1763242996111",
  "amount": 113.48,
  "storeName": "RK Store",
  "customerName": "Kenji Isuga",      // ✅ NEW
  "customerEmail": "isuga@gmail.com", // ✅ NEW
  "customerPhone": "+63 912 345 6789", // ✅ NEW
  "status": "PENDING"
}
```

#### **2. Xendit Metadata**
```json
{
  "metadata": {
    "order_id": "-Oe8TE5MO-thiae85KsF",
    "order_number": "ORD-2025-1763242996111",
    "store_id": "ZJdjKsYuAggsfBiW2mX7NOF8RmB2",
    "customer_name": "Kenji Isuga",    // ✅ NEW
    "customer_email": "isuga@gmail.com", // ✅ NEW
    "customer_phone": "+63 912 345 6789" // ✅ NEW
  }
}
```

#### **3. Webhook Update (`/api/webhooks/xendit`)**
When webhook processes payment, it updates ledger with customer info:
```json
{
  "status": "PAID",
  "paidAt": "2025-11-15T21:43:26.976Z",
  "customerName": "Kenji Isuga",    // ✅ NEW (from metadata)
  "customerEmail": "isuga@gmail.com", // ✅ NEW (from metadata)
  "customerPhone": "+63 912 345 6789" // ✅ NEW (from metadata)
}
```

---

## 📊 **DATA FLOW DIAGRAM**

```
Customer Checkout
      ↓
Mobile App: createOrder()
      ↓ (orderId = Firebase key)
Admin API: POST /api/payments/invoice
      ↓
Creates invoice with:
  - external_id: ORD-2025-XXX
  - metadata.order_id: -Oe8TE5MO-thiae85KsF (Firebase key)
  - metadata.customer_name: "Kenji"
  - metadata.customer_email: "isuga@gmail.com"
      ↓
Writes to ledgers/stores/{storeId}/transactions/{invoiceId}:
  {
    customerName: "Kenji",
    customerEmail: "isuga@gmail.com",
    status: "PENDING"
  }
      ↓
Writes indexes:
  - indexes/invoice_to_store/{invoiceId}
  - indexes/invoice_to_order/{invoiceId} → { orderId: "-Oe8..." }
      ↓
Opens Xendit payment page
      ↓
Customer pays on Xendit
      ↓
Xendit Webhook → POST /api/webhooks/xendit
      ↓
Webhook receives:
  - payload.id: invoiceId
  - payload.external_id: ORD-2025-XXX
  - metadata.order_id: -Oe8TE5MO-thiae85KsF ✅
  - metadata.customer_name: "Kenji" ✅
      ↓
Updates ledger:
  {
    status: "PAID",
    paidAt: "2025-11-15...",
    customerName: "Kenji",
    customerEmail: "isuga@gmail.com"
  }
      ↓
Updates order (using metadata.order_id):
  orders/-Oe8TE5MO-thiae85KsF:
    { paymentStatus: "PAID" } ✅
      ↓
Mobile app listener detects change ✅
      ↓
Shows Order Complete Modal 🎉
```

---

## 🎯 **BENEFITS**

### **For Admin Dashboard:**
✅ **Transaction list shows customer names** (not just email)
✅ **Can filter/search by customer**
✅ **Better customer support** (know who made the purchase)
✅ **Clearer transaction records**

### **For Mobile App:**
✅ **Faster payment confirmation** (direct Firebase key lookup)
✅ **No more "order not found" errors**
✅ **Reliable real-time updates**

### **For Analytics:**
✅ **Customer purchase history**
✅ **Customer lifetime value calculation**
✅ **Segmentation by customer**

---

## 📁 **FILES MODIFIED**

1. **`tindago-admin/src/app/api/payments/invoice/route.ts`**
   - Line 88-102: Added customer fields to ledger
   - Line 73-81: Added customer info to Xendit metadata

2. **`tindago-admin/src/app/api/webhooks/xendit/route.ts`**
   - Line 48-57: Added customer fields to webhook updates

---

## 🧪 **TESTING**

### **Test Customer Info Storage:**
1. Create an order on mobile app
2. Complete payment on Xendit
3. Check Firebase Console:
   ```
   ledgers/stores/{storeId}/transactions/{invoiceId}
   ```
   Should see:
   ```json
   {
     "customerName": "Your Name",
     "customerEmail": "your@email.com",
     "customerPhone": "+63 XXX XXX XXXX"
   }
   ```

### **Test Order ID Resolution:**
1. Check webhook logs
2. Should see:
   ```
   [Webhook] Processing invoice: 6918xxx status: PAID orderNumber: ORD-2025-xxx
   ```
3. Order should update correctly (no "order not found" warnings)

---

## 🎉 **RESULT**

**Before:**
```json
{
  "invoiceId": "xxx",
  "amount": 113.48,
  "storeName": "RK Store",
  "status": "PAID"
}
```

**After:**
```json
{
  "invoiceId": "xxx",
  "amount": 113.48,
  "storeName": "RK Store",
  "customerName": "Kenji Isuga",
  "customerEmail": "isugakenji123@gmail.com",
  "customerPhone": "+63 912 345 6789",
  "status": "PAID"
}
```

**Now you can see WHO made each purchase! 🎊**
