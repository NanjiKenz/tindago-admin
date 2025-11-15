/**
 * User Management Service
 *
 * Firebase service for managing users across TindaGo admin dashboard
 * Extends AdminService patterns for consistency
 */

import { database } from './firebase.js';
import { ref, get, set, update, remove, onValue, off } from 'firebase/database';
import { AdminUser, CustomerUser, StoreOwnerUser, UserStats, UserFormData, BulkUserAction } from '@/types/userManagement';

export class UserManagementService {
  /**
   * Get all admin users
   */
  static async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const res = await fetch('/api/admin/users/all', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return (data.admins || []) as AdminUser[];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  /**
   * Get all customer users (Note: Now consistently filters by userType: "customer")
   */
  static async getAllCustomerUsers(): Promise<CustomerUser[]> {
    try {
      const res = await fetch('/api/admin/users/all', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return (data.customers || []) as CustomerUser[];
    } catch (error) {
      console.error('Error fetching customer users:', error);
      throw error;
    }
  }

  /**
   * Get all store owner users (from users collection with userType: 'store_owner')
   */
  static async getAllStoreOwnerUsers(): Promise<StoreOwnerUser[]> {
    try {
      const res = await fetch('/api/admin/users/all', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return (data.storeOwners || []) as StoreOwnerUser[];
    } catch (error) {
      console.error('Error fetching store owner users:', error);
      throw error;
    }
  }

  /**
   * Get all users (admins, customers, store owners)
   */
  static async getAllUsers(): Promise<(AdminUser | CustomerUser | StoreOwnerUser)[]> {
    try {
      const [admins, customers, storeOwners] = await Promise.all([
        this.getAllAdminUsers(),
        this.getAllCustomerUsers(),
        this.getAllStoreOwnerUsers()
      ]);

      const allUsers = [...admins, ...customers, ...storeOwners];
      return allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const [admins, customers, storeOwners] = await Promise.all([
        this.getAllAdminUsers(),
        this.getAllCustomerUsers(),
        this.getAllStoreOwnerUsers()
      ]);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalUsers = admins.length + customers.length + storeOwners.length;
      const activeUsers = [
        ...admins.filter(u => u.status === 'active'),
        ...customers.filter(u => u.status === 'active'),
        ...storeOwners.filter(u => u.status === 'active')
      ].length;

      const newUsersThisMonth = [
        ...admins.filter(u => new Date(u.createdAt) >= startOfMonth),
        ...customers.filter(u => new Date(u.createdAt) >= startOfMonth),
        ...storeOwners.filter(u => new Date(u.createdAt) >= startOfMonth)
      ].length;

      const verifiedStoreOwners = storeOwners.filter(
        u => u.businessVerification.status === 'verified'
      ).length;

      const pendingVerifications = storeOwners.filter(
        u => u.businessVerification.status === 'pending'
      ).length;

      return {
        totalUsers,
        totalAdmins: admins.length,
        totalCustomers: customers.length,
        totalStoreOwners: storeOwners.length,
        activeUsers,
        newUsersThisMonth,
        verifiedStoreOwners,
        pendingVerifications
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Create a new admin user via API route
   * Creates both Firebase Auth user and admin database record
   */
  static async createAdminUser(userData: UserFormData & { password?: string }): Promise<void> {
    try {
      // Call API route to create admin (handles Firebase Auth + Database)
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password || 'Admin123!', // Default password if not provided
          displayName: userData.displayName,
          role: userData.role || 'admin',
          status: userData.status || 'active',
          permissions: userData.permissions || [],
          phone: userData.phone,
          department: userData.department,
          notes: userData.notes,
          dateOfBirth: (userData as any).dateOfBirth,
          country: (userData as any).country,
          city: (userData as any).city,
          postalCode: (userData as any).postalCode
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create admin user');
      }

      const result = await response.json();
      console.log(`Admin user created: ${result.userId}`);
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  static async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended' | 'banned',
    userType: 'admin' | 'customer' | 'store_owner'
  ): Promise<void> {
    try {
      // Admins are in 'admins' collection, customers and store owners are both in 'users' collection
      const tableName = userType === 'admin' ? 'admins' : 'users';

      const userRef = ref(database, `${tableName}/${userId}`);

      await update(userRef, {
        status,
        statusUpdatedAt: new Date().toISOString()
      });

      console.log(`✅ User ${userId} (${userType}) status updated to: ${status}`);
    } catch (error) {
      console.error(`❌ Error updating user status for ${userId}:`, error);
      // Ensure we throw a proper Error object with a descriptive message
      if (error instanceof Error) {
        throw new Error(`Failed to update status: ${error.message}`);
      }
      throw new Error('Failed to update user status');
    }
  }

  /**
   * Update admin user role
   */
  static async updateAdminUserRole(
    userId: string,
    role: 'super_admin' | 'admin' | 'moderator' | 'viewer'
  ): Promise<void> {
    try {
      const adminRef = ref(database, `admins/${userId}`);

      await update(adminRef, {
        role,
        roleUpdatedAt: new Date().toISOString()
      });

      console.log(`Admin ${userId} role updated to: ${role}`);
    } catch (error) {
      console.error('Error updating admin role:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(
    userId: string,
    userType: 'admin' | 'customer' | 'store_owner'
  ): Promise<void> {
    try {
      // Admins are in 'admins' collection, customers and store owners are both in 'users' collection
      const tableName = userType === 'admin' ? 'admins' : 'users';

      const userRef = ref(database, `${tableName}/${userId}`);

      await remove(userRef);

      // Also remove related data
      if (userType === 'customer') {
        const ordersRef = ref(database, `user_orders/${userId}`);
        await remove(ordersRef);
      } else if (userType === 'store_owner') {
        const storesRef = ref(database, `user_stores/${userId}`);
        const verificationRef = ref(database, `business_verifications/${userId}`);
        const metricsRef = ref(database, `store_metrics/${userId}`);

        await Promise.all([
          remove(storesRef),
          remove(verificationRef),
          remove(metricsRef)
        ]);
      }

      console.log(`✅ User ${userId} (${userType}) deleted successfully`);
    } catch (error) {
      console.error(`❌ Error deleting user ${userId}:`, error);
      // Ensure we throw a proper Error object
      if (error instanceof Error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Perform bulk actions on users
   */
  static async performBulkAction(action: BulkUserAction): Promise<void> {
    try {
      const promises = action.userIds.map(async (userId) => {
        switch (action.type) {
          case 'activate':
            return this.updateUserStatus(userId, 'active', 'customer'); // Default to customer
          case 'deactivate':
            return this.updateUserStatus(userId, 'inactive', 'customer');
          case 'suspend':
            return this.updateUserStatus(userId, 'suspended', 'customer');
          case 'delete':
            return this.deleteUser(userId, 'customer');
          case 'change_role':
            if (action.data?.newRole) {
              return this.updateAdminUserRole(userId, action.data.newRole as 'super_admin' | 'admin' | 'moderator' | 'viewer');
            }
            break;
        }
      });

      await Promise.all(promises);
      console.log(`Bulk action ${action.type} completed for ${action.userIds.length} users`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  }

  /**
   * Search users by criteria
   */
  static async searchUsers(
    searchTerm: string,
    userType?: 'admin' | 'customer' | 'store_owner'
  ): Promise<(AdminUser | CustomerUser | StoreOwnerUser)[]> {
    try {
      const allUsers = await this.getAllUsers();

      let filteredUsers = allUsers;

      // Filter by user type
      if (userType) {
        filteredUsers = filteredUsers.filter(user => {
          if (userType === 'admin') return 'role' in user;
          if (userType === 'customer') return 'totalOrders' in user;
          if (userType === 'store_owner') return 'stores' in user;
          return true;
        });
      }

      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.displayName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.phone && user.phone.toLowerCase().includes(searchLower))
        );
      }

      return filteredUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time user updates
   */
  static subscribeToUsers(
    callback: (users: (AdminUser | CustomerUser | StoreOwnerUser)[]) => void
  ): () => void {
    // Single fetch instead of real-time subscription
    this.getAllUsers()
      .then(callback)
      .catch(error => console.error('Error in user subscription:', error));

    // No-op unsubscribe so existing UI code still works
    return () => {};
  }

  /**
   * Export users to CSV format
   */
  static async exportUsersToCSV(): Promise<string> {
    try {
      const users = await this.getAllUsers();

      // CSV headers
      const headers = [
        'User ID',
        'Name',
        'Email',
        'Phone',
        'Role',
        'User Type',
        'Status',
        'Joined Date',
        'Last Login',
        'Address'
      ];

      // Start with BOM for proper Excel encoding
      const csvRows = ['\uFEFF' + headers.join(',')];

      users.forEach(user => {
        // Helper to escape CSV values
        const escapeCSV = (value: string | undefined | null): string => {
          if (!value) return '';
          const stringValue = String(value);
          // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return '"' + stringValue.replace(/"/g, '""') + '"';
          }
          return stringValue;
        };

        // Format date - apostrophe prefix forces Excel to treat as text
        const formatDate = (dateStr: string | undefined): string => {
          if (!dateStr) return "'N/A";
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "'N/A";
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `'${year}-${month}-${day}`;
          } catch {
            return "'N/A";
          }
        };

        // Determine role
        let role = '';
        if ('role' in user) {
          role = user.role;
        } else if (user.userType === 'store_owner') {
          role = 'Store Owner';
        } else {
          role = 'Customer';
        }

        // Get address
        let address = '';
        if ('address' in user && user.address) {
          address = user.address;
        }

        const row = [
          escapeCSV(user.userId),
          escapeCSV(user.displayName),
          escapeCSV(user.email),
          escapeCSV(user.phone),
          escapeCSV(role),
          escapeCSV('role' in user ? 'admin' : user.userType),
          escapeCSV(user.status),
          formatDate(user.createdAt),
          formatDate(user.lastLoginAt),
          escapeCSV(address)
        ];
        
        csvRows.push(row.join(','));
      });

      return csvRows.join('\r\n');
    } catch (error) {
      console.error('Error exporting users to CSV:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user statistics
   */
  static subscribeToUserStats(
    callback: (stats: UserStats) => void
  ): () => void {
    // Single fetch instead of real-time subscription
    this.getUserStats()
      .then(callback)
      .catch(error => console.error('Error in stats subscription:', error));

    return () => {};
  }
}