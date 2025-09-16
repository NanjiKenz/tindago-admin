 // Firebase SDK v12+ for Admin Dashboard
  import { initializeApp } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  import { getDatabase } from 'firebase/database';

  // Your web app's Firebase configuration (same as mobile app)
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
  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const database = getDatabase(app);

  export default app;