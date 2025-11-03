/**
 * Admin Setup Utilities
 *
 * Helper functions for setting up admin users in Firebase
 */

import { database } from './firebase.js';
import { ref, set } from 'firebase/database';

export interface AdminSetupData {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'super_admin';
}

/**
 * Create an admin user entry in the database
 * This should be called after creating the user in Firebase Auth
 */
export async function createAdminUser(adminData: AdminSetupData): Promise<void> {
  try {
    const adminRef = ref(database, `admins/${adminData.uid}`);
    const timestamp = new Date().toISOString();

    await set(adminRef, {
      email: adminData.email,
      displayName: adminData.displayName || null,
      role: adminData.role,
      createdAt: timestamp,
      lastLogin: null,
      isActive: true
    });

    console.log(`Admin user created: ${adminData.email} (${adminData.role})`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

/**
 * Sample admin users for testing
 */
export const SAMPLE_ADMIN_USERS = [
  {
    email: 'admin@tindago.com',
    password: 'admin123',
    displayName: 'TindaGo Administrator',
    role: 'super_admin' as const
  },
  {
    email: 'manager@tindago.com',
    password: 'manager123',
    displayName: 'Store Manager',
    role: 'admin' as const
  }
];

/**
 * Instructions for manual admin setup:
 *
 * 1. Create user in Firebase Auth Console:
 *    - Go to Firebase Console > Authentication > Users
 *    - Click "Add user"
 *    - Email: admin@tindago.com
 *    - Password: admin123
 *    - Copy the generated UID
 *
 * 2. Add admin entry to Realtime Database:
 *    - Go to Firebase Console > Realtime Database
 *    - Navigate to root and create 'admins' node if it doesn't exist
 *    - Add entry under admins/{UID}:
 *    {
 *      "email": "admin@tindago.com",
 *      "displayName": "TindaGo Administrator",
 *      "role": "super_admin",
 *      "createdAt": "2024-01-01T00:00:00.000Z",
 *      "lastLogin": null,
 *      "isActive": true
 *    }
 *
 * 3. Test login with:
 *    - Email: admin@tindago.com
 *    - Password: admin123
 */