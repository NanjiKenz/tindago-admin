import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

export async function GET() {
  try {
    const db = getAdminDb();

    const [adminsSnap, usersSnap, userOrdersSnap, verificationsSnap, metricsSnap] = await Promise.all([
      db.ref('admins').get(),
      db.ref('users').get(),
      db.ref('user_orders').get(),
      db.ref('business_verifications').get(),
      db.ref('store_metrics').get(),
    ]);

    const adminsData = adminsSnap.exists() ? adminsSnap.val() : {};
    const usersData = usersSnap.exists() ? usersSnap.val() : {};
    const userOrders = userOrdersSnap.exists() ? userOrdersSnap.val() : {};
    const verifications = verificationsSnap.exists() ? verificationsSnap.val() : {};
    const metrics = metricsSnap.exists() ? metricsSnap.val() : {};

    const admins: any[] = Object.keys(adminsData).map((uid) => ({ userId: uid, ...adminsData[uid] }));

    const customers: any[] = [];
    const storeOwners: any[] = [];
    for (const uid of Object.keys(usersData)) {
      const u = usersData[uid] || {};
      if (u.userType === 'customer') {
        const orders = Object.values(userOrders[uid] || {});
        customers.push({
          userId: uid,
          email: u.personalInfo?.email || u.email || '',
          displayName: u.personalInfo?.name || u.displayName || u.name || 'Unknown User',
          phone: u.personalInfo?.mobile || u.phone || '',
          address: u.personalInfo?.address || u.address || '',
          status: u.status || 'active',
          createdAt: u.createdAt,
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
        const verification = verifications[uid] || { status: 'pending' };
        const perf = metrics[uid] || { totalSales: 0, totalOrders: 0, rating: 0, responseTime: 0 };
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
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
          avatar: u.avatar,
          userType: u.userType,
          stores: Object.values((usersData.user_stores || {})[uid] || {}),
          businessVerification: verification,
          performanceMetrics: perf,
        });
      }
    }

    // Sorts
    admins.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    customers.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    storeOwners.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ admins, customers, storeOwners });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}