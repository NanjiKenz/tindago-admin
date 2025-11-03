import { database } from './firebase.js';
import { ref, get, set, update, onValue, off } from 'firebase/database';

// Document interface matching React Native app structure
export interface RegistrationDocument {
  name: string;
  uri: string;
  type: string;
  uploaded: boolean;
  uploadedAt?: {
    '.sv': string;
  } | number;
}

export interface StoreRegistration {
  userId: string;
  // Nested structure from React Native app (primary)
  personalInfo?: {
    name: string;
    email: string;
    mobile: string;
  };
  businessInfo?: {
    storeName: string;
    description: string;
    address: string;
    city: string;
    zipCode: string;
    businessType: string;
  };
  documents?: {
    barangayBusinessClearance?: RegistrationDocument;
    businessPermit?: RegistrationDocument;
    dtiRegistration?: RegistrationDocument;
    validId?: RegistrationDocument;
    // Legacy string format for backward compatibility
    storePhoto?: string | RegistrationDocument;
  };
  paymentInfo?: {
    method: 'gcash' | 'paymaya' | 'bank_transfer';
    accountName: string;
    accountNumber: string;
    verified: boolean;
    addedAt?: {
      '.sv': string;
    } | number;
  };
  status: 'pending_documents' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed_pending' | 'pending_approval' | 'submitted' | 'awaiting_review';
  createdAt: string;
  updatedAt?: string;

  // Legacy flat structure (for backward compatibility)
  storeName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  owner?: string;
  displayName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  storeAddress?: string;
  city?: string;
  businessAddress?: string;
  location?: string;
  businessName?: string;
  name?: string;
  submittedAt?: string;
  dateCreated?: string;
  completedAt?: string;
}

export interface User {
  userId: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export interface Store {
  userId: string;
  storeName: string;
  address: string;
  isActive: boolean;
  approvedAt?: string;
}

export class AdminService {
  static async getPendingStoreRegistrations(): Promise<StoreRegistration[]> {
    try {
      // Fetch all registrations from API and filter for pending ones
      const allRegistrations = await this.getAllStoreRegistrations();
      const pendingStatuses = ['pending', 'completed_pending', 'pending_approval'];
      return allRegistrations.filter(registration =>
        pendingStatuses.includes(registration.status)
      );
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      throw error;
    }
  }

