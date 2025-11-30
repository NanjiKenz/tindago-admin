import { NextResponse } from 'next/server';
import { promises as dns } from 'dns';
import crypto from 'crypto';

// Helper: Hash code so we don't store it in plaintext
function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Helper: sanitize email key for RTDB path
function emailKey(email: string) {
  return email.replaceAll('.', '(dot)').replaceAll('#','(hash)').replaceAll('$','(dollar)').replaceAll('[','(lb)').replaceAll(']','(rb)');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const domain = email.split('@')[1];
    try {
      const mx = await dns.resolveMx(domain);
      if (!mx || mx.length === 0) {
        return NextResponse.json({ error: 'Invalid email domain' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid email domain' }, { status: 400 });
    }

    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!databaseURL) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    // Check if already exists in admins
    const [adminsRes, usersRes] = await Promise.all([
      fetch(`${databaseURL}/admins.json`),
      fetch(`${databaseURL}/users.json`),
    ]);

    const [admins, users] = await Promise.all([
      adminsRes.ok ? adminsRes.json() : Promise.resolve(null),
      usersRes.ok ? usersRes.json() : Promise.resolve(null),
    ]);

    const existsInAdmins = admins && Object.values<any>(admins).some((a: any) => a.email?.toLowerCase() === email.toLowerCase());
    const existsInUsers = users && Object.values<any>(users).some((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (existsInAdmins || existsInUsers) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Store hashed code in RTDB for this email
    const key = emailKey(email);
    const record = { codeHash: hashCode(code), createdAt: now, expiresAt, attempts: 0 };
    await fetch(`${databaseURL}/email_verification_codes/${key}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    // Send email if SMTP configured; otherwise log to server console
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env as Record<string, string | undefined>;

    let sent = false;
    let devCode: string | undefined;
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      } as any);

      const html = `
        <div style=\"font-family:Arial,sans-serif;font-size:14px;color:#111\">\n          <p>Your TindaGo admin verification code is:</p>\n          <p style=\"font-size:24px;font-weight:bold;letter-spacing:3px\">${code}</p>\n          <p>This code will expire in 10 minutes.</p>\n        </div>`;

      await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: 'TindaGo Admin Verification Code',
        html,
      });
      sent = true;
    } else {
      console.log(`[DEV] Verification code for ${email}: ${code}`);
      // Help local testing: return the code in non-production when SMTP is not configured
      if (process.env.NODE_ENV !== 'production') {
        devCode = code;
      }
    }

    return NextResponse.json({ ok: true, sent, ttl: 600, devCode });
  } catch (error: any) {
    console.error('request-code error', error);
    return NextResponse.json({ error: error.message || 'Failed to request code' }, { status: 500 });
  }
}
