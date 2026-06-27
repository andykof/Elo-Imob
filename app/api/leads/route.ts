import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { db } from '@/src/db';
import { leads, users } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { user, error } = await verifyAuth(req);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  try {
    const dbUser = await db.query.users.findFirst({ where: eq(users.uid, user.uid) });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userLeads = await db.select().from(leads).where(eq(leads.userId, dbUser.id)).orderBy(desc(leads.createdAt));
    return NextResponse.json({ leads: userLeads });
  } catch (err) {
    console.error("GET leads failed", err);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await verifyAuth(req);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  try {
    const body = await req.json();
    const dbUser = await db.query.users.findFirst({ where: eq(users.uid, user.uid) });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const result = await db.insert(leads).values({
      userId: dbUser.id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      notes: body.notes,
      stage: body.stage || 'Novo Lead',
    }).returning();
    
    return NextResponse.json({ lead: result[0] });
  } catch (err) {
    console.error("POST leads failed", err);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
