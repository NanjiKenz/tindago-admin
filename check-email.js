const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'YOUR_DATABASE_URL'
  });
}

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: node check-email.js email@example.com');
  process.exit(1);
}

async function checkEmail(email) {
  console.log(`\n🔍 Checking email: ${email}\n`);

  // 1. Check Firebase Authentication
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('❌ EXISTS in Firebase Authentication:');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email Verified: ${userRecord.emailVerified}`);
    console.log(`   Created: ${userRecord.metadata.creationTime}`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('✅ NOT FOUND in Firebase Authentication');
    } else {
      console.error('Error checking Firebase Auth:', error.message);
    }
  }

  // 2. Check admins collection
  const db = admin.database();
  const adminsRef = db.ref('admins');
  const adminsSnapshot = await adminsRef.once('value');
  const admins = adminsSnapshot.val();
  
  let foundInAdmins = false;
  if (admins) {
    for (const [uid, admin] of Object.entries(admins)) {
      if (admin.email?.toLowerCase() === email.toLowerCase()) {
        console.log(`❌ EXISTS in admins/${uid}`);
        foundInAdmins = true;
      }
    }
  }
  if (!foundInAdmins) {
    console.log('✅ NOT FOUND in admins collection');
  }

  // 3. Check users collection
  const usersRef = db.ref('users');
  const usersSnapshot = await usersRef.once('value');
  const users = usersSnapshot.val();
  
  let foundInUsers = false;
  if (users) {
    for (const [uid, user] of Object.entries(users)) {
      if (user.email?.toLowerCase() === email.toLowerCase()) {
        console.log(`❌ EXISTS in users/${uid}`);
        foundInUsers = true;
      }
    }
  }
  if (!foundInUsers) {
    console.log('✅ NOT FOUND in users collection');
  }

  console.log('\n');
  process.exit(0);
}

checkEmail(email).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
