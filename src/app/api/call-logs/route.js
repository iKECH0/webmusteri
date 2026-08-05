import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    
    let stmt;
    if (leadId) {
      stmt = db.prepare('SELECT * FROM call_logs WHERE lead_id = ? ORDER BY created_at DESC');
      const logs = stmt.all(leadId);
      return NextResponse.json(logs);
    } else {
      stmt = db.prepare('SELECT * FROM call_logs ORDER BY created_at DESC LIMIT 50');
      const logs = stmt.all();
      return NextResponse.json(logs);
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
    const stmt = db.prepare('INSERT INTO call_logs (id, lead_id, note) VALUES (?, ?, ?)');
    stmt.run(id, lead_id, note || '');
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Call logs POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
