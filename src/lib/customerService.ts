/**
 * Customer Service
 *
 * Firebase service for managing customers in TindaGo admin dashboard
 * Extends AdminService patterns for consistency with customer-specific operations
 */

import { database } from './firebase.js';
import { ref, get, set, update, onValue, off } from 'firebase/database';
import { CustomerUser } from '@/types/userManagement';

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  bannedCustomers: number;
  verifiedCustomers: number;
  pendingVerifications: number;
  unverifiedCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  newCustomersThisMonth: number;
  averageCustomerValue: number;
}

export interface CustomerFilter {
  status: 'all' | 'active' | 'inactive' | 'banned';
  verificationStatus: 'all' | 'verified' | 'pending' | 'unverified';
  dateRange?: {
    start: string;
    end: string;
  };
  minOrders?: number;
  maxOrders?: number;
  minSpent?: number;
  maxSpent?: number;
}

export interface CustomerOrderHistory {
  orderId: string;
  customerId: string;
  storeId: string;
  storeName: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export class CustomerService {
  /**
   * Get all customers with enhanced data (via API route to bypass Firebase security rules)
   */
  static async getAllCustomers(): Promise<CustomerUser[]> {
    try {
      const res = await fetch('/api/admin/customers', { cache: 'no-store' });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch customers: ${errorText}`);
      }
      const data = await res.json();
      return (data.customers || []) as CustomerUser[];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * DEPRECATED: Old direct Firebase access method - kept for reference
   * Use getAllCustomers() instead which uses API routes
   */
  private static async getAllCustomersLegacy(): Promise<CustomerUser[]> {
    try {
      const customersRef = ref(database, 'users');
      const snapshot = await get(customersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const customers: CustomerUser[] = [];

        for (const userId of Object.keys(data)) {
          const userData = data[userId];

          // Filter only users with userType: "customer" (customers from React Native app)
          if (userData.userType === 'customer') {
            // Get additional customer data
            const [ordersSnapshot, verificationSnapshot] = await Promise.all([
              get(ref(database, `customer_orders/${userId}`)),
              get(ref(database, `customer_verifications/${userId}`))
            ]);

            const orders = ordersSnapshot.exists() ? Object.values(ordersSnapshot.val()) : [];
            const verification = verificationSnapshot.exists() ? verificationSnapshot.val() : null;

            // Extract customer data with nested structure priority
            // Email: Priority - personalInfo.email > email
            const email = userData.personalInfo?.email || userData.email || '';

            // Name: Priority - personalInfo.name > displayName > name
            const displayName = userData.personalInfo?.name || userData.displayName || userData.name || 'Unknown User';

            // Phone: Priority - personalInfo.mobile > phone
            const phone = userData.personalInfo?.mobile || userData.phone || '';

            // Address: Priority - personalInfo.address > address (customers might not have businessInfo)
            const address = userData.personalInfo?.address || userData.address || '';

            const customer: CustomerUser = {
              userId,
              email,
              displayName,
              phone,
              address,
              status: userData.status || 'active',
              createdAt: userData.createdAt || new Date().toISOString(),
              lastLoginAt: userData.lastLoginAt,
              totalOrders: orders.length,
              totalSpent: (orders as Record<string, unknown>[]).reduce((sum: number, order: Record<string, unknown>) => sum + ((order.total as number) || 0), 0),
              avatar: userData.avatar,
              verificationStatus: verification?.status || 'unverified',
              storeOwnership: {
                hasStore: false
              }
            };

            customers.push(customer);
          }
        }

        return customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID with detailed information
   */
  static async getCustomerById(customerId: string): Promise<CustomerUser | null> {
    try {
      const customerRef = ref(database, `users/${customerId}`);
      const snapshot = await get(customerRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        if (userData.userType === 'customer') {
          // Get additional customer data
          const [ordersSnapshot, verificationSnapshot] = await Promise.all([
            get(ref(database, `customer_orders/${customerId}`)),
            get(ref(database, `customer_verifications/${customerId}`))
          ]);

          const orders = ordersSnapshot.exists() ? Object.values(ordersSnapshot.val()) : [];
          const verification = verificationSnapshot.exists() ? verificationSnapshot.val() : null;

          // Extract customer data with nested structure priority
          // Email: Priority - personalInfo.email > email
          const email = userData.personalInfo?.email || userData.email || '';

          // Name: Priority - personalInfo.name > displayName > name
          const displayName = userData.personalInfo?.name || userData.displayName || userData.name || 'Unknown User';

          // Phone: Priority - personalInfo.mobile > phone
          const phone = userData.personalInfo?.mobile || userData.phone || '';

          // Address: Priority - personalInfo.address > address (customers might not have businessInfo)
          const address = userData.personalInfo?.address || userData.address || '';

          return {
            userId: customerId,
            email,
            displayName,
            phone,
            address,
            status: userData.status || 'active',
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLoginAt: userData.lastLoginAt,
            totalOrders: orders.length,
            totalSpent: (orders as Record<string, unknown>[]).reduce((sum: number, order: Record<string, unknown>) => sum + ((order.total as number) || 0), 0),
            avatar: userData.avatar,
            verificationStatus: verification?.status || 'unverified',
            storeOwnership: {
              hasStore: false
            }
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching customer by ID:', error);
      throw error;
    }
  }

  /**
   * Update customer status
   */
  static async updateCustomerStatus(
    customerId: string,
    status: 'active' | 'inactive' | 'banned',
    reason?: string
  ): Promise<void> {
    try {
      const customerRef = ref(database, `users/${customerId}`);

      const updateData: Record<string, unknown> = {
        status,
        statusUpdatedAt: new Date().toISOString()
      };

      if (reason) {
        updateData.statusReason = reason;
      }

      await update(customerRef, updateData);

      // Log the status change
      const logRef = ref(database, `customer_status_logs/${customerId}/${Date.now()}`);
      await set(logRef, {
        oldStatus: 'unknown', // Could be fetched if needed
        newStatus: status,
        reason: reason || '',
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin' // Could be dynamic based on current admin user
      });

      console.log(`Customer ${customerId} status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating customer status:', error);
      throw error;
    }
  }

  /**
   * Update customer verification status
   */
  static async updateCustomerVerification(
    customerId: string,
    verificationStatus: 'verified' | 'pending' | 'unverified',
    notes?: string
  ): Promise<void> {
    try {
      const verificationRef = ref(database, `customer_verifications/${customerId}`);

      const verificationData = {
        status: verificationStatus,
        updatedAt: new Date().toISOString(),
        notes: notes || '',
        verifiedBy: 'admin' // Could be dynamic based on current admin user
      };

      await set(verificationRef, verificationData);

      console.log(`Customer ${customerId} verification updated to: ${verificationStatus}`);
    } catch (error) {
      console.error('Error updating customer verification:', error);
      throw error;
    }
  }

  /**
   * Get customer order history
   */
  static async getCustomerOrderHistory(customerId: string): Promise<CustomerOrderHistory[]> {
    try {
      const ordersRef = ref(database, `customer_orders/${customerId}`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const orders: CustomerOrderHistory[] = [];

        for (const orderId of Object.keys(ordersData)) {
          const orderData = ordersData[orderId];

          // Get store information
          const storeRef = ref(database, `stores/${orderData.storeId}`);
          const storeSnapshot = await get(storeRef);
          const storeData = storeSnapshot.exists() ? storeSnapshot.val() : { name: 'Unknown Store' };

          const order: CustomerOrderHistory = {
            orderId,
            customerId,
            storeId: orderData.storeId,
            storeName: storeData.name || 'Unknown Store',
            orderDate: orderData.createdAt || orderData.orderDate,
            status: orderData.status || 'pending',
            total: orderData.total || 0,
            items: orderData.items || []
          };

          orders.push(order);
        }

        return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      }

      return [];
    } catch (error) {
      console.error('Error fetching customer order history:', error);
      throw error;
    }
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(): Promise<CustomerStats> {
    try {
      // Fetch stats from API route (bypasses Firebase security rules)
      const res = await fetch('/api/admin/customers/stats', { cache: 'no-store' });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch customer stats: ${errorText}`);
      }
      const apiStats = await res.json();

      // Get customers for additional calculations
      const customers = await this.getAllCustomers();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalCustomers = apiStats.totalCustomers || customers.length;
      const activeCustomers = apiStats.activeCustomers || customers.filter(c => c.status === 'active').length;
      const inactiveCustomers = apiStats.inactiveCustomers || customers.filter(c => c.status === 'inactive').length;
      const bannedCustomers = customers.filter(c => c.status === 'banned').length;

      const verifiedCustomers = customers.filter(c => c.verificationStatus === 'verified').length;
      const pendingVerifications = customers.filter(c => c.verificationStatus === 'pending').length;
      const unverifiedCustomers = customers.filter(c => c.verificationStatus === 'unverified').length;

      const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
      const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const newCustomersThisMonth = customers.filter(
        c => new Date(c.createdAt) >= startOfMonth
      ).length;

      const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      return {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        bannedCustomers,
        verifiedCustomers,
        pendingVerifications,
        unverifiedCustomers,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        newCustomersThisMonth,
        averageCustomerValue
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  /**
   * Search customers by criteria
   */
  static async searchCustomers(
    searchTerm: string,
    filters?: CustomerFilter
  ): Promise<CustomerUser[]> {
    try {
      let customers = await this.getAllCustomers();

      // Apply filters
      if (filters) {
        if (filters.status !== 'all') {
          customers = customers.filter(c => c.status === filters.status);
        }

        if (filters.verificationStatus !== 'all') {
          customers = customers.filter(c => c.verificationStatus === filters.verificationStatus);
        }

        if (filters.dateRange) {
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          customers = customers.filter(c => {
            const createdDate = new Date(c.createdAt);
            return createdDate >= startDate && createdDate <= endDate;
          });
        }

        if (filters.minOrders !== undefined) {
          customers = customers.filter(c => c.totalOrders >= filters.minOrders!);
        }

        if (filters.maxOrders !== undefined) {
          customers = customers.filter(c => c.totalOrders <= filters.maxOrders!);
        }

        if (filters.minSpent !== undefined) {
          customers = customers.filter(c => c.totalSpent >= filters.minSpent!);
        }

        if (filters.maxSpent !== undefined) {
          customers = customers.filter(c => c.totalSpent <= filters.maxSpent!);
        }
      }

      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        customers = customers.filter(customer =>
          customer.displayName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
          (customer.address && customer.address.toLowerCase().includes(searchLower))
        );
      }

      return customers;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  /**
   * Delete customer (soft delete by changing status)
   */
  static async deleteCustomer(customerId: string, reason?: string): Promise<void> {
    try {
      // Instead of hard delete, change status to banned
      await this.updateCustomerStatus(customerId, 'banned', reason || 'Account deleted by admin');

      // Log the deletion
      const logRef = ref(database, `customer_deletion_logs/${customerId}`);
      await set(logRef, {
        deletedAt: new Date().toISOString(),
        reason: reason || 'Account deleted by admin',
        deletedBy: 'admin' // Could be dynamic based on current admin user
      });

      console.log(`Customer ${customerId} deleted (banned) successfully`);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time customer updates
   */
  static subscribeToCustomers(
    callback: (customers: CustomerUser[]) => void
  ): () => void {
    // Single fetch instead of real-time subscription
    this.getAllCustomers()
      .then(callback)
      .catch(error => console.error('Error in customer subscription:', error));

    return () => {};
  }

  /**
   * Subscribe to customer statistics
   */
  static subscribeToCustomerStats(
    callback: (stats: CustomerStats) => void
  ): () => void {
    // Single fetch instead of real-time subscription
    this.getCustomerStats()
      .then(callback)
      .catch(error => console.error('Error in customer stats subscription:', error));

    return () => {};
  }

  /**
   * Export customer data to CSV format
   */
  static async exportCustomersToCSV(): Promise<string> {
    try {
      const customers = await this.getAllCustomers();

      const headers = [
        'Customer ID',
        'Name',
        'Email',
        'Phone',
        'Address',
        'Status',
        'Verification Status',
        'Total Orders',
        'Total Spent',
        'Joined Date',
        'Last Login'
      ];

      const csvRows = [headers.join(',')];

      customers.forEach(customer => {
        const row = [
          customer.userId,
          `"${customer.displayName}"`,
          customer.email,
          customer.phone || '',
          `"${customer.address || ''}"`,
          customer.status,
          customer.verificationStatus,
          customer.totalOrders,
          customer.totalSpent,
          customer.createdAt,
          customer.lastLoginAt || ''
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting customers to CSV:', error);
      throw error;
    }
  }
}