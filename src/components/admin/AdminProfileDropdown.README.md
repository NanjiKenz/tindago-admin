# AdminProfileDropdown Component

## Overview
Pixel-perfect implementation of the Admin Profile dropdown menu from Figma design (node-id: 1337:3718).

## Design Specifications

### Container
- **Dimensions**: 200px × 196px
- **Background**: #FFFFFF (white)
- **Border Radius**: 16px
- **Shadow**: 0px 4px 20px rgba(0, 0, 0, 0.1)
- **Position**: Absolute, positioned 60px below header profile button

### Profile Section (Top)
- **Avatar Circle**: 
  - 40px × 40px
  - Background: #3B82F6 (blue)
  - Position: x:20px, y:20px (relative to container)
  - Contains user initials in white

- **User Information**:
  - **Name**: 
    - Font: Clash Grotesk Variable, 500 weight, 16px
    - Color: #1E1E1E
    - Line height: 19.68px
  - **Role**:
    - Font: Clash Grotesk Variable, 400 weight, 12px
    - Color: rgba(30, 30, 30, 0.5)
    - Line height: 14.76px
  - **Email**:
    - Font: Clash Grotesk Variable, 400 weight, 10px
    - Color: rgba(30, 30, 30, 0.8)
    - Line height: 12.3px

### Separator Line
- **Position**: y:77.5px
- **Width**: 171px
- **Height**: 0.5px
- **Color**: rgba(30, 30, 30, 0.5)

### Menu Items

#### Profile Settings (Frame 24)
- **Position**: y:87px
- **Dimensions**: 171px × 35px
- **Padding**: 5px (left/right), 10px (top/bottom)
- **Gap**: 10px between icon and text
- **Icon**: 15px × 15px settings icon
- **Text**: Clash Grotesk Variable, 500 weight, 12px

#### Logout (Frame 25)
- **Position**: y:122px
- **Dimensions**: 171px × 35px
- **Padding**: 5px (left/right), 10px (top/bottom)
- **Gap**: 10px between icon and text
- **Icon**: 15px × 15px logout icon
- **Text**: Clash Grotesk Variable, 500 weight, 12px

### Footer
- **Position**: y:173px
- **Text**: "Version 1.0.0 ~ Privacy Policy"
- **Font**: Clash Grotesk Variable, 500 weight, 8px
- **Line height**: 9.84px
- **Color**: #1E1E1E
- **Alignment**: Center

## Component Props

```typescript
interface AdminProfileDropdownProps {
  isOpen: boolean;                      // Controls dropdown visibility
  onClose: () => void;                   // Callback when dropdown should close
  userName?: string;                     // User's full name (default: "Maynard Dotarot")
  userEmail?: string;                    // User's email (default: "maynard08@gmail.com")
  userRole?: string;                     // User's role (default: "Admin")
  userInitials?: string;                 // User's initials for avatar (default: "MD")
  onProfileSettingsClick?: () => void;   // Callback for Profile Settings action
  onLogoutClick?: () => void;            // Callback for Logout action
}
```

## Usage Example

```typescript
import { AdminProfileDropdown } from '@/components/admin/AdminProfileDropdown';

function HeaderComponent() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setShowProfileMenu(!showProfileMenu)}>
        Profile
      </button>
      
      <AdminProfileDropdown
        isOpen={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        userName="Maynard Dotarot"
        userEmail="maynard08@gmail.com"
        userRole="Admin"
        userInitials="MD"
        onProfileSettingsClick={() => {
          console.log('Navigate to profile settings');
        }}
        onLogoutClick={() => {
          console.log('Perform logout');
        }}
      />
    </div>
  );
}
```

## Integration with AdminHeader

The component is already integrated into `AdminHeader.tsx`:

```typescript
<AdminProfileDropdown
  isOpen={showUserMenu}
  onClose={() => setShowUserMenu(false)}
  userName="Maynard Dotarot"
  userEmail="maynard08@gmail.com"
  userRole="Admin"
  userInitials="MD"
  onProfileSettingsClick={() => {
    // TODO: Navigate to profile settings page
  }}
  onLogoutClick={() => {
    // TODO: Implement logout functionality
  }}
/>
```

## Assets Required

The component requires these image assets in `public/images/admin-dashboard/`:

1. **settings-icon.png** - 15×15px settings icon
2. **logout-icon.png** - 15×15px logout icon

Both icons have been automatically downloaded from Figma and placed in the correct directory.

## Features

✅ **Pixel-perfect positioning** - Exact coordinates from Figma (±0px tolerance)
✅ **Clash Grotesk Variable font** - Typography matches design exactly
✅ **Exact color values** - All colors use hex codes from Figma
✅ **Backdrop click-to-close** - Transparent overlay for easy dismissal
✅ **Hover states** - Interactive feedback on menu items
✅ **Accessibility** - Proper button semantics and keyboard navigation
✅ **TypeScript** - Full type safety with interface definitions
✅ **Responsive positioning** - Automatically positions below profile button

## Design Alignment

This component maintains perfect alignment with the Figma design:

- ✅ Container dimensions exactly 200×196px
- ✅ All text uses Clash Grotesk Variable font
- ✅ Exact font sizes, weights, and line heights
- ✅ Precise positioning of all elements
- ✅ 16px border radius matching design
- ✅ Exact shadow specifications
- ✅ 0.5px separator line
- ✅ Proper padding and spacing throughout

## Testing

To test the component:

1. Click on the profile section in the header (with "Maynard Dotarot" name)
2. The dropdown should appear below the profile button
3. Verify all elements are properly aligned
4. Test clicking "Profile Settings" and "Logout" buttons
5. Click outside the dropdown to close it
6. Verify hover states work on menu items

## Future Enhancements

Potential improvements for future iterations:

- [ ] Connect to actual user data from Firebase Auth
- [ ] Implement actual logout functionality with Firebase
- [ ] Add navigation to profile settings page
- [ ] Add loading states
- [ ] Add animations for dropdown open/close
- [ ] Make avatar image dynamic instead of initials
- [ ] Add more menu items as needed
- [ ] Implement keyboard navigation (arrow keys)

## Files Created/Modified

### New Files:
- `src/components/admin/AdminProfileDropdown.tsx` - Main component
- `src/components/admin/AdminProfileDropdown.README.md` - This documentation
- `public/images/admin-dashboard/settings-icon.png` - Settings icon
- `public/images/admin-dashboard/logout-icon.png` - Logout icon

### Modified Files:
- `src/components/admin/AdminHeader.tsx` - Integrated dropdown component

## Figma Reference

- **File ID**: 8I1Nr3vQZllDDknSevstvH
- **Node ID**: 1337:3718
- **Design Name**: Profile
- **Figma Link**: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1337-3718&m=dev
