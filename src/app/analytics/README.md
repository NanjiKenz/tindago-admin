# Report & Analytics Dashboard

This directory contains the implementation of the TindaGo Admin Report & Analytics dashboard page.

## Components

### Page Structure
- **`page.tsx`** - Main analytics dashboard page with pixel-perfect layout (1440x1024)

### Analytics Components
- **`ReportHeader`** - Page title and description header
- **`AnalyticsStatsCards`** - Key metrics cards (Page Views, Conversion Rate, Avg Order Value, Return Rate)
- **`SalesChart`** - Line chart showing sales performance trends over time
- **`RevenueChart`** - Donut chart displaying revenue breakdown by category
- **`TopProducts`** - Table showing best-selling products with rankings and trends
- **`UserActivity`** - Real-time user engagement metrics and recent activity feed

## Layout Structure

The analytics page follows the same pixel-perfect layout system as the main dashboard:

- **Sidebar**: 273px fixed width (inherited from AdminSidebar)
- **Main Content**: 1167px width (1440px - 273px sidebar)
- **Header**: 80px height with navigation
- **Content Area**: Positioned below header with exact Figma coordinates

## Component Positioning

All components use exact pixel positioning for pixel-perfect implementation:

```typescript
// Example positioning pattern
style={{
  left: '40px',      // Exact x coordinate
  top: '301px',      // Exact y coordinate
  width: '620px',    // Exact width
  height: '320px'    // Exact height
}}
```

## Features

- **Real-time Data**: Components designed to integrate with Firebase real-time data
- **Interactive Charts**: SVG-based charts with hover effects and animations
- **Responsive Metrics**: Dynamic stat cards with trend indicators
- **Live Activity Feed**: Real-time user activity tracking
- **Navigation Integration**: Seamless sidebar navigation with active state highlighting

## Design System Compliance

- **Typography**: Uses Clash Grotesk Variable font family throughout
- **Colors**: Exact hex color values matching TindaGo design system
- **Spacing**: Precise spacing and positioning from Figma specifications
- **Shadows**: Consistent shadow patterns across all cards and components
- **Icons**: Scalable SVG icons with proper color theming

## Navigation

The analytics page is accessible via:
- URL: `/analytics`
- Sidebar: "Report & Analytic" menu item
- Active state highlighting when on analytics page