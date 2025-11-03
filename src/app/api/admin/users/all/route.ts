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
    // Fetch all data using REST API - returns plain JSON (null if no data)
    const [adminsData, usersData, userOrders, verifications, metrics] = await Promise.all([
      fetchFirebase('admins'),
      fetchFirebase('users'),
      fetchFirebase('user_orders'),
      fetchFirebase('business_verifications'),
      fetchFirebase('store_metrics'),
    ]);

    // Handle null/empty responses and format admin data properly
    const admins: any[] = adminsData && typeof adminsData === 'object'
      ? Object.keys(adminsData).map((uid) => {
          const admin = adminsData[uid];
          return {
            userId: uid,
            email: admin.email || '',
            displayName: admin.displayName || admin.name || 'Admin User',
            role: admin.role || 'admin',
            status: admin.status || 'active',
            createdAt: admin.createdAt || new Date().toISOString(),
            lastLogin: admin.lastLogin,
            lastLoginAt: admin.lastLoginAt,
          };
        })
      : [];

    const customers: any[] = [];
    const storeOwners: any[] = [];

    if (usersData && typeof usersData === 'object') {
      for (const uid of Object.keys(usersData)) {
        const u = usersData[uid] || {};
        if (u.userType === 'customer') {
          const orders = Object.values((userOrders && userOrders[uid]) ? userOrders[uid] : {});
          customers.push({
            userId: uid,
            email: u.personalInfo?.email || u.email || '',
            displayName: u.personalInfo?.name || u.displayName || u.name || 'Unknown User',
            phone: u.personalInfo?.mobile || u.phone || '',
            address: u.personalInfo?.address || u.address || '',
            status: u.status || 'active',
            createdAt: u.createdAt || new Date().toISOString(),
            lastLoginAt: u.lastLoginAt,
            totalOrders: orders.length,
            totalSpent: (orders as any[]).reduce((s, o: any) => s + (o.total || 0), 0),
            avatar: u.avatar,
            verificationStatus: u.verificationStatus || 'unverified',
            userType: u.userType,
            storeOwnership: { hasStore: false },
          });
        }
        if (u.userType === 'store_owner') {
          const verification = (verifications && verifications[uid]) ? verifications[uid] : { status: 'pending' };
          const perf = (metrics && metrics[uid]) ? metrics[uid] : { totalSales: 0, totalOrders: 0, rating: 0, responseTime: 0 };
          const businessAddress = u.businessInfo?.address;
          const businessCity = u.businessInfo?.city;
          const legacyAddress = u.address;
          const address = businessAddress && businessCity ? `${businessAddress}, ${businessCity}` : (businessAddress || legacyAddress || '');
          storeOwners.push({
            userId: uid,
            email: u.personalInfo?.email || u.email || '',
            displayName: u.personalInfo?.name || u.displayName || u.name || 'Unknown Owner',
            phone: u.personalInfo?.mobile || u.phone || '',
            address,
            status: u.status || 'active',
            createdAt: u.createdAt || new Date().toISOString(),
            lastLoginAt: u.lastLoginAt,
            avatar: u.avatar,
            userType: u.userType,
            stores: Object.values((usersData.user_stores || {})[uid] || {}),
            businessVerification: verification,
            performanceMetrics: perf,
          });
        }
      }
    }

    // Sorts - safely handle missing createdAt
    admins.sort((a,b)=> {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    customers.sort((a,b)=> {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    storeOwners.sort((a,b)=> {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ admins, customers, storeOwners });
  } catch (e: any) {
    console.error('Error in /api/admin/users/all:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}