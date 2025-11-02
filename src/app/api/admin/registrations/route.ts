import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

/**
 * Get all store registrations
 */
export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch store registrations
    const registrationsSnap = await db.ref('store_registrations').get();

    if (!registrationsSnap.exists()) {
      return NextResponse.json({ registrations: [] });
    }

    const registrationsData = registrationsSnap.val();
    const registrations = Object.entries(registrationsData).map(([userId, registration]: [string, any]) => ({
      userId,
      storeName: registration.storeName || '',
      ownerName: registration.ownerName || '',
      email: registration.email || '',
      phone: registration.phone || '',
      address: registration.address || '',
      status: registration.status || 'pending',
      createdAt: registration.createdAt || '',
      updatedAt: registration.updatedAt,
      rejectionReason: registration.rejectionReason,
      documents: registration.documents || {},
    }));

    // Sort by creation date (newest first)
    registrations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error('Error fetching store registrations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch store registrations' },
      { status: 500 }
    );
  }
}
