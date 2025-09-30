'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminService, StoreRegistration } from '@/lib/adminService';

interface PendingApprovalDetailProps {
  userId: string;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string, reason?: string) => void;
  onBack?: () => void;
}

export const PendingApprovalDetail: React.FC<PendingApprovalDetailProps> = ({
  userId,
  onApprove,
  onReject,
  onBack
}) => {
  const [registration, setRegistration] = useState<StoreRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        setLoading(true);
        console.log(`🔍 [PendingApprovalDetail] Fetching registration for userId: ${userId}`);

        // Try to get from store_registrations first
        const registrations = await AdminService.getAllStoreRegistrations();
        let targetRegistration = registrations.find(reg => reg.userId === userId);

        if (targetRegistration) {
          console.log(`✅ [PendingApprovalDetail] Found registration in 'store_registrations'`);
        } else {
          console.log(`⚠️ [PendingApprovalDetail] Not found in 'store_registrations', checking 'stores' collection...`);
          // If not found, try to fetch from stores collection (might be a pending store)
          // This will be handled by StoreService
        }

        setRegistration(targetRegistration || null);
      } catch (error) {
        console.error('❌ [PendingApprovalDetail] Error fetching registration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [userId]);

  const handleApprove = async () => {
    if (!registration) return;

    try {
      setProcessing(true);
      await AdminService.approveStoreRegistration(userId);
      onApprove?.(userId);
    } catch (error) {
      console.error('Error approving registration:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!registration) return;

    try {
      setProcessing(true);
      await AdminService.rejectStoreRegistration(userId, rejectReason);
      onReject?.(userId, rejectReason);
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting registration:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div
        className="relative"
        style={{
          width: '1200px',
          height: '1000px',
          backgroundColor: '#f3f5f9',
          borderRadius: '16px',
          boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
          margin: '0 auto'
        }}
      >
        <div className="flex items-center justify-center h-full">
          <div
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '18px',
              color: '#1e1e1e'
            }}
          >
            Loading registration details...
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div
        className="relative"
        style={{
          width: '1200px',
          height: '1000px',
          backgroundColor: '#f3f5f9',
          borderRadius: '16px',
          boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
          margin: '0 auto'
        }}
      >
        <div className="flex items-center justify-center h-full">
          <div
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '18px',
              color: '#ef4343'
            }}
          >
            Registration not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: '1200px',
        height: (() => {
          const documents = registration.documents || {};
          const documentCount = Object.values(documents).filter(
            (doc: string | undefined) => doc && typeof doc === 'string'
          ).length;
          const docsHeight = Math.max(120, 70 + (documentCount * 50) + 20);
          return 700 + docsHeight + 70 + 50; // Base + docs + buttons + larger margin
        })(),
        backgroundColor: '#f3f5f9',
        borderRadius: '16px',
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
        margin: '0 auto'
      }}
    >
      {/* Header Section - White bar with back button and status */}
      <div
        className="absolute"
        style={{
          left: '0px',
          top: '100px',
          width: '1200px',
          height: '100px',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{
            left: '40px',
            top: '40px'
          }}
        >
          <Image
            src="/images/admin-dashboard/pending-approval/back-arrow.svg"
            alt="Back"
            width={20}
            height={20}
            className="object-contain"
          />
        </button>

        {/* Status Badge */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: '1062px',
            top: '34px',
            width: '98px',
            height: '32px',
            backgroundColor: '#fef9c3', // Always yellow for pending status display
            borderRadius: '8px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '5px',
            paddingBottom: '5px'
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '16px',
              color: '#b86b0e', // Always yellow text for pending status display
              textAlign: 'center'
            }}
          >
            Pending
          </span>
        </div>
      </div>

      {/* Business Owner Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '220px',
          width: '1120px',
          height: '150px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Avatar Circle */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: '20px',
            top: '20px',
            width: '40px',
            height: '40px',
            backgroundColor: '#dbeafe',
            borderRadius: '50%'
          }}
        >
          <Image
            src="/images/admin-dashboard/pending-approval/user-icon.svg"
            alt="User"
            width={25}
            height={25}
            className="object-contain"
          />
        </div>

        {/* Business Owner Title */}
        <h2
          className="absolute"
          style={{
            left: '80px',
            top: '27px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '24.6px',
            color: '#1e1e1e',
            textAlign: 'center'
          }}
        >
          Business Owner
        </h2>

        {/* Owner Name */}
        <div
          className="absolute"
          style={{
            left: '20px',
            top: '70px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '19.68px',
            color: '#1e1e1e'
          }}
        >
          {registration.personalInfo?.name ||
           registration.ownerName ||
           registration.displayName ||
           'Owner Name Not Provided'}
        </div>

        {/* Contact Info */}
        <div
          className="absolute"
          style={{
            left: '50px',
            top: '95px'
          }}
        >
          {/* Email */}
          <div
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '12.3px',
              color: '#3b82f6'
            }}
          >
            {registration.personalInfo?.email ||
             registration.email ||
             registration.ownerEmail ||
             'Email not provided'}
          </div>

          {/* Phone */}
          <div
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '12.3px',
              color: '#3b82f6',
              marginTop: '5px'
            }}
          >
            {registration.personalInfo?.mobile ||
             registration.phone ||
             registration.ownerPhone ||
             'Phone not provided'}
          </div>
        </div>
      </div>

      {/* Business Details Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '390px',
          width: '1120px',
          height: '180px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Business Details Header */}
        <div
          className="absolute flex items-center"
          style={{
            left: '20px',
            top: '20px'
          }}
        >
          {/* Icon Circle */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              marginRight: '20px'
            }}
          >
            <Image
              src="/images/admin-dashboard/pending-approval/business-building.svg"
              alt="Business Building"
              width={25}
              height={25}
              className="object-contain"
            />
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '22.14px',
              color: '#1e1e1e',
              textAlign: 'center'
            }}
          >
            Business Details
          </h2>
        </div>

        {/* Business Address */}
        <div
          className="absolute"
          style={{
            left: '40px',
            top: '70px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '19.68px',
            color: '#1e1e1e'
          }}
        >
          {registration.address || 'Address not provided'}
        </div>

        {/* Business Type and Permit Type */}
        <div className="absolute" style={{ left: '30px', top: '116px' }}>
          {/* Business Type */}
          <div style={{ display: 'inline-block', marginRight: '560px' }}>
            <div
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '22px',
                color: '#1e1e1e',
                marginBottom: '2px'
              }}
            >
              BUSINESS TYPE
            </div>
            <div
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '22px',
                color: '#1e1e1e'
              }}
            >
              {'Sari-Sari Store'}
            </div>
          </div>

          {/* Permit Type */}
          <div style={{ display: 'inline-block' }}>
            <div
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '22px',
                color: '#1e1e1e',
                marginBottom: '2px'
              }}
            >
              PERMIT TYPE
            </div>
            <div
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '22px',
                color: '#1e1e1e'
              }}
            >
              {'Business Permit'}
            </div>
          </div>
        </div>
      </div>

      {/* Business Description Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '590px',
          width: '1120px',
          height: '90px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Title */}
        <h2
          className="absolute"
          style={{
            left: '20px',
            top: '20px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '22.14px',
            color: '#1e1e1e'
          }}
        >
          Business Description
        </h2>

        {/* Description Text */}
        <p
          className="absolute"
          style={{
            left: '20px',
            top: '52px',
            width: '877px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '17.22px',
            color: '#1e1e1e'
          }}
        >
          {'No business description provided.'}
        </p>
      </div>

      {/* Submitted Documents Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '700px',
          width: '1120px',
          height: (() => {
            const documents = registration.documents || {};
            const documentCount = Object.values(documents).filter(
              (doc: string | undefined) => doc && typeof doc === 'string'
            ).length;
            return Math.max(120, 70 + (documentCount * 50) + 20); // Base height + documents + padding
          })(),
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div
          className="absolute flex items-center"
          style={{
            left: '20px',
            top: '20px'
          }}
        >
          {/* Icon Circle */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#f3e8ff',
              borderRadius: '50%',
              marginRight: '20px'
            }}
          >
            <Image
              src="/images/admin-dashboard/pending-approval/document-icon.svg"
              alt="Document"
              width={25}
              height={25}
              className="object-contain"
            />
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '22.14px',
              color: '#1e1e1e'
            }}
          >
            Submitted Documents
          </h2>
        </div>

        {/* Dynamic Document List */}
        {(() => {
          const documents = registration.documents || {};
          const documentList = [
            {
              key: 'businessPermit',
              name: 'Barangay Business Clearance',
              data: documents.businessPermit
            },
            {
              key: 'businessPermit',
              name: 'Business Permit',
              data: documents.businessPermit
            },
            {
              key: 'storePhoto',
              name: 'Store Photo',
              data: documents.storePhoto
            },
            {
              key: 'validId',
              name: 'Valid ID',
              data: documents.validId
            }
          ].filter(doc => doc.data && typeof doc.data === 'string');

          if (documentList.length === 0) {
            return (
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: '20px',
                  top: '70px',
                  width: '1080px',
                  height: '90px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  border: '2px dashed #d1d5db'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#6b7280'
                  }}
                >
                  No documents uploaded yet
                </span>
              </div>
            );
          }

          return documentList.map((doc, index) => (
            <div key={doc.key}>
              {/* Document Background */}
              <div
                className="absolute"
                style={{
                  left: '20px',
                  top: `${70 + (index * 50)}px`,
                  width: '1080px',
                  height: '40px',
                  backgroundColor: '#d9d9d9',
                  borderRadius: '8px'
                }}
              />

              {/* Document Row */}
              <div
                className="absolute flex items-center"
                style={{
                  left: '30px',
                  top: `${80 + (index * 50)}px`,
                  height: '20px'
                }}
              >
                {/* Document Icon */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '5px',
                    marginRight: '20px'
                  }}
                >
                  <Image
                    src="/images/admin-dashboard/pending-approval/small-document.svg"
                    alt="Document"
                    width={15}
                    height={15}
                    className="object-contain"
                  />
                </div>

                {/* Document Name */}
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '14.76px',
                    color: '#000000',
                    marginRight: 'auto'
                  }}
                >
                  {doc.name}
                </span>

                {/* View Link */}
                <button
                  onClick={() => {
                    if (doc.data && typeof doc.data === 'string') {
                      window.open(doc.data, '_blank');
                    }
                  }}
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '10px',
                    lineHeight: '12.3px',
                    color: (doc.data && typeof doc.data === 'string') ? '#3b82f6' : '#9ca3af',
                    marginLeft: '800px',
                    cursor: (doc.data && typeof doc.data === 'string') ? 'pointer' : 'not-allowed',
                    background: 'none',
                    border: 'none',
                    textDecoration: (doc.data && typeof doc.data === 'string') ? 'underline' : 'none'
                  }}
                  disabled={!doc.data || typeof doc.data !== 'string'}
                >
                  {(doc.data && typeof doc.data === 'string') ? 'View' : 'No file'}
                </button>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Action Buttons */}
      {/* Approve Button */}
      <button
        onClick={handleApprove}
        disabled={processing || registration.status === 'approved'}
        className="absolute flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
        style={{
          left: '40px',
          top: (() => {
            const documents = registration.documents || {};
            const documentCount = Object.values(documents).filter(
              (doc: string | undefined) => doc && typeof doc === 'string'
            ).length;
            const docsHeight = Math.max(120, 70 + (documentCount * 50) + 20);
            return 700 + docsHeight + 50; // Documents section top + height + larger margin
          })(),
          width: '540px',
          height: '50px',
          backgroundColor: registration.status === 'approved' ? '#9ca3af' : '#3bb77e',
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(59, 183, 126, 0.25)',
          border: 'none',
          cursor: (processing || registration.status === 'approved') ? 'not-allowed' : 'pointer',
          gap: '12px'
        }}
      >
        <Image
          src="/images/admin-dashboard/pending-approval/check-icon.svg"
          alt="Approve"
          width={25}
          height={25}
          className="object-contain"
        />
        <span
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '22px',
            color: '#ffffff',
            textAlign: 'center'
          }}
        >
          {processing ? 'Processing...' :
           registration.status === 'approved' ? 'Already Approved' :
           'Approve Application'}
        </span>
      </button>

      {/* Reject Button */}
      <button
        onClick={() => setShowRejectModal(true)}
        disabled={processing || registration.status === 'rejected'}
        className="absolute flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
        style={{
          left: '620px',
          top: (() => {
            const documents = registration.documents || {};
            const documentCount = Object.values(documents).filter(
              (doc: string | undefined) => doc && typeof doc === 'string'
            ).length;
            const docsHeight = Math.max(120, 70 + (documentCount * 50) + 20);
            return 700 + docsHeight + 50; // Documents section top + height + larger margin
          })(),
          width: '540px',
          height: '50px',
          backgroundColor: registration.status === 'rejected' ? '#9ca3af' : '#ef4343',
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(239, 67, 67, 0.25)',
          border: 'none',
          cursor: (processing || registration.status === 'rejected') ? 'not-allowed' : 'pointer',
          gap: '12px'
        }}
      >
        <Image
          src="/images/admin-dashboard/pending-approval/close-icon.svg"
          alt="Reject"
          width={25}
          height={25}
          className="object-contain"
        />
        <span
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '22px',
            color: '#ffffff',
            textAlign: 'center'
          }}
        >
          {registration.status === 'rejected' ? 'Already Rejected' : 'Reject Application'}
        </span>
      </button>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-2xl shadow-xl"
            style={{
              width: '500px',
              padding: '32px'
            }}
          >
            <h3
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 600,
                fontSize: '24px',
                color: '#1E1E1E',
                marginBottom: '16px'
              }}
            >
              Reject Application
            </h3>

            <p
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '14px',
                color: 'rgba(30, 30, 30, 0.7)',
                marginBottom: '24px',
                lineHeight: '1.5em'
              }}
            >
              Please provide a reason for rejecting this store registration application. This will help the applicant understand what needs to be improved.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-200 rounded-lg p-3 resize-none"
              style={{
                height: '120px',
                fontFamily: 'Clash Grotesk Variable',
                fontSize: '14px',
                marginBottom: '24px'
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#6B7280'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processing}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                {processing ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovalDetail;