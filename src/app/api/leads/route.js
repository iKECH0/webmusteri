import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await db.query('SELECT * FROM leads ORDER BY ai_score DESC, created_at DESC');
    const leads = res.rows;
    return NextResponse.json(leads.map(l => ({
      ...l,
      has_website: !!l.has_website,
      tags: JSON.parse(l.tags || '[]'),
    })));
  } catch (error) {
    console.error("Leads GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, category, status, notes, tags, revenue, desktop_mockup_url, mobile_mockup_url, next_followup_date, portal_token, portal_viewed, assigned_to, email } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const query = `
      UPDATE leads 
      SET 
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        status = COALESCE($3, status),
        notes = COALESCE($4, notes),
        tags = COALESCE($5, tags),
        revenue = COALESCE($6, revenue),
        desktop_mockup_url = COALESCE($7, desktop_mockup_url),
        mobile_mockup_url = COALESCE($8, mobile_mockup_url),
        next_followup_date = COALESCE($9, next_followup_date),
        portal_token = COALESCE($10, portal_token),
        portal_viewed = COALESCE($11, portal_viewed),
        assigned_to = COALESCE($12, assigned_to),
        email = COALESCE($13, email),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
    `;
    const params = [name, category, status, notes, tags ? JSON.stringify(tags) : null, revenue, desktop_mockup_url, mobile_mockup_url, next_followup_date, portal_token, portal_viewed, assigned_to, email, id];
    
    await db.query(query, params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leads PUT error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  
  // FOREIGN KEY CASCADE is set, but let's be explicit if we want
  await db.query('DELETE FROM leads WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
