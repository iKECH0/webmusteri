import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    
    if (leadId) {
      const res = await db.query('SELECT * FROM call_logs WHERE lead_id = $1 ORDER BY created_at DESC', [leadId]);
      return NextResponse.json(res.rows);
    } else {
      const res = await db.query('SELECT * FROM call_logs ORDER BY created_at DESC LIMIT 50');
      return NextResponse.json(res.rows);
    }
  } catch (error) {
    console.error("Call logs GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { lead_id, note } = await request.json();
    if (!lead_id) return NextResponse.json({ error: 'lead_id required' }, { status: 400 });
    
    const id = Math.random().toString(36).substring(2, 15);
    await db.query('INSERT INTO call_logs (id, lead_id, note) VALUES ($1, $2, $3)', [id, lead_id, note || '']);
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Call logs POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
