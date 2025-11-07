import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';


/**
 * Get all store registrations
 */


export async function GET() {
  try {
    console.log('📡 Starting store registrations fetch from Firebase...');

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

    console.log(`✅ Returning ${registrations.length} store registrations`);
    return NextResponse.json({ registrations });
  } catch (error: any) {
    console.error('❌ Error in /api/admin/registrations:', error);
    console.error('Stack trace:', error.stack);

    // Return empty array instead of error to allow UI to function
    return NextResponse.json({
      registrations: [],
      warning: 'Failed to fetch store registrations from Firebase. Check server logs for details.'
    }, { status: 200 }); // Changed to 200 to prevent UI errors
  }
}
