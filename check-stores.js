/**
 * Check Stores and their Owners
 */

require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

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

async function checkStores() {
  try {
    console.log('📊 Fetching stores from Firebase...\n');

    const storesRef = ref(database, 'stores');
    const storesSnapshot = await get(storesRef);
    const stores = storesSnapshot.exists() ? storesSnapshot.val() : {};

    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

    const storeOwners = Object.entries(users)
      .filter(([uid, user]) => user.userType === 'store_owner')
      .map(([uid, user]) => ({ uid, ...user }));

    console.log(`Found ${Object.keys(stores).length} store(s)`);
    console.log(`Found ${storeOwners.length} store owner(s)\n`);

    console.log('🏪 STORES AND THEIR OWNERS:\n');
    console.log('='.repeat(80));

    for (const [storeId, store] of Object.entries(stores)) {
      console.log(`\n🏪 ${store.storeName || 'Unnamed Store'}`);
      console.log(`   Store ID: ${storeId}`);
      console.log(`   Status: ${store.status || 'N/A'}`);
      console.log(`   Owner ID: ${store.ownerId || store.userId || 'N/A'}`);
      console.log(`   Owner Email: ${store.ownerEmail || 'N/A'}`);
      
      // Find the owner in users
      const ownerId = store.ownerId || store.userId;
      const owner = ownerId ? users[ownerId] : null;
      if (owner) {
        console.log(`   ✅ Owner Found: ${owner.personalInfo?.name || owner.displayName || 'Unknown'}`);
      } else {
        console.log(`   ❌ Owner Not Found in users collection`);
      }
      console.log('-'.repeat(80));
    }

    console.log('\n📊 STORE OWNERS AND THEIR STORES:\n');
    console.log('='.repeat(80));

    for (const owner of storeOwners) {
      const ownerStores = Object.entries(stores).filter(([storeId, store]) => 
        store.ownerId === owner.uid || store.userId === owner.uid
      );

      console.log(`\n👤 ${owner.personalInfo?.name || owner.displayName || 'Unknown'}`);
      console.log(`   User ID: ${owner.uid}`);
      console.log(`   Email: ${owner.personalInfo?.email || owner.email}`);
      console.log(`   Stores: ${ownerStores.length}`);
      
      if (ownerStores.length > 0) {
        ownerStores.forEach(([storeId, store]) => {
          console.log(`      • ${store.storeName || 'Unnamed'} (${store.status || 'N/A'})`);
        });
      } else {
        console.log(`      ❌ No stores found`);
      }
      console.log('-'.repeat(80));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkStores();
