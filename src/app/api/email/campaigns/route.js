import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const res = await db.query('SELECT * FROM email_campaigns ORDER BY created_at DESC');
  return NextResponse.json(res.rows);
}

export async function POST(request) {
  const { name, subject, body } = await request.json();
  if (!name || !subject || !body) {
    return NextResponse.json({ error: 'name, subject, body required' }, { status: 400 });
  }
  const id = Math.random().toString(36).substring(2, 15);
  await db.query('INSERT INTO email_campaigns (id, name, subject, body) VALUES ($1, $2, $3, $4)', [id, name, subject, body]);
  return NextResponse.json({ success: true, id });
}

export async function DELETE(request) {
  const { id } = await request.json();
  await db.query('DELETE FROM email_campaigns WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
