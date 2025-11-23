# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TindaGo Admin is a Next.js web application designed for managing store registrations and approvals in the TindaGo sari-sari store marketplace ecosystem. This admin dashboard enables administrators to review, approve, or reject store registration applications with document verification.

## Development Commands

### Essential Commands
- `npm install` - Install dependencies
- `npm run dev` - Start Next.js development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Custom Scripts
- `npm run figma:sync` - Sync design tokens and assets from Figma
- `npm run figma:watch` - Watch for Figma design changes

### Database Migration Scripts
- `npm run migrate:usertype` - Migrate user types from old format to customer format
- `npm run migrate:usertype:dry-run` - Preview migration changes without applying them
- `npm run migrate:usertype:backup` - Create backup of user data before migration
- `npm run migrate:usertype:rollback` - Rollback migration if needed
- `npm run standardize:status` - Standardize status fields across database collections
- `npm run standardize:status:check` - Check status field inconsistencies without applying changes

### TypeScript & Code Quality
- `npx tsc --noEmit` - Type checking without compilation
- `npx eslint` - Manual linting (lint script configured)

## Architecture & Structure

### Next.js App Router Architecture

**Core Pages:**
- **`src/app/layout.tsx`** - Root layout with Geist font configuration
- **`src/app/page.tsx`** - Main landing page
- **`src/app/dashboard/page.tsx`** - Admin dashboard for managing store registrations
- **`src/app/analytics/page.tsx`** - Analytics dashboard for metrics and reporting
- **`src/app/auth/`** - Authentication pages (login, signup, forgot-password)
- **`src/app/landing/page.tsx`** - Landing page component
- **`src/app/contact/page.tsx`** - Contact information and support page

**Management Pages:**
- **`src/app/users/page.tsx`** - User management section for admin operations
- **`src/app/customers/page.tsx`** - Customer management section for admin operations
- **`src/app/stores/page.tsx`** - Store management section for admin operations
- **`src/app/reports/page.tsx`** - Reports section for admin analysis

**Financial Management Pages:**
- **`src/app/transactions/page.tsx`** - Transaction records synchronized with TindaGo app with refund management
- **`src/app/payouts/page.tsx`** - Payout request management and approval with bulk operations
- **`src/app/stores/[storeId]/payments/page.tsx`** - Per-store commission rate settings (admin only)

**Store Detail Pages:**
- **`src/app/stores/pending/[userId]/page.tsx`** - Pending registration details
- **`src/app/stores/active/[storeId]/page.tsx`** - Active store details
- **`src/app/stores/suspended/[storeId]/page.tsx`** - Suspended store details
- **`src/app/stores/rejected/[userId]/page.tsx`** - Rejected registration details

**Global Styles & Routing:**
- **`src/app/globals.css`** - Tailwind CSS global styles
- **`src/middleware.ts`** - Next.js middleware for authentication routing

### Key Components & Services

**Core Administrative Services:**
- **AdminService** (`src/lib/adminService.ts`) - Firebase Realtime Database operations for store registrations
- **StoreService** (`src/lib/storeService.ts`) - Store management operations including status updates, verification, and real-time subscriptions
- **CustomerService** (`src/lib/customerService.ts`) - Customer management operations with order history and statistics
- **UserManagementService** (`src/lib/userManagementService.ts`) - Comprehensive user management operations for admin, customer, and store owner users

**Financial & Transaction Services:**
- **TransactionService** (`src/lib/transactionService.ts`) - Payment transaction management and ledger operations synchronized with TindaGo app
- **WalletService** (`src/lib/walletService.ts`) - Store wallet balance management with credit/debit operations
- **PayoutService** (`src/lib/payoutService.ts`) - Store payout request management with approval workflow
- **XenditService** (`src/lib/xenditService.ts`) - Xendit payment gateway integration for invoice management

