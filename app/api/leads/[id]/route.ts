import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { db } from '@/src/db';
import { leads, users } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await verifyAuth(req);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });
  
  const idStr = (await params).id;
  const leadId = parseInt(idStr, 10);
  if (isNaN(leadId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const body = await req.json();
    const dbUser = await db.query.users.findFirst({ where: eq(users.uid, user.uid) });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const existing = await db.query.leads.findFirst({ where: and(eq(leads.id, leadId), eq(leads.userId, dbUser.id)) });
    if (!existing) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });

    const result = await db.update(leads).set({
      name: body.name !== undefined ? body.name : existing.name,
      email: body.email !== undefined ? body.email : existing.email,
      phone: body.phone !== undefined ? body.phone : existing.phone,
      notes: body.notes !== undefined ? body.notes : existing.notes,
      stage: body.stage !== undefined ? body.stage : existing.stage,
    }).where(eq(leads.id, leadId)).returning();
    
    return NextResponse.json({ lead: result[0] });
  } catch (err) {
    console.error("PUT leads failed", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await verifyAuth(req);
  if (error || !user) return NextResponse.json({ error }, { status: 401 });

  const idStr = (await params).id;
  const leadId = parseInt(idStr, 10);
  if (isNaN(leadId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const dbUser = await db.query.users.findFirst({ where: eq(users.uid, user.uid) });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const existing = await db.query.leads.findFirst({ where: and(eq(leads.id, leadId), eq(leads.userId, dbUser.id)) });
    if (!existing) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });

    await db.delete(leads).where(eq(leads.id, leadId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE leads failed", err);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
