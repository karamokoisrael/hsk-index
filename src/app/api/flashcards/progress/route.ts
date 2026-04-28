import { NextResponse } from 'next/server';

import { getSession } from '@/libs/services/auth';
import { getDb } from '@/libs/database/mongo';
import type { FlashcardProgress } from '@/types/Hsk';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const doc = await db.collection('flashcard_progress').findOne({ userId: session.userId });
    return NextResponse.json({ progressByWordId: doc?.progressByWordId ?? {} });
  } catch {
    return NextResponse.json({ progressByWordId: {} });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { progressByWordId } = await request.json() as {
    progressByWordId: Record<number, FlashcardProgress>;
  };

  try {
    const db = await getDb();
    await db.collection('flashcard_progress').updateOne(
      { userId: session.userId },
      {
        $set: { userId: session.userId, progressByWordId, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
