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