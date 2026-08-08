import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await db.query('SELECT * FROM leads ORDER BY ai_score DESC, created_at DESC');
    const leads = res.rows;
    return NextResponse.json(leads.map(l => ({
      ...l,
      has_website: !!l.has_website,
      tags: JSON.parse(l.tags || '[]'),
    })));
  } catch (error) {
    console.error("Leads GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function PUT(request) {
  const data = await request.json();
  const { id, status, notes, next_followup_date, revenue, email, tags, portal_token, desktop_mockup_url, mobile_mockup_url } = data;
  if (!id) return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });

  const tagsJson = tags !== undefined ? JSON.stringify(tags) : null;
  
  await db.query(`
    UPDATE leads SET
      status = COALESCE($1, status),
      notes = COALESCE($2, notes),
      next_followup_date = COALESCE($3, next_followup_date),
      revenue = COALESCE($4, revenue),
      email = COALESCE($5, email),
      tags = COALESCE($6, tags),
      portal_token = COALESCE($7, portal_token),
      desktop_mockup_url = COALESCE($8, desktop_mockup_url),
      mobile_mockup_url = COALESCE($9, mobile_mockup_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
  `, [status ?? null, notes ?? null, next_followup_date ?? null, revenue ?? null, email ?? null, tagsJson, portal_token ?? null, desktop_mockup_url ?? null, mobile_mockup_url ?? null, id]);

  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  
  // FOREIGN KEY CASCADE is set, but let's be explicit if we want
  await db.query('DELETE FROM leads WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
