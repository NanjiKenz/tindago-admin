import { NextResponse } from 'next/server';
import crypto from 'crypto';

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function emailKey(email: string) {
  return email.replaceAll('.', '(dot)').replaceAll('#','(hash)').replaceAll('$','(dollar)').replaceAll('[','(lb)').replaceAll(']','(rb)');
}

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });

    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!databaseURL) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    const key = emailKey(email);
    const recRes = await fetch(`${databaseURL}/email_verification_codes/${key}.json`);
    if (!recRes.ok) return NextResponse.json({ error: 'Code not found' }, { status: 400 });
    const rec = await recRes.json();
    if (!rec) return NextResponse.json({ error: 'Code not found' }, { status: 400 });

    const now = Date.now();
    if (rec.expiresAt && now > rec.expiresAt) {
      await fetch(`${databaseURL}/email_verification_codes/${key}.json`, { method: 'DELETE' });
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    const attempts = typeof rec.attempts === 'number' ? rec.attempts : 0;
    if (attempts >= 5) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }

    const ok = rec.codeHash === hashCode(code.toString());

    if (!ok) {
      await fetch(`${databaseURL}/email_verification_codes/${key}/attempts.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempts + 1),
      });
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Success: delete record
    await fetch(`${databaseURL}/email_verification_codes/${key}.json`, { method: 'DELETE' });

    return NextResponse.json({ verified: true });
  } catch (error: any) {
    console.error('confirm-code error', error);
    return NextResponse.json({ error: error.message || 'Failed to confirm code' }, { status: 500 });
  }
}
