/**
 * Update Admin Status Using Firebase Client SDK
 *
 * This script updates existing admin accounts to ensure they have:
 * - status: 'active' (for frequently used accounts)
 * - displayName: populated from email if missing
 * - lastLoginAt: set to current date if missing
 *
 * Run: node update-admin-status-client.js
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');
require('dotenv').config();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.replace(/"/g, ''),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.replace(/"/g, ''),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.replace(/"/g, ''),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/"/g, ''),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace(/"/g, ''),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.replace(/"/g, ''),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.replace(/"/g, '')
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function updateAdminStatus() {
  try {
    console.log('🔄 Starting admin status update...\n');

    // Get all admins
    const adminsRef = ref(database, 'admins');
    const snapshot = await get(adminsRef);
    const admins = snapshot.val();

    if (!admins) {
      console.log('❌ No admin accounts found in database.');
      process.exit(0);
    }

    console.log(`📊 Found ${Object.keys(admins).length} admin account(s)\n`);

    // Update each admin
    for (const [uid, admin] of Object.entries(admins)) {
      console.log(`\n👤 Processing admin: ${admin.email}`);

      const adminUpdates = {};
      let changesMade = false;

      // 1. Set status to 'active' if missing or inactive
      if (!admin.status || admin.status === 'inactive') {
        adminUpdates.status = 'active';
        console.log(`   ✓ Setting status to 'active'`);
        changesMade = true;
      }

      // 2. Add displayName if missing
      if (!admin.displayName) {
        // Extract name from email (before @)
        const emailName = admin.email.split('@')[0];
        const displayName = emailName
          .split(/[._-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        adminUpdates.displayName = displayName;
        console.log(`   ✓ Adding displayName: ${displayName}`);
        changesMade = true;
      }

      // 3. Add lastLoginAt if missing
      if (!admin.lastLoginAt) {
        adminUpdates.lastLoginAt = new Date().toISOString();
        console.log(`   ✓ Adding lastLoginAt timestamp`);
        changesMade = true;
      }

      // 4. Ensure role is set
      if (!admin.role) {
        adminUpdates.role = 'admin';
        console.log(`   ✓ Setting role to 'admin'`);
        changesMade = true;
      }

      // Apply updates
      if (changesMade) {
        const adminRef = ref(database, `admins/${uid}`);
        await update(adminRef, adminUpdates);
        console.log(`   ✅ Updates applied for ${admin.email}`);
      } else {
        console.log(`   ℹ️  No updates needed for ${admin.email}`);
      }
    }

    console.log('\n\n✅ All admin accounts processed successfully!\n');

    // Show final state
    console.log('📋 Current Admin Accounts:');
    console.log('=' .repeat(80));

    const updatedSnapshot = await get(adminsRef);
    const updatedAdmins = updatedSnapshot.val();

    for (const [uid, adminData] of Object.entries(updatedAdmins)) {
      console.log(`\n📧 Email: ${adminData.email}`);
      console.log(`   Name: ${adminData.displayName || 'Not set'}`);
      console.log(`   Status: ${adminData.status || 'Not set'}`);
      console.log(`   Role: ${adminData.role || 'Not set'}`);
      console.log(`   Last Login: ${adminData.lastLoginAt || 'Never'}`);
    }
    console.log('\n' + '='.repeat(80));
    console.log('\n💡 Best Practice: Status will now auto-update to "active" on each login!');
    console.log('💡 Last Login timestamp is tracked automatically in the login flow.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating admin status:', error);
    console.error('\nMake sure your .env file has the correct Firebase configuration.');
    process.exit(1);
  }
}

// Run the update
updateAdminStatus();
