import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const res = await db.query(`
      SELECT n.*, l.name as lead_name, l.portal_token 
      FROM portal_notes n 
      JOIN leads l ON n.lead_id = l.id 
      ORDER BY n.created_at DESC
    `);
    return NextResponse.json({ success: true, notes: res.rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    await db.query('UPDATE portal_notes SET is_read = 1 WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    await db.query('DELETE FROM portal_notes WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
