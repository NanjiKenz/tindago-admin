/**
 * Customer Management Type Definitions
 *
 * TypeScript interfaces for customer management functionality in TindaGo Admin Dashboard
 * Extends existing user management patterns with customer-specific data
 */

import { CustomerUser } from './userManagement';

export interface CustomerProfile extends CustomerUser {
  // Extended customer profile information
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    profilePicture?: string;
  };
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    marketing: {
      emailMarketing: boolean;
      smsMarketing: boolean;
    };
  };
  loyaltyProgram?: {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    points: number;
    memberSince: string;
    benefits: string[];
  };
}

export interface CustomerOrder {
  orderId: string;
  customerId: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  orderNumber: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash_on_delivery' | 'gcash' | 'maya' | 'bank_transfer' | 'credit_card';
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryFee: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items: CustomerOrderItem[];
  notes?: string;
  rating?: number;
  review?: string;
}

export interface CustomerOrderItem {
  itemId: string;
  productId: string;
  productName: string;
  productImage?: string;
  category: string;
  brand?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variations?: {
    size?: string;
    color?: string;
    flavor?: string;
    [key: string]: string | undefined;
  };
}

export interface CustomerActivity {
  activityId: string;
  customerId: string;
  type: 'login' | 'logout' | 'order_placed' | 'order_cancelled' | 'review_submitted' | 'profile_updated' | 'password_changed';
  description: string;
  timestamp: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    orderId?: string;
    [key: string]: any;
  };
}

export interface CustomerSupport {
  ticketId: string;
  customerId: string;
  subject: string;
  category: 'technical' | 'billing' | 'order' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  messages: CustomerSupportMessage[];
  tags: string[];
}

export interface CustomerSupportMessage {
  messageId: string;
  ticketId: string;
  senderId: string;
  senderType: 'customer' | 'admin';
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface CustomerAnalytics {
  customerId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    orderFrequency: number; // orders per period
    favoriteCategories: Array<{
      category: string;
      orderCount: number;
      totalSpent: number;
    }>;
    favoriteStores: Array<{
      storeId: string;
      storeName: string;
      orderCount: number;
      totalSpent: number;
    }>;
    paymentMethodPreference: {
      [method: string]: number; // count of usage
    };
    deliveryMethodPreference: {
      pickup: number;
      delivery: number;
    };
    activityScore: number; // 0-100 based on engagement
    lifetimeValue: number;
    predictedChurnRisk: 'low' | 'medium' | 'high';
  };
  trends: {
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
    orderFrequencyTrend: 'increasing' | 'decreasing' | 'stable';
    engagementTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface CustomerSegment {
  segmentId: string;
  name: string;
  description: string;
  criteria: {
    minOrders?: number;
    maxOrders?: number;
    minSpent?: number;
    maxSpent?: number;
    status?: CustomerUser['status'][];
    verificationStatus?: CustomerUser['verificationStatus'][];
    joinedAfter?: string;
    joinedBefore?: string;
    hasOrderedInLastDays?: number;
    loyaltyTier?: string[];
  };
  customerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerExport {
  exportId: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'excel' | 'json';
  filters: CustomerFilter;
  totalRecords: number;
  downloadUrl?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface CustomerFilter {
  search?: string;
  status?: 'all' | 'active' | 'inactive' | 'banned';
  verificationStatus?: 'all' | 'verified' | 'pending' | 'unverified';
  loyaltyTier?: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum';
  dateRange?: {
    start: string;
    end: string;
  };
  orderRange?: {
    min: number;
    max: number;
  };
  spentRange?: {
    min: number;
    max: number;
  };
  location?: {
    city?: string;
    province?: string;
    region?: string;
  };
  tags?: string[];
}

export interface CustomerBulkAction {
  actionId: string;
  type: 'update_status' | 'update_verification' | 'assign_segment' | 'send_notification' | 'export' | 'delete';
  customerIds: string[];
  parameters: {
    newStatus?: CustomerUser['status'];
    verificationStatus?: CustomerUser['verificationStatus'];
    segmentId?: string;
    notificationMessage?: string;
    exportFormat?: 'csv' | 'excel' | 'json';
    deleteReason?: string;
  };
  executedBy: string;
  executedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    successful: number;
    failed: number;
    errors: Array<{
      customerId: string;
      error: string;
    }>;
  };
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersToday: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  churned: number; // customers who haven't ordered in 90+ days
  returning: number; // customers with 2+ orders
  oneTime: number; // customers with only 1 order
  averageLifetimeValue: number;
  averageOrderValue: number;
  topSpenders: CustomerUser[];
  frequentBuyers: CustomerUser[];
  recentSignups: CustomerUser[];
  inactiveCustomers: CustomerUser[];
}

export interface CustomerNotification {
  notificationId: string;
  customerId: string;
  type: 'promotional' | 'transactional' | 'reminder' | 'announcement';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failureReason?: string;
  metadata?: {
    campaign?: string;
    template?: string;
    [key: string]: any;
  };
}

// Form interfaces for admin operations
export interface CustomerUpdateForm {
  displayName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: CustomerUser['status'];
  verificationStatus?: CustomerUser['verificationStatus'];
  notes?: string;
}

export interface CustomerCreateForm {
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  password: string;
  status: CustomerUser['status'];
  verificationStatus: CustomerUser['verificationStatus'];
  notes?: string;
}

// API response interfaces
export interface CustomerListResponse {
  customers: CustomerUser[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CustomerDetailsResponse {
  customer: CustomerProfile;
  orders: CustomerOrder[];
  activities: CustomerActivity[];
  support: CustomerSupport[];
  analytics: CustomerAnalytics;
}

// Utility types
export type CustomerSortField = 'displayName' | 'email' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'lastLoginAt';
export type CustomerSortDirection = 'asc' | 'desc';

export interface CustomerTableColumn {
  key: keyof CustomerUser | 'actions';
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (customer: CustomerUser) => React.ReactNode;
}

export interface CustomerManagementState {
  customers: CustomerUser[];
  loading: boolean;
  error: string | null;
  filters: CustomerFilter;
  sortField: CustomerSortField;
  sortDirection: CustomerSortDirection;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  selectedCustomers: Set<string>;
  bulkActionInProgress: boolean;
}

// Event types for customer management
export type CustomerEvent =
  | { type: 'LOAD_CUSTOMERS_START' }
  | { type: 'LOAD_CUSTOMERS_SUCCESS'; payload: CustomerUser[] }
  | { type: 'LOAD_CUSTOMERS_ERROR'; payload: string }
  | { type: 'UPDATE_FILTERS'; payload: Partial<CustomerFilter> }
  | { type: 'UPDATE_SORT'; payload: { field: CustomerSortField; direction: CustomerSortDirection } }
  | { type: 'UPDATE_PAGE'; payload: number }
  | { type: 'SELECT_CUSTOMER'; payload: string }
  | { type: 'SELECT_ALL_CUSTOMERS'; payload: boolean }
  | { type: 'BULK_ACTION_START' }
  | { type: 'BULK_ACTION_SUCCESS' }
  | { type: 'BULK_ACTION_ERROR'; payload: string };

export default CustomerProfile;