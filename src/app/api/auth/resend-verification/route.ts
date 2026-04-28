import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import { getDb } from '@/libs/database/mongo';
import { getSession } from '@/libs/services/auth';
import { sendVerificationEmail } from '@/libs/services/email';

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.emailVerified) {
    return NextResponse.json({ error: 'Already verified' }, { status: 400 });
  }

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  await db.collection('email_verification_tokens').deleteMany({ userId: session.userId });

  const token = crypto.randomBytes(32).toString('hex');
  await db.collection('email_verification_tokens').insertOne({
    userId: session.userId,
    email: session.email,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  });

  await sendVerificationEmail({ email: session.email, token });

  return NextResponse.json({ success: true });
}
