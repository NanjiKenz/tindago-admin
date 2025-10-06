'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PendingApprovalDetail } from '@/components/admin';

export default function PendingApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const returnTo = searchParams.get('returnTo');

  const handleApprove = (userId: string) => {
    console.log('✅ Store registration approved for user:', userId);
    // Navigate to Active view after approval
    if (returnTo === 'storeManagement') {
      router.push('/stores?view=active');
    } else {
      router.push('/stores');
    }
  };

  const handleReject = (userId: string, reason?: string) => {
    console.log('❌ Store registration rejected for user:', userId, 'Reason:', reason);
    // Navigate to Rejected view after rejection
    if (returnTo === 'storeManagement') {
      router.push('/stores?view=rejected');
    } else {
      router.push('/stores');
    }
  };

  const handleBack = () => {
    // Navigate back based on returnTo parameter
    if (returnTo === 'storeManagement') {
      router.push('/stores?view=pending');
    } else {
      router.push('/stores/pending');
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg font-medium text-red-600">Invalid user ID</div>
      </div>
    );
  }

  return (
    <PendingApprovalDetail
      userId={userId}
      onApprove={handleApprove}
      onReject={handleReject}
      onBack={handleBack}
    />
  );
}