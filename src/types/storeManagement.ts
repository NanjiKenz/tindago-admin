/**
 * Store Management Type Definitions
 *
 * TypeScript interfaces for store management functionality in TindaGo Admin Dashboard
 * Extends existing AdminService patterns for consistency with store-specific operations
 */

export interface Store {
  storeId: string;
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  address: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  joinedDate: string;
  lastActiveAt?: string;
  businessHours?: {
    open: string;
    close: string;
    days: string[];
  };
  documents?: {
    businessPermit?: string;
    validId?: string;
    storePhoto?: string;
  };
  businessVerification?: {
    status: 'verified' | 'pending' | 'rejected';
    verifiedAt?: string;
    notes?: string;
  };
  performanceMetrics?: {
    totalSales: number;
    totalOrders: number;
    rating: number;
    responseTime: number;
  };
  locationCoordinates?: {
    latitude: number;
    longitude: number;
  };
  storeCategory?: string;
  storeDescription?: string;
  subscriptionStatus?: 'free' | 'premium' | 'enterprise';
  subscriptionExpiry?: string;
}

export interface StoreStats {
  totalStores: number;
  activeStores: number;
  pendingApproval: number;
  rejectedStores: number;
  suspendedStores: number;
  subscribedStores: number;
  totalRevenue: number;
  averageStoreRating: number;
  newStoresThisMonth: number;
  verifiedStores: number;
  totalOrders: number;
}

export interface StoreFilter {
  status: 'all' | 'active' | 'pending' | 'suspended' | 'rejected';
  subscriptionStatus: 'all' | 'free' | 'premium' | 'enterprise';
  verificationStatus: 'all' | 'verified' | 'pending' | 'rejected';
  dateRange?: {
    start: string;
    end: string;
  };
  minRating?: number;
  maxRating?: number;
  category?: string;
}

export interface StoreOrder {
  orderId: string;
  storeId: string;
  customerId: string;
  customerName: string;
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

export interface StoreProduct {
  productId: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface StoreRegistration {
  userId: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  documents?: {
    businessPermit?: string;
    validId?: string;
    storePhoto?: string;
  };
  rejectionReason?: string;
}

export interface StoreAnalytics {
  storeId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    sales: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
    rating: number;
    views: number;
  };
  trends: {
    salesGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
  };
  topProducts: {
    productId: string;
    productName: string;
    salesCount: number;
    revenue: number;
  }[];
}

export interface StoreSubscription {
  storeId: string;
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  features: string[];
  price: number;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
}

export interface StoreTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface StoreAction {
  id: string;
  label: string;
  icon?: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  permission?: string;
  condition?: (store: Store) => boolean;
}

export interface StoreManagementState {
  stores: Store[];
  loading: boolean;
  error: string | null;
  filters: StoreFilter;
  searchTerm: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  selectedStores: Set<string>;
  processingIds: Set<string>;
}

export interface StoreFormData {
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  address: string;
  storeCategory?: string;
  storeDescription?: string;
  businessHours?: {
    open: string;
    close: string;
    days: string[];
  };
  locationCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface BulkStoreAction {
  type: 'activate' | 'suspend' | 'delete' | 'change_subscription';
  storeIds: string[];
  data?: {
    newSubscription?: string;
    reason?: string;
  };
}

export type StoreStatus = 'active' | 'pending' | 'suspended' | 'rejected';
export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';
export type VerificationStatus = 'verified' | 'pending' | 'rejected';