import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

/**
 * Get all transactions across all stores
 */
export async function GET() {
  try {
    // Fetch transactions from ledgers/stores - REST API returns plain JSON
    const ledgerData = await fetchFirebase('ledgers/stores');

    // Preload users once to enable name lookup by email when customerId is missing
    // This is cached for 15s by fetchFirebase, so it won't hammer RTDB.
    let usersData: Record<string, any> | null = null;

    // Handle null/empty response
    if (!ledgerData || typeof ledgerData !== 'object') {
      return NextResponse.json({ transactions: [] });
    }

    const transactions: any[] = [];
    const customerCache: Record<string, any> = {};
    const usersByEmail: Record<string, any> = {};
    const usersByLocal: Record<string, any> = {};
    const usersByPhone: Record<string, any> = {};

    // Lazy-load users only if/when we need lookups
    const ensureUsersLoaded = async () => {
      if (usersData) return;
      try {
        usersData = await fetchFirebase('users');
        if (usersData && typeof usersData === 'object') {
          // Build indexes for quick lookups
          for (const uid of Object.keys(usersData)) {
            const u = usersData[uid] || {};
            const email = (u.email || u.personalInfo?.email || '').toLowerCase();
            if (email) {
              usersByEmail[email] = { ...u, uid };
              const local = email.split('@')[0];
              if (local) usersByLocal[local] = { ...u, uid };
            }
            const phone = (u.phoneNumber || u.profile?.phone || u.personalInfo?.mobile || '').replace(/\D/g, '');
            if (phone) usersByPhone[phone] = { ...u, uid };
          }
        } else {
          usersData = {};
        }
      } catch (e) {
        console.error('Error preloading users for name resolution:', e);
        usersData = {};
      }
    };

    // Process each store's transactions
    for (const storeId of Object.keys(ledgerData)) {
      const storeData = ledgerData[storeId];
      const storeTxs = storeData.transactions || {};

      for (const invoiceId of Object.keys(storeTxs)) {
        const tx = storeTxs[invoiceId];

        // Initialize with transaction data
        let customerName = tx.customerName || '';
        let customerEmail = tx.customerEmail || '';
        let customerPhone = tx.customerPhone || '';

        // Try to fetch actual customer data if customerId exists
        if (tx.customerId) {
          // Fetch from cache or Firebase
          if (!customerCache[tx.customerId]) {
            try {
              const userData = await fetchFirebase(`users/${tx.customerId}`);
              if (userData && typeof userData === 'object') {
                customerCache[tx.customerId] = userData;
              }
            } catch (error) {
              console.error(`Error fetching customer ${tx.customerId}:`, error);
            }
          }

          // Use customer data from cache if available
          if (customerCache[tx.customerId]) {
            const user = customerCache[tx.customerId];

            // Override with actual user data (prioritize real name over stored customerName)
            if (user.name && user.name.trim()) {
              customerName = user.name;
            } else if (user.personalInfo?.name && user.personalInfo.name.trim()) {
              customerName = user.personalInfo.name;
            } else if (user.displayName && user.displayName.trim()) {
              customerName = user.displayName;
            }

            // Email
            if (user.email) {
              customerEmail = user.email;
            } else if (user.personalInfo?.email) {
              customerEmail = user.personalInfo.email;
            }

            // Phone
            if (user.phoneNumber) {
              customerPhone = user.phoneNumber;
            } else if (user.profile?.phone) {
              customerPhone = user.profile.phone;
            } else if (user.personalInfo?.mobile) {
              customerPhone = user.personalInfo.mobile;
            } else if (user.phone) {
              customerPhone = user.phone;
            }
          } else {
            // customerId exists but didn't match a real user (many ledgers store local-part here)
            // Fall back to users lookup by email/local-part
            await ensureUsersLoaded();
            const emailKey = (customerEmail || '').toLowerCase();
            if (emailKey && usersByEmail[emailKey]) {
              const u = usersByEmail[emailKey];
              customerName = u.name || u.personalInfo?.name || u.displayName || customerName;
              if (!customerPhone) {
                customerPhone = u.phoneNumber || u.profile?.phone || u.personalInfo?.mobile || customerPhone;
              }
            } else {
              const local = String(tx.customerId).toLowerCase();
              const u = usersByLocal[local];
              if (u) {
                customerName = u.name || u.personalInfo?.name || u.displayName || customerName;
                if (!customerPhone) {
                  customerPhone = u.phoneNumber || u.profile?.phone || u.personalInfo?.mobile || customerPhone;
                }
                if (!customerEmail) customerEmail = u.email || u.personalInfo?.email || customerEmail;
              }
            }
          }
        } else if (customerEmail) {
          // No customerId but we have an email — try to resolve name via users collection
          await ensureUsersLoaded();
          const emailKey = customerEmail.toLowerCase();
          const byEmail = usersByEmail[emailKey];
          if (byEmail) {
            if (byEmail.name && byEmail.name.trim()) {
              customerName = byEmail.name;
            } else if (byEmail.personalInfo?.name && byEmail.personalInfo.name.trim()) {
              customerName = byEmail.personalInfo.name;
            } else if (byEmail.displayName && byEmail.displayName.trim()) {
              customerName = byEmail.displayName;
            }
            if (!customerPhone) {
              customerPhone = byEmail.phoneNumber || byEmail.profile?.phone || byEmail.personalInfo?.mobile || customerPhone;
            }
          } else {
            // Maybe the ledger stored only the local-part (before @)
            const local = emailKey.split('@')[0];
            const byLocal = usersByLocal[local];
            if (byLocal) {
              if (byLocal.name && byLocal.name.trim()) {
                customerName = byLocal.name;
              } else if (byLocal.personalInfo?.name && byLocal.personalInfo.name.trim()) {
                customerName = byLocal.personalInfo.name;
              } else if (byLocal.displayName && byLocal.displayName.trim()) {
                customerName = byLocal.displayName;
              }
              if (!customerPhone) {
                customerPhone = byLocal.phoneNumber || byLocal.profile?.phone || byLocal.personalInfo?.mobile || customerPhone;
              }
            }
          }
        } else if (customerName && !customerName.includes(' ')) {
          // If we only have a username-like value (e.g., 'isugakenji123'), try matching as email local-part
          await ensureUsersLoaded();
          const byLocal = usersByLocal[customerName.toLowerCase()];
          if (byLocal) {
            if (byLocal.name && byLocal.name.trim()) {
              customerName = byLocal.name;
            } else if (byLocal.personalInfo?.name && byLocal.personalInfo.name.trim()) {
              customerName = byLocal.personalInfo.name;
            } else if (byLocal.displayName && byLocal.displayName.trim()) {
              customerName = byLocal.displayName;
            }
            if (!customerPhone) {
              customerPhone = byLocal.phoneNumber || byLocal.profile?.phone || byLocal.personalInfo?.mobile || customerPhone;
            }
          }
        } else if (customerPhone) {
          // Last resort: phone match
          await ensureUsersLoaded();
          const normalized = String(customerPhone).replace(/\D/g, '');
          const byPhone = usersByPhone[normalized];
          if (byPhone) {
            customerName = byPhone.name || byPhone.personalInfo?.name || byPhone.displayName || customerName;
          }
        }

        transactions.push({
          id: invoiceId,
          invoiceId,
          orderNumber: tx.orderNumber || '',
          storeId,
          storeName: tx.storeName || '',
          amount: Number(tx.amount || 0),
          commission: Number(tx.commission || 0),
          commissionRate: Number(tx.commissionRate || 0),
          storeAmount: Number(tx.storeAmount || 0),
          method: tx.method || '',
          status: (tx.status || 'PENDING').toString(),
          paymentStatus: (tx.paymentStatus || 'pending') as 'pending' | 'paid' | 'refunded',
          createdAt: tx.createdAt || '',
          paidAt: tx.paidAt,
          invoiceUrl: tx.invoiceUrl,
          customerId: tx.customerId,
          customerName,
          customerEmail,
          customerPhone,
        });
      }
    }

    // Sort by creation date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 200 }
    );
  }
}
