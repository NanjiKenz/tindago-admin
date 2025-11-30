import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';

/**
 * Verify if email exists in the system
 * POST /api/admin/verify-email
 * 
 * Checks if email is already registered as:
 * - Admin user
 * - Customer
 * - Store owner
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Extract domain from email
    const domain = email.split('@')[1];

    // Verify domain has valid MX records (can receive emails)
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return NextResponse.json(
          { 
            error: 'Invalid email domain',
            message: 'This email domain cannot receive emails. Please use a valid email address.' 
          },
          { status: 400 }
        );
      }
    } catch (dnsError) {
      // DNS lookup failed - domain doesn't exist or has no MX records
      return NextResponse.json(
        { 
          error: 'Invalid email domain',
          message: 'This email domain does not exist or cannot receive emails. Please check the email address.' 
        },
        { status: 400 }
      );
    }

    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!databaseURL) {
      return NextResponse.json(
        { error: 'Database URL not configured' },
        { status: 500 }
      );
    }

    // Check in admins collection
    const adminsResponse = await fetch(`${databaseURL}/admins.json`);
    if (adminsResponse.ok) {
      const admins = await adminsResponse.json();
      if (admins) {
        const existingAdmin = Object.values(admins).find(
          (admin: any) => admin.email?.toLowerCase() === email.toLowerCase()
        );
        if (existingAdmin) {
          return NextResponse.json(
            { 
              exists: true, 
              userType: 'admin',
              message: 'This email is already registered as an admin user'
            },
            { status: 200 }
          );
        }
      }
    }

    // Check in users collection (customers and store owners)
    const usersResponse = await fetch(`${databaseURL}/users.json`);
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      if (users) {
        const existingUser = Object.values(users).find(
          (user: any) => user.email?.toLowerCase() === email.toLowerCase()
        );
        if (existingUser) {
          const userType = (existingUser as any).userType || 'user';
          return NextResponse.json(
            { 
              exists: true, 
              userType,
              message: `This email is already registered as a ${userType}`
            },
            { status: 200 }
          );
        }
      }
    }

    // Also check Firebase Authentication
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey) {
      try {
        // Use Firebase Auth REST API to check if email exists
        // We'll use the fetchSignInMethodsForEmail equivalent
        const authCheckUrl = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`;
        const authCheckResponse = await fetch(authCheckUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: email,
            continueUri: 'http://localhost:3000'
          })
        });

        if (authCheckResponse.ok) {
          const authData = await authCheckResponse.json();
          // If registered is true or signInMethods exist, email is already in use
          if (authData.registered || (authData.allProviders && authData.allProviders.length > 0)) {
            return NextResponse.json(
              { 
                exists: true, 
                userType: 'firebase_auth',
                message: 'This email is already registered in the system'
              },
              { status: 200 }
            );
          }
        }
      } catch (authCheckError) {
        console.warn('Firebase Auth check failed:', authCheckError);
        // Continue if Firebase Auth check fails - we already checked the database
      }
    }

    // Email is available
    return NextResponse.json(
      { 
        exists: false,
        available: true,
        message: 'Email is available'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    );
  }
}
