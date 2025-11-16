'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminService, StoreRegistration } from '@/lib/adminService';

type DocumentData = string | { uri?: string; url?: string; type?: string; uploaded?: boolean; name?: string };

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

  // Helper function to convert base64 data URL to Blob URL
  const convertBase64ToBlob = (dataUrl: string): string => {
    try {
      // Split the data URL to get mime type and base64 data
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
  const hasValidUri = (docData: DocumentData | undefined): boolean => {
    if (!docData) return false;

    // String format (legacy)
    if (typeof docData === 'string') {
      return docData.trim().length > 0;
    }

    // Object format (React Native app)
    if (typeof docData === 'object' && 'uri' in docData) {
      return !!(docData.uri && docData.uri.trim().length > 0);
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
        console.log(`🔍 [PendingApprovalDetail] Fetching registration for userId: ${userId}`);

        // Try to get from store_registrations first
        const registrations = await AdminService.getAllStoreRegistrations();
        const targetRegistration = registrations.find(reg => reg.userId === userId);

        if (targetRegistration) {
          console.log(`✅ [PendingApprovalDetail] Found registration in 'store_registrations'`);
          console.log(`📋 [Registration Data]`, {
            userId: targetRegistration.userId,
            status: targetRegistration.status,
            hasDocuments: !!targetRegistration.documents,
            documentKeys: targetRegistration.documents ? Object.keys(targetRegistration.documents) : [],
            documents: targetRegistration.documents
          });

          // Test if documents have valid image data
          if (targetRegistration.documents) {
            console.log('\n🧪 [Document Validation Test]');
            Object.entries(targetRegistration.documents).forEach(([key, value]) => {
              if (value && typeof value === 'object' && 'uri' in value) {
                const uri = value.uri;
                console.log(`  ${key}:`, {
                  hasUri: !!uri,
                  uriLength: uri?.length || 0,
                  isBase64Image: uri?.startsWith('data:image/') || false,
                  imageFormat: uri?.substring(5, 15) || 'unknown',
                  canOpen: !!(uri && uri.length > 0)
                });
              } else if (typeof value === 'string') {
                console.log(`  ${key}:`, {
                  hasUri: !!value,
                  uriLength: value?.length || 0,
                  isBase64Image: value?.startsWith('data:image/') || false,
                  imageFormat: value?.substring(5, 15) || 'unknown',
                  canOpen: !!(value && value.length > 0)
                });
              } else {
                console.log(`  ${key}: Not uploaded or invalid format`);
              }
            });
          }
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
          const uploadedDocs = getUploadedDocumentsList(registration);
          const documentCount = uploadedDocs.length;
          const docsHeight = documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30);
          return 700 + docsHeight + 70 + 80; // Base + docs + buttons + extra margin
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
          {registration.businessInfo?.description || 'No business description provided.'}
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
            const uploadedDocs = getUploadedDocumentsList(registration);
            const documentCount = uploadedDocs.length;
            return documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30); // Base height + documents + padding
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
            // All documents in this list are already validated as uploaded (have valid URIs)
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

                  {/* Right side - View Link (all documents in list are uploaded) */}
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

                        console.log(`🖼️ [View Document] Attempting to open ${doc.name}`);
                        console.log('📋 Full document data:', doc.data);
                        console.log('🔍 URI details:', {
                          format: typeof doc.data === 'string' ? 'string' : 'object',
                          hasUri: !!uri,
                          uriLength: uri?.length || 0,
                          isDataURL: uri?.startsWith('data:') ? 'Yes ✅' : 'No',
                          isStorageURL: uri?.startsWith('http') ? 'Yes ✅' : 'No',
                          uriPrefix: uri?.substring(0, 50) + '...',
                          documentType: typeof doc.data === 'object' && 'type' in doc.data ? doc.data.type || '(empty)' : 'unknown',
                          uploaded: typeof doc.data === 'object' && 'uploaded' in doc.data ? doc.data.uploaded : 'unknown'
                        });

                        if (uri && uri.length > 0) {
                          let urlToOpen = uri;

                          // Check if it's a Cloudinary URL (best performance)
                          if (uri.startsWith('https://res.cloudinary.com/')) {
                            console.log('✅ [Cloudinary] Cloudinary URL detected, opening directly...');
                            // No conversion needed, Cloudinary URLs work directly
                          }
                          // Check if it's a base64 data URL (needs conversion)
                          else if (uri.startsWith('data:')) {
                            console.log('🔄 [Converting] Base64 data URL detected, converting to Blob URL...');
                            urlToOpen = convertBase64ToBlob(uri);
                            console.log('✅ [Converted] Blob URL created:', urlToOpen);
                          } else if (uri.startsWith('http')) {
                            console.log('✅ [Direct URL] Other storage URL detected, opening directly...');
                          }

                          console.log(`✅ Opening document in new tab...`);
                          const newWindow = window.open(urlToOpen, '_blank');

                          if (!newWindow) {
                            console.error('❌ Pop-up blocked! Please allow pop-ups for this site.');
                            alert('Pop-up blocked! Please allow pop-ups to view documents.\n\nThe image data is valid but your browser blocked the new tab.');
                          } else {
                            console.log('✅ Document opened successfully!');
                          }
                        } else {
                          console.error(`❌ [View Document] No valid URI found for ${doc.name}`, {
                            dataType: typeof doc.data,
                            data: doc.data
                          });
                          alert(`Cannot open ${doc.name}: Document URI is empty or invalid.\n\nCheck browser console (F12) for details.`);
                        }
                      } catch (error) {
                        console.error('❌ [View Document] Error:', error);
                        alert(`Error opening document: ${error}\n\nCheck browser console (F12) for details.`);
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
      {/* Approve Button */}
      <button
        onClick={handleApprove}
        disabled={processing || registration.status === 'approved'}
        className="absolute flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
        style={{
          left: '40px',
          top: (() => {
            const uploadedDocs = getUploadedDocumentsList(registration);
            const documentCount = uploadedDocs.length;
            const docsHeight = documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30);
            return 700 + docsHeight + 30; // Documents section top + height + spacing
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
            const uploadedDocs = getUploadedDocumentsList(registration);
            const documentCount = uploadedDocs.length;
            const docsHeight = documentCount === 0 ? 140 : Math.max(140, 70 + (documentCount * 50) + 30);
            return 700 + docsHeight + 30; // Documents section top + height + spacing
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