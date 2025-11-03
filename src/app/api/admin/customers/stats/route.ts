import { NextResponse } from 'next/server';



// Helper function to fetch from Firebase REST API
async function fetchFirebase(path: string) {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const url = `${dbUrl}/${path}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch from Firebase');
  return res.json();
}

export async function GET() {
  try {
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
