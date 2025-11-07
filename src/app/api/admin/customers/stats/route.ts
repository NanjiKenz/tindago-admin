import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

export async function GET() {
  try {
    console.log('📡 Starting customer stats fetch from Firebase...');

    // Fetch users and user orders - REST API returns plain JSON
    const [usersData, userOrders] = await Promise.all([
      fetchFirebase('users'),
      fetchFirebase('user_orders'),
    ]);

    // Handle null/empty responses
    if (!usersData || typeof usersData !== 'object') {
      return NextResponse.json({
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      });
    }

    // Filter customers and calculate stats
    let totalCustomers = 0;
    let activeCustomers = 0;
    let inactiveCustomers = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    for (const uid of Object.keys(usersData)) {
      const user = usersData[uid];

      if (user?.userType === 'customer') {
        totalCustomers++;

        if (user.status === 'active') {
          activeCustomers++;
        } else if (user.status === 'inactive') {
          inactiveCustomers++;
        }

        // Count orders and revenue for this customer
        const orders = Object.values((userOrders && userOrders[uid]) || {}) as any[];
        totalOrders += orders.length;
        totalRevenue += orders.reduce((sum, order) => sum + (order.total || 0), 0);
      }
    }

    console.log(`✅ Returning customer stats: ${totalCustomers} customers, ${totalOrders} orders`);
    return NextResponse.json({
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    });
  } catch (error: any) {
    console.error('❌ Error in /api/admin/customers/stats:', error);
    console.error('Stack trace:', error.stack);

    // Return zeros instead of error to allow UI to function
    return NextResponse.json({
      totalCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      warning: 'Failed to fetch customer stats from Firebase. Check server logs for details.'
    }, { status: 200 }); // Changed to 200 to prevent UI errors
  }
}
