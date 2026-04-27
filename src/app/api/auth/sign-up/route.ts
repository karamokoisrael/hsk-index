import crypto from 'node:crypto';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { COOKIE_NAME, SESSION_COOKIE_OPTIONS, signToken } from '@/libs/Auth';
import { sendVerificationEmail } from '@/libs/Email';
import { Env } from '@/libs/Env';
import { getDb } from '@/libs/MongoDB';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { email, password } = parsed.data;

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const existing = await db.collection('users').findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const passwordHash = await hash(password + Env.PASSWORD_PEPPER, 10);
  const result = await db.collection('users').insertOne({
    email,
    passwordHash,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const userId = result.insertedId.toString();

  // Fire-and-forget verification email
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await db.collection('email_verification_tokens').insertOne({
    userId,
    email,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
  });
  sendVerificationEmail({ email, token: verificationToken }).catch(() => {});

  const sessionToken = await signToken({ userId, email, emailVerified: false });

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);
  return response;
}
