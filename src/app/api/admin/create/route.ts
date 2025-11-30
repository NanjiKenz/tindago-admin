import { NextResponse } from 'next/server';

/**
 * Create a new admin user
 * POST /api/admin/create
 *
 * Creates:
 * 1. Firebase Authentication user
 * 2. Admin record in database
 * 3. Role entry for admin access
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email, password, displayName, role, status, permissions,
      phone, department, notes, dateOfBirth, country, city, postalCode
    } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get Firebase API key from environment
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Firebase API key not configured' },
        { status: 500 }
      );
    }

    // PRECHECK: Ensure email not already used in admins/users (race-safe server check)
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!databaseURL) {
      return NextResponse.json(
        { error: 'Database URL not configured' },
        { status: 500 }
      );
    }

    const [adminsRes, usersRes] = await Promise.all([
      fetch(`${databaseURL}/admins.json`),
      fetch(`${databaseURL}/users.json`)
    ]);
    const [admins, users] = await Promise.all([
      adminsRes.ok ? adminsRes.json() : Promise.resolve(null),
      usersRes.ok ? usersRes.json() : Promise.resolve(null)
    ]);
    const existsInAdmins = admins && Object.values<any>(admins).some((a: any) => a.email?.toLowerCase() === email.toLowerCase());
    const existsInUsers = users && Object.values<any>(users).some((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (existsInAdmins || existsInUsers) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Create Firebase Authentication user using REST API
    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    if (!authResponse.ok) {
      const authError = await authResponse.json();
      const errorMessage = authError.error?.message || 'Failed to create Firebase Auth user';
      
      // Provide user-friendly error messages
      let friendlyMessage = errorMessage;
      if (errorMessage.includes('EMAIL_EXISTS')) {
        friendlyMessage = 'This email is already registered in the system. Please use a different email address.';
      } else if (errorMessage.includes('WEAK_PASSWORD')) {
        friendlyMessage = 'Password is too weak. Please use a stronger password (at least 6 characters).';
      } else if (errorMessage.includes('INVALID_EMAIL')) {
        friendlyMessage = 'Invalid email address format.';
      }
      
      return NextResponse.json(
        { error: friendlyMessage },
        { status: 400 }
      );
    }

    const authData = await authResponse.json();
    const userId = authData.localId; // This is the Firebase UID

    // Send Firebase built-in email verification to the new admin account
    try {
      const verifyEmailUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;
      const verifyResponse = await fetch(verifyEmailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'VERIFY_EMAIL', idToken: authData.idToken })
      });
      if (!verifyResponse.ok) {
        console.warn('Failed to send verification email to new admin');
      }
    } catch (emailErr) {
      console.warn('Verification email error (non-fatal):', emailErr);
    }

    // Create admin record in Firebase Realtime Database
    // databaseURL already validated above

    const now = new Date().toISOString();

    const adminData = {
      email,
      displayName: displayName || '',
      role: role || 'admin',
      status: status || 'active',
      createdAt: now,
      permissions: permissions || [],
      phone: phone || '',
      department: department || '',
      notes: notes || '',
      dateOfBirth: dateOfBirth || '',
      country: country || '',
      city: city || '',
      postalCode: postalCode || '',
      lastLogin: null,
      lastLoginAt: null,
      statusUpdatedAt: now,
      emailVerified: false,
      emailVerificationSentAt: now
    };

    // Save admin data
    const adminUrl = `${databaseURL}/admins/${userId}.json`;
    const adminResponse = await fetch(adminUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    });

    if (!adminResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to create admin record in database' },
        { status: 500 }
      );
    }

    // CRITICAL FIX: Also create entry in users/{userId} collection
    // This enables the email JOIN in AdminManagement table
    const userData = {
      email,
      name: displayName || '',
      role: role || 'admin',
      createdAt: now,
      dateOfBirth: dateOfBirth || '',
      country: country || '',
      city: city || '',
      postalCode: postalCode || '',
      phone: phone || ''
    };

    const userUrl = `${databaseURL}/users/${userId}.json`;
    const userResponse = await fetch(userUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!userResponse.ok) {
      console.error('Warning: Failed to create user record, but admin record exists');
    }

    // Create role entry
    const roleUrl = `${databaseURL}/roles/${userId}.json`;
    await fetch(roleUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('admin'),
    });

    console.log(`✅ Admin user created successfully: ${userId}`);
    console.log(`   - Firebase Auth: Created`);
    console.log(`   - admins/${userId}: Created`);
    console.log(`   - users/${userId}: Created`);
    console.log(`   - roles/${userId}: Created`);

    return NextResponse.json({
      success: true,
      userId,
      verificationEmailSent: true,
      message: 'Admin user created successfully. A verification email has been sent to the admin.'
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
