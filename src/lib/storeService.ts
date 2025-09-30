/**
 * Store Service
 *
 * Firebase service for managing stores in TindaGo admin dashboard
 * Extends AdminService patterns for consistency with store-specific operations
 */

import { database } from './firebase.js';
import { ref, get, set, update, onValue, off } from 'firebase/database';
import { Store, StoreStats, StoreFilter } from '@/types/storeManagement';
import { AdminService, StoreRegistration } from './adminService';

export class StoreService {
  /**
   * Get all stores with enhanced data
   */
  static async getAllStores(): Promise<Store[]> {
    try {
      const storesRef = ref(database, 'stores');
      const snapshot = await get(storesRef);

      console.log('🔍 [getAllStores] Fetching stores from Firebase...');

      if (snapshot.exists()) {
        const data = snapshot.val();
        const stores: Store[] = [];

        console.log(`📊 [getAllStores] Found ${Object.keys(data).length} stores in 'stores' collection`);

        for (const storeId of Object.keys(data)) {
          const storeData = data[storeId];

          // Get additional store data
          const [ordersSnapshot, verificationSnapshot, subscriptionSnapshot] = await Promise.all([
            get(ref(database, `store_orders/${storeId}`)),
            get(ref(database, `store_verifications/${storeId}`)),
            get(ref(database, `store_subscriptions/${storeId}`))
          ]);

          const orders = ordersSnapshot.exists() ? Object.values(ordersSnapshot.val()) : [];
          const verification = verificationSnapshot.exists() ? verificationSnapshot.val() : null;
          const subscription = subscriptionSnapshot.exists() ? subscriptionSnapshot.val() : null;

          // Extract data with proper fallbacks matching React Native app fields
          // Store Name: Priority order - storeName > businessName > name
          const storeName = storeData.storeName ||
                           storeData.businessName ||
                           storeData.name ||
                           'Unknown Store';

          // Owner Name: Priority order - ownerName > name > owner > displayName
          const ownerName = storeData.ownerName ||
                           storeData.name ||
                           storeData.owner ||
                           storeData.displayName ||
                           'Unknown Owner';

          // Email: Priority order - email > ownerEmail
          const ownerEmail = storeData.email ||
                            storeData.ownerEmail ||
                            storeData.personalEmail ||
                            '';

          // Phone: Priority order - phone > ownerPhone > mobile
          const ownerPhone = storeData.phone ||
                            storeData.ownerPhone ||
                            storeData.mobile ||
                            '';

          // Address: Combine address + city from React Native app registration
          const address = storeData.address && storeData.city
                           ? `${storeData.address}, ${storeData.city}`
                           : storeData.address ||
                             (storeData.storeAddress && storeData.city
                               ? `${storeData.storeAddress}, ${storeData.city}`
                               : '') ||
                             storeData.storeAddress ||
                             storeData.city ||
                             storeData.location ||
                             storeData.businessAddress ||
                             '';

          const store: Store = {
            storeId,
            storeName,
            ownerName,
            ownerEmail,
            ownerPhone,
            address,
            status: storeData.status || 'active',
            joinedDate: storeData.joinedDate || storeData.createdAt || storeData.approvedAt || new Date().toISOString(),
            lastActiveAt: storeData.lastActiveAt,
            businessHours: storeData.businessHours,
            documents: storeData.documents,
            businessVerification: verification ? {
              status: verification.status || 'pending',
              verifiedAt: verification.verifiedAt,
              notes: verification.notes
            } : { status: 'pending' },
            performanceMetrics: {
              totalSales: (orders as Record<string, unknown>[]).reduce((sum: number, order: Record<string, unknown>) => sum + ((order.total as number) || 0), 0),
              totalOrders: orders.length,
              rating: storeData.rating || 4.5,
              responseTime: storeData.responseTime || 15
            },
            locationCoordinates: storeData.locationCoordinates,
            storeCategory: storeData.storeCategory || storeData.category,
            storeDescription: storeData.storeDescription || storeData.description,
            subscriptionStatus: subscription?.plan || 'free',
            subscriptionExpiry: subscription?.endDate
          };

          stores.push(store);
        }

        console.log(`✅ [getAllStores] Successfully loaded ${stores.length} stores`);
        console.log(`📊 [getAllStores] Status breakdown:`, {
          active: stores.filter(s => s.status === 'active').length,
          pending: stores.filter(s => s.status === 'pending').length,
          suspended: stores.filter(s => s.status === 'suspended').length,
          rejected: stores.filter(s => s.status === 'rejected').length
        });

        return stores.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
      }

      console.log('⚠️ [getAllStores] No stores found in Firebase');
      return [];
    } catch (error) {
      console.error('❌ [getAllStores] Error fetching stores:', error);
      throw error;
    }
  }

