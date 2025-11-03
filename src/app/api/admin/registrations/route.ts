import { NextResponse } from 'next/server';


/**
 * Get all store registrations
 */

// Helper function to fetch from Firebase REST API
async function fetchFirebase(path: string) {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const url = `${dbUrl}/${path}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch from Firebase');
  return res.json();
}

export async function GET() {
  try {
    // Fetch store registrations - REST API returns plain JSON (null if no data)
    const registrationsData = await fetchFirebase('store_registrations');

    // Handle null/empty response
    if (!registrationsData || typeof registrationsData !== 'object') {
      return NextResponse.json({ registrations: [] });
    }

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
