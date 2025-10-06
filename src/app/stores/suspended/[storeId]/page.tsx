'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuspendedStoreDetail } from '@/components/admin/SuspendedStoreDetail';

export default function SuspendedStoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const handleReactivate = (storeId: string) => {
    console.log(`✅ Store ${storeId} reactivated successfully`);
    // Navigate to Active view after reactivation
    router.push('/stores?view=active');
  };

  const handleDelete = (storeId: string) => {
    console.log(`🗑️ Store ${storeId} deleted successfully`);
    // Navigate to overview after deletion
    router.push('/stores');
  };

  const handleBack = () => {
    router.push('/stores?view=suspended');
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden lg:overflow-visible"
      style={{
        width: '100vw',
        maxWidth: '1440px',
        minHeight: '1024px',
        backgroundColor: '#F3F5F9',
        margin: '0 auto',
        padding: '40px'
      }}
    >
      <SuspendedStoreDetail
        storeId={storeId}
        onReactivate={handleReactivate}
        onDelete={handleDelete}
        onBack={handleBack}
      />
    </div>
  );
}
