/**
 * Firebase Status Standardization Script
 *
 * Standardizes status values across store_registrations and stores collections
 * Maps all pending variations to 'pending'
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Status mapping rules
const STATUS_MAPPING = {
  // Pending variations → standardize to 'pending'
  'completed_pending': 'pending',
  'pending_approval': 'pending',
  'submitted': 'pending',
  'awaiting_review': 'pending',

  // Keep standard statuses
  'pending': 'pending',
  'approved': 'approved',
  'active': 'active',
  'rejected': 'rejected',
  'suspended': 'suspended'
};

async function standardizeStoreRegistrations() {
  console.log('🔄 Standardizing store_registrations statuses...');

  try {
    const registrationsRef = ref(database, 'store_registrations');
    const snapshot = await get(registrationsRef);

    if (!snapshot.exists()) {
      console.log('❌ No store_registrations found');
      return;
    }

    const data = snapshot.val();
    const updates = {};
    let changeCount = 0;

    for (const [userId, registration] of Object.entries(data)) {
      const currentStatus = registration.status;
      const standardStatus = STATUS_MAPPING[currentStatus] || currentStatus;

      if (currentStatus !== standardStatus) {
        updates[`store_registrations/${userId}/status`] = standardStatus;
        updates[`store_registrations/${userId}/statusUpdatedAt`] = new Date().toISOString();
        updates[`store_registrations/${userId}/statusUpdatedBy`] = 'migration_script';

        console.log(`📝 ${userId}: "${currentStatus}" → "${standardStatus}"`);
        changeCount++;
      }
    }

    if (changeCount > 0) {
      await update(ref(database), updates);
      console.log(`✅ Updated ${changeCount} store_registrations`);
    } else {
      console.log('✅ All store_registrations already standardized');
    }

  } catch (error) {
    console.error('❌ Error standardizing store_registrations:', error);
  }
}

async function standardizeStores() {
  console.log('🔄 Standardizing stores statuses...');

  try {
    const storesRef = ref(database, 'stores');
    const snapshot = await get(storesRef);

    if (!snapshot.exists()) {
      console.log('❌ No stores found');
      return;
    }

    const data = snapshot.val();
    const updates = {};
    let changeCount = 0;

    for (const [storeId, store] of Object.entries(data)) {
      const currentStatus = store.status;
      const standardStatus = STATUS_MAPPING[currentStatus] || currentStatus;

      if (currentStatus !== standardStatus) {
        updates[`stores/${storeId}/status`] = standardStatus;
        updates[`stores/${storeId}/statusUpdatedAt`] = new Date().toISOString();
        updates[`stores/${storeId}/statusUpdatedBy`] = 'migration_script';

        console.log(`📝 ${storeId}: "${currentStatus}" → "${standardStatus}"`);
        changeCount++;
      }
    }

    if (changeCount > 0) {
      await update(ref(database), updates);
      console.log(`✅ Updated ${changeCount} stores`);
    } else {
      console.log('✅ All stores already standardized');
    }

  } catch (error) {
    console.error('❌ Error standardizing stores:', error);
  }
}

async function validateConsistency() {
  console.log('🔍 Validating status consistency...');

  try {
    const [registrationsSnapshot, storesSnapshot] = await Promise.all([
      get(ref(database, 'store_registrations')),
      get(ref(database, 'stores'))
    ]);

    const registrations = registrationsSnapshot.exists() ? registrationsSnapshot.val() : {};
    const stores = storesSnapshot.exists() ? storesSnapshot.val() : {};

    const inconsistencies = [];

    // Check for stores that exist in both collections with different statuses
    for (const userId of Object.keys(registrations)) {
      if (stores[userId]) {
        const regStatus = registrations[userId].status;
        const storeStatus = stores[userId].status;

        if (regStatus !== storeStatus) {
          inconsistencies.push({
            userId,
            registrationStatus: regStatus,
            storeStatus: storeStatus
          });
        }
      }
    }

    if (inconsistencies.length > 0) {
      console.log('⚠️ Found status inconsistencies:');
      inconsistencies.forEach(item => {
        console.log(`   ${item.userId}: registration="${item.registrationStatus}" vs store="${item.storeStatus}"`);
      });
    } else {
      console.log('✅ All statuses are consistent');
    }

    return inconsistencies;

  } catch (error) {
    console.error('❌ Error validating consistency:', error);
    return [];
  }
}

async function createBackup() {
  console.log('💾 Creating backup...');

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRef = ref(database, `_backups/status_migration_${timestamp}`);

    const [registrationsSnapshot, storesSnapshot] = await Promise.all([
      get(ref(database, 'store_registrations')),
      get(ref(database, 'stores'))
    ]);

    const backupData = {
      store_registrations: registrationsSnapshot.exists() ? registrationsSnapshot.val() : {},
      stores: storesSnapshot.exists() ? storesSnapshot.val() : {},
      created_at: new Date().toISOString(),
      description: 'Backup before status standardization'
    };

    await set(backupRef, backupData);
    console.log(`✅ Backup created: _backups/status_migration_${timestamp}`);

  } catch (error) {
    console.error('❌ Error creating backup:', error);
  }
}

async function main() {
  console.log('🚀 Firebase Status Standardization Script');
  console.log('==========================================');

  try {
    // Step 1: Create backup
    await createBackup();

    // Step 2: Check current inconsistencies
    console.log('\n📊 Current status analysis:');
    await validateConsistency();

    // Step 3: Standardize both collections
    console.log('\n🔧 Starting standardization...');
    await standardizeStoreRegistrations();
    await standardizeStores();

    // Step 4: Validate results
    console.log('\n✅ Validation after standardization:');
    const remainingIssues = await validateConsistency();

    if (remainingIssues.length === 0) {
      console.log('\n🎉 Status standardization completed successfully!');
    } else {
      console.log('\n⚠️ Some inconsistencies remain - manual review needed');
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  }

  process.exit(0);
}

// Run the migration
main();