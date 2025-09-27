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

### TypeScript & Code Quality
- `npx tsc --noEmit` - Type checking without compilation
- `npx eslint` - Manual linting (lint script configured)

## Architecture & Structure

### Next.js App Router Architecture
- **`src/app/layout.tsx`** - Root layout with Geist font configuration
- **`src/app/page.tsx`** - Main landing page
- **`src/app/dashboard/page.tsx`** - Admin dashboard for managing store registrations
- **`src/app/analytics/page.tsx`** - Analytics dashboard for metrics and reporting
- **`src/app/auth/`** - Authentication pages (login, signup, forgot-password)
- **`src/app/landing/page.tsx`** - Landing page component
- **`src/app/reports/page.tsx`** - Reports section for admin analysis
- **`src/app/users/page.tsx`** - User management section for admin operations
- **`src/app/customers/page.tsx`** - Customer management section for admin operations
- **`src/app/stores/page.tsx`** - Store management section for admin operations
- **`src/app/contact/page.tsx`** - Contact information and support page
- **`src/app/globals.css`** - Tailwind CSS global styles
- **`src/middleware.ts`** - Next.js middleware for authentication routing

### Key Components & Services
- **AdminService** (`src/lib/adminService.ts`) - Firebase Realtime Database operations
- **UserManagementService** (`src/lib/userManagementService.ts`) - Comprehensive user management operations for admin, customer, and store owner users
- **UI Components** (`src/components/ui/`) - Button, Typography, and FormInput components
- **Admin Components** (`src/components/admin/`) - UserManagement, UserCreateModal specialized admin components
- **Firebase Config** (`src/lib/firebase.js`) - Firebase Realtime Database setup
- **Type Definitions** (`src/types/`) - TypeScript interfaces for admin operations, user management types
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

**Focus: Admin Management System**
- Store registration review and approval workflow
- User management (admins, customers, store owners)
- Document verification and business compliance tracking
- Analytics dashboard for marketplace insights

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
      "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=figd_Qow2KUHJ6s6vuXbduOs9Wj001_5mg7m8XNFCTnmN", "--stdio"]
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
- **Authentication Setup**: `AUTH_SETUP.md` - Admin authentication configuration

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.