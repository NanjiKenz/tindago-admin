import { NextRequest, NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/purchase-orders/[id]
 *
 * Fetches a single purchase order with full details
 * @param id - Purchase order Firebase key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Purchase order ID is required' },
        { status: 400 }
      );
    }

    console.log(`[Purchase Order Details API] Fetching purchase order: ${id}`);

    // Fetch the specific purchase order
    const purchaseOrder = await fetchFirebase(`purchase_orders/${id}`);

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Enrich with store information
    if (purchaseOrder.storeId) {
      const store = await fetchFirebase(`stores/${purchaseOrder.storeId}`);
      if (store) {
        purchaseOrder.storeInfo = {
          name: store.storeName || store.name || 'Unknown Store',
          address: store.storeAddress || store.address || '',
          ownerName: store.ownerName || '',
          phone: store.phone || store.phoneNumber || '',
        };
      }
    }

    // Enrich with product details
    if (purchaseOrder.items && purchaseOrder.items.length > 0) {
      const enrichedItems = [];

      for (const item of purchaseOrder.items) {
        const enrichedItem = { ...item };

        // Optionally fetch current product data
        if (item.productId) {
          try {
            const product = await fetchFirebase(`products/${item.productId}`);
            if (product) {
              enrichedItem.currentStock = product.quantity || 0;
              enrichedItem.productStatus = product.status || 'unknown';
            }
          } catch (err) {
            console.warn(`Could not fetch product ${item.productId}:`, err);
          }
        }

        enrichedItems.push(enrichedItem);
      }

      purchaseOrder.items = enrichedItems;
    }

    // Add computed fields
    purchaseOrder.id = id;
    purchaseOrder.totalItems = purchaseOrder.items?.length || 0;
    purchaseOrder.totalQuantity = purchaseOrder.items?.reduce(
      (sum: number, item: any) => sum + (item.quantity || 0),
      0
    ) || 0;

    // Fetch payment ledger if exists
    if (purchaseOrder.paymentInfo?.invoiceId) {
      try {
        const ledger = await fetchFirebase(
          `ledgers/purchase_orders/${purchaseOrder.storeId}/transactions/${purchaseOrder.paymentInfo.invoiceId}`
        );
        if (ledger) {
          purchaseOrder.paymentLedger = ledger;
        }
      } catch (err) {
        console.warn('Could not fetch payment ledger:', err);
      }
    }

    console.log(`[Purchase Order Details API] Returning purchase order: ${id}`);

    return NextResponse.json({ purchaseOrder });

  } catch (error: any) {
    console.error('[Purchase Order Details API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase order', details: error.message },
      { status: 500 }
    );
  }
}
