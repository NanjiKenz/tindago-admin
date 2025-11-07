import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

export async function GET() {
  try {
    console.log('📡 Starting customers data fetch from Firebase...');

    // Fetch customers from users collection - REST API returns plain JSON
    const usersData = await fetchFirebase('users');
    const userOrders = await fetchFirebase('user_orders');

    // Handle null/empty responses
    if (!usersData || typeof usersData !== 'object') {
      return NextResponse.json({ customers: [] });
    }

    // Filter and format customers
    const customers: any[] = [];
    for (const uid of Object.keys(usersData)) {
      const user = usersData[uid];

      // Only include users with userType 'customer'
      if (user?.userType === 'customer') {
        const orders = Object.values((userOrders && userOrders[uid]) || {});

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

    console.log(`✅ Returning ${customers.length} customers`);
    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error('❌ Error in /api/admin/customers:', error);
    console.error('Stack trace:', error.stack);

    // Return empty array instead of error to allow UI to function
    return NextResponse.json({
      customers: [],
      warning: 'Failed to fetch customer data from Firebase. Check server logs for details.'
    }, { status: 200 }); // Changed to 200 to prevent UI errors
  }
}
