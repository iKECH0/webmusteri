import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const campaigns = db.prepare('SELECT * FROM email_campaigns ORDER BY created_at DESC').all();
  return NextResponse.json(campaigns);
}

export async function POST(request) {
  const { name, subject, body } = await request.json();
  if (!name || !subject || !body) {
    return NextResponse.json({ error: 'name, subject, body required' }, { status: 400 });
  }
  const id = Math.random().toString(36).substring(2, 15);
  db.prepare('INSERT INTO email_campaigns (id, name, subject, body) VALUES (?, ?, ?, ?)').run(id, name, subject, body);
  return NextResponse.json({ success: true, id });
}

export async function DELETE(request) {
  const { id } = await request.json();
  db.prepare('DELETE FROM email_campaigns WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
