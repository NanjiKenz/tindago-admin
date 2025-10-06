'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { RejectedStoreDetail } from '@/components/admin/RejectedStoreDetail';
import { AdminService } from '@/lib/adminService';

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function RejectedStoreDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;

  const handleReReview = async (userId: string) => {
    try {
      // Update the registration status back to pending for re-review
      await AdminService.reReviewStoreRegistration(userId);
      console.log('🔄 Application moved back to pending review:', userId);

      // Navigate to Pending view after re-review
      router.push('/stores?view=pending');
    } catch (error) {
      console.error('Error re-reviewing application:', error);
      alert('Failed to re-review application. Please try again.');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      // Soft delete the registration
      await AdminService.deleteStoreRegistration(userId);
      console.log('🗑️ Registration deleted:', userId);

      // Navigate to overview after deletion
      router.push('/stores');
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration. Please try again.');
    }
  };

  const handleBack = () => {
    router.push('/stores?view=rejected');
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
        paddingTop: '100px',
        paddingBottom: '100px'
      }}
    >
      <div className="flex items-center justify-center">
        <RejectedStoreDetail
          userId={userId}
          onReReview={handleReReview}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
