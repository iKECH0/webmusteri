import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
    const leads = stmt.all();
    
    // Convert SQLite 1/0 to boolean
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
    const { id, status, notes } = data;

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE leads 
      SET status = COALESCE(?, status), 
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(status, notes, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leads PUT error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
