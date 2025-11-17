'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { StoreService } from '@/lib/storeService';
import { Store } from '@/types/storeManagement';

interface ActiveStoreDetailProps {
  storeId: string;
  onSuspend?: (storeId: string, reason?: string) => void;
  onBack?: () => void;
}

type DocumentData = string | { uri?: string; url?: string; type?: string; uploaded?: boolean; name?: string };

export const ActiveStoreDetail: React.FC<ActiveStoreDetailProps> = ({
  storeId,
  onSuspend,
  onBack
}) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

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

  // Helper function to check if document has valid URI or URL
  const hasValidUri = (docData: DocumentData | undefined): boolean => {
    if (!docData) return false;

    // String format (legacy base64)
    if (typeof docData === 'string') {
      return docData.trim().length > 0;
    }

    // Object format (React Native app)
    if (typeof docData === 'object') {
      // Check for Cloudinary URL (new)
      if ('url' in docData && docData.url) {
        return docData.url.trim().length > 0;
      }
      // Check for base64 URI (legacy)
      if ('uri' in docData && docData.uri) {
        return docData.uri.trim().length > 0;
      }
    }

    return false;
  };

  // Helper function to get ONLY uploaded documents
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
        console.log(`🔍 [ActiveStoreDetail] Fetching store data for storeId: ${storeId}`);

        const storeData = await StoreService.getStoreByIdComplete(storeId);

        if (storeData) {
          console.log(`✅ [ActiveStoreDetail] Found store data:`, {
            storeId: storeData.storeId,
            status: storeData.status,
            storeName: storeData.storeName,
            hasDocuments: !!storeData.documents,
            documentsKeys: storeData.documents ? Object.keys(storeData.documents) : [],
            hasBusinessInfo: !!storeData.businessInfo,
            businessDescription: storeData.businessInfo?.description || storeData.storeDescription,
            fullStoreData: storeData
          });
          setStore(storeData);
        } else {
          console.log(`⚠️ [ActiveStoreDetail] Store not found for ID: ${storeId}`);
        }
      } catch (error) {
        console.error('❌ [ActiveStoreDetail] Error fetching store:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  const handleSuspend = async () => {
    if (!store) return;

    try {
      setProcessing(true);
      await StoreService.updateStoreStatus(storeId, 'suspended', suspendReason);
      onSuspend?.(storeId, suspendReason);
      setShowSuspendModal(false);
    } catch (error) {
      console.error('Error suspending store:', error);
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
  const totalHeight = 700 + docsHeight + 70 + 80;

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

        {/* Status Badge - Active (Green) */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: '1062px',
            top: '34px',
            width: '98px',
            height: '32px',
            backgroundColor: '#dcfce7',
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
              color: '#16a34a',
              textAlign: 'center'
            }}
          >
            Active
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
          {store.businessInfo?.description || store.storeDescription || 'No business description provided.'}
        </p>
      </div>

      {/* Submitted Documents Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '700px',
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
                      // Support Cloudinary URL (new), legacy string, and object format
                      let uri: string | undefined;

                      // Priority 1: Check for Cloudinary URL (new - Phase 2)
                      if (typeof doc.data === 'object' && doc.data && 'url' in doc.data) {
                        const docWithUrl = doc.data as { url?: string };
                        uri = docWithUrl.url?.trim();
                        console.log('✅ [Cloudinary URL] Using Cloudinary URL from doc.data.url');
                      }
                      // Priority 2: Check for base64 URI (legacy)
                      else if (typeof doc.data === 'string') {
                        uri = doc.data.trim();
                        console.log('✅ [Legacy String] Using base64 string');
                      } else if (typeof doc.data === 'object' && doc.data && 'uri' in doc.data) {
                        const docWithUri = doc.data as { uri?: string };
                        uri = docWithUri.uri?.trim();
                        console.log('✅ [Legacy Object] Using base64 from doc.data.uri');
                      }

                      if (uri && uri.length > 0) {
                        let urlToOpen = uri;

                        // Check if it's a Cloudinary URL (best performance)
                        if (uri.startsWith('https://res.cloudinary.com/')) {
                          console.log('✅ [Cloudinary] Cloudinary URL detected, opening directly...');
                          // No conversion needed
                        }
                        // Check if it's a base64 data URL (needs conversion)
                        else if (uri.startsWith('data:')) {
                          console.log('🔄 [Converting] Base64 data URL detected, converting to Blob URL...');
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

      {/* Action Button */}
      {/* Suspend Store Button */}
      <button
        onClick={() => setShowSuspendModal(true)}
        disabled={processing}
        className="absolute flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
        style={{
          left: '40px',
          top: `${700 + docsHeight + 30}px`,
          width: '1120px',
          height: '50px',
          backgroundColor: '#f59e0b',
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(245, 158, 11, 0.25)',
          border: 'none',
          cursor: processing ? 'not-allowed' : 'pointer',
          gap: '12px'
        }}
      >
        <Image
          src="/images/admin-dashboard/pending-approval/close-icon.svg"
          alt="Suspend"
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
          Suspend Store
        </span>
      </button>

      {/* Suspend Modal */}
      {showSuspendModal && (
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
              Suspend Store
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
              Please provide a reason for suspending this store. This action will temporarily disable the store until further review.
            </p>

            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter suspension reason..."
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
                onClick={() => setShowSuspendModal(false)}
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
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || processing}
                className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                {processing ? 'Suspending...' : 'Suspend Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveStoreDetail;
