import { NextResponse } from 'next/server';

import { getDb } from '@/libs/database/mongo';
import { getSession } from '@/libs/services/auth';
import type { FlashcardProgress } from '@/types/Hsk';

type ProgressMap = Record<number, FlashcardProgress>;

function reviewedAt(progress: FlashcardProgress): number {
  if (!progress.lastReviewedAt) {
    return 0;
  }

  const time = new Date(progress.lastReviewedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function mergeProgress(existing: ProgressMap, incoming: ProgressMap): ProgressMap {
  const merged: ProgressMap = { ...existing };

  for (const [wordId, incomingProgress] of Object.entries(incoming)) {
    const numericWordId = Number(wordId);
    const currentProgress = merged[numericWordId];

    if (!currentProgress) {
      merged[numericWordId] = incomingProgress;
      continue;
    }

    const currentReviewedAt = reviewedAt(currentProgress);
    const incomingReviewedAt = reviewedAt(incomingProgress);

    if (
      incomingReviewedAt > currentReviewedAt
      || (incomingReviewedAt === currentReviewedAt && incomingReviewedAt > 0)
    ) {
      merged[numericWordId] = incomingProgress;
    }
  }

  return merged;
}

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
    progressByWordId?: ProgressMap;
    hskLevel?: number;
  };

  const db = await getDb();
  const existing = await db.collection('flashcard_progress').findOne({ userId: session.userId });

  const updateFields: Record<string, unknown> = { userId: session.userId, updatedAt: new Date() };
  if (body.progressByWordId !== undefined) {
    updateFields.progressByWordId = mergeProgress(
      (existing?.progressByWordId ?? {}) as ProgressMap,
      body.progressByWordId,
    );
  }
  if (body.hskLevel !== undefined) {
    updateFields.hskLevel = body.hskLevel;
  }

  try {
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
