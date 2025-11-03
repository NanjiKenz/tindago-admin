/**
 * Script to fix missing admin role in Firebase Database
 * This adds the roles/{uid} entry required by security rules
 * Run with: node fix-admin-role.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set, get } = require('firebase/database');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@tindago.com';
const ADMIN_PASSWORD = 'Admin123!';

async function fixAdminRole() {
  try {
    console.log('🔄 Logging in as admin...');

    // Sign in to get the user's UID
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = userCredential.user;

    console.log('✅ Logged in successfully');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);

    // Check if role already exists
    const roleRef = ref(database, `roles/${user.uid}`);
    const roleSnapshot = await get(roleRef);

    if (roleSnapshot.exists()) {
      console.log('✅ Role already exists:', roleSnapshot.val());
    } else {
      console.log('⚠️  Role does not exist, creating it now...');

      // Add the missing role entry
      await set(roleRef, 'admin');
      console.log('✅ Role set to "admin" in roles collection');
    }

    // Also ensure admins collection has status field
    const adminRef = ref(database, `admins/${user.uid}`);
    const adminSnapshot = await get(adminRef);

    if (adminSnapshot.exists()) {
      const adminData = adminSnapshot.val();
      if (!adminData.status) {
        await set(adminRef, {
          ...adminData,
          status: 'active',
          lastLoginAt: null
        });
        console.log('✅ Updated admins collection with status field');
      } else {
        console.log('✅ Admins collection is up to date');
      }
    } else {
      // Create admins entry if it doesn't exist
      await set(adminRef, {
        uid: user.uid,
        email: ADMIN_EMAIL,
        name: 'Admin User',
        role: 'super_admin',
        status: 'active',
        permissions: {
          manageStores: true,
          manageUsers: true,
          viewAnalytics: true,
          manageOrders: true
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: null
      });
      console.log('✅ Created admins collection entry');
    }

    console.log('\n🎉 Admin role fixed successfully!');
    console.log('🔗 You can now log in at: http://localhost:3000/auth/login');
    console.log('\n📝 Login credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin role:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixAdminRole();
