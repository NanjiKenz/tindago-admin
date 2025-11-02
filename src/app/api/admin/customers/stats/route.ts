import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch users and user orders
    const [usersSnap, userOrdersSnap] = await Promise.all([
      db.ref('users').get(),
      db.ref('user_orders').get(),
    ]);

    const usersData = usersSnap.exists() ? usersSnap.val() : {};
    const userOrders = userOrdersSnap.exists() ? userOrdersSnap.val() : {};

    // Filter customers and calculate stats
    let totalCustomers = 0;
    let activeCustomers = 0;
    let inactiveCustomers = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    for (const uid of Object.keys(usersData)) {
      const user = usersData[uid];

      if (user.userType === 'customer') {
        totalCustomers++;

        if (user.status === 'active') {
          activeCustomers++;
        } else if (user.status === 'inactive') {
          inactiveCustomers++;
        }

        // Count orders and revenue for this customer
        const orders = Object.values(userOrders[uid] || {}) as any[];
        totalOrders += orders.length;
        totalRevenue += orders.reduce((sum, order) => sum + (order.total || 0), 0);
      }
    }

    return NextResponse.json({
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch customer statistics' },
      { status: 500 }
    );
  }
}
