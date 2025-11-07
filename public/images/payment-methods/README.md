# Payment Method Logos

## How to Add Logo Images from Figma

### Step 1: Export from Figma
1. Open your Figma design: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1337-4347&m=dev
2. Select the **GCash logo** component
3. Right-click → Export → Select PNG format at 2x or 3x scale
4. Save as: `gcash-logo.png`

5. Select the **PayMaya logo** component  
6. Right-click → Export → Select PNG format at 2x or 3x scale
7. Save as: `paymaya-logo.png`

### Step 2: Add Images to This Folder
Place the exported images in this directory:
```
tindago-admin/
  public/
    images/
      payment-methods/
        gcash-logo.png     ← Add GCash logo here
        paymaya-logo.png   ← Add PayMaya logo here
```

### Expected Logo Specifications
Based on your Figma design:

#### GCash Logo
- Background: Blue (#007DFF or #2F7FED)
- Contains: GCash "G" icon + "Gcash" text
- Rounded corners: ~12px
- Recommended size: 240x80px (120x40px will be displayed at 2x)

#### PayMaya Logo
- Background: Green (#00D632)  
- Contains: "maya" watermark + "PayMaya" text
- Rounded corners: ~12px
- Recommended size: 240x80px (120x40px will be displayed at 2x)

### Step 3: Verify
After adding the images:
1. Restart your Next.js development server
2. Navigate to Transaction Records page
3. The payment method logos should now display the actual Figma designs

### Current Implementation
The logos are displayed in the Transaction Records table at:
- Width: 120px
- Height: 40px
- Object-fit: contain (preserves aspect ratio)

### Fallback
If images are not found, you'll see a broken image icon. Make sure:
- File names match exactly: `gcash-logo.png` and `paymaya-logo.png`
- Files are in the correct directory
- Files are PNG format with transparent or colored backgrounds

## Alternative: Use SVG Format
For better quality at any size, you can also export as SVG:
1. Export from Figma as SVG
2. Save as `gcash-logo.svg` and `paymaya-logo.svg`
3. Update the file extensions in the component if needed

## Need Help?
If you need to adjust the logo sizes, edit these values in:
`src/components/admin/TransactionManagement.tsx`

Look for the `GCashLogo` and `PayMayaLogo` components and modify the `width` and `height` props.
