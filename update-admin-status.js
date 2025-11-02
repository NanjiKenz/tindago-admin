/**
 * Update Admin Status and Add Missing Fields
 *
 * This script updates existing admin accounts to ensure they have:
 * - status: 'active' (for frequently used accounts)
 * - displayName: populated from email if missing
 * - lastLoginAt: set to current date if missing
 *
 * Run: node update-admin-status.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./tindagoproject-firebase-adminsdk-q0q84-efe3c79b64.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tindagoproject-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

async function updateAdminStatus() {
  try {
    console.log('🔄 Starting admin status update...\n');

    // Get all admins
    const adminsRef = db.ref('admins');
    const snapshot = await adminsRef.once('value');
    const admins = snapshot.val();

    if (!admins) {
      console.log('❌ No admin accounts found in database.');
      process.exit(0);
    }

    console.log(`📊 Found ${Object.keys(admins).length} admin account(s)\n`);

    // Update each admin
    const updates = {};
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
        updates[`admins/${uid}`] = { ...admin, ...adminUpdates };
        console.log(`   ✅ Updates prepared for ${admin.email}`);
      } else {
        console.log(`   ℹ️  No updates needed for ${admin.email}`);
      }
    }

    // Write all updates at once
    if (Object.keys(updates).length > 0) {
      console.log('\n\n📝 Applying updates to Firebase...');
      await db.ref().update(updates);
      console.log('✅ All admin accounts updated successfully!\n');

      // Show final state
      console.log('📋 Updated Admin Accounts:');
      console.log('=' .repeat(80));
      for (const [path, adminData] of Object.entries(updates)) {
        console.log(`\n📧 Email: ${adminData.email}`);
        console.log(`   Name: ${adminData.displayName}`);
        console.log(`   Status: ${adminData.status}`);
        console.log(`   Role: ${adminData.role}`);
        console.log(`   Last Login: ${adminData.lastLoginAt}`);
      }
      console.log('\n' + '='.repeat(80));
    } else {
      console.log('\n✅ All admin accounts are already up to date!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating admin status:', error);
    process.exit(1);
  }
}

// Run the update
updateAdminStatus();
