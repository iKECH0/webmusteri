import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM search_schedules ORDER BY created_at DESC');
    const schedules = stmt.all().map(s => ({ ...s, queries: JSON.parse(s.queries) }));
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { queries, schedule_type, schedule_day } = await request.json();
    if (!queries || !Array.isArray(queries)) {
      return NextResponse.json({ error: 'queries array required' }, { status: 400 });
    }
    const id = Math.random().toString(36).substring(2, 15);
    const stmt = db.prepare(`
      INSERT INTO search_schedules (id, queries, schedule_type, schedule_day)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, JSON.stringify(queries), schedule_type || 'weekly', schedule_day ?? 1);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    db.prepare('DELETE FROM search_schedules WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, is_active } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    db.prepare('UPDATE search_schedules SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
