import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { getOrCreateUser } from '@/src/db/users';

export async function POST(req: NextRequest) {
  const { user, error } = await verifyAuth(req);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const dbUser = await getOrCreateUser(user.uid, user.email || '');
    return NextResponse.json({ user: dbUser });
  } catch (err: any) {
    console.error("Auth sync failed", err);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
