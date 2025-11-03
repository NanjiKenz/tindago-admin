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

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
