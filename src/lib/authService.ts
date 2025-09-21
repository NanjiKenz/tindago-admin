/**
 * Authentication Service for TindaGo Admin
 *
 * Firebase Authentication service with admin role verification
 */

import { auth, database } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { ref, get } from 'firebase/database';

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  authenticated: boolean;
}

export class AuthService {
  /**
   * Sign in admin user with email and password
   */
  static async signIn(email: string, password: string): Promise<AdminUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Verify admin role from database
      const adminUser = await this.verifyAdminRole(firebaseUser);

      // Update last login timestamp
      await this.updateLastLogin(adminUser.uid);

      return adminUser;
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const authError = error as { code?: string };
      throw new Error(this.getAuthErrorMessage(authError.code || 'unknown-error'));
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      const authError = error as { code?: string };
      throw new Error(this.getAuthErrorMessage(authError.code || 'unknown-error'));
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      await updatePassword(user, newPassword);
    } catch (error: unknown) {
      console.error('Password update error:', error);
      const authError = error as { code?: string };
      throw new Error(this.getAuthErrorMessage(authError.code || 'unknown-error'));
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Verify admin role from database
   */
  static async verifyAdminRole(firebaseUser: FirebaseUser): Promise<AdminUser> {
    try {
      const adminRef = ref(database, `admins/${firebaseUser.uid}`);
      const snapshot = await get(adminRef);

      if (!snapshot.exists()) {
        throw new Error('Access denied. Admin privileges required.');
      }

      const adminData = snapshot.val();

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || adminData.displayName,
        role: adminData.role || 'admin',
        createdAt: adminData.createdAt,
        lastLogin: adminData.lastLogin
      };
    } catch (error) {
      console.error('Admin verification error:', error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(uid: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      // Using AdminService pattern for database updates
      const { update } = await import('firebase/database');
      await update(ref(database, `admins/${uid}`), {
        lastLogin: timestamp
      });
    } catch (error) {
      console.error('Last login update error:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  static onAuthStateChanged(callback: (user: AdminUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const adminUser = await this.verifyAdminRole(firebaseUser);
          callback(adminUser);
        } catch (error) {
          console.error('Auth state verification error:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  /**
   * Convert Firebase auth error codes to user-friendly messages
   */
  static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No admin account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This admin account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  /**
   * Check if user has super admin privileges
   */
  static isSuperAdmin(user: AdminUser | null): boolean {
    return user?.role === 'super_admin';
  }

  /**
   * Validate admin permissions for specific actions
   */
  static hasPermission(user: AdminUser | null, action: string): boolean {
    if (!user) return false;

    // Super admins have all permissions
    if (user.role === 'super_admin') return true;

    // Regular admins can approve/reject registrations
    const adminPermissions = [
      'view_registrations',
      'approve_registration',
      'reject_registration',
      'export_data'
    ];

    return adminPermissions.includes(action);
  }
}