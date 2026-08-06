import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const res = await db.query('SELECT * FROM search_schedules ORDER BY created_at DESC');
    const schedules = res.rows.map(s => ({ ...s, queries: JSON.parse(s.queries) }));
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
    await db.query(`
      INSERT INTO search_schedules (id, queries, schedule_type, schedule_day)
      VALUES ($1, $2, $3, $4)
    `, [id, JSON.stringify(queries), schedule_type || 'weekly', schedule_day ?? 1]);
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.query('DELETE FROM search_schedules WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, is_active } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.query('UPDATE search_schedules SET is_active = $1 WHERE id = $2', [is_active ? 1 : 0, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
