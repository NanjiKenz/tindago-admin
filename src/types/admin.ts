/**
 * TindaGo Admin Dashboard Type Definitions
 *
 * TypeScript interfaces for admin dashboard components and data
 */

export interface DashboardStats {
  totalStores: number;
  activeOrders: number;
  totalRevenue: number;
  inventoryItems: number;
  lowStockCount?: number;
  pendingApprovals?: number;
  monthlyGrowth?: {
    stores: number;
    orders: number;
    revenue: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'store' | 'inventory' | 'user' | 'system';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
  details?: {
    orderId?: string;
    storeId?: string;
    userId?: string;
    amount?: number;
    itemCount?: number;
  };
}

export interface StoreInfo {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  verificationStatus: 'verified' | 'pending' | 'rejected';
  location: {
    barangay: string;
    municipality: string;
    province: string;
  };
  contactInfo: {
    phone: string;
    email?: string;
  };
  businessInfo: {
    registrationNumber?: string;
    taxId?: string;
    businessPermit?: string;
  };
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    activeProducts: number;
  };
  createdAt: string;
  lastActive: string;
}

export interface OrderInfo {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  totals: {
    subtotal: number;
    tax: number;
    serviceFee: number;
    total: number;
  };
  timestamps: {
    ordered: string;
    confirmed?: string;
    ready?: string;
    completed?: string;
    cancelled?: string;
  };
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
  category: string;
  image?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  stock: {
    current: number;
    minimum: number;
    maximum?: number;
  };
  supplier?: {
    name: string;
    contact: string;
  };
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  lastUpdated: string;
  image?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermission[];
  lastLogin: string;
  isActive: boolean;
}

export interface AdminPermission {
  resource: 'stores' | 'orders' | 'inventory' | 'users' | 'analytics' | 'system';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface NotificationSettings {
  email: {
    newOrders: boolean;
    storeApprovals: boolean;
    lowStock: boolean;
    systemAlerts: boolean;
  };
  push: {
    urgentAlerts: boolean;
    dailySummary: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Component Props Interfaces
export interface AdminDashboardProps {
  className?: string;
  user?: AdminUser;
  refreshInterval?: number;
  onError?: (error: ApiError) => void;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  color?: string;
  onClick?: () => void;
}

export interface ActivityItemProps {
  activity: RecentActivity;
  onItemClick?: (activity: RecentActivity) => void;
}

export interface QuickActionProps {
  label: string;
  icon: string;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
}

// Filter and Sort Interfaces
export interface FilterOptions {
  stores?: {
    status?: StoreInfo['status'][];
    verificationStatus?: StoreInfo['verificationStatus'][];
    location?: string[];
  };
  orders?: {
    status?: OrderInfo['status'][];
    dateRange?: {
      start: string;
      end: string;
    };
    storeId?: string[];
  };
  inventory?: {
    category?: string[];
    status?: InventoryItem['status'][];
    lowStock?: boolean;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Dashboard Configuration
export interface DashboardConfig {
  refreshInterval: number;
  defaultPageSize: number;
  maxRecentActivities: number;
  features: {
    realTimeUpdates: boolean;
    pushNotifications: boolean;
    exportData: boolean;
    advancedAnalytics: boolean;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    darkMode: boolean;
  };
}

// Event Types for Real-time Updates
export type DashboardEvent =
  | { type: 'stats_updated'; payload: Partial<DashboardStats> }
  | { type: 'new_activity'; payload: RecentActivity }
  | { type: 'order_status_changed'; payload: { orderId: string; status: OrderInfo['status'] } }
  | { type: 'store_approved'; payload: { storeId: string; storeName: string } }
  | { type: 'low_stock_alert'; payload: { itemId: string; itemName: string; currentStock: number } };

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: ApiError | null;
  lastUpdated?: string;
}