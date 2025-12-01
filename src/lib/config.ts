// Centralized config/env helpers for server-side code

// Xendit Configuration
export const XENDIT_BASE_URL = process.env.XENDIT_BASE_URL || 'https://api.xendit.co';
export const XENDIT_SECRET_KEY = process.env.EXPO_PUBLIC_XENDIT_SECRET_KEY || process.env.XENDIT_SECRET_KEY || '';
export const XENDIT_PUBLIC_KEY = process.env.EXPO_PUBLIC_XENDIT_PUBLIC_KEY || '';
export const XENDIT_MODE = process.env.EXPO_PUBLIC_XENDIT_MODE || 'test'; // 'test' or 'live'
export const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || '';

// Platform commission rate (default 1% = 0.01)
export const PLATFORM_COMMISSION_RATE = parseFloat(process.env.EXPO_PUBLIC_PLATFORM_COMMISSION_RATE || '0.01');

export function requireEnv(varName: string, value: string) {
  if (!value) {
    throw new Error(`Missing required env: ${varName}`);
  }
  return value;
}

/**
 * Validate and format Philippine phone number for Xendit
 * Returns formatted phone or throws descriptive error
 */
export function validatePhoneNumber(phone: string | undefined, fieldName: string = 'Phone number'): string {
  if (!phone || phone.trim() === '') {
    throw new Error(`${fieldName} is required for GCash/PayMaya payments`);
  }

  let cleaned = phone.trim().replace(/[\s\-()]/g, '');

  // Handle Philippine country code
  if (cleaned.startsWith('+63')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('63')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Philippine mobile numbers should be 10 digits
  if (cleaned.length !== 10 || !/^[0-9]{10}$/.test(cleaned)) {
    throw new Error(`Invalid ${fieldName} format. Must be a valid Philippine mobile number (e.g., 09171234567)`);
  }

  return `+63${cleaned}`;
}
