import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const leads = db.prepare('SELECT * FROM leads ORDER BY ai_score DESC, created_at DESC').all();
  return NextResponse.json(leads.map(l => ({
    ...l,
    has_website: !!l.has_website,
    tags: JSON.parse(l.tags || '[]'),
  })));
}

export async function PUT(request) {
  const data = await request.json();
  const { id, status, notes, next_followup_date, revenue, email, tags, portal_token } = data;
  if (!id) return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });

  const tagsJson = tags !== undefined ? JSON.stringify(tags) : null;
  db.prepare(`
    UPDATE leads SET
      status = COALESCE(?, status),
      notes = COALESCE(?, notes),
      next_followup_date = COALESCE(?, next_followup_date),
      revenue = COALESCE(?, revenue),
      email = COALESCE(?, email),
      tags = COALESCE(?, tags),
      portal_token = COALESCE(?, portal_token),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status ?? null, notes ?? null, next_followup_date ?? null, revenue ?? null, email ?? null, tagsJson, portal_token ?? null, id);

  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  db.prepare('DELETE FROM call_logs WHERE lead_id = ?').run(id);
  db.prepare('DELETE FROM quotes WHERE lead_id = ?').run(id);
  db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
