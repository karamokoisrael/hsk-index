import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

import { COOKIE_NAME, SESSION_COOKIE_OPTIONS, signToken } from '@/libs/Auth';
import { getDb } from '@/libs/MongoDB';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/?verified=invalid`);
  }

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.redirect(`${APP_URL}/?verified=error`);
  }

  const record = await db.collection('email_verification_tokens').findOne({ token });

  if (!record || record.expiresAt < new Date()) {
    await db.collection('email_verification_tokens').deleteOne({ token });
    return NextResponse.redirect(`${APP_URL}/?verified=invalid`);
  }

  await db.collection('users').updateOne(
    { _id: new ObjectId(record.userId) },
    { $set: { emailVerified: true, updatedAt: new Date() } },
  );

  await db.collection('email_verification_tokens').deleteOne({ token });

  const sessionToken = await signToken({
    userId: record.userId,
    email: record.email,
    emailVerified: true,
  });

  const response = NextResponse.redirect(`${APP_URL}/dashboard?verified=true`);
  response.cookies.set(COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);
  return response;
}
