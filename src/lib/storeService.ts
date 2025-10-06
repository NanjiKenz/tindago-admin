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

          // Extract data with proper fallbacks matching React Native app nested structure
          // Store Name: Priority order - businessInfo.storeName > storeName > businessName > name
          const storeName = storeData.businessInfo?.storeName ||
                           storeData.storeName ||
                           storeData.businessName ||
                           storeData.name ||
                           'Unknown Store';

          // Owner Name: Priority order - personalInfo.name > name > ownerName > owner > displayName
          const ownerName = storeData.personalInfo?.name ||
                           storeData.name ||
                           storeData.ownerName ||
                           storeData.owner ||
                           storeData.displayName ||
                           'Unknown Owner';

          // Email: Priority order - personalInfo.email > email > ownerEmail
          const ownerEmail = storeData.personalInfo?.email ||
                            storeData.email ||
                            storeData.ownerEmail ||
                            storeData.personalEmail ||
                            '';

          // Phone: Priority order - personalInfo.mobile > phone > ownerPhone > mobile
          const ownerPhone = storeData.personalInfo?.mobile ||
                            storeData.phone ||
                            storeData.ownerPhone ||
                            storeData.mobile ||
                            '';

          // Address: Priority order - businessInfo (address + city) > legacy address + city
          const businessAddress = storeData.businessInfo?.address;
          const businessCity = storeData.businessInfo?.city;
          const legacyAddress = storeData.address || storeData.storeAddress;
          const legacyCity = storeData.city;

          const address = businessAddress && businessCity
                           ? `${businessAddress}, ${businessCity}`
                           : businessAddress ||
                             (legacyAddress && legacyCity
                               ? `${legacyAddress}, ${legacyCity}`
                               : legacyAddress || legacyCity || storeData.location || storeData.businessAddress || '');

          const store: Store = {
            storeId,
            storeName,
            ownerName,
            ownerEmail,
            ownerPhone,
            address,
            status: storeData.status || 'active',
            statusReason: storeData.statusReason,
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

        // Extract data with proper fallbacks matching React Native app nested structure
        // Store Name: Priority order - businessInfo.storeName > storeName > businessName > name
        const storeName = storeData.businessInfo?.storeName ||
                         storeData.storeName ||
                         storeData.businessName ||
                         storeData.name ||
                         'Unknown Store';

        // Owner Name: Priority order - personalInfo.name > name > ownerName > owner > displayName
        const ownerName = storeData.personalInfo?.name ||
                         storeData.name ||
                         storeData.ownerName ||
                         storeData.owner ||
                         storeData.displayName ||
                         'Unknown Owner';

        // Owner Email: Priority order - personalInfo.email > email > ownerEmail > personalEmail
        const ownerEmail = storeData.personalInfo?.email ||
                          storeData.email ||
                          storeData.ownerEmail ||
                          storeData.personalEmail ||
                          '';

        // Owner Phone: Priority order - personalInfo.mobile > phone > mobile > ownerPhone
        const ownerPhone = storeData.personalInfo?.mobile ||
                          storeData.phone ||
                          storeData.mobile ||
                          storeData.ownerPhone ||
                          '';

        // Address: Priority order - businessInfo (address + city) > legacy address + city
        const businessAddress = storeData.businessInfo?.address;
        const businessCity = storeData.businessInfo?.city;
        const legacyAddress = storeData.address || storeData.storeAddress;
        const legacyCity = storeData.city;

        const address = businessAddress && businessCity
                         ? `${businessAddress}, ${businessCity}`
                         : businessAddress ||
                           (legacyAddress && legacyCity
                             ? `${legacyAddress}, ${legacyCity}`
                             : legacyAddress || legacyCity || storeData.location || storeData.businessAddress || '');

        return {
          storeId,
          storeName,
          ownerName,
          ownerEmail,
          ownerPhone,
          address,
          status: storeData.status || 'pending',
          statusReason: storeData.statusReason,
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
   * Get all stores including pending and rejected registrations
   * Fetches from BOTH stores collection AND store_registrations collection
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

      // Get ALL registrations from store_registrations collection (pending and rejected)
      const allRegistrations = await AdminService.getAllStoreRegistrations();
      const pendingRegistrations = allRegistrations.filter(reg =>
        reg.status === 'pending' || reg.status === 'completed_pending' || reg.status === 'pending_approval' || !reg.status
      );
      const rejectedRegistrations = allRegistrations.filter(reg => reg.status === 'rejected');

      console.log(`📋 [getAllStoresWithRegistrations] Registrations from 'store_registrations':`);
      console.log(`   ├─ Pending: ${pendingRegistrations.length}`);
      console.log(`   └─ Rejected: ${rejectedRegistrations.length}`);

      // Convert registrations to Store format with proper field mapping from nested structure
      const pendingStores: Store[] = pendingRegistrations.map((registration: StoreRegistration) => {
        // Extract store name - Priority: businessInfo.storeName > storeName > businessName > name
        const storeName = registration.businessInfo?.storeName ||
                         registration.storeName ||
                         registration.businessName ||
                         registration.name ||
                         'Unknown Store';

        // Extract owner name - Priority: personalInfo.name > name > ownerName > owner > displayName
        const ownerName = registration.personalInfo?.name ||
                         registration.name ||
                         registration.ownerName ||
                         registration.owner ||
                         registration.displayName ||
                         'Unknown Owner';

        // Extract email - Priority: personalInfo.email > email > ownerEmail
        const ownerEmail = registration.personalInfo?.email ||
                          registration.email ||
                          registration.ownerEmail ||
                          '';

        // Extract phone - Priority: personalInfo.mobile > phone > ownerPhone
        const ownerPhone = registration.personalInfo?.mobile ||
                          registration.phone ||
                          registration.ownerPhone ||
                          '';

        // Extract address - Priority: businessInfo (address + city) > legacy address + city
        const businessAddress = registration.businessInfo?.address;
        const businessCity = registration.businessInfo?.city;
        const legacyAddress = registration.address || registration.storeAddress;
        const legacyCity = registration.city;

        const address = businessAddress && businessCity
                         ? `${businessAddress}, ${businessCity}`
                         : businessAddress ||
                           (legacyAddress && legacyCity
                             ? `${legacyAddress}, ${legacyCity}`
                             : legacyAddress || legacyCity || '');

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

      // Convert rejected registrations to Store format
      const rejectedStores: Store[] = rejectedRegistrations.map((registration: StoreRegistration) => {
        // Extract store name - Priority: businessInfo.storeName > storeName > businessName > name
        const storeName = registration.businessInfo?.storeName ||
                         registration.storeName ||
                         registration.businessName ||
                         registration.name ||
                         'Unknown Store';

        // Extract owner name - Priority: personalInfo.name > name > ownerName > owner > displayName
        const ownerName = registration.personalInfo?.name ||
                         registration.name ||
                         registration.ownerName ||
                         registration.owner ||
                         registration.displayName ||
                         'Unknown Owner';

        // Extract email - Priority: personalInfo.email > email > ownerEmail
        const ownerEmail = registration.personalInfo?.email ||
                          registration.email ||
                          registration.ownerEmail ||
                          '';

        // Extract phone - Priority: personalInfo.mobile > phone > ownerPhone
        const ownerPhone = registration.personalInfo?.mobile ||
                          registration.phone ||
                          registration.ownerPhone ||
                          '';

        // Extract address - Priority: businessInfo (address + city) > legacy address + city
        const businessAddress = registration.businessInfo?.address;
        const businessCity = registration.businessInfo?.city;
        const legacyAddress = registration.address || registration.storeAddress;
        const legacyCity = registration.city;

        const address = businessAddress && businessCity
                         ? `${businessAddress}, ${businessCity}`
                         : businessAddress ||
                           (legacyAddress && legacyCity
                             ? `${legacyAddress}, ${legacyCity}`
                             : legacyAddress || legacyCity || '');

        return {
          storeId: registration.userId,
          storeName,
          ownerName,
          ownerEmail,
          ownerPhone,
          address,
          status: 'rejected' as const,
          joinedDate: registration.createdAt || registration.submittedAt || registration.dateCreated || new Date().toISOString(),
          documents: registration.documents,
          businessVerification: {
            status: 'rejected' as const
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
      const additionalRejectedStores = rejectedStores.filter(rs => !storeIds.has(rs.storeId));

      console.log(`🔄 [getAllStoresWithRegistrations] Deduplication:`);
      console.log(`   ├─ Stores from 'stores' collection: ${allStores.length}`);
      console.log(`   ├─ Pending from 'store_registrations': ${pendingStores.length} (${additionalPendingStores.length} new)`);
      console.log(`   ├─ Rejected from 'store_registrations': ${rejectedStores.length} (${additionalRejectedStores.length} new)`);
      console.log(`   └─ Total additions from registrations: ${additionalPendingStores.length + additionalRejectedStores.length}`);

      // Combine: All stores from 'stores' + additional pending + additional rejected from 'store_registrations'
      const combinedStores = [...allStores, ...additionalPendingStores, ...additionalRejectedStores];

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
   * Reactivate a suspended store (change status from suspended to active)
   */
  static async reactivateStore(storeId: string): Promise<void> {
    try {
      const storeRef = ref(database, `stores/${storeId}`);

      const updateData: Record<string, unknown> = {
        status: 'active',
        statusUpdatedAt: new Date().toISOString(),
        reactivatedAt: new Date().toISOString(),
        statusReason: '' // Clear the suspension reason
      };

      await update(storeRef, updateData);

      // Log the reactivation
      const logRef = ref(database, `store_status_logs/${storeId}/${Date.now()}`);
      await set(logRef, {
        oldStatus: 'suspended',
        newStatus: 'active',
        reason: 'Store reactivated by admin',
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      });

      console.log(`Store ${storeId} reactivated successfully`);
    } catch (error) {
      console.error('Error reactivating store:', error);
      throw error;
    }
  }

  /**
   * Permanently delete a store (hard delete from Firebase)
   * WARNING: This action is irreversible
   */
  static async permanentlyDeleteStore(storeId: string): Promise<void> {
    try {
      // Log the permanent deletion first
      const logRef = ref(database, `store_permanent_deletion_logs/${storeId}`);
      await set(logRef, {
        deletedAt: new Date().toISOString(),
        deletedBy: 'admin',
        storeId
      });

      // Delete the store record
      const storeRef = ref(database, `stores/${storeId}`);
      await set(storeRef, null);

      // Optionally delete related data (uncomment if needed)
      // await set(ref(database, `store_orders/${storeId}`), null);
      // await set(ref(database, `store_verifications/${storeId}`), null);
      // await set(ref(database, `store_subscriptions/${storeId}`), null);

      console.log(`Store ${storeId} permanently deleted successfully`);
    } catch (error) {
      console.error('Error permanently deleting store:', error);
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

  static async updateStoreDetails(
    storeId: string,
    details: {
      storeName?: string;
      ownerName?: string;
      ownerEmail?: string;
      ownerPhone?: string;
      address?: string;
      storeDescription?: string;
    }
  ): Promise<void> {
    try {
      const storeRef = ref(database, `stores/${storeId}`);

      const updateData: Record<string, unknown> = {
        ...details,
        updatedAt: new Date().toISOString()
      };

      await update(storeRef, updateData);

      console.log(`Store details updated successfully for store: ${storeId}`);
    } catch (error) {
      console.error('Error updating store details:', error);
      throw error;
    }
  }
}