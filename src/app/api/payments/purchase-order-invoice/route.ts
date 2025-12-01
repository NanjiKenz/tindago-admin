import { NextRequest, NextResponse } from 'next/server';
import Xendit from 'xendit-node';
import { ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      purchaseOrderId,
      purchaseOrderNumber,
      total,
      method,
      store,
      storeOwner,
      supplierName,
      items,
    } = body;

    console.log('[Purchase Order Payment] Creating invoice:', purchaseOrderNumber);

    // Validate required fields
    if (!purchaseOrderId || !purchaseOrderNumber || !total || !method || !store || !storeOwner) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Xendit invoice for B2B payment tracking
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId: `PO-${purchaseOrderId}`,
        amount: total,
        payerEmail: storeOwner.email,
        description: `Purchase Order ${purchaseOrderNumber} - Supplier: ${supplierName}`,
        invoiceDuration: 86400, // 24 hours
        successRedirectUrl: `tindago://purchase-details?purchaseOrderId=${purchaseOrderId}&payment=success`,
        failureRedirectUrl: `tindago://purchase-details?purchaseOrderId=${purchaseOrderId}&payment=failed`,
        currency: 'PHP',
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: 'Inventory Purchase',
        })),
        customer: {
          given_names: storeOwner.name,
          email: storeOwner.email,
          mobile_number: storeOwner.phone,
        },
        customerNotificationPreference: {
          invoice_created: ['email'],
          invoice_reminder: ['email'],
          invoice_paid: ['email'],
          invoice_expired: ['email'],
        },
        paymentMethods: [method.toUpperCase()],
        metadata: {
          purchase_order_id: purchaseOrderId,
          purchase_order_number: purchaseOrderNumber,
          store_id: store.id,
          store_name: store.name,
          supplier_name: supplierName,
          method: method,
        },
      }
    });

    console.log('[Purchase Order Payment] Invoice created:', invoice.id);

    // Create index for webhook lookup
    await set(ref(database, `indexes/invoice_to_purchase_order/${invoice.id}`), {
      purchaseOrderId,
      storeId: store.id,
      createdAt: new Date().toISOString(),
    });

    // Create ledger entry
    await set(ref(database, `ledgers/purchase_orders/${store.id}/transactions/${invoice.id}`), {
      invoiceId: invoice.id,
      purchaseOrderId,
      purchaseOrderNumber,
      amount: total,
      method: method,
      status: 'PENDING',
      supplierName,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      expiryDate: invoice.expiry_date,
    });
  } catch (error: any) {
    console.error('[Purchase Order Payment] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
