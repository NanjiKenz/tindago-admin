/**
 * Script to create an admin user in Firebase
 * Run with: node create-admin-user.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set } = require('firebase/database');

// Firebase configuration from .env file
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

// Admin credentials to create
const ADMIN_EMAIL = 'admin@tindago.com';
const ADMIN_PASSWORD = 'Admin123!';

async function createAdminUser() {
  try {
    console.log('🔄 Creating admin user...');

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = userCredential.user;

    console.log('✅ User created in Firebase Authentication');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);

    // Add user to Realtime Database with admin role
    await set(ref(database, `users/${user.uid}`), {
      uid: user.uid,
      email: ADMIN_EMAIL,
      role: 'admin',
      name: 'Admin User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ User added to Realtime Database with admin role');

    // Add to admins collection
    await set(ref(database, `admins/${user.uid}`), {
      uid: user.uid,
      email: ADMIN_EMAIL,
      name: 'Admin User',
      role: 'super_admin',
      permissions: {
        manageStores: true,
        manageUsers: true,
        viewAnalytics: true,
        manageOrders: true
      },
      createdAt: new Date().toISOString()
    });

    console.log('✅ User added to admins collection');
    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('\n🔗 Go to: http://localhost:3000/auth/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);

    if (error.code === 'auth/email-already-in-use') {
      console.log('\n✅ Admin user already exists!');
      console.log('📝 Login credentials:');
      console.log('   Email:', ADMIN_EMAIL);
      console.log('   Password:', ADMIN_PASSWORD);
    }

    process.exit(1);
  }
}

createAdminUser();
