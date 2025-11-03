# TindaGo Admin Dashboard - Action Buttons Implementation Guide

## ✅ Professional Approach: Soft Deletes + Full Functionality

This guide implements ALL action buttons with professional best practices:
- **Status Management** (Deactivate/Suspend) instead of hard deletes
- **View** detailed information modals
- **Edit** navigation to edit pages
- **Profile** comprehensive user/store profiles

---

## 📦 Available Components

### 1. `StatusChangeModal.tsx` ✅ Created
Professional modal for status changes with:
- Deactivate (temporary, reversible)
- Suspend (policy violations)
- Reactivate (restore access)
- Optional reason input
- Loading states

### 2. `ViewDetailsModal.tsx` ✅ Created
Professional modal for viewing details with:
- Flexible sections and fields
- Status badges
- Scrollable content
- Professional styling

### 3. `DeleteConfirmationModal.tsx` ✅ Created (Legacy - use StatusChangeModal instead)

---

## 🎯 Implementation Pattern for Each Management Page

### Step 1: Import Required Components

```typescript
import { StatusChangeModal } from '@/components/admin/StatusChangeModal';
import { ViewDetailsModal } from '@/components/admin/ViewDetailsModal';
import { useRouter } from 'next/navigation';
```

### Step 2: Add State Management

```typescript
const [statusModal, setStatusModal] = useState<{
  isOpen: boolean;
  action: 'deactivate' | 'suspend' | 'reactivate';
  itemId: string | null;
  itemName: string;
  currentStatus: string;
}>({
  isOpen: false,
  action: 'deactivate',
  itemId: null,
  itemName: '',
  currentStatus: ''
});

const [viewModal, setViewModal] = useState<{
  isOpen: boolean;
  data: any | null;
}>({
  isOpen: false,
  data: null
});

const [isProcessing, setIsProcessing] = useState(false);
```

### Step 3: Implement Action Handlers

```typescript
// 1. VIEW HANDLER
const handleView = (item: any) => {
  setViewModal({
    isOpen: true,
    data: item
  });
};

// 2. EDIT HANDLER
const router = useRouter();
const handleEdit = (id: string, type?: string) => {
  router.push(`/[resource]/edit/${id}`);
};

// 3. STATUS CHANGE HANDLERS
const handleDeactivate = (item: any) => {
  setStatusModal({
    isOpen: true,
    action: 'deactivate',
    itemId: item.id,
    itemName: item.name,
    currentStatus: item.status
  });
};

const handleSuspend = (item: any) => {
  setStatusModal({
    isOpen: true,
    action: 'suspend',
    itemId: item.id,
    itemName: item.name,
    currentStatus: item.status
  });
};

const handleReactivate = (item: any) => {
  setStatusModal({
    isOpen: true,
    action: 'reactivate',
    itemId: item.id,
    itemName: item.name,
    currentStatus: item.status
  });
};

// 4. STATUS CHANGE CONFIRM HANDLER
const confirmStatusChange = async (reason?: string) => {
  if (!statusModal.itemId) return;

  try {
    setIsProcessing(true);

    // Determine new status
    const newStatus = statusModal.action === 'reactivate' ? 'active' :
                     statusModal.action === 'deactivate' ? 'inactive' : 'suspended';

    // Call API
    const response = await fetch('/api/admin/[resource]/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: statusModal.itemId,
        status: newStatus,
        reason: reason
      })
    });

    if (!response.ok) throw new Error('Status change failed');

    // Refresh data
    await loadData();

    // Close modal
    setStatusModal({
      isOpen: false,
      action: 'deactivate',
      itemId: null,
      itemName: '',
      currentStatus: ''
    });

    // Show success message (implement toast notification)
    console.log('Status updated successfully');

  } catch (error) {
    console.error('Status change error:', error);
    setError('Failed to update status. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};

// 5. PROFILE HANDLER (for users/customers/stores)
const handleProfile = (id: string) => {
  router.push(`/[resource]/profile/${id}`);
};
```

### Step 4: Update Table Action Buttons

```typescript
{/* Actions Column */}
<td style={{ padding: '25px 20px' }}>
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '8px'
  }}>

    {/* VIEW Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleView(item);
      }}
      title="View details"
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#3BB77E';
        e.currentTarget.style.borderColor = '#3BB77E';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>

    {/* EDIT Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleEdit(item.id);
      }}
      title="Edit"
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#0077BE';
        e.currentTarget.style.borderColor = '#0077BE';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>

    {/* PROFILE Button (for users/customers/stores) */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleProfile(item.id);
      }}
      title="View profile"
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#6366F1';
        e.currentTarget.style.borderColor = '#6366F1';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </button>

    {/* DEACTIVATE/SUSPEND Button (conditional based on status) */}
    {item.status === 'active' ? (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeactivate(item);
        }}
        title="Deactivate"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: '#FFFFFF',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F59E0B';
          e.currentTarget.style.borderColor = '#F59E0B';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.transform = 'translateY(0px)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
      </button>
    ) : (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleReactivate(item);
        }}
        title="Reactivate"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: '#FFFFFF',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#22C55E';
          e.currentTarget.style.borderColor = '#22C55E';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.transform = 'translateY(0px)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
        </svg>
      </button>
    )}
  </div>
</td>
```

