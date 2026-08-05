import { NextResponse } from 'next/server';
import db from '@/lib/db';

// AI Scoring algorithm
function calculateScore(lead) {
  let score = 0;

  // No website = biggest opportunity
  if (!lead.has_website) score += 40;

  // Good rating (4-5 stars) = business is doing well, can invest
  if (lead.rating >= 4.0) score += 20;
  else if (lead.rating >= 3.5) score += 10;

  // Many reviews = active customer base
  if (lead.review_count >= 50) score += 15;
  else if (lead.review_count >= 20) score += 10;
  else if (lead.review_count >= 5) score += 5;

  // Not yet contacted
  if (lead.status === 'new') score += 10;

  // Has phone number (reachable)
  if (lead.phone) score += 10;

  // Has email
  if (lead.email) score += 5;

  return Math.min(score, 100);
}

export async function POST(request) {
  try {
    const { lead_id } = await request.json();

    if (lead_id) {
      // Score single lead
      const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead_id);
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

      const score = calculateScore(lead);
      db.prepare('UPDATE leads SET ai_score = ? WHERE id = ?').run(score, lead_id);
      return NextResponse.json({ success: true, score });
    } else {
      // Score ALL leads (batch)
      const leads = db.prepare('SELECT * FROM leads').all();
      const updateStmt = db.prepare('UPDATE leads SET ai_score = ? WHERE id = ?');

      const updateAll = db.transaction((allLeads) => {
        for (const lead of allLeads) {
          const score = calculateScore(lead);
          updateStmt.run(score, lead.id);
        }
      });
      updateAll(leads);

      return NextResponse.json({ success: true, updated: leads.length });
    }
  } catch (error) {
    console.error('AI score error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
