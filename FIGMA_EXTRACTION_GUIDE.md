# TindaGo Figma Design Extraction Guide

This guide will help you extract the complete design specifications from your TindaGo Share Figma design for pixel-perfect implementation.

## Quick Setup

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

### 3. Extract the Design

Run the extraction script for your specific node:

```bash
node scripts/figma-design-extractor.js 281-115
```

## What You'll Get

The script will create a `figma-extracted-design` folder with:

### 📁 Complete Design Data
- **`design-data.json`** - Complete JSON with all design specifications
- **`design-specifications.md`** - Human-readable design documentation
- **`TindaGoShare.tsx`** - Generated React component with Tailwind CSS
- **`assets/`** - Downloaded PNG images at 2x resolution

### 🎨 Design Specifications Include:
1. **Layout Structure** - Exact dimensions, positioning, spacing
2. **Typography** - Fonts, sizes, weights, colors, line heights
3. **Colors** - Background colors, gradients, text colors (hex/rgba)
4. **Images & Assets** - All images exported as high-res PNGs
5. **Effects** - Shadows, blurs, and other visual effects
6. **Component Hierarchy** - Complete nested structure
7. **Tailwind CSS Classes** - Ready-to-use utility classes
8. **React Component** - Fully generated JSX component

### 📊 Example Output Structure:
```
figma-extracted-design/
├── design-data.json          # Complete design data
├── design-specifications.md  # Human-readable specs
├── TindaGoShare.tsx         # Generated React component
└── assets/
    ├── 281-116.png          # Header image
    ├── 281-117.png          # Hero section
    ├── 281-118.png          # App store buttons
    └── ...                  # All extracted images
```

## Manual Alternative (If Token Setup Fails)

If you can't get the Figma API token working, you can:

1. **Export from Figma manually:**
   - Select your TindaGo Share frame (281-115)
   - Right-click → Export
   - Choose PNG, 2x scale
   - Export individual components

2. **Use Figma Dev Mode:**
   - Switch to Dev mode in Figma
   - Select elements to see CSS specifications
   - Copy the generated CSS values

3. **Screenshots for reference:**
   - Take high-resolution screenshots
   - Use browser developer tools to measure elements

## Expected Design Elements

Based on the URL node ID (281-115), this should extract:

- **Header Section** - Navigation, logo, menu buttons
- **Hero Section** - Main headline, subtitle, call-to-action
- **App Store Buttons** - Download buttons for iOS/Android
- **Product Images** - Phone mockups, app screenshots
- **Background Elements** - Gradients, decorative shapes
- **Typography System** - All text styles and hierarchies

## Troubleshooting

### Common Issues:
1. **403 Forbidden** - Check your Figma access token
2. **Node not found** - Verify the node ID (281-115)
3. **No images exported** - Check if images exist in the design
4. **Large file size** - Images are exported at 2x resolution

### Getting Help:
- Check Figma API documentation: https://www.figma.com/developers/api
- Verify file permissions in Figma (must have access to the file)
- Test token with: `curl -H "X-Figma-Token: YOUR_TOKEN" https://api.figma.com/v1/me`

## Implementation Next Steps

Once you have the extracted design:

1. **Review `design-specifications.md`** for complete specs
2. **Use `TindaGoShare.tsx`** as your starting component
3. **Copy images from `assets/`** to your `public/images/` folder
4. **Customize the generated Tailwind classes** as needed
5. **Add interactivity and functionality** to the component

The extraction will give you pixel-perfect specifications to match the Figma design exactly!