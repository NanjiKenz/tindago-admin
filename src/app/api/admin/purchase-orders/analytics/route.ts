import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/purchase-orders/analytics
 *
 * Provides analytics dashboard data for purchase orders
 * - Total purchase orders count
 * - Total amount spent (all orders)
 * - Payment status breakdown (paid vs unpaid)
 * - Payment method distribution
 * - Top stores by purchase volume
 * - Top suppliers by order count
 * - Recent purchase activity (last 30 days)
 * - Average order value
 */
export async function GET() {
  try {
    console.log('[Purchase Orders Analytics API] Generating analytics...');

    // Fetch all purchase orders
    const purchaseOrdersData = await fetchFirebase('purchase_orders');

    if (!purchaseOrdersData) {
      console.log('[Purchase Orders Analytics API] No purchase orders found');
      return NextResponse.json({
        totalOrders: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        paymentStatusBreakdown: { paid: 0, unpaid: 0, pending: 0 },
        paymentMethodBreakdown: {},
        topStores: [],
        topSuppliers: [],
        recentActivity: [],
        averageOrderValue: 0,
      });
    }

    // Fetch stores for store name lookup
    const storesData = await fetchFirebase('stores');
    const storeMap: Record<string, any> = storesData || {};

    // Initialize analytics counters
    let totalOrders = 0;
    let totalAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;

    const paymentStatusBreakdown: Record<string, number> = {
      paid: 0,
      unpaid: 0,
      pending: 0,
    };

    const paymentMethodBreakdown: Record<string, number> = {};
    const storeVolume: Record<string, { name: string; amount: number; count: number }> = {};
    const supplierCounts: Record<string, number> = {};
    const recentActivity: any[] = [];

    // Process each purchase order
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const [poId, poData] of Object.entries(purchaseOrdersData)) {
      const po: any = poData;
      totalOrders++;

      const orderAmount = po.totalCost || 0;
      totalAmount += orderAmount;

      // Payment status
      const status = po.paymentStatus || 'pending';
      paymentStatusBreakdown[status] = (paymentStatusBreakdown[status] || 0) + 1;

      if (status === 'paid') {
        paidAmount += orderAmount;
      } else {
        unpaidAmount += orderAmount;
      }

      // Payment method
      const method = po.paymentMethod || 'unknown';
      paymentMethodBreakdown[method] = (paymentMethodBreakdown[method] || 0) + 1;

      // Store volume
      const storeId = po.storeId;
      const storeName = storeMap[storeId]?.storeName || storeMap[storeId]?.name || 'Unknown Store';

      if (!storeVolume[storeId]) {
        storeVolume[storeId] = { name: storeName, amount: 0, count: 0 };
      }
      storeVolume[storeId].amount += orderAmount;
      storeVolume[storeId].count += 1;

      // Supplier counts
      const supplier = po.supplierName || 'Unknown';
      supplierCounts[supplier] = (supplierCounts[supplier] || 0) + 1;

      // Recent activity (last 30 days)
      const createdDate = new Date(po.createdAt);
      if (createdDate >= thirtyDaysAgo) {
        recentActivity.push({
          id: poId,
          purchaseOrderNumber: po.purchaseOrderNumber,
          storeName,
          supplierName: po.supplierName,
          amount: orderAmount,
          paymentStatus: status,
          paymentMethod: method,
          createdAt: po.createdAt,
        });
      }
    }

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // Top stores by purchase volume (top 10)
    const topStores = Object.entries(storeVolume)
      .map(([storeId, data]) => ({
        storeId,
        storeName: data.name,
        totalAmount: data.amount,
        orderCount: data.count,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    // Top suppliers by order count (top 10)
    const topSuppliers = Object.entries(supplierCounts)
      .map(([supplier, count]) => ({
        supplierName: supplier,
        orderCount: count,
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);

    // Sort recent activity by date (newest first)
    recentActivity.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const analytics = {
      totalOrders,
      totalAmount: Math.round(totalAmount * 100) / 100,
      paidAmount: Math.round(paidAmount * 100) / 100,
      unpaidAmount: Math.round(unpaidAmount * 100) / 100,
      paymentStatusBreakdown,
      paymentMethodBreakdown,
      topStores,
      topSuppliers,
      recentActivity: recentActivity.slice(0, 20), // Limit to 20 recent orders
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };

    console.log('[Purchase Orders Analytics API] Analytics generated successfully');

    return NextResponse.json(analytics);

  } catch (error: any) {
    console.error('[Purchase Orders Analytics API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics', details: error.message },
      { status: 500 }
    );
  }
}
