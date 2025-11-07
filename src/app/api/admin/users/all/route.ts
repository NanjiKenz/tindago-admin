import { NextResponse } from 'next/server';

// Helper function to fetch from Firebase REST API with retry logic
async function fetchFirebase(path: string, retries = 3) {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  // Validate database URL
  if (!dbUrl) {
    console.error('❌ NEXT_PUBLIC_FIREBASE_DATABASE_URL is not defined');
    throw new Error('Firebase database URL not configured');
  }

  const url = `${dbUrl}/${path}.json`;
  console.log(`🔄 Fetching: ${path} from ${url}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
        // Add keep-alive and connection options
        next: { revalidate: 0 } // Disable caching
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`✅ Successfully fetched: ${path}`);
      return data;

    } catch (error: any) {
      console.error(`❌ Attempt ${attempt}/${retries} failed for ${path}:`, error.message);

      if (attempt === retries) {
        // Last attempt failed
        if (error.name === 'AbortError') {
          throw new Error(`Timeout fetching ${path} after 15 seconds`);
        }
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error(`Failed to fetch ${path} after ${retries} attempts`);
}

export async function GET() {
  try {
    console.log('📡 Starting user data fetch from Firebase...');

    // Fetch all data using REST API with individual error handling
    let adminsData = null;
    let usersData = null;
    let userOrders = null;
    let verifications = null;
    let metrics = null;

    try {
      const results = await Promise.allSettled([
        fetchFirebase('admins'),
        fetchFirebase('users'),
        fetchFirebase('user_orders'),
        fetchFirebase('business_verifications'),
        fetchFirebase('store_metrics'),
      ]);

      adminsData = results[0].status === 'fulfilled' ? results[0].value : null;
      usersData = results[1].status === 'fulfilled' ? results[1].value : null;
      userOrders = results[2].status === 'fulfilled' ? results[2].value : null;
      verifications = results[3].status === 'fulfilled' ? results[3].value : null;
      metrics = results[4].status === 'fulfilled' ? results[4].value : null;

      // Log any failures
      results.forEach((result, index) => {
        const paths = ['admins', 'users', 'user_orders', 'business_verifications', 'store_metrics'];
        if (result.status === 'rejected') {
          console.error(`⚠️  Failed to fetch ${paths[index]}:`, result.reason);
        }
      });

    } catch (error) {
      console.error('❌ Critical error during parallel fetch:', error);
      // Continue with null data - will return empty arrays
    }

    // Handle null/empty responses and format admin data properly
    // IMPORTANT: admins collection has metadata (status, lastLogin), users collection has profile data (email, name)
    let admins: any[] = [];

    if (adminsData && typeof adminsData === 'object') {
      // Admins collection exists - JOIN with users collection to get email/name
      console.log(`📋 Found ${Object.keys(adminsData).length} admin(s) in admins collection, joining with users data...`);
      admins = Object.keys(adminsData).map((uid) => {
        const adminMetadata = adminsData[uid];
        const userData = usersData && usersData[uid] ? usersData[uid] : null;

        console.log(`📧 Processing admin ${uid}:`, {
          hasUserData: !!userData,
          email: userData?.email || '(not found in users collection)',
          name: userData?.name || '(not found)',
        });

        return {
          userId: uid,
          email: userData?.email || userData?.personalInfo?.email || '',
          displayName: userData?.name || userData?.displayName || userData?.personalInfo?.name || 'Admin User',
          role: userData?.role || 'admin',
          status: adminMetadata.status || 'active',
          createdAt: userData?.createdAt || new Date().toISOString(),
          lastLogin: adminMetadata.lastLogin,
          lastLoginAt: adminMetadata.lastLoginAt,
        };
      });
    } else if (usersData && typeof usersData === 'object') {
      // Fallback: Filter admins from users collection by role or userType
      console.log('⚠️  No "admins" collection found, filtering from "users" collection');
      admins = Object.keys(usersData)
        .filter(uid => {
          const user = usersData[uid];
          // Check if user is admin by role, userType, or isAdmin flag
          return user?.role === 'admin' ||
                 user?.userType === 'admin' ||
                 user?.isAdmin === true ||
                 user?.role === 'super_admin';
        })
        .map(uid => {
          const user = usersData[uid];
          return {
            userId: uid,
            email: user.email || user.personalInfo?.email || '',
            displayName: user.displayName || user.name || user.personalInfo?.name || 'Admin User',
            role: user.role || 'admin',
            status: user.status || 'active',
            createdAt: user.createdAt || new Date().toISOString(),
            lastLogin: user.lastLogin,
            lastLoginAt: user.lastLoginAt,
          };
        });
      console.log(`ℹ️  Found ${admins.length} admins in users collection`);
    }

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

    console.log(`✅ Returning data: ${admins.length} admins, ${customers.length} customers, ${storeOwners.length} store owners`);
    return NextResponse.json({ admins, customers, storeOwners });
  } catch (e: any) {
    console.error('❌ Error in /api/admin/users/all:', e);
    console.error('Stack trace:', e.stack);

    // Return empty arrays instead of error to allow UI to function
    return NextResponse.json({
      admins: [],
      customers: [],
      storeOwners: [],
      warning: 'Failed to fetch data from Firebase. Check server logs for details.'
    }, { status: 200 }); // Changed to 200 to prevent UI errors
  }
}