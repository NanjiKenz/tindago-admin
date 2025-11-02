import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch customers from users collection
    const usersSnap = await db.ref('users').get();
    const usersData = usersSnap.exists() ? usersSnap.val() : {};

    // Fetch user orders
    const userOrdersSnap = await db.ref('user_orders').get();
    const userOrders = userOrdersSnap.exists() ? userOrdersSnap.val() : {};

    // Filter and format customers
    const customers: any[] = [];
    for (const uid of Object.keys(usersData)) {
      const user = usersData[uid];

      // Only include users with userType 'customer'
      if (user.userType === 'customer') {
        const orders = Object.values(userOrders[uid] || {});

        customers.push({
          userId: uid,
          email: user.personalInfo?.email || user.email || '',
          displayName: user.personalInfo?.name || user.displayName || user.name || 'Unknown User',
          phone: user.personalInfo?.mobile || user.phone || '',
          address: user.personalInfo?.address || user.address || '',
          status: user.status || 'active',
          createdAt: user.createdAt || new Date().toISOString(),
          lastLoginAt: user.lastLoginAt,
          totalOrders: orders.length,
          totalSpent: (orders as any[]).reduce((sum, order: any) => sum + (order.total || 0), 0),
          avatar: user.avatar,
          verificationStatus: user.verificationStatus || 'unverified',
          userType: user.userType,
        });
      }
    }

    // Sort by creation date (newest first)
    customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
