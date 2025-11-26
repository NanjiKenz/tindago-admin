import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/purchase-orders
 *
 * Fetches all purchase orders with store and product details
 * Used by admin dashboard to monitor B2B purchase transactions
 */
export async function GET() {
  try {
    console.log('[Purchase Orders API] Fetching all purchase orders...');

    // Fetch all purchase orders
    const purchaseOrdersData = await fetchFirebase('purchase_orders');

    if (!purchaseOrdersData) {
      console.log('[Purchase Orders API] No purchase orders found');
      return NextResponse.json({ purchaseOrders: [] });
    }

    // Fetch stores for store name lookup
    const storesData = await fetchFirebase('stores');
    const storeMap: Record<string, any> = storesData || {};

    // Transform to array and enrich with store information
    const purchaseOrders: any[] = [];

    for (const [poId, poData] of Object.entries(purchaseOrdersData)) {
      const po: any = { id: poId, ...poData };

      // Add store information
      const store = storeMap[po.storeId];
      if (store) {
        po.storeInfo = {
          name: store.storeName || store.name || 'Unknown Store',
          address: store.storeAddress || store.address || '',
          ownerName: store.ownerName || '',
        };
      }

      // Calculate totals
      po.totalItems = po.items?.length || 0;
      po.totalQuantity = po.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0;

      purchaseOrders.push(po);
    }

    // Sort by creation date (newest first)
    purchaseOrders.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    console.log(`[Purchase Orders API] Returning ${purchaseOrders.length} purchase orders`);

    return NextResponse.json({
      purchaseOrders,
      count: purchaseOrders.length,
    });

  } catch (error: any) {
    console.error('[Purchase Orders API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders', details: error.message },
      { status: 500 }
    );
  }
}
