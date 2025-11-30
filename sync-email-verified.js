const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'YOUR_DATABASE_URL'
  });
}

const db = admin.database();
const auth = admin.auth();

async function syncEmailVerifiedStatus() {
  console.log('🔄 Starting email verification status sync...\n');

  try {
    // Get all admins from database
    const adminsRef = db.ref('admins');
    const snapshot = await adminsRef.once('value');
    const admins = snapshot.val();

    if (!admins) {
      console.log('❌ No admins found in database');
      return;
    }

    const adminIds = Object.keys(admins);
    console.log(`📋 Found ${adminIds.length} admin(s) to sync\n`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const uid of adminIds) {
      const adminData = admins[uid];
      const email = adminData.email;

      try {
        // Get Firebase Auth user record
        const userRecord = await auth.getUser(uid);
        const authEmailVerified = userRecord.emailVerified;
        const dbEmailVerified = adminData.emailVerified;

        // Check if update is needed
        if (dbEmailVerified !== authEmailVerified) {
          console.log(`🔄 Syncing ${email}:`);
          console.log(`   Database: ${dbEmailVerified} -> Firebase Auth: ${authEmailVerified}`);

          // Update database
          await adminsRef.child(uid).update({
            emailVerified: authEmailVerified
          });

          console.log(`   ✅ Updated successfully\n`);
          updatedCount++;
        } else {
          console.log(`✓ ${email}: Already in sync (${authEmailVerified})`);
        }

      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log(`⚠️  ${email}: User not found in Firebase Auth (orphaned database record)`);
        } else {
          console.error(`❌ ${email}: Error - ${error.message}`);
        }
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Sync Summary:');
    console.log(`   Total admins: ${adminIds.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Already in sync: ${adminIds.length - updatedCount - errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }

  process.exit(0);
}

// Run the sync
syncEmailVerifiedStatus();
