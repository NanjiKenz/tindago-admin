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

      await update(registrationRef, {
        status: 'approved',
        approvedAt
      });

      await set(storeRef, {
        userId,
        storeName: registrationData.storeName,
        ownerName: registrationData.ownerName,
        address: registrationData.address,
        phone: registrationData.phone,
        email: registrationData.email,
        isActive: true,
        approvedAt,
        createdAt: registrationData.createdAt
      });

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