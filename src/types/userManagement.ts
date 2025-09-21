/**
 * User Management Type Definitions
 *
 * TypeScript interfaces for user management functionality in TindaGo Admin Dashboard
 * Extends existing AdminService patterns for consistency
 */

export interface AdminUser {
  userId: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  permissions: UserPermission[];
  avatar?: string;
  phone?: string;
  department?: string;
  notes?: string;
}

export interface CustomerUser {
  userId: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
  avatar?: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  userType?: 'customer' | 'store_owner' | 'admin'; // Firebase userType field
  storeOwnership?: {
    hasStore: boolean;
    storeId?: string;
    storeName?: string;
  };
}

export interface StoreOwnerUser {
  userId: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  avatar?: string;
  userType?: 'customer' | 'store_owner' | 'admin'; // Firebase userType field
  stores: StoreOwnership[];
  businessVerification: BusinessVerification;
  performanceMetrics: {
    totalSales: number;
    totalOrders: number;
    rating: number;
    responseTime: number;
  };
}

export interface StoreOwnership {
  storeId: string;
  storeName: string;
  status: 'active' | 'inactive' | 'pending_approval';
  role: 'owner' | 'manager' | 'staff';
  joinedAt: string;
}

export interface BusinessVerification {
  status: 'verified' | 'pending' | 'rejected' | 'expired';
  businessPermit?: string;
  validId?: string;
  storePhoto?: string;
  verifiedAt?: string;
  expiresAt?: string;
}

export interface UserPermission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface UserFilter {
  userType: 'all' | 'admin' | 'customer' | 'store_owner';
  status: 'all' | 'active' | 'inactive' | 'suspended' | 'banned';
  role?: 'all' | 'super_admin' | 'admin' | 'moderator' | 'viewer';
  verificationStatus?: 'all' | 'verified' | 'pending' | 'unverified';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface UserTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface UserAction {
  id: string;
  label: string;
  icon?: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  permission?: string;
  condition?: (user: AdminUser | CustomerUser | StoreOwnerUser) => boolean;
}

export interface UserManagementState {
  users: (AdminUser | CustomerUser | StoreOwnerUser)[];
  loading: boolean;
  error: string | null;
  filters: UserFilter;
  searchTerm: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  selectedUsers: Set<string>;
  processingIds: Set<string>;
}

export interface UserFormData {
  email: string;
  displayName: string;
  role?: 'super_admin' | 'admin' | 'moderator' | 'viewer';
  phone?: string;
  department?: string;
  permissions?: UserPermission[];
  status: 'active' | 'inactive';
  notes?: string;
}

export interface BulkUserAction {
  type: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'change_role';
  userIds: string[];
  data?: {
    newRole?: string;
    reason?: string;
  };
}

export type UserType = 'admin' | 'customer' | 'store_owner';

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalCustomers: number;
  totalStoreOwners: number;
  activeUsers: number;
  newUsersThisMonth: number;
  verifiedStoreOwners: number;
  pendingVerifications: number;
}