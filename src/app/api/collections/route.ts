import { NextResponse } from 'next/server';

import { getDb } from '@/libs/database/mongo';
import { getSession } from '@/libs/services/auth';
import type { Collection } from '@/stores/useCollectionsStore';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();

    const [userDoc, publicDocs] = await Promise.all([
      db.collection('user_collections').findOne({ userId: session.userId }),
      db.collection('user_collections').find({ userId: null }).toArray(),
    ]);

    const userCollections: Collection[] = ((userDoc?.collections as Collection[]) ?? []).map(c => ({
      ...c,
      isPublic: false,
    }));

    const publicCollections: Collection[] = publicDocs.flatMap(doc =>
      ((doc.collections as Collection[]) ?? []).map(c => ({ ...c, isPublic: true })),
    );

    return NextResponse.json({ collections: [...userCollections, ...publicCollections] });
  } catch {
    return NextResponse.json({ collections: [] });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json() as { collections: Collection[] };
  const collections = (body.collections ?? []).map(({ isPublic: _p, ...rest }) => rest);

  try {
    const db = await getDb();
    await db.collection('user_collections').updateOne(
      { userId: session.userId },
      {
        $set: { collections, updatedAt: new Date() },
        $setOnInsert: { userId: session.userId, createdAt: new Date() },
      },
      { upsert: true },
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
