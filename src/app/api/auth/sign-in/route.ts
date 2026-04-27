import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDb } from '@/libs/database/mongo';
import { COOKIE_NAME, SESSION_COOKIE_OPTIONS, signToken } from '@/libs/services/auth';
import { Env } from '@/utils/env';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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

  const user = await db.collection('users').findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await compare(password + Env.PASSWORD_PEPPER, user.passwordHash as string);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await signToken({ userId: user._id.toString(), email });

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