### Step 5: Add Modal Components to JSX

```typescript
{/* Status Change Modal */}
<StatusChangeModal
  isOpen={statusModal.isOpen}
  onClose={() => setStatusModal({
    ...statusModal,
    isOpen: false
  })}
  onConfirm={confirmStatusChange}
  action={statusModal.action}
  resourceType="user" // Change based on management page
  resourceName={statusModal.itemName}
  currentStatus={statusModal.currentStatus}
  isProcessing={isProcessing}
/>

{/* View Details Modal */}
<ViewDetailsModal
  isOpen={viewModal.isOpen}
  onClose={() => setViewModal({ isOpen: false, data: null })}
  title={viewModal.data?.name || 'Details'}
  subtitle={viewModal.data?.email}
  badge={{
    text: viewModal.data?.status || 'Unknown',
    color: viewModal.data?.status === 'active' ? '#22C55E' : '#EF4444',
    bgColor: viewModal.data?.status === 'active' ? '#D1FAE5' : '#FEE2E2'
  }}
  sections={[
    {
      title: 'Basic Information',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BB77E" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>,
      fields: [
        { label: 'Full Name', value: viewModal.data?.name },
        { label: 'Email', value: viewModal.data?.email },
        { label: 'Phone', value: viewModal.data?.phone },
        { label: 'Status', value: viewModal.data?.status, highlight: true },
        { label: 'Role', value: viewModal.data?.role },
        { label: 'Joined Date', value: viewModal.data?.createdAt ? new Date(viewModal.data.createdAt).toLocaleDateString() : '—' }
      ]
    },
    {
      title: 'Account Details',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BB77E" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>,
      fields: [
        { label: 'Last Login', value: viewModal.data?.lastLoginAt ? new Date(viewModal.data.lastLoginAt).toLocaleDateString() : 'Never' },
        { label: 'Total Orders', value: viewModal.data?.stats?.totalOrders || 0 },
        { label: 'Total Spent', value: viewModal.data?.stats?.totalSpent ? `₱${viewModal.data.stats.totalSpent.toLocaleString()}` : '₱0' }
      ]
    }
  ]}
/>
```

---

## 📁 Specific Implementation for Each Page

### 1. **AdminManagement.tsx**
- **Actions**: View, Edit, Deactivate/Reactivate
- **Resource Type**: `'admin'`
- **Edit Route**: `/admins/edit/[id]`
- **No Profile button** (admins don't need public profiles)

### 2. **UserManagement.tsx**
- **Actions**: View, Edit, Profile, Deactivate/Reactivate
- **Resource Type**: `'user'`
- **Edit Route**: `/users/edit/[id]`
- **Profile Route**: `/users/profile/[id]`

### 3. **CustomerManagement.tsx**
- **Actions**: View, Edit, Profile, Deactivate/Suspend
- **Resource Type**: `'customer'`
- **Edit Route**: `/customers/edit/[id]`
- **Profile Route**: `/customers/profile/[id]`

### 4. **StoreManagement.tsx**
- **Actions**: View, Edit (already implemented), Profile, Suspend/Reactivate
- **Resource Type**: `'store'`
- **Edit Route**: Already implemented with status-based routing
- **Profile Route**: `/stores/profile/[id]`

---

## 🔧 API Endpoints Needed

Create these API routes in `src/app/api/admin/`:

### 1. Update Status Endpoint
```typescript
// src/app/api/admin/[resource]/update-status/route.ts
export async function POST(request: Request) {
  try {
    const { id, status, reason } = await request.json();

    // Update Firebase
    const db = getDatabase();
    await update(ref(db, `[resource]/${id}`), {
      status: status,
      statusChangedAt: new Date().toISOString(),
      statusChangeReason: reason || null,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
```

---

## 🎨 UI/UX Best Practices

1. **Button Colors**:
   - View: Green (#3BB77E)
   - Edit: Blue (#0077BE)
   - Profile: Indigo (#6366F1)
   - Deactivate: Amber (#F59E0B)
   - Suspend: Red (#EF4444)
   - Reactivate: Green (#22C55E)

2. **Hover Effects**: Always include scale and shadow

3. **Loading States**: Disable buttons during processing

4. **Tooltips**: Use `title` attribute for button descriptions

5. **Confirmation Modals**: Always require confirmation for status changes

---

## ✅ Implementation Checklist

- [ ] Import modal components
- [ ] Add state management
- [ ] Implement all action handlers
- [ ] Update table action buttons
- [ ] Add modal components to JSX
- [ ] Create API endpoints
- [ ] Test all functionality
- [ ] Add toast notifications
- [ ] Implement audit logging

---

## 🚀 Next Steps

Would you like me to implement this for:
1. **One specific management page** (as example)
2. **All management pages** (comprehensive)
3. **Just the API endpoints**
4. **Focus on specific actions** (e.g., just View and Edit)

Let me know your preference, and I'll proceed with the implementation!
