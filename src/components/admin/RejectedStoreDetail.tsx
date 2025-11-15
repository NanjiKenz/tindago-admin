'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminService, StoreRegistration } from '@/lib/adminService';

interface RejectedStoreDetailProps {
  userId: string;
  onReReview?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  onBack?: () => void;
}

export const RejectedStoreDetail: React.FC<RejectedStoreDetailProps> = ({
  userId,
  onReReview,
  onDelete,
  onBack
}) => {
  const [registration, setRegistration] = useState<StoreRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReReviewModal, setShowReReviewModal] = useState(false);

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
  const getUploadedDocumentsList = (registration: StoreRegistration | null) => {
    if (!registration) return [];

    const documents = registration.documents || {};

    console.log('📄 [Document Retrieval] Raw Firebase documents object:', JSON.stringify(documents, null, 2));
    console.log('📄 [Document Keys]', Object.keys(documents));

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

    // Log detailed info for each document
    allDocuments.forEach(doc => {
      const isValid = hasValidUri(doc.data);
      const format = typeof doc.data;

      console.log(`📋 [${doc.key}]`, {
        exists: !!doc.data,
        format: format,
        hasValidUri: isValid,
        required: doc.required,
        rawData: doc.data
      });

      if (doc.data && typeof doc.data === 'object') {
        console.log(`  └─ Object details:`, {
          hasUri: 'uri' in doc.data,
          uriLength: doc.data.uri?.length || 0,
          type: doc.data.type || '(empty)',
          uploaded: doc.data.uploaded,
          name: doc.data.name
        });
      }
    });

    // Filter to only show documents with valid URIs (actually uploaded)
    const uploadedDocuments = allDocuments.filter(doc => hasValidUri(doc.data));

    console.log(`📊 [Document Summary] Found ${allDocuments.length} total documents, showing ${uploadedDocuments.length} uploaded documents`);
    return uploadedDocuments;
  };

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        setLoading(true);
        console.log(`🔍 [RejectedStoreDetail] Fetching registration for userId: ${userId}`);

        // Get from store_registrations
        const registrations = await AdminService.getAllStoreRegistrations();
        const targetRegistration = registrations.find(reg => reg.userId === userId);

        if (targetRegistration) {
          console.log(`✅ [RejectedStoreDetail] Found registration in 'store_registrations'`);
          console.log(`📋 [Registration Data]`, {
            userId: targetRegistration.userId,
            status: targetRegistration.status,
            hasDocuments: !!targetRegistration.documents,
            documentKeys: targetRegistration.documents ? Object.keys(targetRegistration.documents) : [],
            documents: targetRegistration.documents
          });
        } else {
          console.log(`⚠️ [RejectedStoreDetail] Registration not found for userId: ${userId}`);
        }

        setRegistration(targetRegistration || null);
      } catch (error) {
        console.error('❌ [RejectedStoreDetail] Error fetching registration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [userId]);

  const handleReReview = async () => {
    if (!registration) return;

    try {
      setProcessing(true);
      // Trigger re-review action
      onReReview?.(userId);
      setShowReReviewModal(false);
    } catch (error) {
      console.error('Error re-reviewing registration:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!registration) return;

    try {
      setProcessing(true);
      onDelete?.(userId);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting registration:', error);
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
          const uploadedDocs = getUploadedDocumentsList(registration);
          const documentCount = uploadedDocs.length;
          const docsHeight = documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30);
          // Add height for rejection reason section (120px)
          return 700 + 120 + docsHeight + 70 + 80; // Base + rejection + docs + buttons + extra margin
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

        {/* Status Badge - Rejected (Red) */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: '1062px',
            top: '34px',
            width: '98px',
            height: '32px',
            backgroundColor: '#fee2e2',
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
              color: '#dc2626',
              textAlign: 'center'
            }}
          >
            Rejected
          </span>
        </div>
      </div>

      {/* Rejection Reason Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '220px',
          width: '1120px',
          height: '100px',
          backgroundColor: '#fef2f2',
          borderRadius: '16px',
          boxShadow: '0px 0px 5px rgba(220, 38, 38, 0.15)',
          border: '1px solid #fecaca'
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
            backgroundColor: '#fee2e2',
            borderRadius: '50%'
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: '#dc2626' }}
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

        {/* Rejection Reason Title */}
        <h2
          className="absolute"
          style={{
            left: '80px',
            top: '20px',
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '19.68px',
            color: '#dc2626',
            textAlign: 'left'
          }}
        >
          Rejection Reason
        </h2>

        {/* Rejection Reason Text */}
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
            color: '#991b1b'
          }}
        >
          {(registration as StoreRegistration & { rejectionReason?: string }).rejectionReason || 'No rejection reason provided'}
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
          {(() => {
            const businessAddress = registration.businessInfo?.address;
            const businessCity = registration.businessInfo?.city;
            const legacyAddress = registration.address || registration.storeAddress;
            const legacyCity = registration.city;

            return businessAddress && businessCity
              ? `${businessAddress}, ${businessCity}`
              : businessAddress ||
                (legacyAddress && legacyCity
                  ? `${legacyAddress}, ${legacyCity}`
                  : legacyAddress || legacyCity || 'Address not provided');
          })()}
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
          {registration.businessInfo?.description || 'No business description provided.'}
        </p>
      </div>

      {/* Submitted Documents Section */}
      <div
        className="absolute"
        style={{
          left: '40px',
          top: '820px',
          width: '1120px',
          height: (() => {
            const uploadedDocs = getUploadedDocumentsList(registration);
            const documentCount = uploadedDocs.length;
            return documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30);
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

        {/* Dynamic Document List - Show ONLY uploaded documents */}
        {(() => {
          const documentList = getUploadedDocumentsList(registration);

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

          return documentList.map((doc, index) => {
            return (
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

                        // Priority 1: Check for Cloudinary URL (doc.data.url)
                        if (typeof doc.data === 'object' && doc.data && 'url' in doc.data) {
                          const docData = doc.data as { url?: string };
                          uri = docData.url?.trim();
                        }
                        // Priority 2: Fallback to base64 (doc.data.uri)
                        else if (typeof doc.data === 'object' && doc.data && 'uri' in doc.data) {
                          const docData = doc.data as { uri?: string };
                          uri = docData.uri?.trim();
                        }
                        // Priority 3: Legacy string format
                        else if (typeof doc.data === 'string') {
                          uri = (doc.data as string).trim();
                        }

                        if (uri && uri.length > 0) {
                          let urlToOpen = uri;

                          // Only convert to blob if it's base64 data
                          // Cloudinary URLs (http/https) open directly
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
            );
          });
        })()}
      </div>

      {/* Action Buttons */}
      {/* Re-Review Application Button */}
      <button
        onClick={() => setShowReReviewModal(true)}
        disabled={processing}
        className="absolute flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
        style={{
          left: '40px',
          top: (() => {
            const uploadedDocs = getUploadedDocumentsList(registration);
            const documentCount = uploadedDocs.length;
            const docsHeight = documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30);
            return 820 + docsHeight + 30;
          })(),
          width: '540px',
          height: '50px',
          backgroundColor: '#3b82f6',
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(59, 130, 246, 0.25)',
          border: 'none',
          cursor: processing ? 'not-allowed' : 'pointer',
          gap: '12px'
        }}
      >
        {/* Document with checkmark icon - more relevant for re-review */}
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M14 2V8H20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M9 13L11 15L15 11"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
          Re-Review Application
        </span>
      </button>

      {/* Delete Registration Button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        disabled={processing}
        className="absolute flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
        style={{
          left: '620px',
          top: (() => {
            const uploadedDocs = getUploadedDocumentsList(registration);
            const documentCount = uploadedDocs.length;
            const docsHeight = documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30);
            return 820 + docsHeight + 30;
          })(),
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
          Delete Registration
        </span>
      </button>

      {/* Re-Review Confirmation Modal */}
      {showReReviewModal && (
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
              Re-Review Application
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
              Are you sure you want to move this registration back to pending review? The admin team will review the application again and the store owner can resubmit updated documents if needed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReReviewModal(false)}
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
                onClick={handleReReview}
                disabled={processing}
                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                {processing ? 'Processing...' : 'Re-Review Application'}
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
              Delete Registration
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
              Are you sure you want to permanently delete this rejected store registration? This action cannot be undone.
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

export default RejectedStoreDetail;
