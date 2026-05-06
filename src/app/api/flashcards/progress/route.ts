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
    return NextResponse.json({
      progressByWordId: doc?.progressByWordId ?? {},
      hskLevel: doc?.hskLevel ?? null,
    });
  } catch {
    return NextResponse.json({ progressByWordId: {}, hskLevel: null });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as {
    progressByWordId?: Record<number, FlashcardProgress>;
    hskLevel?: number;
  };

  const updateFields: Record<string, unknown> = { userId: session.userId, updatedAt: new Date() };
  if (body.progressByWordId !== undefined) updateFields.progressByWordId = body.progressByWordId;
  if (body.hskLevel !== undefined) updateFields.hskLevel = body.hskLevel;

  try {
    const db = await getDb();
    await db.collection('flashcard_progress').updateOne(
      { userId: session.userId },
      {
        $set: updateFields,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
