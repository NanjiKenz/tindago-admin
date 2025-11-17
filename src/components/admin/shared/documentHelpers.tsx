import { StoreRegistration } from '@/lib/adminService';

export type DocumentData = string | { uri?: string; url?: string; type?: string; uploaded?: boolean; name?: string };

// Helper function to convert base64 data URL to Blob URL
export const convertBase64ToBlob = (dataUrl: string): string => {
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
    return blobUrl;
  } catch (error) {
    console.error('❌ [Blob Conversion] Failed to convert base64:', error);
    throw error;
  }
};

// Helper function to check if document has valid URI or URL
export const hasValidUri = (docData: DocumentData | undefined): boolean => {
  if (!docData) return false;

  if (typeof docData === 'string') {
    return docData.trim().length > 0;
  }

  if (typeof docData === 'object') {
    if ('url' in docData && docData.url) {
      return docData.url.trim().length > 0;
    }
    if ('uri' in docData && docData.uri) {
      return docData.uri.trim().length > 0;
    }
  }

  return false;
};

// Helper function to get ONLY uploaded documents
export const getUploadedDocumentsList = (data: StoreRegistration | any | null) => {
  if (!data) return [];

  const documents = data.documents || {};

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
