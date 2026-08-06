import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('lead_id');
  let res;
  if (leadId) {
    res = await db.query('SELECT * FROM quotes WHERE lead_id = $1 ORDER BY created_at DESC', [leadId]);
  } else {
    res = await db.query('SELECT * FROM quotes ORDER BY created_at DESC');
  }
  return NextResponse.json(res.rows.map(q => ({ ...q, items: JSON.parse(q.items || '[]') })));
}

export async function POST(request) {
  const { lead_id, title, items, notes } = await request.json();
  if (!lead_id || !items?.length) return NextResponse.json({ error: 'lead_id and items required' }, { status: 400 });

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const id = Math.random().toString(36).substring(2, 15);
  await db.query('INSERT INTO quotes (id, lead_id, title, items, notes, total) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, lead_id, title || 'Teklif', JSON.stringify(items), notes || '', total]);

  return NextResponse.json({ success: true, id, total });
}

export async function PUT(request) {
  const { id, status, items, title, notes } = await request.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  if (items) {
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    await db.query('UPDATE quotes SET status = COALESCE($1, status), items = $2, title = COALESCE($3, title), notes = COALESCE($4, notes), total = $5 WHERE id = $6',
      [status ?? null, JSON.stringify(items), title ?? null, notes ?? null, total, id]);
  } else {
    await db.query('UPDATE quotes SET status = COALESCE($1, status) WHERE id = $2', [status ?? null, id]);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { id } = await request.json();
  await db.query('DELETE FROM quotes WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