  static async getAllStoreRegistrations(): Promise<StoreRegistration[]> {
    try {
      // Fetch from API route to bypass Firebase security rules
      const res = await fetch('/api/admin/registrations', { cache: 'no-store' });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch registrations: ${errorText}`);
      }

      const data = await res.json();
      return (data.registrations || []) as StoreRegistration[];
    } catch (error) {
      console.error('Error fetching all registrations:', error);
      throw error;
    }
  }

  static async approveStoreRegistration(userId: string): Promise<void> {
    try {
      const registrationRef = ref(database, `store_registrations/${userId}`);
      const storeRef = ref(database, `stores/${userId}`);

      const registrationSnapshot = await get(registrationRef);
      if (!registrationSnapshot.exists()) {
        throw new Error('Registration not found');
      }

      const registrationData = registrationSnapshot.val();
      const approvedAt = new Date().toISOString();

      // Debug: Log the registration data structure
      console.log('Registration data for approval:', {
        userId,
        registrationData: JSON.stringify(registrationData, null, 2)
      });

      await update(registrationRef, {
        status: 'approved',
        approvedAt
      });

      // Extract store data with proper fallbacks matching React Native app nested structure
      const storeData = {
        userId,
        // Preserve full nested structure from React Native app
        personalInfo: registrationData.personalInfo || {
          name: registrationData.name || registrationData.ownerName || registrationData.displayName || 'Unknown Owner',
          email: registrationData.email || registrationData.ownerEmail || '',
          mobile: registrationData.phone || registrationData.ownerPhone || ''
        },
        businessInfo: {
          storeName: registrationData.businessInfo?.storeName || registrationData.storeName || registrationData.businessName || 'Unknown Store',
          description: registrationData.businessInfo?.description || registrationData.description || '',
          address: registrationData.businessInfo?.address || registrationData.address || registrationData.storeAddress || '',
          city: registrationData.businessInfo?.city || registrationData.city || '',
          zipCode: registrationData.businessInfo?.zipCode || registrationData.zipCode || '',
          businessType: registrationData.businessInfo?.businessType || registrationData.businessType || 'Sari-Sari Store',
          logo: registrationData.businessInfo?.logo || null,
          coverImage: registrationData.businessInfo?.coverImage || null
        },
        documents: registrationData.documents || {},
        paymentInfo: registrationData.paymentInfo,

        // Legacy flat fields for backward compatibility
        storeName: registrationData.businessInfo?.storeName ||
                  registrationData.storeName ||
                  registrationData.businessName ||
                  'Unknown Store',
        name: registrationData.personalInfo?.name ||
              registrationData.name ||
              registrationData.ownerName ||
              'Unknown Owner',
        ownerName: registrationData.personalInfo?.name ||
                  registrationData.name ||
                  registrationData.ownerName ||
                  'Unknown Owner',
        address: registrationData.businessInfo?.address ||
                registrationData.address ||
                '',
        city: registrationData.businessInfo?.city ||
              registrationData.city ||
              '',
        storeAddress: registrationData.businessInfo?.address ||
                     registrationData.address ||
                     '',
        email: registrationData.personalInfo?.email ||
              registrationData.email ||
              '',
        ownerEmail: registrationData.personalInfo?.email ||
                   registrationData.email ||
                   '',
        phone: registrationData.personalInfo?.mobile ||
              registrationData.phone ||
              '',
        ownerPhone: registrationData.personalInfo?.mobile ||
                   registrationData.phone ||
                   '',
        isActive: true,
        approvedAt,
        createdAt: registrationData.createdAt ||
                  registrationData.submittedAt ||
                  new Date().toISOString(),
        businessType: registrationData.businessInfo?.businessType ||
                     registrationData.businessType ||
                     'Sari-Sari Store',
        // Store images
        logo: registrationData.businessInfo?.logo || null,
        coverImage: registrationData.businessInfo?.coverImage || null,
        status: 'active'
      };

      // Remove any undefined values to prevent Firebase errors
      const cleanStoreData = Object.fromEntries(
        Object.entries(storeData).filter(([_, value]) => value !== undefined)
      );

      await set(storeRef, cleanStoreData);

      console.log(`Store registration approved for user: ${userId}`);
    } catch (error) {
      console.error('Error approving registration:', error);
      throw error;
    }
  }

  static async rejectStoreRegistration(userId: string, reason?: string): Promise<void> {
    try {
      const registrationRef = ref(database, `store_registrations/${userId}`);

      await update(registrationRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'No reason provided'
      });

      console.log(`Store registration rejected for user: ${userId}`);
    } catch (error) {
      console.error('Error rejecting registration:', error);
      throw error;
    }
  }

  static async getUserDetails(userId: string): Promise<User | null> {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return {
          userId,
          ...snapshot.val()
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  }

  static subscribeToRegistrations(callback: (registrations: StoreRegistration[]) => void): () => void {
    const registrationsRef = ref(database, 'store_registrations');

    const unsubscribe = onValue(registrationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const registrations = Object.keys(data)
          .map(userId => ({
            userId,
            ...data[userId]
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        callback(registrations);
      } else {
        callback([]);
      }
    });

    return () => off(registrationsRef, 'value', unsubscribe);
  }

  static async reReviewStoreRegistration(userId: string): Promise<void> {
    try {
      const registrationRef = ref(database, `store_registrations/${userId}`);

      await update(registrationRef, {
        status: 'pending',
        reReviewedAt: new Date().toISOString(),
        rejectionReason: null,
        rejectedAt: null
      });

      console.log(`Store registration moved back to pending for re-review: ${userId}`);
    } catch (error) {
      console.error('Error re-reviewing registration:', error);
      throw error;
    }
  }

  static async deleteStoreRegistration(userId: string): Promise<void> {
    try {
      const registrationRef = ref(database, `store_registrations/${userId}`);

      // Soft delete by updating status to 'deleted'
      await update(registrationRef, {
        status: 'deleted',
        deletedAt: new Date().toISOString()
      });

      console.log(`Store registration marked as deleted: ${userId}`);
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
  }
}