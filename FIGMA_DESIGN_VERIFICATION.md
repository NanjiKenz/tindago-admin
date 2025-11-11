# Figma Design Verification Guide
## Admin Report & Analytics Page

### 🎯 Figma Reference
**Node ID**: 1337-3735  
**URL**: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1337-3735&m=dev

---

## ✅ Design Verification Checklist

### **Page Specifications**
- [ ] Canvas: 1440px × 1024px
- [ ] Background: #F3F5F9 (light gray-blue)
- [ ] Sidebar: 273px width
- [ ] Main content: 1167px width (1440 - 273)

### **Layout Structure**

#### 1. **Sidebar** (x:0, y:0, 273px × 1024px)
- [ ] TindaGo logo at top
- [ ] "Report & Analytic" menu item highlighted
- [ ] Blue background (#0077BE) on active item
- [ ] All menu items visible

#### 2. **Header** (x:273, y:0, 1167px × 80px)
- [ ] White background
- [ ] Admin profile info on right
- [ ] Menu hamburger icon on left (mobile)
- [ ] Proper shadow/border

#### 3. **Report Header** (x:308, y:120, ~1095px × 80px)
- [ ] Title: "Report & Analytics"
  - Font: Clash Grotesk Variable
  - Size: 48px
  - Weight: 500
  - Color: #1E1E1E
- [ ] Subtitle below title
  - Size: 16px
  - Color: rgba(30, 30, 30, 0.6)
- [ ] Bottom border line

---

### **Component Specifications**

#### 4. **Analytics Stats Cards** (4 cards)
**Position**: Below report header  
**Layout**: Horizontal row with 5px gaps

##### Card Dimensions:
- Width: 270px each
- Height: 150px
- Gap: 5px between cards
- Total width: 1095px (270×4 + 5×3)

##### Card Structure (Each):
```
┌────────────────────────────────┐
│ Title          [Icon 32×32]    │ ← Top: 20px padding
│ Subtitle                        │
│                                 │
│ Value (28px bold)               │ ← Bottom: 20px padding
│                         Trend ↑ │
└────────────────────────────────┘
```

##### Card Details:
1. **Page Views**
   - Icon bg: #6366F1 (Indigo)
   - Value: 342.8K
   - Trend: +18% ↑ (green)

2. **Conversion Rate**
   - Icon bg: #10B981 (Emerald)
   - Value: 3.42%
   - Trend: +8% ↑ (green)

3. **Avg Order Value**
   - Icon bg: #F59E0B (Amber)
   - Value: ₱1,250
   - Trend: -5% ↓ (red)

4. **Return Rate**
   - Icon bg: #EF4444 (Red)
   - Value: 2.1%
   - Trend: +12% ↑ (green)

#### 5. **Sales Chart** (Left Column)
**Position**: x:313, y:410, 620px × 320px

- [ ] White background card
- [ ] Rounded corners (16px)
- [ ] Title: "Sales Performance" (18px)
- [ ] Subtitle: "Monthly sales trend analysis" (12px)
- [ ] Blue line chart (#3B82F6)
- [ ] 12 data points (Jan-Dec)
- [ ] Grid lines (dashed, light gray)
- [ ] Data point circles (white border)
- [ ] Gradient area fill below line
- [ ] Y-axis labels (₱0 - ₱300K)
- [ ] X-axis month labels

#### 6. **Revenue Chart** (Right Column)
**Position**: x:953, y:410, 447px × 320px

- [ ] White background card
- [ ] Title: "Revenue Breakdown" (18px)
- [ ] Subtitle: "Revenue distribution by category" (12px)
- [ ] Donut chart in center
- [ ] Center text: Total amount
- [ ] Legend on right side
- [ ] 4 colored segments:
  - Blue: Product Sales (45%)
  - Green: Service Revenue (25%)
  - Amber: Delivery Fees (18%)
  - Red: Commission (12%)

#### 7. **Top Products Table** (Left Column)
**Position**: x:313, y:750, 620px × 280px

- [ ] White background card
- [ ] Title: "Top Products" (18px)
- [ ] Subtitle: "Best-selling products this month" (12px)
- [ ] Table headers:
  - Rank | Product | Sales | Revenue | Trend
- [ ] 5 product rows
- [ ] Product names and categories
- [ ] Sales numbers
- [ ] Revenue amounts (₱)
- [ ] Trend indicators (↑ ↓)
- [ ] Row hover effects

#### 8. **User Activity** (Right Column)
**Position**: x:953, y:750, 447px × 280px

- [ ] White background card
- [ ] Title: "User Activity" (18px)
- [ ] Subtitle: "Real-time user engagement metrics" (12px)
- [ ] 4 metric boxes (2×2 grid):
  - Active Users (with trend)
  - Session Duration (with trend)
  - Bounce Rate (with trend)
  - Page Views/Session (with trend)
- [ ] Recent activity feed below
- [ ] User actions with timestamps
- [ ] Transaction amounts

---

## 🎨 **Typography Specifications**

### Fonts
```css
font-family: 'Clash Grotesk Variable'
```

### Sizes & Weights:
- Page Title: 48px, weight 500
- Section Headers: 18px, weight 500
- Metric Values: 28px, weight 700
- Card Titles: 14px, weight 500
- Body Text: 14px, weight 400
- Captions/Subtitles: 12px, weight 400
- Small Text: 10px, weight 400

---

## 🎨 **Color Specifications**

### Primary Colors:
```css
Background: #F3F5F9
Card White: #FFFFFF
Text Primary: #1E1E1E
Text Secondary: rgba(30, 30, 30, 0.6)
```

### Accent Colors:
```css
Blue Primary: #3B82F6
Blue Active: #0077BE
Green Success: #22C55E
Green: #10B981
Red Error: #EF4444
Amber Warning: #F59E0B
Indigo: #6366F1
```

### Shadows:
```css
Card Shadow: 0px 4px 20px rgba(0, 0, 0, 0.1)
Border: 1px solid rgba(0, 0, 0, 0.05)
```

---

## 📐 **Spacing & Layout**

### Padding:
- Card internal: 20px all sides
- Content left/right: 35px from container edge
- Section vertical gaps: 40px
- Component gaps: 20px

### Border Radius:
- Cards: 16px (rounded-2xl)
- Icon badges: 12px (rounded-xl)
- Buttons: varies by component

---

## ✅ **Visual Testing Steps**

### 1. **Overall Layout**
- [ ] Page centered on screen
- [ ] Sidebar aligned to left edge
- [ ] Content area properly offset
- [ ] No horizontal scrolling at 1440px
- [ ] Background color correct

### 2. **Stat Cards**
- [ ] All 4 cards visible in one row
- [ ] Equal spacing between cards
- [ ] Icons in top-right corners
- [ ] Values large and bold
- [ ] Trend arrows pointing correct direction
- [ ] Colors matching specification

### 3. **Charts**
- [ ] Sales chart smooth line curve
- [ ] Data points visible on line
- [ ] Grid lines subtle and dashed
- [ ] Revenue donut chart circular
- [ ] Segment colors distinct
- [ ] Legend aligned properly

### 4. **Tables**
- [ ] Headers properly aligned
- [ ] Content rows evenly spaced
- [ ] Text alignment consistent
- [ ] Borders subtle
- [ ] Hover effects working

### 5. **Typography**
- [ ] All text using Clash Grotesk
- [ ] Font sizes match spec
- [ ] Font weights correct
- [ ] Line heights proper
- [ ] Text colors accurate

### 6. **Spacing**
- [ ] Consistent padding in cards
- [ ] Proper gaps between components
- [ ] Aligned grid system
- [ ] No overlapping elements
- [ ] White space balanced

### 7. **Responsive Behavior**
- [ ] Desktop (1440px): Full layout
- [ ] Smaller desktop (1024px): Adjusted
- [ ] Tablet: Responsive layout
- [ ] Mobile: Sidebar collapses

---

## 🐛 **Common Issues to Check**

### Typography Issues:
- ❌ Wrong font family (not Clash Grotesk)
- ❌ Incorrect font weights
- ❌ Text sizes don't match
- ❌ Line heights too tight/loose

### Layout Issues:
- ❌ Cards not aligned horizontally
- ❌ Inconsistent spacing between elements
- ❌ Components overlapping
- ❌ Wrong positioning coordinates

### Color Issues:
- ❌ Background color not #F3F5F9
- ❌ Card shadows too dark/light
- ❌ Trend indicators wrong color
- ❌ Icon backgrounds don't match

### Chart Issues:
- ❌ Line chart not smooth
- ❌ Donut chart segments misaligned
- ❌ Legend colors don't match chart
- ❌ Grid lines too prominent

---

## 🔧 **How to Compare with Figma**

### Step 1: Open Figma Design
1. Go to: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1337-3735&m=dev
2. View at 100% zoom
3. Take screenshot or use inspect mode

### Step 2: Open Localhost
1. Run: `npm run dev`
2. Navigate to: `http://localhost:3000/analytics`
3. View at 100% browser zoom

### Step 3: Side-by-Side Comparison
1. Place windows side by side
2. Compare each component visually
3. Check positioning with browser DevTools
4. Verify colors with color picker
5. Measure spacing with ruler tool

### Step 4: Detailed Inspection
Use browser DevTools to verify:
- Element dimensions (width/height)
- Position (left/top coordinates)
- Colors (computed styles)
- Fonts (font-family, size, weight)
- Spacing (padding, margin, gaps)

---

## 📸 **Screenshot Comparison**

Take screenshots of:
1. Full page view
2. Each component individually
3. Hover states
4. Mobile view

Compare with Figma:
- Overlay screenshots in image editor
- Use 50% opacity to see differences
- Mark any discrepancies

---

## ✅ **Sign-Off Checklist**

- [ ] All components render correctly
- [ ] Typography matches Figma exactly
- [ ] Colors are pixel-perfect
- [ ] Spacing is accurate
- [ ] Charts display properly
- [ ] Interactive elements work
- [ ] Responsive design functions
- [ ] No console errors
- [ ] Page loads quickly
- [ ] Design approved

---

## 📝 **Notes**

If you find any discrepancies between the implemented design and Figma:

1. Note the specific component
2. Document what's different
3. Note expected vs actual values
4. Take screenshots
5. Report for fixing

---

**Last Updated**: 2025-11-11  
**Figma Node**: 1337-3735  
**Status**: ✅ Ready for Verification
