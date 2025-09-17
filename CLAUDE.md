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

### TypeScript & Code Quality
- `npx tsc --noEmit` - Type checking without compilation
- `npx eslint` - Manual linting (lint script configured)

## Architecture & Structure

### Next.js App Router Architecture
- **`src/app/layout.tsx`** - Root layout with Geist font configuration
- **`src/app/page.tsx`** - Main admin dashboard for managing TindaGo React Native app
- **`src/app/globals.css`** - Tailwind CSS global styles

### Key Components & Services
- **AdminService** (`src/lib/adminService.ts`) - Firebase Realtime Database operations
- **UI Components** (`src/components/ui/`) - Button, Typography, and FormInput components
- **Firebase Config** (`src/lib/firebase.js`) - Firebase Realtime Database setup
- **Type Definitions** (`src/types/admin.ts`) - TypeScript interfaces for admin operations

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
- **`users`** - User profiles linked to Firebase Auth
- **`admins`** - Admin user roles and permissions

### AdminService Operations
Core administrative functions in `src/lib/adminService.ts`:
- **`getAllStoreRegistrations()`** - Fetch all registrations with status filtering
- **`approveStoreRegistration(userId)`** - Approve registration and create store record
- **`rejectStoreRegistration(userId, reason)`** - Reject registration with optional reason
- **Real-time subscriptions** - Live updates for registration changes

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
The main dashboard (`src/app/page.tsx`) provides comprehensive store registration management:

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
3. **State Management**: Follow React patterns with useState/useEffect for data fetching
4. **Error Handling**: Implement user-friendly error messages for Firebase operations
5. **Figma Integration**: Use TindaGo Web Design-to-Code Agent for converting admin designs

### Figma Integration Workflow
For new admin dashboard designs:
1. **Use TindaGo Web Design-to-Code Agent**: Convert Figma admin designs to Next.js components
2. **Download Assets**: Images stored in `public/images/[screen-name]/`
3. **Component Creation**: Use Tailwind CSS with TindaGo design tokens
4. **Integration**: Connect components with existing AdminService for database operations

### Environment Configuration
Required environment variables:
- `FIGMA_ACCESS_TOKEN` - Personal Figma access token for design sync (optional)
- Firebase configuration handled in `src/lib/firebase.js` for Realtime Database
- Firebase project configuration requires Realtime Database service enabled

### Business Requirements Focus
This admin dashboard specifically addresses:

**Phase 1: Admin Management System**
- Store registration review and approval workflow
- Document verification tracking
- Admin user interface for store onboarding management

The broader TindaGo ecosystem includes separate applications for:
- Mobile app for customers and store owners
- Inventory management systems
- Point-of-sale integration

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

## Figma Integration & Design System

### Figma Sync Workflow
The project includes automated Figma integration:
- **`figma-api`** dependency for design token extraction
- **`style-dictionary`** for design token processing
- Custom sync scripts in `scripts/figma-sync.js`

### Design System Implementation
Reference implementation in `FIGMA_IMPLEMENTATION.md`:
- **Baseline**: 440x956px Figma design dimensions
- **Scaling Functions**: Responsive design with mobile-first approach
- **Component Library**: Button, Typography, and specialized TindaGo components
- **Asset Management**: Automated image downloads to `src/assets/images/`

### Environment Setup for Figma Integration
```bash
# .env file configuration
FIGMA_ACCESS_TOKEN=your_figma_personal_access_token
FIGMA_FILE_ID=8I1Nr3vQZllDDknSevstvH
```

### Key Documentation References
- **Database Schema**: `firebase-database-structure.md` - Complete Firebase structure
- **Web Design Agent**: `doc/TindaGo-Web-Design-to-Code-Agent.md` - Agent for converting admin Figma designs to Next.js
- **Auth Setup**: `AUTH_SETUP.md` - Admin authentication setup guide

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.