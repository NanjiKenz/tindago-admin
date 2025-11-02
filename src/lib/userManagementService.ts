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
   * Create a new admin user
   */
  static async createAdminUser(userData: UserFormData): Promise<void> {
    try {
      const userId = `admin_${Date.now()}`;
      const adminRef = ref(database, `admins/${userId}`);

      const adminData: Omit<AdminUser, 'userId'> = {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role || 'admin',
        status: userData.status,
        createdAt: new Date().toISOString(),
        permissions: userData.permissions || [],
        phone: userData.phone,
        department: userData.department,
        notes: userData.notes
      };

      await set(adminRef, adminData);
      console.log(`Admin user created: ${userId}`);
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
      const tableName = userType === 'admin' ? 'admins' :
                       userType === 'customer' ? 'users' : 'store_owners';

      const userRef = ref(database, `${tableName}/${userId}`);

      await update(userRef, {
        status,
        statusUpdatedAt: new Date().toISOString()
      });

      console.log(`User ${userId} status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
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
      const tableName = userType === 'admin' ? 'admins' :
                       userType === 'customer' ? 'users' : 'store_owners';

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

      console.log(`User ${userId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
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
    const adminsRef = ref(database, 'admins');
    const usersRef = ref(database, 'users');

    const updateUsers = async () => {
      try {
        const users = await this.getAllUsers();
        callback(users);
      } catch (error) {
        console.error('Error in user subscription:', error);
      }
    };

    const adminUnsubscribe = onValue(adminsRef, updateUsers);
    const usersUnsubscribe = onValue(usersRef, updateUsers);

    return () => {
      off(adminsRef, 'value', adminUnsubscribe);
      off(usersRef, 'value', usersUnsubscribe);
    };
  }

  /**
   * Export users to CSV format
   */
  static async exportUsersToCSV(): Promise<string> {
    try {
      const users = await this.getAllUsers();

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

      const csvRows = [headers.join(',')];

      users.forEach(user => {
        const row = [
          user.userId,
          `"${user.displayName}"`,
          user.email,
          user.phone || '',
          `"${('role' in user) ? user.role : (user.userType === 'store_owner' ? 'Store Owner' : 'Customer')}"`,
          ('role' in user) ? 'admin' : user.userType,
          user.status,
          user.createdAt,
          user.lastLoginAt || '',
          `"${('address' in user) ? user.address || '' : ''}"`
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\\n');
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
    const updateStats = async () => {
      try {
        const stats = await this.getUserStats();
        callback(stats);
      } catch (error) {
        console.error('Error in stats subscription:', error);
      }
    };

    // Subscribe to all user tables for stats updates
    const adminsRef = ref(database, 'admins');
    const usersRef = ref(database, 'users');
    const ownersRef = ref(database, 'store_owners');

    const adminUnsubscribe = onValue(adminsRef, updateStats);
    const usersUnsubscribe = onValue(usersRef, updateStats);
    const ownersUnsubscribe = onValue(ownersRef, updateStats);

    return () => {
      off(adminsRef, 'value', adminUnsubscribe);
      off(usersRef, 'value', usersUnsubscribe);
      off(ownersRef, 'value', ownersUnsubscribe);
    };
  }
}