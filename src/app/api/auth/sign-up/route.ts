import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { COOKIE_NAME, SESSION_COOKIE_OPTIONS, signToken } from '@/libs/Auth';
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
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const token = await signToken({ userId: result.insertedId.toString(), email });

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
