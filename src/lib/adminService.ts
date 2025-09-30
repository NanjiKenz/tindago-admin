import { database } from './firebase.js';
import { ref, get, set, update, onValue, off } from 'firebase/database';

export interface StoreRegistration {
  userId: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed_pending' | 'pending_approval' | 'submitted' | 'awaiting_review';
  createdAt: string;
  documents?: {
    businessPermit?: string;
    validId?: string;
    storePhoto?: string;
  };
  // Firebase data structure fields
  personalInfo?: {
    name?: string;
    email?: string;
    mobile?: string;
  };
  owner?: string;
  displayName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  // Address field variations
  storeAddress?: string;
  city?: string;
  businessAddress?: string;
  location?: string;
  // Store name variations
  businessName?: string;
  name?: string;
  // Date fields variations
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
      const registrationsRef = ref(database, 'store_registrations');
      const snapshot = await get(registrationsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data)
          .map(userId => ({
            userId,
            ...data[userId]
          }))
          .filter(registration => {
            const pendingStatuses = ['pending', 'completed_pending', 'pending_approval'];
            return pendingStatuses.includes(registration.status);
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return [];
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      throw error;
    }
  }

  static async getAllStoreRegistrations(): Promise<StoreRegistration[]> {
    try {
      const registrationsRef = ref(database, 'store_registrations');
      const snapshot = await get(registrationsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data)
          .map(userId => ({
            userId,
            ...data[userId]
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return [];
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

      // Extract store data with proper fallbacks matching React Native app fields
      const storeData = {
        userId,
        // Store Name: Check storeName field first (like RK Store)
        storeName: registrationData.storeName ||
                  registrationData.businessName ||
                  registrationData.name ||
                  'Unknown Store',
        // Owner Name: Check 'name' field first from React Native app
        name: registrationData.name ||
              registrationData.personalInfo?.name ||
              registrationData.ownerName ||
              registrationData.owner ||
              registrationData.displayName ||
              'Unknown Owner',
        ownerName: registrationData.name ||
                  registrationData.personalInfo?.name ||
                  registrationData.ownerName ||
                  registrationData.owner ||
                  registrationData.displayName ||
                  'Unknown Owner',
        // Address: Combine address + city from React Native app
        address: registrationData.address ||
                registrationData.storeAddress ||
                '',
        city: registrationData.city || '',
        // Store address + city for legacy support
        storeAddress: registrationData.address ||
                     registrationData.storeAddress ||
                     registrationData.businessAddress ||
                     '',
        // Email: Check 'email' field first
        email: registrationData.email ||
              registrationData.personalInfo?.email ||
              registrationData.ownerEmail ||
              '',
        ownerEmail: registrationData.email ||
                   registrationData.personalInfo?.email ||
                   registrationData.ownerEmail ||
                   '',
        // Phone: Check 'phone' field first
        phone: registrationData.phone ||
              registrationData.personalInfo?.mobile ||
              registrationData.ownerPhone ||
              registrationData.mobile ||
              '',
        ownerPhone: registrationData.phone ||
                   registrationData.personalInfo?.mobile ||
                   registrationData.ownerPhone ||
                   registrationData.mobile ||
                   '',
        isActive: true,
        approvedAt,
        createdAt: registrationData.createdAt ||
                  registrationData.submittedAt ||
                  registrationData.dateCreated ||
                  new Date().toISOString(),
        businessType: registrationData.businessType || 'Sari-Sari Store',
        permitType: registrationData.permitType || 'Business Permit',
        documents: registrationData.documents || {},
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
}