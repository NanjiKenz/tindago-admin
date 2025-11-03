/**
 * Script to fix missing admin role using direct database access
 * This script manually sets the role in Firebase
 * Run with: node fix-admin-role-server.js
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDeGdo1GmlBTolD7bYhtDyQAqobYSBVnE",
  authDomain: "tindagoproject.firebaseapp.com",
  databaseURL: "https://tindagoproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tindagoproject",
  storageBucket: "tindagoproject.firebasestorage.app",
  messagingSenderId: "65525054922",
  appId: "1:65525054922:web:4004a23c5aeb0c6b6ce333"
};

// Initialize Firebase (this will use default public access if rules allow)
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Known admin UID from previous script
const ADMIN_UID = 'oBNuLagtZ0aUCCIvCrVr5rqRhoQ2';

async function fixAdminRole() {
  console.log('🔄 Attempting to set admin role...');
  console.log('   UID:', ADMIN_UID);

  try {
    // Try to set the role directly
    const roleRef = ref(database, `roles/${ADMIN_UID}`);
    await set(roleRef, 'admin');

    console.log('✅ Successfully set role to "admin"');
    console.log('\n🎉 Admin role fixed!');
    console.log('🔗 You can now log in at: http://localhost:3000/auth/login');
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@tindago.com');
    console.log('   Password: Admin123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  The security rules are preventing this operation.');
    console.log('\n📋 MANUAL FIX REQUIRED:');
    console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('   2. Select project: tindagoproject');
    console.log('   3. Go to: Realtime Database > Data');
    console.log('   4. Click on root node "+" button');
    console.log('   5. Add new child:');
    console.log('      - Name: roles');
    console.log('   6. Under "roles", add new child:');
    console.log(`      - Name: ${ADMIN_UID}`);
    console.log('      - Value: "admin" (as string)');
    console.log('   7. Save changes');
    console.log('\n   Then try logging in again!');

    process.exit(1);
  }
}

fixAdminRole();
