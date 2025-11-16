/**
 * Xendit Service - Helper functions for Xendit payment integration
 * Handles invoice creation, payment verification, and refunds
 */

import { XENDIT_BASE_URL, XENDIT_SECRET_KEY, XENDIT_MODE } from './config';

export interface XenditInvoiceItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

export interface XenditCustomer {
  given_names: string;
  email: string;
  mobile_number?: string;
}

export interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  customer: XenditCustomer;
  items: XenditInvoiceItem[];
  paymentMethods?: string[];
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  currency?: string;
  invoiceDuration?: number;
  fees?: Array<{ type: string; value: number }>;
  metadata?: Record<string, any>;
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  status: string;
  merchant_name: string;
  amount: number;
  payer_email: string;
  description: string;
  invoice_url: string;
  expiry_date: string;
  available_banks?: any[];
  available_retail_outlets?: any[];
  available_ewallets?: any[];
  currency: string;
  created: string;
  updated: string;
}

/**
 * Generate Basic Auth header for Xendit API
 */
export function createAuthHeader(secretKey: string = XENDIT_SECRET_KEY): string {
  const b64 = Buffer.from(`${secretKey}:`).toString('base64');
  return `Basic ${b64}`;
}

/**
 * Check if Xendit is in test mode
 */
export function isTestMode(): boolean {
  return XENDIT_MODE === 'test';
}

/**
 * Create a Xendit invoice
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<XenditInvoiceResponse> {
  const {
    externalId,
    amount,
    payerEmail,
    description,
    customer,
    items,
    paymentMethods = ['GCASH', 'PAYMAYA', 'CREDIT_CARD', 'DEBIT_CARD'],
    successRedirectUrl = 'tindago://payment/success',
    failureRedirectUrl = 'tindago://payment/failed',
    currency = 'PHP',
    invoiceDuration = 86400, // 24 hours
    fees = [],
    metadata = {},
  } = params;

  const payload = {
    external_id: externalId,
    amount,
    payer_email: payerEmail,
    description,
    invoice_duration: invoiceDuration,
    customer,
    items: items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      category: item.category || 'Groceries',
    })),
    payment_methods: paymentMethods,
    success_redirect_url: successRedirectUrl,
    failure_redirect_url: failureRedirectUrl,
    currency,
    fees,
    metadata: {
      ...metadata,
      mode: XENDIT_MODE,
    },
  };

  const response = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: createAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Xendit API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Get invoice details by ID
 */
export async function getInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
  const response = await fetch(`${XENDIT_BASE_URL}/v2/invoices/${invoiceId}`, {
    method: 'GET',
    headers: {
      Authorization: createAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get invoice: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Expire an invoice
 */
export async function expireInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
  const response = await fetch(`${XENDIT_BASE_URL}/v2/invoices/${invoiceId}/expire!`, {
    method: 'POST',
    headers: {
      Authorization: createAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to expire invoice: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Check if invoice is paid
 */
export async function isInvoicePaid(invoiceId: string): Promise<boolean> {
  try {
    const invoice = await getInvoice(invoiceId);
    return invoice.status === 'PAID' || invoice.status === 'SETTLED';
  } catch (error) {
    console.error('Error checking invoice status:', error);
    return false;
  }
}

/**
 * Validate webhook signature (if Xendit sends signature headers)
 */
export function validateWebhookToken(token: string, expectedToken: string): boolean {
  return token === expectedToken;
}

/**
 * Format invoice status for display
 */
export function formatInvoiceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    PAID: 'Paid',
    SETTLED: 'Settled',
    EXPIRED: 'Expired',
    REFUNDED: 'Refunded',
    VOIDED: 'Voided',
  };
  return statusMap[status] || status;
}

/**
 * Get payment method display name
 */
export function formatPaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    GCASH: 'GCash',
    PAYMAYA: 'PayMaya',
    CREDIT_CARD: 'Credit Card',
    DEBIT_CARD: 'Debit Card',
    BPI: 'BPI',
    BDO: 'BDO',
  };
  return methodMap[method] || method;
}
