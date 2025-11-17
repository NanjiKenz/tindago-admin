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

    const registrations = Object.entries(registrationsData).map(([userId, registration]: [string, any]) => {
      // Support both nested structure (React Native app) and flat legacy structure
      const personalInfo = registration.personalInfo || {
        name: registration.ownerName || registration.name || registration.displayName || '',
        email: registration.email || registration.ownerEmail || '',
        mobile: registration.phone || registration.ownerPhone || registration.mobile || ''
      };

      const businessInfo = registration.businessInfo || {
        storeName: registration.storeName || registration.businessName || '',
        description: registration.description || '',
        address: registration.address || registration.storeAddress || registration.location?.address || '',
        city: registration.city || '',
        zipCode: registration.zipCode || '',
        businessType: registration.businessType || 'Sari-Sari Store',
        logo: registration.logo || null,
        coverImage: registration.coverImage || null
      };

      const mappedData = {
        userId,
        // Nested structure (primary)
        personalInfo,
        businessInfo,
        documents: registration.documents || {},
        paymentInfo: registration.paymentInfo || null,
        
        // Flat legacy fields for backward compatibility
        storeName: businessInfo.storeName,
        ownerName: personalInfo.name,
        email: personalInfo.email,
        phone: personalInfo.mobile,
        address: businessInfo.address,
        city: businessInfo.city,
        businessType: businessInfo.businessType,
        description: businessInfo.description,
        
        // Status and metadata
        status: registration.status || 'pending',
        createdAt: registration.createdAt || '',
        updatedAt: registration.updatedAt,
        rejectionReason: registration.rejectionReason,
        location: registration.location || null
      };

      // Debug log for first registration
      if (userId && !console['_loggedFirst']) {
        console.log('📋 [API Sample Registration Data]:', {
          userId,
          'Raw Firebase': {
            hasPersonalInfo: !!registration.personalInfo,
            hasBusinessInfo: !!registration.businessInfo,
            rawStoreName: registration.storeName,
            rawOwnerName: registration.ownerName,
            nestedStoreName: registration.businessInfo?.storeName,
            nestedOwnerName: registration.personalInfo?.name
          },
          'Mapped Output': {
            storeName: mappedData.storeName,
            ownerName: mappedData.ownerName,
            email: mappedData.email,
            address: mappedData.address
          }
        });
        console['_loggedFirst'] = true;
      }

      return mappedData;
    });

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
