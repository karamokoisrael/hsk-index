import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDb } from '@/libs/MongoDB';
import { sendPasswordResetEmail } from '@/libs/Email';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { email } = parsed.data;

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  // Always return success to avoid leaking whether the email exists
  const user = await db.collection('users').findOne({ email });
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Delete any existing token for this email
  await db.collection('password_reset_tokens').deleteMany({ email });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.collection('password_reset_tokens').insertOne({
    email,
    token,
    expiresAt,
    createdAt: new Date(),
  });

  await sendPasswordResetEmail({ email, token });

  return NextResponse.json({ success: true });
}
