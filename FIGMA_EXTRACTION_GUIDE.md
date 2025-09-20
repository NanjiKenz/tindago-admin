# TindaGo Figma Design Extraction Guide

This guide will help you extract complete design specifications from any Figma design in your TindaGo project for pixel-perfect implementation. **All extractions are preserved** - no previous work will be lost!

## 🚀 Quick Setup

### 1. Get Your Figma Access Token

1. Go to [Figma Account Settings](https://www.figma.com/developers/api#access-tokens)
2. Click "Create new token"
3. Give it a name like "TindaGo Admin Dashboard"
4. Copy the generated token

### 2. Update Environment Variables

Edit your `.env` file and replace the placeholder token:

```env
FIGMA_ACCESS_TOKEN=your_actual_figma_token_here
FIGMA_FILE_ID=8I1Nr3vQZllDDknSevstvH
```

### 3. Extract Any Design

Run the extraction script for any Figma node:

```bash
# Extract User Management dashboard
node scripts/figma-design-extractor.js 281-980

# Extract Landing page
node scripts/figma-design-extractor.js 281-115

# Extract any other node
node scripts/figma-design-extractor.js [your-node-id]
```

## 🎯 Dynamic Structure - No More Overwrites!

The script creates a **dynamic folder structure** that preserves all your extractions:

### 📁 Dynamic Folder Structure

Each design gets its own organized folder:

```
figma-extracted-design/
├── README.md                    # Overview of all extractions
├── extraction-index.json       # Index tracking all extractions
├── user-management-281-980/     # User Management dashboard
│   ├── UserManagement.tsx      # Generated React component
│   ├── design-data.json        # Complete design specifications
│   ├── design-specifications.md # Human-readable documentation
│   └── assets/                 # All images for this design
│       ├── 281-984.png
│       ├── 281-1003.png
│       └── ...
├── landing-page-281-115/        # Landing page design
│   ├── LandingPage.tsx
│   ├── design-data.json
│   ├── design-specifications.md
│   └── assets/
└── analytics-dashboard-281-456/ # Analytics dashboard
    ├── AnalyticsDashboard.tsx
    ├── design-data.json
    ├── design-specifications.md
    └── assets/
```

### 🎨 What Each Extraction Contains:

1. **`{ComponentName}.tsx`** - Ready-to-use React component with dynamic naming
2. **`design-data.json`** - Complete JSON with all design specifications
3. **`design-specifications.md`** - Human-readable design documentation
4. **`assets/`** - All images exported as high-res PNGs (2x resolution)

### 🏗️ Design Specifications Include:
- **Layout Structure** - Exact dimensions, positioning, spacing
- **Typography** - Fonts, sizes, weights, colors, line heights
- **Colors** - Background colors, gradients, text colors (hex/rgba)
- **Images & Assets** - All images exported as high-res PNGs
- **Effects** - Shadows, blurs, and other visual effects
- **Component Hierarchy** - Complete nested structure
- **Tailwind CSS Classes** - Ready-to-use utility classes
- **Dynamic Component Names** - Generated from Figma node names

## 📋 Extraction Tracking System

The system automatically tracks all your extractions:

### `README.md` - Overview Dashboard
- Lists all extracted designs in a table
- Shows component names, node IDs, and asset counts
- Provides direct links to each extraction folder
- Updates automatically after each extraction

### `extraction-index.json` - Machine-Readable Index
- Complete metadata for all extractions
- Tracks timestamps, file paths, and component details
- Used for automation and integration scripts

### Example Overview:
```
| Component | Node ID | Extracted | Assets | Folder |
|-----------|---------|-----------|--------|----|
| UserManagement | 281-980 | 12/19/2025 | 15 | user-management-281-980/ |
| LandingPage | 281-115 | 12/18/2025 | 8 | landing-page-281-115/ |
| AnalyticsDashboard | 281-456 | 12/17/2025 | 12 | analytics-dashboard-281-456/ |
```

## 💡 Smart Features

### ✅ No More Overwrites
- Each extraction gets its own unique folder
- Previous work is always preserved
- Re-extracting the same node updates only that specific extraction

### ✅ Dynamic Component Naming
- "User Management" → `UserManagement.tsx`
- "Analytics Dashboard" → `AnalyticsDashboard.tsx`
- "Store Registration" → `StoreRegistration.tsx`

### ✅ Organized Asset Management
- Assets are isolated per extraction
- No conflicts between different designs
- Easy to find images for specific components

## 🔧 Manual Alternative (If Token Setup Fails)

If you can't get the Figma API token working:

1. **Export from Figma manually** - Select frames and export as PNG (2x scale)
2. **Use Figma Dev Mode** - Copy CSS specifications directly
3. **Screenshots for reference** - High-resolution captures for manual implementation

## 🔧 Troubleshooting

### Common Issues:
1. **403 Forbidden** - Check your Figma access token in `.env`
2. **Node not found** - Verify the node ID exists in your Figma file
3. **No images exported** - Check if the design contains image fills
4. **Large file sizes** - Images are exported at 2x resolution for quality

### Quick Fixes:
- **Test your token**: `curl -H "X-Figma-Token: YOUR_TOKEN" https://api.figma.com/v1/me`
- **Check file permissions** - Ensure you have access to the Figma file
- **Verify node ID** - Copy from Figma URL or use Dev Mode

### Getting Help:
- Figma API docs: https://www.figma.com/developers/api
- Check the generated `README.md` for your extraction overview

## 🚀 Implementation Workflow

### After Extraction:

1. **Check the overview** - Open `figma-extracted-design/README.md`
2. **Navigate to your component** - Go to the specific extraction folder
3. **Review specifications** - Read `design-specifications.md` for details
4. **Copy the component** - Use the generated `{ComponentName}.tsx` file
5. **Move assets** - Copy images from `assets/` to `public/images/shared/icons/` or appropriate folders
6. **Integrate with existing code** - Import and use in your app

### Example Integration:
```tsx
// Import the generated component
import { UserManagement } from './figma-extracted-design/user-management-281-980/UserManagement';

// Use in your app
export default function AdminPage() {
  return (
    <div>
      <UserManagement />
    </div>
  );
}
```

### Asset Integration:
```bash
# Copy shared icons to organized structure
cp figma-extracted-design/user-management-281-980/assets/*.png public/images/shared/icons/

# Reference in components
<img src="/images/shared/icons/user-icon.png" alt="User" />
```

## ✨ Benefits of Dynamic System

- **🔄 No Lost Work** - All extractions are preserved
- **📦 Organized Structure** - Each design has its own space
- **🏷️ Smart Naming** - Components named after Figma node names
- **📊 Easy Tracking** - Overview dashboard shows all extractions
- **🔍 Quick Navigation** - Direct links to each extraction folder
- **♻️ Reusable Assets** - Organized asset management with shared icons

The extraction system now grows with your project instead of overwriting your progress!