import { NextRequest } from 'next/server';
import { ref, set, get } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { roundCurrency } from '@/lib/commission';
import { requireEnv, XENDIT_SECRET_KEY, PLATFORM_COMMISSION_RATE } from '@/lib/config';
import { createInvoice } from '@/lib/xenditService';

export const runtime = 'nodejs';

interface InvoiceItem { name: string; quantity: number; price: number; }
interface CreateInvoiceBody {
  orderId?: string; // internal order key in RTDB (preferred for direct updates)
  orderNumber: string; // unique string used as external_id
  total: number;
  method: 'gcash' | 'paymaya' | 'online';
  store: { id: string; name: string; email?: string };
  customer: { email: string; name: string; phone?: string };
  items: InvoiceItem[];
}

export async function POST(req: NextRequest) {
  try {
    requireEnv('XENDIT_SECRET_KEY', XENDIT_SECRET_KEY);

    const body = (await req.json()) as CreateInvoiceBody;
    const { orderId, orderNumber, total, method, store, customer, items } = body;

    if (!orderNumber || !store?.id || !total || total <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
    }

    // Get commission rate from Firebase directly (avoid server-side fetch)
    let commissionRate = PLATFORM_COMMISSION_RATE;
    try {
      const storeRateSnap = await get(ref(database, `settings/commissions/stores/${store.id}`));
      if (storeRateSnap.exists()) {
        commissionRate = storeRateSnap.val().rate;
      } else {
        const globalRateSnap = await get(ref(database, 'settings/platform/commissionRate'));
        if (globalRateSnap.exists()) commissionRate = globalRateSnap.val();
      }
    } catch (err) {
      console.warn('[Invoice] Could not read commission from Firebase, using default:', PLATFORM_COMMISSION_RATE);
    }

    const commission = roundCurrency(total * commissionRate);
    const storeAmount = roundCurrency(total - commission);

    // Determine payment methods based on method parameter
    const paymentMethods = method === 'gcash' ? ['GCASH'] 
      : method === 'paymaya' ? ['PAYMAYA'] 
      : ['GCASH', 'PAYMAYA', 'CREDIT_CARD', 'DEBIT_CARD'];

    // Create invoice using xenditService
    const data = await createInvoice({
      externalId: orderNumber,
      amount: total,
      payerEmail: customer.email,
      description: `TindaGo Order ${orderNumber} from ${store.name}`,
      customer: {
        given_names: customer.name,
        email: customer.email,
        mobile_number: customer.phone || '',
      },
      items: items.map(i => ({ 
        name: i.name, 
        quantity: i.quantity, 
        price: i.price, 
        category: 'Groceries' 
      })),
      paymentMethods,
      fees: [{ type: 'PLATFORM_FEE', value: commission }],
      metadata: {
        order_id: orderId || undefined,
        order_number: orderNumber,
        store_id: store.id,
        store_name: store.name,
        commission,
        commission_rate: commissionRate,
        store_amount: storeAmount,
      },
    });

    // Write draft ledger row
    const invoiceId: string = data.id;
    const nowIso = new Date().toISOString();

    const ledgerRef = ref(database, `ledgers/stores/${store.id}/transactions/${invoiceId}`);
    await set(ledgerRef, {
      orderNumber,
      invoiceId,
      amount: total,
      commission,
      commissionRate,
      storeAmount,
      method,
      status: data.status || 'PENDING',
      createdAt: nowIso,
      invoiceUrl: data.invoice_url,
      expiryDate: data.expiry_date,
      storeName: store.name,
    });

    // Helpful secondary indexes
    await set(ref(database, `indexes/invoice_to_store/${invoiceId}`), { storeId: store.id, orderNumber });
    if (orderId) {
      await set(ref(database, `indexes/invoice_to_order/${invoiceId}`), { orderId, orderNumber });
    }

    return new Response(JSON.stringify({
      success: true,
      invoiceId,
      invoiceUrl: data.invoice_url,
      expiryDate: data.expiry_date,
      commission,
      storeAmount,
    }), { status: 200 });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Server error';
    console.error('[Invoice API] Error creating invoice:', e);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
