/**
 * Reset admin password in Firebase Authentication
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, updatePassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyBDeGdo1GmlBTolD7bYhtDyQAqobYSBVnE",
  authDomain: "tindagoproject.firebaseapp.com",
  databaseURL: "https://tindagoproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tindagoproject",
  storageBucket: "tindagoproject.firebasestorage.app",
  messagingSenderId: "65525054922",
  appId: "1:65525054922:web:4004a23c5aeb0c6b6ce333"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Admin email
const ADMIN_EMAIL = 'admin@tindago.com';
const OLD_PASSWORD = 'Admin123!'; // Current password
const NEW_PASSWORD = 'Admin123!'; // Reset to this

async function resetPassword() {
  console.log('🔄 Resetting admin password...');
  console.log(`   Email: ${ADMIN_EMAIL}`);

  try {
    // Try to sign in with old password first
    console.log('\n1️⃣ Attempting to sign in with current password...');
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, OLD_PASSWORD);
    const user = userCredential.user;

    console.log('✅ Sign in successful!');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);

    // Update password
    console.log('\n2️⃣ Updating password...');
    await updatePassword(user, NEW_PASSWORD);

    console.log('✅ Password updated successfully!');
    console.log('\n📝 NEW Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log('\n🔗 Try logging in at: http://localhost:3001/auth/login');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.code, error.message);

    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      console.log('\n⚠️  Current password is incorrect!');
      console.log('\n📋 Options:');
      console.log('1. Try different password in the script');
      console.log('2. Use Firebase Console to reset password:');
      console.log('   - Go to: https://console.firebase.google.com/');
      console.log('   - Select: tindagoproject');
      console.log('   - Go to: Authentication > Users');
      console.log(`   - Find: ${ADMIN_EMAIL}`);
      console.log('   - Click "..." menu > Reset password');
      console.log('   - Send password reset email');
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n⚠️  Admin user does not exist in Firebase Authentication!');
      console.log('Run: node create-admin-user.js');
    }

    process.exit(1);
  }
}

resetPassword();
