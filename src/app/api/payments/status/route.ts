import { NextRequest } from 'next/server';
import { getInvoice, isInvoicePaid } from '@/lib/xenditService';

export const runtime = 'nodejs';

/**
 * GET /api/payments/status?invoiceId=xxx
 * Check the status of a payment invoice
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'invoiceId is required' }), 
        { status: 400 }
      );
    }

    const invoice = await getInvoice(invoiceId);
    const isPaid = await isInvoicePaid(invoiceId);

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: invoice.id,
        status: invoice.status,
        isPaid,
        amount: invoice.amount,
        currency: invoice.currency,
        externalId: invoice.external_id,
        invoiceUrl: invoice.invoice_url,
        expiryDate: invoice.expiry_date,
        created: invoice.created,
        updated: invoice.updated,
      }),
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get invoice status';
    console.error('Get invoice status error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { status: 500 }
    );
  }
}
