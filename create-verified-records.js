/**
 * Create Verified Business Verification Records
 * This script creates verified business verification records for store owners that don't have them
 */

require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function createVerifiedRecords() {
  try {
    console.log('🔄 Creating verified business verification records...\n');

    // Get all users with userType: store_owner
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

    const storeOwners = Object.entries(users)
      .filter(([uid, user]) => user.userType === 'store_owner')
      .map(([uid, user]) => ({ uid, ...user }));

    console.log(`Found ${storeOwners.length} store owner(s)\n`);

    // Get existing business_verifications
    const verificationsRef = ref(database, 'business_verifications');
    const verificationsSnapshot = await get(verificationsRef);
    const verifications = verificationsSnapshot.exists() ? verificationsSnapshot.val() : {};

    console.log(`Found ${Object.keys(verifications).length} existing verification record(s)\n`);

    // Create verified records for store owners without verification
    let created = 0;
    let skipped = 0;

    for (const owner of storeOwners) {
      if (!verifications[owner.uid]) {
        console.log(`Creating verified record for: ${owner.personalInfo?.name || owner.displayName || 'Unknown'}`);
        console.log(`   User ID: ${owner.uid}`);
        console.log(`   Email: ${owner.personalInfo?.email || owner.email}`);

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

        const verificationRef = ref(database, `business_verifications/${owner.uid}`);
        await set(verificationRef, verificationRecord);

        console.log(`   ✅ Created verified record\n`);
        created++;
      } else {
        console.log(`Skipping ${owner.personalInfo?.name || owner.displayName}: already has verification record (${verifications[owner.uid].status})\n`);
        skipped++;
      }
    }

    console.log('📊 SUMMARY:');
    console.log(`   ✅ Records created: ${created}`);
    console.log(`   ⏭️  Skipped (already exists): ${skipped}`);
    console.log(`   Total store owners: ${storeOwners.length}`);

    if (created > 0) {
      console.log('\n✨ Successfully created verified records!');
      console.log('   The "Pending Verifications" count should now show 0.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createVerifiedRecords();
