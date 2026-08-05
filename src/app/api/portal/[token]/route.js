import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { token } = await params;
    const lead = db.prepare('SELECT * FROM leads WHERE portal_token = ?').get(token);
    if (!lead) return NextResponse.json({ error: 'Portal bulunamadı' }, { status: 404 });

    // Mark as viewed
    db.prepare('UPDATE leads SET portal_viewed = 1 WHERE portal_token = ?').run(token);

    // Get quotes for this lead
    const quotes = db.prepare('SELECT * FROM quotes WHERE lead_id = ? ORDER BY created_at DESC').all(lead.id);

    return NextResponse.json({
      lead: {
        name: lead.name,
        address: lead.address,
        phone: lead.phone,
        status: lead.status,
        portal_viewed: lead.portal_viewed,
      },
      quotes: quotes.map(q => ({
        ...q,
        items: JSON.parse(q.items || '[]'),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { token } = await params;
    const { action } = await request.json(); // 'approve' | 'reject'
    const lead = db.prepare('SELECT * FROM leads WHERE portal_token = ?').get(token);
    if (!lead) return NextResponse.json({ error: 'Portal bulunamadı' }, { status: 404 });

    const newStatus = action === 'approve' ? 'interested' : 'rejected';
    db.prepare('UPDATE leads SET status = ? WHERE portal_token = ?').run(newStatus, token);

    // Also update the latest quote
    const latestQuote = db.prepare("SELECT * FROM quotes WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1").get(lead.id);
    if (latestQuote) {
      db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(action === 'approve' ? 'approved' : 'rejected', latestQuote.id);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
