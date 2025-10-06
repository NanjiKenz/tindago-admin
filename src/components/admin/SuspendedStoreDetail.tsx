'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { StoreService } from '@/lib/storeService';
import { Store } from '@/types/storeManagement';

interface SuspendedStoreDetailProps {
  storeId: string;
  onReactivate?: (storeId: string) => void;
  onDelete?: (storeId: string) => void;
  onBack?: () => void;
}

export const SuspendedStoreDetail: React.FC<SuspendedStoreDetailProps> = ({
  storeId,
  onReactivate,
  onDelete,
  onBack
}) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  // Helper function to convert base64 data URL to Blob URL
  const convertBase64ToBlob = (dataUrl: string): string => {
    try {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      console.log('✅ [Blob Conversion] Base64 converted to Blob URL:', {
        originalLength: dataUrl.length,
        mimeType: mime,
        blobUrl: blobUrl
      });

      return blobUrl;
    } catch (error) {
      console.error('❌ [Blob Conversion] Failed to convert base64:', error);
      throw error;
    }
  };

  // Helper function to check if document has valid URI
  const hasValidUri = (docData: unknown): boolean => {
    if (!docData) return false;

    // String format (legacy)
    if (typeof docData === 'string') {
      return docData.trim().length > 0;
    }

    // Object format (React Native app)
    if (typeof docData === 'object' && docData !== null && 'uri' in docData) {
      const doc = docData as { uri?: string };
      return !!(doc.uri && doc.uri.trim().length > 0);
    }

    return false;
  };

  // Helper function to get ONLY uploaded documents (filter out documents without valid URIs)
  const getUploadedDocumentsList = (store: Store | null) => {
    if (!store) return [];

    const documents = store.documents || {};

    const allDocuments = [
      {
        key: 'businessPermit',
        name: 'Business Permit',
        data: documents.businessPermit,
        required: true
      },
      {
        key: 'validId',
        name: 'Valid ID',
        data: documents.validId,
        required: true
      },
      {
        key: 'barangayBusinessClearance',
        name: 'Barangay Business Clearance',
        data: documents.barangayBusinessClearance,
        required: false
      },
      {
        key: 'dtiRegistration',
        name: 'DTI Registration',
        data: documents.dtiRegistration,
        required: false
      }
    ];

    return allDocuments.filter(doc => hasValidUri(doc.data));
  };

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        console.log(`🔍 [SuspendedStoreDetail] Fetching store data for storeId: ${storeId}`);

        const storeData = await StoreService.getStoreById(storeId);

        if (storeData) {
          console.log(`✅ [SuspendedStoreDetail] Found store data:`, {
            storeId: storeData.storeId,
            status: storeData.status,
            storeName: storeData.storeName
          });
          setStore(storeData);
        } else {
          console.log(`⚠️ [SuspendedStoreDetail] Store not found for ID: ${storeId}`);
        }
      } catch (error) {
        console.error('❌ [SuspendedStoreDetail] Error fetching store:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  const handleReactivate = async () => {
    if (!store) return;

    try {
      setProcessing(true);
      await StoreService.reactivateStore(storeId);
      onReactivate?.(storeId);
      setShowReactivateModal(false);
    } catch (error) {
      console.error('Error reactivating store:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!store) return;

    try {
      setProcessing(true);
      await StoreService.permanentlyDeleteStore(storeId);
      onDelete?.(storeId);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting store:', error);
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
            Loading store details...
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
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
            Store not found
          </div>
        </div>
      </div>
    );
  }

  const uploadedDocs = getUploadedDocumentsList(store);
  const documentCount = uploadedDocs.length;
  const docsHeight = documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30);
  // Add height for suspension reason section (120px)
  const totalHeight = 700 + 120 + docsHeight + 70 + 80;

  // Get suspension reason from store data
  const suspensionReason = store?.statusReason || 'No suspension reason provided';

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: '1200px',
        height: totalHeight,
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

        {/* Status Badge - Suspended (Orange/Amber) */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: '1040px',
            top: '34px',
            width: '120px',
            height: '32px',
            backgroundColor: '#fef3c7',
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
              color: '#d97706',
              textAlign: 'center'
            }}
          >
            Suspended
          </span>
        </div>
      </div>

      {/* Suspension Reason Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '220px',
          width: '1120px',
          height: '100px',
          backgroundColor: '#fffbeb',
          borderRadius: '16px',
          boxShadow: '0px 0px 5px rgba(217, 119, 6, 0.15)',
          border: '1px solid #fde68a'
        }}
      >
        {/* Warning Icon */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: '20px',
            top: '20px',
            width: '40px',
            height: '40px',
            backgroundColor: '#fef3c7',
            borderRadius: '50%'
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: '#d97706' }}
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Suspension Reason Title */}
        <h2
          className="absolute"
          style={{
            left: '80px',
            top: '20px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '19.68px',
            color: '#d97706',
            textAlign: 'left'
          }}
        >
          Suspension Reason
        </h2>

        {/* Suspension Reason Text */}
        <p
          className="absolute"
          style={{
            left: '80px',
            top: '50px',
            width: '1000px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '17.22px',
            color: '#92400e'
          }}
        >
          {suspensionReason}
        </p>
      </div>

      {/* Business Owner Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '340px',
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
          {store.ownerName}
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
            {store.ownerEmail}
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
            {store.ownerPhone || 'Phone not provided'}
          </div>
        </div>
      </div>

      {/* Business Details Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '510px',
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
          {store.address}
        </div>

        {/* Business Type */}
        <div className="absolute" style={{ left: '30px', top: '116px' }}>
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
              {store.storeCategory || 'Sari-Sari Store'}
            </div>
          </div>
        </div>
      </div>

      {/* Business Description Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '710px',
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
          {store.storeDescription || 'No business description provided.'}
        </p>
      </div>

      {/* Submitted Documents Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '820px',
          width: '1120px',
          height: docsHeight,
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
        {uploadedDocs.length === 0 ? (
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
              No documents uploaded
            </span>
          </div>
        ) : (
          uploadedDocs.map((doc, index) => (
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
                className="absolute flex items-center justify-between"
                style={{
                  left: '30px',
                  top: `${80 + (index * 50)}px`,
                  width: '1060px',
                  height: '20px'
                }}
              >
                {/* Left side - Icon + Document Name */}
                <div className="flex items-center">
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
                      color: '#000000'
                    }}
                  >
                    {doc.name}
                  </span>
                </div>

                {/* Right side - View Link */}
                <button
                  onClick={() => {
                    try {
                      let uri: string | undefined;

                      if (typeof doc.data === 'string') {
                        uri = (doc.data as string).trim();
                      } else if (typeof doc.data === 'object' && doc.data && 'uri' in doc.data) {
                        const docData = doc.data as { uri?: string };
                        uri = docData.uri?.trim();
                      }

                      if (uri && uri.length > 0) {
                        let urlToOpen = uri;

                        if (uri.startsWith('data:')) {
                          urlToOpen = convertBase64ToBlob(uri);
                        }

                        const newWindow = window.open(urlToOpen, '_blank');

                        if (!newWindow) {
                          alert('Pop-up blocked! Please allow pop-ups to view documents.');
                        }
                      }
                    } catch (error) {
                      console.error('❌ [View Document] Error:', error);
                      alert(`Error opening document: ${error}`);
                    }
                  }}
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '10px',
                    lineHeight: '12.3px',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    textDecoration: 'underline'
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      {/* Reactivate Store Button */}
      <button
        onClick={() => setShowReactivateModal(true)}
        disabled={processing}
        className="absolute flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
        style={{
          left: '40px',
          top: `${820 + docsHeight + 30}px`,
          width: '540px',
          height: '50px',
          backgroundColor: '#22c55e',
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(34, 197, 94, 0.25)',
          border: 'none',
          cursor: processing ? 'not-allowed' : 'pointer',
          gap: '12px'
        }}
      >
        <Image
          src="/images/admin-dashboard/pending-approval/check-icon.svg"
          alt="Reactivate"
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
          Reactivate Store
        </span>
      </button>

      {/* Delete Store Button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={processing}
        className="absolute flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
        style={{
          left: '620px',
          top: `${820 + docsHeight + 30}px`,
          width: '540px',
          height: '50px',
          backgroundColor: '#ef4343',
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(239, 67, 67, 0.25)',
          border: 'none',
          cursor: processing ? 'not-allowed' : 'pointer',
          gap: '12px'
        }}
      >
        <Image
          src="/images/admin-dashboard/pending-approval/close-icon.svg"
          alt="Delete"
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
          Delete Store
        </span>
      </button>

      {/* Reactivate Confirmation Modal */}
      {showReactivateModal && (
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
              Reactivate Store
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
              Are you sure you want to reactivate this store? This will change the store status to active and make it available for customers again.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReactivateModal(false)}
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
                onClick={handleReactivate}
                disabled={processing}
                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                {processing ? 'Reactivating...' : 'Reactivate Store'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
              Delete Store
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
              Are you sure you want to permanently delete this suspended store? This action cannot be undone and will remove all store data.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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
                onClick={handleDelete}
                disabled={processing}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                {processing ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuspendedStoreDetail;
