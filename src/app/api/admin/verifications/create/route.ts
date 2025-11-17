import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating verified business verification records...');

    // Get all users with userType: store_owner
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};

    const storeOwners = Object.entries(users)
      .filter(([uid, user]: [string, any]) => user.userType === 'store_owner')
      .map(([uid, user]: [string, any]) => ({ uid, ...user }));

    console.log(`Found ${storeOwners.length} store owner(s)`);

    // Get existing business_verifications
    const verificationsSnapshot = await database.ref('business_verifications').once('value');
    const verifications = verificationsSnapshot.val() || {};

    console.log(`Found ${Object.keys(verifications).length} existing verification record(s)`);

    // Create verified records for store owners without verification
    const created: string[] = [];
    const skipped: string[] = [];

    for (const owner of storeOwners) {
      if (!verifications[owner.uid]) {
        const ownerName = owner.personalInfo?.name || owner.displayName || owner.name || 'Unknown';
        console.log(`Creating verified record for: ${ownerName}`);

        const verificationRecord = {
          status: 'verified',
          verifiedAt: new Date().toISOString(),
          businessPermit: owner.businessInfo?.businessPermit || 'legacy-verified',
          validId: owner.businessInfo?.validId || 'legacy-verified',
          storePhoto: owner.businessInfo?.storePhoto || '',
          businessName: owner.businessInfo?.businessName || '',
          businessAddress: owner.businessInfo?.address || '',
          businessCity: owner.businessInfo?.city || '',
          verifiedBy: 'system-migration',
          notes: 'Automatically verified for existing active store owners'
        };

        await database.ref(`business_verifications/${owner.uid}`).set(verificationRecord);
        created.push(owner.uid);
        console.log(`✅ Created verified record for ${ownerName}`);
      } else {
        const ownerName = owner.personalInfo?.name || owner.displayName || owner.name || 'Unknown';
        skipped.push(owner.uid);
        console.log(`⏭️  Skipped ${ownerName}: already has verification record (${verifications[owner.uid].status})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} verified records`,
      created: created.length,
      skipped: skipped.length,
      total: storeOwners.length,
      createdIds: created,
      skippedIds: skipped
    });

  } catch (error: any) {
    console.error('❌ Error creating verification records:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create verification records' },
      { status: 500 }
    );
  }
}
