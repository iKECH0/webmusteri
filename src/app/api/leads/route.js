import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
    const leads = stmt.all();
    
    const formattedLeads = leads.map(lead => ({
      ...lead,
      has_website: !!lead.has_website
    }));
    
    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("Leads GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, status, notes, next_followup_date, revenue } = data;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE leads 
      SET status = COALESCE(?, status), 
          notes = COALESCE(?, notes),
          next_followup_date = COALESCE(?, next_followup_date),
          revenue = COALESCE(?, revenue),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(status ?? null, notes ?? null, next_followup_date ?? null, revenue ?? null, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leads PUT error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    
    // Delete related call logs first
    db.prepare('DELETE FROM call_logs WHERE lead_id = ?').run(id);
    db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leads DELETE error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
