import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { token } = await params;
    const res = await db.query('SELECT * FROM leads WHERE portal_token = $1', [token]);
    const lead = res.rows[0];
    if (!lead) return NextResponse.json({ error: 'Portal bulunamadı' }, { status: 404 });

    await db.query('UPDATE leads SET portal_viewed = 1 WHERE portal_token = $1', [token]);

    const quotesRes = await db.query('SELECT * FROM quotes WHERE lead_id = $1 ORDER BY created_at DESC', [lead.id]);
    
    return NextResponse.json({
      lead: {
        name: lead.name,
        address: lead.address,
        phone: lead.phone,
        category: lead.category,
        competitor_report: lead.competitor_report,
        status: lead.status,
        portal_viewed: 1,
        desktop_mockup_url: lead.desktop_mockup_url,
        mobile_mockup_url: lead.mobile_mockup_url,
      },
      quotes: quotesRes.rows.map(q => ({
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
    const { action, reason } = await request.json(); // 'approve' | 'reject' | 'reject_reason'
    const leadRes = await db.query('SELECT * FROM leads WHERE portal_token = $1', [token]);
    const lead = leadRes.rows[0];
    if (!lead) return NextResponse.json({ error: 'Portal bulunamadı' }, { status: 404 });

    if (action === 'reject_reason' && reason) {
      const currentNotes = lead.notes || '';
      const newNotes = currentNotes + `\n\n[MÜŞTERİ RED SEBEBİ]: ${reason} - (${new Date().toLocaleString('tr-TR')})`;
      await db.query('UPDATE leads SET notes = $1 WHERE portal_token = $2', [newNotes, token]);
      return NextResponse.json({ success: true });
    }

    const newStatus = action === 'approve' ? 'interested' : 'rejected';
    await db.query('UPDATE leads SET status = $1 WHERE portal_token = $2', [newStatus, token]);

    const latestQuoteRes = await db.query("SELECT * FROM quotes WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 1", [lead.id]);
    const latestQuote = latestQuoteRes.rows[0];
    if (latestQuote) {
      await db.query('UPDATE quotes SET status = $1 WHERE id = $2', [action === 'approve' ? 'approved' : 'rejected', latestQuote.id]);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
