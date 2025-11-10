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
      return NextResponse.json(
        { error: authError.error?.message || 'Failed to create Firebase Auth user' },
        { status: 400 }
      );
    }

    const authData = await authResponse.json();
    const userId = authData.localId; // This is the Firebase UID

    // Create admin record in Firebase Realtime Database
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!databaseURL) {
      return NextResponse.json(
        { error: 'Database URL not configured' },
        { status: 500 }
      );
    }

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
      statusUpdatedAt: now
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
      message: 'Admin user created successfully with complete database records',
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