**UI & Component Architecture:**
- **UI Components** (`src/components/ui/`) - Button, Typography, and FormInput components
- **Admin Components** (`src/components/admin/`) - UserManagement, UserCreateModal, StoreManagement, PendingApprovalDetail, TransactionsTable specialized admin components
- **Firebase Config** (`src/lib/firebase.js`) - Firebase Realtime Database setup
- **Type Definitions** (`src/types/`) - TypeScript interfaces for admin operations, user management, store management, customer management, and transaction types
- **Authentication Context** (`src/contexts/AuthContext.tsx`) - React context for authentication state
- **Custom Hooks** (`src/hooks/`) - useNotifications, useResponsive hooks
- **Middleware** (`src/middleware.ts`) - Authentication routing and protection

### Core Technologies Stack
- **Next.js 15.5.3** with App Router and **React 19.1.0**
- **Firebase 12.2.1** (Realtime Database for store registrations, Authentication for admin access)
- **TypeScript** with strict mode and path aliases (@/* → src/*)
- **Tailwind CSS 4** with custom TindaGo design tokens

## Styling & Design System

### Tailwind CSS Configuration
Custom TindaGo theme defined in `tailwind.config.js`:
- **Primary Colors**: TindaGo green shades (50-950) with main color #3BB77E
- **Secondary Colors**: Slate gray palette for backgrounds and text
- **Custom Shadows**: Soft and medium shadows for modern card designs
- **Typography**: Inter font family with custom radius values

### Design System Components
Clean web UI components implemented in `src/components/ui/`:
- **Button Component**: Primary/secondary variants with Tailwind CSS styling
- **Typography Components**: H1, H2, H3, Body, Caption with Tailwind CSS classes
- **FormInput Component**: Simple form input with error handling

## Firebase Integration

### Authentication & Database Structure
The admin dashboard uses Firebase for both authentication and data storage:

**Firebase Authentication:**
- Admin user authentication with email/password
- Protected routes with role-based access control
- Email verification and password reset functionality

**Realtime Database Structure:**
- **`store_registrations`** - Pending, approved, and rejected store applications
- **`stores`** - Active store records after approval
- **`users`** - User profiles linked to Firebase Auth (customers and store owners)
- **`admins`** - Admin user roles and permissions with role-based access control
- **`ledgers/stores`** - Transaction ledger synchronized with TindaGo React Native app
- **`wallets`** - Store wallet balances with transaction history
- **`payouts`** - Payout requests from store owners with approval workflow

### AdminService Operations
Core administrative functions in `src/lib/adminService.ts`:
- **`getAllStoreRegistrations()`** - Fetch all registrations with status filtering
- **`approveStoreRegistration(userId)`** - Approve registration and create store record
- **`rejectStoreRegistration(userId, reason)`** - Reject registration with optional reason
- **Real-time subscriptions** - Live updates for registration changes

### UserManagementService Operations
Comprehensive user management in `src/lib/userManagementService.ts`:
- **`getAllAdminUsers()`** - Fetch admin users with role-based filtering
- **`getAllCustomerUsers()`** - Retrieve customer user profiles with order history
- **`getAllStoreOwnerUsers()`** - Get store owner profiles with business verification status
- **`createAdminUser()`** - Create new admin accounts with permissions
- **`updateUserStatus()`** - Activate, deactivate, or suspend users
- **`bulkUserActions()`** - Perform batch operations on multiple users
- **Real-time user data** - Live synchronization across admin interfaces

### StoreService Operations
Store management operations in `src/lib/storeService.ts`:
- **`getAllStores()`** - Fetch all stores from the stores collection
- **`getAllStoresWithRegistrations()`** - Combines stores collection with pending store_registrations for unified view
- **`getStoreById(storeId)`** - Get detailed store information with performance metrics
- **`updateStoreStatus(storeId, status, reason?)`** - Update store status (active, pending, suspended, rejected)
- **`updateStoreVerification(storeId, status, notes?)`** - Manage business verification status
- **`getStoreStats()`** - Calculate comprehensive store statistics and analytics
- **`searchStores(searchTerm, filters?)`** - Advanced store search with multiple filter options
- **`subscribeToStores(callback)`** - Real-time store updates subscription
- **`exportStoresToCSV()`** - Export store data for reporting

### TransactionService Operations
Transaction and ledger management synchronized with TindaGo React Native app in `src/lib/transactionService.ts`:
- **`getAllTransactions()`** - Fetch all transactions across all stores from `ledgers/stores` database path
- **`getStoreTransactions(storeId)`** - Get transactions for specific store
- **`getTransactionSummary(transactions)`** - Calculate total revenue, commission, and store earnings
- **`filterTransactions(transactions, filters)`** - Filter by store, status, method, date range, and search term
- **`exportToCSV(transactions)`** - Export transaction data to CSV format
- **Real-time synchronization** - Transactions automatically sync from TindaGo React Native app when payments are processed

**Transaction Data Model:**
```typescript
interface Transaction {
  invoiceId: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  amount: number;
  commission: number;
  commissionRate: number;
  storeAmount: number;
  status: 'PENDING' | 'PAID' | 'SETTLED' | 'REFUNDED';
  method: 'gcash' | 'paymaya' | 'online';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  paidAt?: string;
  invoiceUrl?: string;
}
```

### WalletService Operations
Store wallet balance management in `src/lib/walletService.ts`:
- **`getWalletBalance(storeId)`** - Get available and pending balance for store
- **`getWalletTransactions(storeId)`** - Fetch wallet transaction history
- **`creditWallet(params)`** - Add funds to wallet from order payments
- **`debitWallet(params)`** - Deduct funds when payout is approved
- **`calculateStoreEarnings(storeId)`** - Calculate total, paid, and pending earnings from ledger
- **`syncWalletFromLedger(storeId)`** - Reconcile wallet balance with transaction ledger
- **Real-time balance updates** - Wallet balances update automatically when transactions are processed

**Wallet Data Model:**
```typescript
interface WalletBalance {
  storeId: string;
  storeName: string;
  available: number;   // Can be withdrawn
  pending: number;     // From unpaid orders
  total: number;       // available + pending
  lastUpdated: string;
}
```

### PayoutService Operations
Payout request management with admin approval workflow in `src/lib/payoutService.ts`:
- **`createPayoutRequest(params)`** - Store owner creates payout request
- **`getAllPayoutRequests()`** - Admin fetches all payout requests across stores
- **`getStorePayoutRequests(storeId)`** - Get payout history for specific store
- **`approvePayoutRequest(params)`** - Admin approves payout and debits wallet
- **`rejectPayoutRequest(params)`** - Admin rejects payout with reason
- **`completePayoutRequest(payoutId)`** - Mark payout as completed after money transfer
- **`getPayoutStats()`** - Calculate pending, approved, and completed payout statistics
- **Real-time approval workflow** - Admin actions update store wallets immediately

**Payout Data Model:**
```typescript
interface PayoutRequest {
  id: string;
  storeId: string;
  storeName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;  // Admin user ID
  paymentMethod: 'bank' | 'gcash' | 'paymaya';
  accountDetails: string;
  notes?: string;
  adminNotes?: string;
}
```

### XenditService Operations
Xendit payment gateway integration in `src/lib/xenditService.ts`:
- **`createInvoice(params)`** - Create Xendit invoice for customer payment
- **`getInvoice(invoiceId)`** - Fetch invoice details by ID
- **`expireInvoice(invoiceId)`** - Manually expire unpaid invoice
- **`isInvoicePaid(invoiceId)`** - Check if invoice has been paid
- **`validateWebhookToken(token, expectedToken)`** - Verify Xendit webhook authenticity
- **Payment methods supported** - GCash, PayMaya, Credit Card, Debit Card
- **Webhook integration** - Real-time payment status updates from Xendit to Firebase ledger

### Store Registration Data Model
```typescript
interface StoreRegistration {
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
}
```

Detailed database schema available in `firebase-database-structure.md`.

## Admin Dashboard Features

### Store Registration Management
The admin dashboard (`src/app/dashboard/page.tsx`) provides comprehensive store registration management:

**Filtering & Status Management**:
- Filter by status: All, Pending, Approved, Rejected
- Real-time registration count badges for each status
- Sortable table with store details, owner info, and contact information

**Administrative Actions**:
- **Approve Registration** - Creates active store record and updates status
- **Reject Registration** - Marks as rejected with optional reason
- **Real-time Refresh** - Updates data without page reload

**Registration Details Displayed**:
- Store name and address
- Owner name and contact information
- Submission date and current status
- Document verification status (business permits, valid ID, store photos)

### Transaction Records Management
Real-time transaction monitoring synchronized with TindaGo React Native app (`src/app/transactions/page.tsx`):

**Transaction Tracking:**
- View all transactions across all stores from `ledgers/stores` Firebase path
- Real-time updates when payments are processed in TindaGo app
- Advanced filtering: status (paid, pending, refunded), payment method (GCash, PayMaya, online, card), store, and date range
- Quick date filters: Last 7 days, last 30 days, this month, or custom range
- Search by invoice ID, order number, or store name
- Pagination with customizable page size (10/20/50 per page)
- Export transaction data to CSV for accounting

**Transaction Analytics:**
- Total transaction count with status breakdown (paid, pending, refunded)
- Total revenue across all stores
- Platform commission earnings
- Store earnings to be paid out
- Payment method distribution

**Refund Management (NEW):**
- Process refunds directly from transaction details
- Admin can refund PAID/SETTLED transactions with reason tracking
- Updates transaction status to REFUNDED with timestamp
- Transaction detail drawer shows refund button for eligible transactions
- Visual indicators for already-refunded transactions

**Synchronization with TindaGo App:**
- When a customer completes payment in TindaGo React Native app, transaction is written to `ledgers/stores/{storeId}/transactions/{invoiceId}`
- Admin dashboard automatically reflects new transactions in real-time
- Commission is calculated based on configurable rate (default 10%, per-store override available)
- Store earnings are credited to wallet when payment status changes to PAID/SETTLED

### Wallet Management System
Store wallet balance tracking with real-time updates:

**Wallet Features:**
- Available balance (can be withdrawn)
- Pending balance (from unpaid orders)
- Transaction history with credit/debit operations
- Automatic synchronization with transaction ledger
- Real-time balance updates when transactions are processed

**Wallet Operations:**
- Credit wallet when order payment is confirmed
- Debit wallet when payout is approved
- Reconcile wallet balance from ledger data
- View complete wallet transaction history per store

### Payout Request Management
Admin approval workflow for store owner payout requests (`src/app/payouts/page.tsx`):

**Payout Workflow:**
1. Store owner creates payout request with payment method (bank, GCash, PayMaya)
2. Admin reviews pending payout requests in admin dashboard
3. Admin approves or rejects with notes (individual or bulk)
4. On approval, amount is automatically debited from store wallet
5. Payout status tracked through completion

**Payout Dashboard Features:**
- View all pending, approved, rejected, and completed payouts
- Filter by status with count badges (all, pending, approved)
- Statistics cards: Pending count & amount, approved, completed, rejected
- Shows store name, amount, payment method, account details per request
- Real-time updates when new requests are created

**Bulk Payout Operations (NEW):**
- Select multiple pending payouts with checkboxes
- "Select All" checkbox for all pending payouts on current view
- Bulk approve button processes multiple payouts at once
- Shows total amount and count before approval
- Success/failure tracking for batch operations
- Highlighted rows for selected payouts
- Clear selection button

**Individual Payout Actions:**
- Approve button for individual pending payouts
- Reject button with reason input
- Admin notes field for approval/rejection context
- Displays processed timestamp and admin user ID

### User Management System
Comprehensive user administration for admins, customers, and store owners (`src/app/users/page.tsx`):

**User Types:**
- **Admins** - Super admin, admin, moderator, viewer roles with permissions
- **Customers** - Order history, total spent, verification status
- **Store Owners** - Business verification, store associations, performance metrics

**User Management Features:**
- Create new admin users with role assignment
- Update user status (active, inactive, suspended, banned)
- Bulk user actions for multiple users
- Search and filter by user type, status, or search term
- Export user data to CSV
- Real-time user statistics and activity tracking

### TindaGo Screen Component
Pixel-perfect implementation of TindaGo design system:
- Responsive layout based on 440x956 Figma baseline
- Glassmorphism design with gradient backgrounds and decorative elements
- Call-to-action buttons with hover effects
- Typography system using Clash Grotesk and ABeeZee fonts

## Development Workflow

### Admin Dashboard Development
1. **Adding New Features**: Extend AdminService with new Firebase operations
2. **UI Components**: Use existing clean UI components from `src/components/ui/`
3. **State Management**: Use AuthContext for authentication state and React patterns for data fetching
4. **Error Handling**: Implement user-friendly error messages using useNotifications hook
5. **Authentication**: Leverage middleware.ts for route protection and AuthContext for state
6. **Figma Integration**: Use TindaGo Web Design-to-Code Agent for converting admin designs

### TindaGo Web Admin Design-to-Code Agent Integration

**Primary Agent for Admin Dashboard Development:**
Use the `tindago-web-admin-design-to-code` agent for ALL Figma admin design conversions. This specialized agent masters exact TindaGo admin patterns and Firebase integration.

**Usage Examples:**

Simple Activation:
```
@tindago-web-admin-design-to-code

Convert this Figma admin dashboard design to Next.js:
https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Admin?node-id=102-123

This is the store registration management dashboard for TindaGo Admin.
```

Complex Request with Firebase Integration:
```
@tindago-web-admin-design-to-code

I need this Figma admin design with full functionality:
https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Admin?node-id=102-456

Features needed:
- Store registration approval cards with real-time updates
- Filter and search functionality
- Status indicators and action buttons
- Integration with AdminService and Firebase database
```

**Agent Capabilities:**
- ✅ Extracts Figma data automatically using `mcp__figma-developer-mcp__get_figma_data`
- ✅ **Smart asset management**: Checks for existing assets in `public/images/shared/` before downloading duplicates
- ✅ Downloads new assets to organized directories (`public/images/admin/`, `public/images/shared/`)
- ✅ Creates pixel-perfect Next.js admin components with 1440px baseline
- ✅ Integrates with existing AdminService and Firebase patterns
- ✅ Follows established TindaGo admin authentication and routing
- ✅ Uses exact Tailwind CSS classes and TindaGo design tokens
- ✅ Implements desktop-first responsive design for admin interfaces

**Pro Tips:**
1. Always include complete Figma URL with node-id when requesting conversions
2. Describe specific admin functionality needed (user management, store approval, etc.)
3. Mention Firebase integration requirements for real-time data operations
4. Reference existing admin components for consistency
5. The agent learns from previous work and maintains design system consistency

### Environment Configuration
Required environment variables:
- `FIGMA_ACCESS_TOKEN` - Personal Figma access token for design sync (optional)
- Firebase configuration handled in `src/lib/firebase.js` for Realtime Database
- Firebase project configuration requires Realtime Database service enabled

### Business Requirements Focus
This admin dashboard specifically addresses:

**Focus: Comprehensive Admin Management System**
- **Store Management** - Registration review, approval workflow, status management
- **User Management** - Admins, customers, store owners with role-based access
- **Financial Operations** - Transaction monitoring, wallet management, payout approvals
- **Payment Integration** - Xendit payment gateway with real-time synchronization
- **Document Verification** - Business permits, valid IDs, compliance tracking
- **Analytics & Reporting** - Dashboard metrics, transaction reports, CSV exports
- **Real-time Synchronization** - Instant updates from TindaGo React Native app

## System Architecture & Data Flow

### Transaction Flow (TindaGo App → Admin Dashboard)
1. **Customer Places Order** in TindaGo React Native app
2. **Xendit Invoice Created** via XenditService with order details
3. **Customer Completes Payment** through GCash, PayMaya, or card
4. **Xendit Webhook Fires** to update payment status
5. **Transaction Written** to `ledgers/stores/{storeId}/transactions/{invoiceId}` in Firebase
6. **Admin Dashboard Updates** in real-time via Firebase listeners
7. **Wallet Credited** when payment status changes to PAID/SETTLED
8. **Commission Calculated** and separated from store earnings

### Payout Flow (Store Owner → Admin → Bank Transfer)
1. **Store Owner Views Wallet** with available balance
2. **Payout Request Created** with payment method and account details
3. **Admin Reviews Request** in payout management dashboard
4. **Admin Approves/Rejects** with optional notes
5. **Wallet Debited** automatically on approval
6. **Money Transferred** by admin to store owner bank/GCash/PayMaya
7. **Payout Marked Complete** with confirmation

### User Management Flow
1. **User Registers** in TindaGo app (customer or store owner)
2. **Profile Created** in Firebase `users` collection with `userType` field
3. **Admin Views Users** filtered by type (customer, store_owner)
4. **Admin Manages Status** (active, inactive, suspended, banned)
5. **Changes Sync** immediately to TindaGo app via Firebase listeners

## Recommendations for Improvement

### Priority 1: Essential Features (Remaining)
1. **Admin Profile Settings** - Allow admins to update their profile, password, and notification preferences
2. **Activity Logs** - Track all admin actions (approvals, rejections, status changes) with timestamps and audit trail
3. **Notification System** - Real-time alerts for new registrations, payout requests, and failed transactions
4. **Dashboard Widgets** - Customizable dashboard with drag-and-drop widgets for key metrics

### Priority 2: Financial Management Enhancements (Remaining)
1. **Commission Rate Configuration UI** - Web interface at `/settings/commission` to manage global and per-store rates
2. **Financial Reports** - Monthly revenue reports, commission breakdowns, payout summaries
3. **CSV Export for Payouts** - Export payout history to CSV for accounting
4. **Wallet Management UI** - Admin view of all store wallets with balance reconciliation tools

### Priority 3: Store & User Management
1. **Store Performance Analytics** - Sales trends, customer ratings, response times
2. **Document Upload Portal** - Allow admins to request additional documents from stores
3. **User Communication** - In-app messaging between admins and store owners
4. **Verification Workflow** - Multi-step verification process with checklist

### Priority 4: Advanced Features
1. **Role-Based Permissions** - Granular permissions for different admin roles (already has basic role structure)
2. **API Integration** - REST API for third-party integrations
3. **Mobile Admin App** - React Native admin app for on-the-go management
4. **Automated Fraud Detection** - Flag suspicious transactions or payout requests

### ✅ Recently Implemented Features
1. **Refund Management** - Admin can process refunds directly from transaction details with reason tracking
2. **Bulk Payout Processing** - Approve multiple payouts at once with checkbox selection and batch operations
3. **Payouts Navigation** - Payouts page now accessible from admin sidebar navigation
4. **Advanced Transaction Filters** - Date range filters, pagination, and improved search functionality

### Recommended Database Structure Additions
```typescript
// Activity logs for audit trail
interface AdminActivityLog {
  logId: string;
  adminId: string;
  action: 'approve' | 'reject' | 'suspend' | 'payout_approve' | 'status_change';
  targetType: 'store' | 'user' | 'transaction' | 'payout';
  targetId: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

// Notification system
interface AdminNotification {
  notificationId: string;
  type: 'new_registration' | 'payout_request' | 'failed_transaction' | 'document_update';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

// Commission configuration
interface CommissionConfig {
  configId: string;
  storeId?: string;  // null for default rate
  category?: string; // category-specific rate
  commissionRate: number;
  effectiveFrom: string;
  createdBy: string;
}
```

## Important Conventions

### Import Paths & TypeScript
- Use `@/` path alias for src imports: `import { AdminService } from '@/lib/adminService'`
- Path aliases configured in `tsconfig.json` with strict TypeScript mode
- Maintain clean import structure with barrel exports (`index.ts` files)

### Styling & Component Patterns
- **Tailwind CSS**: Use utility-first approach with custom TindaGo theme
- **Design System**: Use Tailwind CSS classes with TindaGo theme tokens
- **Responsive Design**: Use responsive scaling functions (s, vs, ms) for Figma-based components
- **Component Architecture**: Follow established patterns in existing UI components

### Firebase & Data Management
- **Async/Await**: Consistent patterns for Firebase Realtime Database operations
- **Error Handling**: Implement user-friendly error messages with proper try/catch blocks
- **Real-time Updates**: Use Firebase listeners for live data synchronization
- **Data Validation**: Validate Firebase data structures match TypeScript interfaces

### Code Quality Standards
- **TypeScript Strict Mode**: All new code must include proper type definitions
- **ESLint**: Follow Next.js ESLint configuration for consistent code style
- **Component Documentation**: Include Figma node IDs and coordinate comments for design system components

## MCP Figma Integration Setup

### Figma MCP Server Configuration
The project uses MCP (Model Context Protocol) servers for Figma integration:

**MCP Settings** (`mcp-settings.json`):
```json
{
  "mcpServers": {
    "Framelink Figma MCP": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=figd_ObQgz20L8sghXs83yKfU1Xy0gaAVVM5k6QEvaMRM", "--stdio"]
    }
  }
}
```

**Permissions** (`.claude/settings.local.json`):
- `mcp__figma-developer-mcp__get_figma_data` - Extract Figma design data
- `mcp__figma-developer-mcp__download_figma_images` - Download assets automatically

### Admin Dashboard Design System
- **Baseline**: 1440x1024px desktop-first design for admin interfaces
- **Typography**: Clash Grotesk Variable and Inter fonts
- **Component Library**: Specialized admin components in `src/components/admin/`

### Optimized Asset Management Strategy
**Organized Structure** (avoid duplicating existing assets):
```
public/images/
├── shared/                    # Reusable assets across pages
│   ├── icons/                # Common UI icons (user, settings, search, plus, edit, delete)
│   ├── logos/                # TindaGo brand assets (tindago-logo.svg/png)
│   └── badges/               # External badges (app-store, google-play)
├── admin/                    # Admin-specific assets
│   ├── dashboard/stats-icons/  # Dashboard stat card icons
│   ├── sidebar/              # Navigation icons
│   └── profile/              # User profile assets
└── landing/features/         # Landing page specific assets
```

**Asset Usage Guidelines:**
- ✅ **Check existing assets first**: Use `public/images/shared/icons/` for common icons
- ✅ **Reuse shared assets**: Reference same icon across multiple components
- ✅ **Avoid duplicates**: Copy existing assets to new locations rather than re-downloading
- ✅ **Use organized paths**: `<img src="/images/shared/icons/user-icon.png" />`
- ✅ **TindaGo logo**: Always use `/images/shared/logos/tindago-logo.svg` for consistency

### Figma Integration Workflow
1. Use `@tindago-web-admin-design-to-code` agent for admin design conversions
2. Provide Figma URL with specific node-id for targeted component extraction
3. Agent automatically extracts design data and downloads all assets
4. Creates pixel-perfect Next.js components with Firebase integration

### Additional Resources
- **Database Schema**: `firebase-database-structure.md` - Firebase Realtime Database structure
- **React Native Integration**: `REACT_NATIVE_FIREBASE_INTEGRATION.md` - Complete guide for React Native app developers on store registration structure
- **Authentication Setup**: `AUTH_SETUP.md` - Admin authentication configuration

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.