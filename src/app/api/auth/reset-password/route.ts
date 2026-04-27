import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDb } from '@/libs/database/mongo';
import { Env } from '@/utils/env';

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { token, password } = parsed.data;

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const resetToken = await db.collection('password_reset_tokens').findOne({ token });

  if (!resetToken) {
    return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
  }

  if (new Date() > new Date(resetToken.expiresAt as Date)) {
    await db.collection('password_reset_tokens').deleteOne({ token });
    return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });
  }

  const passwordHash = await hash(password + Env.PASSWORD_PEPPER, 10);

  await db.collection('users').updateOne(
    { email: resetToken.email },
    { $set: { passwordHash, updatedAt: new Date() } },
  );

  await db.collection('password_reset_tokens').deleteOne({ token });

  return NextResponse.json({ success: true });
}
