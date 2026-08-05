import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('lead_id');
  let quotes;
  if (leadId) {
    quotes = db.prepare('SELECT * FROM quotes WHERE lead_id = ? ORDER BY created_at DESC').all(leadId);
  } else {
    quotes = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all();
  }
  return NextResponse.json(quotes.map(q => ({ ...q, items: JSON.parse(q.items || '[]') })));
}

export async function POST(request) {
  const { lead_id, title, items, notes } = await request.json();
  if (!lead_id || !items?.length) return NextResponse.json({ error: 'lead_id and items required' }, { status: 400 });

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const id = Math.random().toString(36).substring(2, 15);
  db.prepare('INSERT INTO quotes (id, lead_id, title, items, notes, total) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, lead_id, title || 'Teklif', JSON.stringify(items), notes || '', total);

  return NextResponse.json({ success: true, id, total });
}

export async function PUT(request) {
  const { id, status, items, title, notes } = await request.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  if (items) {
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    db.prepare('UPDATE quotes SET status = COALESCE(?, status), items = ?, title = COALESCE(?, title), notes = COALESCE(?, notes), total = ? WHERE id = ?')
      .run(status ?? null, JSON.stringify(items), title ?? null, notes ?? null, total, id);
  } else {
    db.prepare('UPDATE quotes SET status = COALESCE(?, status) WHERE id = ?').run(status ?? null, id);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { id } = await request.json();
  db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
