/**
 * Check Business Verifications in Firebase
 * This script fetches and displays all business verification records
 */

require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

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

async function checkVerifications() {
  try {
    console.log('📊 Fetching business verifications from Firebase...\n');

    // Get all users with userType: store_owner
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

    const storeOwners = Object.entries(users)
      .filter(([uid, user]) => user.userType === 'store_owner')
      .map(([uid, user]) => ({ uid, ...user }));

    console.log(`Found ${storeOwners.length} store owner(s)\n`);

    // Get business_verifications collection
    const verificationsRef = ref(database, 'business_verifications');
    const verificationsSnapshot = await get(verificationsRef);
    const verifications = verificationsSnapshot.exists() ? verificationsSnapshot.val() : {};

    console.log(`Found ${Object.keys(verifications).length} verification record(s)\n`);

    // Display each store owner and their verification status
    console.log('📋 STORE OWNERS AND VERIFICATION STATUS:\n');
    console.log('='.repeat(80));

    for (const owner of storeOwners) {
      const verification = verifications[owner.uid];
      
      console.log(`\n👤 ${owner.personalInfo?.name || owner.displayName || owner.name || 'Unknown'}`);
      console.log(`   Email: ${owner.personalInfo?.email || owner.email || 'N/A'}`);
      console.log(`   User ID: ${owner.uid}`);
      console.log(`   Account Status: ${owner.status || 'N/A'}`);
      
      if (verification) {
        console.log(`   ✅ HAS VERIFICATION RECORD`);
        console.log(`   Verification Status: ${verification.status || 'N/A'}`);
        console.log(`   Verified At: ${verification.verifiedAt || 'N/A'}`);
        console.log(`   Business Permit: ${verification.businessPermit ? '✓' : '✗'}`);
        console.log(`   Valid ID: ${verification.validId ? '✓' : '✗'}`);
      } else {
        console.log(`   ❌ NO VERIFICATION RECORD (defaults to 'pending' in API)`);
      }
      console.log('-'.repeat(80));
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    const verified = Object.values(verifications).filter(v => v.status === 'verified').length;
    const pending = Object.values(verifications).filter(v => v.status === 'pending').length;
    const rejected = Object.values(verifications).filter(v => v.status === 'rejected').length;
    const noRecord = storeOwners.length - Object.keys(verifications).length;

    console.log(`   Verified: ${verified}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Rejected: ${rejected}`);
    console.log(`   No Record: ${noRecord}`);
    console.log(`\n   Total Store Owners: ${storeOwners.length}`);
    
    if (noRecord > 0) {
      console.log(`\n⚠️  WARNING: ${noRecord} store owner(s) have no verification record in business_verifications collection.`);
      console.log(`   These will default to 'pending' status in the API, causing incorrect counts.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVerifications();
