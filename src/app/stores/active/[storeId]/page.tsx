'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ActiveStoreDetail } from '@/components/admin/ActiveStoreDetail';

export default function ActiveStoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;
  const returnTo = searchParams.get('returnTo');

  const handleEdit = (storeId: string) => {
    console.log('Edit store details for:', storeId);
    // Navigate to store edit page (to be implemented)
    alert(`Edit functionality for store ${storeId} will be implemented soon.`);
  };

  const handleSuspend = (storeId: string, reason?: string) => {
    console.log('⚠️ Store suspended:', storeId, 'Reason:', reason);
    // Navigate to Suspended view after suspension
    if (returnTo === 'storeManagement') {
      router.push('/stores?view=suspended');
    } else {
      router.push('/stores');
    }
  };

  const handleBack = () => {
    // Navigate back based on returnTo parameter
    if (returnTo === 'storeManagement') {
      router.push('/stores?view=active');
    } else {
      router.push('/stores');
    }
  };

  if (!storeId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg font-medium text-red-600">Invalid store ID</div>
      </div>
    );
  }

  return (
    <ActiveStoreDetail
      storeId={storeId}
      onEdit={handleEdit}
      onSuspend={handleSuspend}
      onBack={handleBack}
    />
  );
}
