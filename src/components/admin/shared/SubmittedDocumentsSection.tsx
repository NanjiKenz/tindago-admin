import React from 'react';
import Image from 'next/image';
import { convertBase64ToBlob, getUploadedDocumentsList, DocumentData } from './documentHelpers';

interface SubmittedDocumentsSectionProps {
  data: any; // Store or registration data
  topPosition: number; // Absolute top position in px
}

export const SubmittedDocumentsSection: React.FC<SubmittedDocumentsSectionProps> = ({ data, topPosition }) => {
  const documentList = getUploadedDocumentsList(data);

  return (
    <div
      className="absolute"
      style={{
        left: '40px',
        top: `${topPosition}px`,
        width: '1120px',
        height: documentList.length === 0 ? 140 : Math.max(140, 70 + (documentList.length * 50) + 30),
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
      {documentList.length === 0 ? (
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
      ) : (
        documentList.map((doc, index) => (
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

                    // Priority 1: Cloudinary URL
                    if (typeof doc.data === 'object' && doc.data && 'url' in doc.data) {
                      const docWithUrl = doc.data as { url?: string };
                      uri = docWithUrl.url?.trim();
                    }
                    // Priority 2: Base64 string
                    else if (typeof doc.data === 'string') {
                      uri = doc.data.trim();
                    }
                    // Priority 3: Base64 object URI
                    else if (typeof doc.data === 'object' && doc.data && 'uri' in doc.data) {
                      const docWithUri = doc.data as { uri?: string };
                      uri = docWithUri.uri?.trim();
                    }

                    if (uri && uri.length > 0) {
                      let urlToOpen = uri;

                      if (uri.startsWith('https://res.cloudinary.com/')) {
                        // Cloudinary URL - open directly
                      } else if (uri.startsWith('data:')) {
                        // Base64 - convert to blob
                        urlToOpen = convertBase64ToBlob(uri);
                      }

                      const newWindow = window.open(urlToOpen, '_blank');
                      if (!newWindow) {
                        alert('Pop-up blocked! Please allow pop-ups to view documents.');
                      }
                    } else {
                      alert(`Cannot open ${doc.name}: Document URI is empty or invalid.`);
                    }
                  } catch (error) {
                    console.error('❌ Error opening document:', error);
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
  );
};
