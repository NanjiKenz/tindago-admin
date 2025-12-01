import { NextRequest, NextResponse } from 'next/server';
import { ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { createInvoice } from '@/lib/xenditService';
import { requireEnv, XENDIT_SECRET_KEY } from '@/lib/config';

// Ensure Xendit secret key is configured at runtime
requireEnv('XENDIT_SECRET_KEY', XENDIT_SECRET_KEY);

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
    console.log('[Purchase Order Payment] Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!purchaseOrderId || !purchaseOrderNumber || !total || !method || !store) {
      console.error('[Purchase Order Payment] Missing required fields:', {
        purchaseOrderId: !!purchaseOrderId,
        purchaseOrderNumber: !!purchaseOrderNumber,
        total: !!total,
        method: !!method,
        store: !!store,
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!storeOwner || !storeOwner.email || !storeOwner.name || !storeOwner.phone) {
      console.error('[Purchase Order Payment] Invalid storeOwner data:', storeOwner);
      return NextResponse.json(
        { success: false, error: 'Missing or invalid storeOwner information (email, name, phone required)' },
        { status: 400 }
      );
    }

    // Determine Xendit payment methods based on selected method (gcash/paymaya)
    const paymentMethods = method === 'gcash'
      ? ['GCASH']
      : method === 'paymaya'
        ? ['PAYMAYA']
        : ['GCASH', 'PAYMAYA'];

    // Create Xendit invoice for B2B payment tracking (store owner -> supplier)
    console.log('[Purchase Order Payment] Calling Xendit API with:', {
      externalId: `PO-${purchaseOrderId}`,
      amount: total,
      payerEmail: storeOwner.email,
      mobileNumber: storeOwner.phone,
      paymentMethods,
      items,
    });

    const invoice = await createInvoice({
      externalId: `PO-${purchaseOrderId}`,
      amount: total,
      payerEmail: storeOwner.email,
      description: `Purchase Order ${purchaseOrderNumber} - Supplier: ${supplierName || 'N/A'}`,
      customer: {
        given_names: storeOwner.name,
        email: storeOwner.email,
        mobile_number: storeOwner.phone,
      },
      items: items?.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: 'Inventory Purchase',
      })) || [],
      paymentMethods,
      successRedirectUrl: `tindago://purchase-details?purchaseOrderId=${purchaseOrderId}&payment=success`,
      failureRedirectUrl: `tindago://purchase-details?purchaseOrderId=${purchaseOrderId}&payment=failed`,
      currency: 'PHP',
      invoiceDuration: 86400,
      metadata: {
        purchase_order_id: purchaseOrderId,
        purchase_order_number: purchaseOrderNumber,
        store_id: store.id,
        store_name: store.name,
        supplier_name: supplierName || 'N/A',
        method,
        type: 'purchase_order',
      },
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
      method,
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
    console.error('[Purchase Order Payment] Error:', error);
    console.error('[Purchase Order Payment] Error message:', error.message);
    console.error('[Purchase Order Payment] Error response:', error.response?.data);
    console.error('[Purchase Order Payment] Error status:', error.response?.status);
    
    // Extract detailed error message from Xendit response
    let errorMessage = error.message || 'Unknown error';
    if (error.response?.data) {
      const xenditError = error.response.data;
      if (xenditError.error_code) {
        errorMessage = `${xenditError.error_code}: ${xenditError.message || errorMessage}`;
      } else if (xenditError.message) {
        errorMessage = xenditError.message;
      }
      console.error('[Purchase Order Payment] Xendit error details:', JSON.stringify(xenditError));
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