  /**
   * Get store by ID with detailed information
   */
  static async getStoreById(storeId: string): Promise<Store | null> {
    try {
      const storeRef = ref(database, `stores/${storeId}`);
      const snapshot = await get(storeRef);

      if (snapshot.exists()) {
        const storeData = snapshot.val();

        // Get additional store data
        const [ordersSnapshot, verificationSnapshot, subscriptionSnapshot] = await Promise.all([
          get(ref(database, `store_orders/${storeId}`)),
          get(ref(database, `store_verifications/${storeId}`)),
          get(ref(database, `store_subscriptions/${storeId}`))
        ]);

        const orders = ordersSnapshot.exists() ? Object.values(ordersSnapshot.val()) : [];
        const verification = verificationSnapshot.exists() ? verificationSnapshot.val() : null;
        const subscription = subscriptionSnapshot.exists() ? subscriptionSnapshot.val() : null;

        // Extract data with proper fallbacks matching React Native app fields
        const storeName = storeData.storeName ||
                         storeData.businessName ||
                         storeData.name ||
                         'Unknown Store';

        const ownerName = storeData.name ||
                         storeData.ownerName ||
                         storeData.owner ||
                         storeData.displayName ||
                         'Unknown Owner';

        const ownerEmail = storeData.email ||
                          storeData.ownerEmail ||
                          storeData.personalEmail ||
                          '';

        const ownerPhone = storeData.phone ||
                          storeData.mobile ||
                          storeData.ownerPhone ||
                          '';

        const address = storeData.address && storeData.city
                         ? `${storeData.address}, ${storeData.city}`
                         : storeData.address ||
                           (storeData.storeAddress && storeData.city
                             ? `${storeData.storeAddress}, ${storeData.city}`
                             : '') ||
                           storeData.storeAddress ||
                           storeData.city ||
                           storeData.location ||
                           storeData.businessAddress ||
                           '';

        return {
          storeId,
          storeName,
          ownerName,
          ownerEmail,
          ownerPhone,
          address,
          status: storeData.status || 'pending',
          joinedDate: storeData.joinedDate || storeData.createdAt || new Date().toISOString(),
          lastActiveAt: storeData.lastActiveAt,
          businessHours: storeData.businessHours,
          documents: storeData.documents,
          businessVerification: verification ? {
            status: verification.status || 'pending',
            verifiedAt: verification.verifiedAt,
            notes: verification.notes
          } : { status: 'pending' },
          performanceMetrics: {
            totalSales: (orders as Record<string, unknown>[]).reduce((sum: number, order: Record<string, unknown>) => sum + ((order.total as number) || 0), 0),
            totalOrders: orders.length,
            rating: storeData.rating || 4.5,
            responseTime: storeData.responseTime || 15
          },
          locationCoordinates: storeData.locationCoordinates,
          storeCategory: storeData.storeCategory || storeData.category,
          storeDescription: storeData.storeDescription || storeData.description,
          subscriptionStatus: subscription?.plan || 'free',
          subscriptionExpiry: subscription?.endDate
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching store by ID:', error);
      throw error;
    }
  }

  /**
   * Update store status
   */
  static async updateStoreStatus(
    storeId: string,
    status: 'active' | 'pending' | 'suspended' | 'rejected',
    reason?: string
  ): Promise<void> {
    try {
      const storeRef = ref(database, `stores/${storeId}`);

      const updateData: Record<string, unknown> = {
        status,
        statusUpdatedAt: new Date().toISOString()
      };

      if (reason) {
        updateData.statusReason = reason;
      }

      await update(storeRef, updateData);

      // Log the status change
      const logRef = ref(database, `store_status_logs/${storeId}/${Date.now()}`);
      await set(logRef, {
        oldStatus: 'unknown', // Could be fetched if needed
        newStatus: status,
        reason: reason || '',
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin' // Could be dynamic based on current admin user
      });

      console.log(`Store ${storeId} status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating store status:', error);
      throw error;
    }
  }

  /**
   * Update store verification status
   */
  static async updateStoreVerification(
    storeId: string,
    verificationStatus: 'verified' | 'pending' | 'rejected',
    notes?: string
  ): Promise<void> {
    try {
      const verificationRef = ref(database, `store_verifications/${storeId}`);

      const verificationData: Record<string, unknown> = {
        status: verificationStatus,
        updatedAt: new Date().toISOString(),
        notes: notes || '',
        verifiedBy: 'admin' // Could be dynamic based on current admin user
      };

      if (verificationStatus === 'verified') {
        verificationData.verifiedAt = new Date().toISOString();
      }

      await set(verificationRef, verificationData);

      console.log(`Store ${storeId} verification updated to: ${verificationStatus}`);
    } catch (error) {
      console.error('Error updating store verification:', error);
      throw error;
    }
  }

  /**
   * Get all stores including pending registrations
   * Fetches from BOTH stores collection (with status=pending) AND store_registrations collection
   */
  static async getAllStoresWithRegistrations(): Promise<Store[]> {
    try {
      console.log('🚀 [getAllStoresWithRegistrations] Starting comprehensive data fetch...');

      // Get ALL stores (including pending ones from stores collection)
      const allStores = await this.getAllStores();
      console.log(`📊 [getAllStoresWithRegistrations] Stores from 'stores' collection: ${allStores.length}`);
      console.log(`   ├─ Active: ${allStores.filter(s => s.status === 'active').length}`);
      console.log(`   ├─ Pending: ${allStores.filter(s => s.status === 'pending').length}`);
      console.log(`   ├─ Suspended: ${allStores.filter(s => s.status === 'suspended').length}`);
      console.log(`   └─ Rejected: ${allStores.filter(s => s.status === 'rejected').length}`);

      // Get pending registrations from store_registrations collection (for backward compatibility)
      const pendingRegistrations = await AdminService.getPendingStoreRegistrations();
      console.log(`📋 [getAllStoresWithRegistrations] Pending registrations from 'store_registrations': ${pendingRegistrations.length}`);

      // Convert registrations to Store format with proper field mapping
      const pendingStores: Store[] = pendingRegistrations.map((registration: StoreRegistration) => {
        // Extract store name - Check storeName field first (like RK Store)
        const storeName = registration.storeName ||
                         registration.businessName ||
                         registration.name ||
                         'Unknown Store';

        // Extract owner name - Priority: name > personalInfo.name > ownerName > owner > displayName
        // NOTE: React Native app stores owner name in 'name' field
        const ownerName = registration.name ||
                         registration.personalInfo?.name ||
                         registration.ownerName ||
                         registration.owner ||
                         registration.displayName ||
                         'Unknown Owner';

        // Extract email - Priority: email > personalInfo.email > ownerEmail
        const ownerEmail = registration.email ||
                          registration.personalInfo?.email ||
                          registration.ownerEmail ||
                          '';

        // Extract phone - Check 'phone' field first
        const ownerPhone = registration.phone ||
                          registration.personalInfo?.mobile ||
                          registration.ownerPhone ||
                          '';

        // Extract address - Combine address + city from React Native app
        const address = registration.address && registration.city
                         ? `${registration.address}, ${registration.city}`
                         : registration.address ||
                           (registration.storeAddress && registration.city
                             ? `${registration.storeAddress}, ${registration.city}`
                             : '') ||
                           registration.storeAddress ||
                           registration.city ||
                           '';

        return {
          storeId: registration.userId,
          storeName,
          ownerName,
          ownerEmail,
          ownerPhone,
          address,
          status: 'pending' as const,
          joinedDate: registration.createdAt || registration.submittedAt || registration.dateCreated || (registration.completedAt ? new Date(registration.completedAt).toISOString() : new Date().toISOString()),
          documents: registration.documents,
          businessVerification: {
            status: 'pending' as const
          },
          performanceMetrics: {
            totalSales: 0,
            totalOrders: 0,
            rating: 0,
            responseTime: 0
          },
          registrationData: registration
        };
      });

      // Prioritize stores from 'stores' collection, only add from 'store_registrations' if not in stores
      const storeIds = new Set(allStores.map(s => s.storeId));
      const additionalPendingStores = pendingStores.filter(ps => !storeIds.has(ps.storeId));

      console.log(`🔄 [getAllStoresWithRegistrations] Deduplication:`);
      console.log(`   ├─ Stores from 'stores' collection: ${allStores.length}`);
      console.log(`   ├─ Registrations from 'store_registrations': ${pendingStores.length}`);
      console.log(`   ├─ Already in 'stores' (skipped): ${pendingStores.length - additionalPendingStores.length}`);
      console.log(`   └─ Added from 'store_registrations': ${additionalPendingStores.length}`);

      // Combine: All stores from 'stores' + additional from 'store_registrations'
      const combinedStores = [...allStores, ...additionalPendingStores];

      console.log(`✅ [getAllStoresWithRegistrations] Final result: ${combinedStores.length} total stores`);
      console.log(`📊 [getAllStoresWithRegistrations] Status breakdown:`);
      console.log(`   ├─ Active: ${combinedStores.filter(s => s.status === 'active').length}`);
      console.log(`   ├─ Pending: ${combinedStores.filter(s => s.status === 'pending').length}`);
      console.log(`   ├─ Suspended: ${combinedStores.filter(s => s.status === 'suspended').length}`);
      console.log(`   └─ Rejected: ${combinedStores.filter(s => s.status === 'rejected').length}`);

      return combinedStores;
    } catch (error) {
      console.error('Error fetching stores with registrations:', error);
      throw error;
    }
  }

  /**
   * Get store statistics
   */
  static async getStoreStats(): Promise<StoreStats> {
    try {
      const stores = await this.getAllStoresWithRegistrations();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalStores = stores.length;
      const activeStores = stores.filter(s => s.status === 'active').length;
      const pendingApproval = stores.filter(s => s.status === 'pending').length;
      const rejectedStores = stores.filter(s => s.status === 'rejected').length;
      const suspendedStores = stores.filter(s => s.status === 'suspended').length;

      const subscribedStores = stores.filter(s =>
        s.subscriptionStatus === 'premium' || s.subscriptionStatus === 'enterprise'
      ).length;

      const totalRevenue = stores.reduce((sum, s) =>
        sum + (s.performanceMetrics?.totalSales || 0), 0
      );

      const verifiedStores = stores.filter(s =>
        s.businessVerification?.status === 'verified'
      ).length;

      const totalOrders = stores.reduce((sum, s) =>
        sum + (s.performanceMetrics?.totalOrders || 0), 0
      );

      const averageStoreRating = totalStores > 0
        ? stores.reduce((sum, s) => sum + (s.performanceMetrics?.rating || 0), 0) / totalStores
        : 0;

      const newStoresThisMonth = stores.filter(
        s => new Date(s.joinedDate) >= startOfMonth
      ).length;

      return {
        totalStores,
        activeStores,
        pendingApproval,
        rejectedStores,
        suspendedStores,
        subscribedStores,
        totalRevenue,
        averageStoreRating,
        newStoresThisMonth,
        verifiedStores,
        totalOrders
      };
    } catch (error) {
      console.error('Error fetching store stats:', error);
      throw error;
    }
  }

  /**
   * Search stores by criteria
   */
  static async searchStores(
    searchTerm: string,
    filters?: StoreFilter
  ): Promise<Store[]> {
    try {
      let stores = await this.getAllStores();

      // Apply filters
      if (filters) {
        if (filters.status !== 'all') {
          stores = stores.filter(s => s.status === filters.status);
        }

        if (filters.subscriptionStatus !== 'all') {
          stores = stores.filter(s => s.subscriptionStatus === filters.subscriptionStatus);
        }

        if (filters.verificationStatus !== 'all') {
          stores = stores.filter(s => s.businessVerification?.status === filters.verificationStatus);
        }

        if (filters.dateRange) {
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          stores = stores.filter(s => {
            const joinedDate = new Date(s.joinedDate);
            return joinedDate >= startDate && joinedDate <= endDate;
          });
        }

        if (filters.minRating !== undefined) {
          stores = stores.filter(s => (s.performanceMetrics?.rating || 0) >= filters.minRating!);
        }

        if (filters.maxRating !== undefined) {
          stores = stores.filter(s => (s.performanceMetrics?.rating || 0) <= filters.maxRating!);
        }

        if (filters.category) {
          stores = stores.filter(s => s.storeCategory === filters.category);
        }
      }

      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        stores = stores.filter(store =>
          store.storeName.toLowerCase().includes(searchLower) ||
          store.ownerName.toLowerCase().includes(searchLower) ||
          store.ownerEmail.toLowerCase().includes(searchLower) ||
          (store.address && store.address.toLowerCase().includes(searchLower)) ||
          (store.storeCategory && store.storeCategory.toLowerCase().includes(searchLower))
        );
      }

      return stores;
    } catch (error) {
      console.error('Error searching stores:', error);
      throw error;
    }
  }

  /**
   * Delete store (soft delete by changing status)
   */
  static async deleteStore(storeId: string, reason?: string): Promise<void> {
    try {
      // Instead of hard delete, change status to suspended
      await this.updateStoreStatus(storeId, 'suspended', reason || 'Store deleted by admin');

      // Log the deletion
      const logRef = ref(database, `store_deletion_logs/${storeId}`);
      await set(logRef, {
        deletedAt: new Date().toISOString(),
        reason: reason || 'Store deleted by admin',
        deletedBy: 'admin' // Could be dynamic based on current admin user
      });

      console.log(`Store ${storeId} deleted (suspended) successfully`);
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time store updates
   */
  static subscribeToStores(
    callback: (stores: Store[]) => void
  ): () => void {
    const storesRef = ref(database, 'stores');
    const registrationsRef = ref(database, 'store_registrations');

    const updateStores = async () => {
      try {
        const stores = await this.getAllStoresWithRegistrations();
        callback(stores);
      } catch (error) {
        console.error('Error in store subscription:', error);
      }
    };

    const storeUnsubscribe = onValue(storesRef, updateStores);
    const registrationUnsubscribe = onValue(registrationsRef, updateStores);

    return () => {
      off(storesRef, 'value', storeUnsubscribe);
      off(registrationsRef, 'value', registrationUnsubscribe);
    };
  }

  /**
   * Subscribe to store statistics
   */
  static subscribeToStoreStats(
    callback: (stats: StoreStats) => void
  ): () => void {
    const storesRef = ref(database, 'stores');
    const ordersRef = ref(database, 'store_orders');

    const updateStats = async () => {
      try {
        const stats = await this.getStoreStats();
        callback(stats);
      } catch (error) {
        console.error('Error in store stats subscription:', error);
      }
    };

    const unsubscribeStores = onValue(storesRef, updateStats);
    const unsubscribeOrders = onValue(ordersRef, updateStats);

    return () => {
      off(storesRef, 'value', unsubscribeStores);
      off(ordersRef, 'value', unsubscribeOrders);
    };
  }

  /**
   * Export store data to CSV format
   */
  static async exportStoresToCSV(): Promise<string> {
    try {
      const stores = await this.getAllStores();

      const headers = [
        'Store ID',
        'Store Name',
        'Owner Name',
        'Owner Email',
        'Owner Phone',
        'Address',
        'Status',
        'Verification Status',
        'Subscription',
        'Total Sales',
        'Total Orders',
        'Rating',
        'Joined Date',
        'Last Active'
      ];

      const csvRows = [headers.join(',')];

      stores.forEach(store => {
        const row = [
          store.storeId,
          `"${store.storeName}"`,
          `"${store.ownerName}"`,
          store.ownerEmail,
          store.ownerPhone || '',
          `"${store.address}"`,
          store.status,
          store.businessVerification?.status || 'pending',
          store.subscriptionStatus || 'free',
          store.performanceMetrics?.totalSales || 0,
          store.performanceMetrics?.totalOrders || 0,
          store.performanceMetrics?.rating || 0,
          store.joinedDate,
          store.lastActiveAt || ''
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting stores to CSV:', error);
      throw error;
    }
  }

  /**
   * Create new store
   */
  static async createStore(storeData: Partial<Store>): Promise<string> {
    try {
      const storeId = `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const storeRef = ref(database, `stores/${storeId}`);

      const newStore = {
        ...storeData,
        storeId,
        status: 'pending',
        joinedDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      await set(storeRef, newStore);

      console.log(`Store ${storeId} created successfully`);
      return storeId;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  }

  /**
   * Update store information
   */
  static async updateStore(storeId: string, storeData: Partial<Store>): Promise<void> {
    try {
      const storeRef = ref(database, `stores/${storeId}`);

      const updateData = {
        ...storeData,
        updatedAt: new Date().toISOString()
      };

      // Remove storeId from update data if present
      delete updateData.storeId;

      await update(storeRef, updateData);

      console.log(`Store ${storeId} updated successfully`);
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  }
}