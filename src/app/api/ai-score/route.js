import { NextResponse } from 'next/server';
import db from '@/lib/db';

function calculateScore(lead) {
  let score = 0;
  if (!lead.has_website) score += 40;
  if (lead.rating >= 4.0) score += 20;
  else if (lead.rating >= 3.5) score += 10;
  if (lead.review_count >= 50) score += 15;
  else if (lead.review_count >= 20) score += 10;
  else if (lead.review_count >= 5) score += 5;
  if (lead.status === 'new') score += 10;
  if (lead.phone) score += 10;
  if (lead.email) score += 5;
  return Math.min(score, 100);
}

export async function POST(request) {
  try {
    const { lead_id } = await request.json();

    if (lead_id) {
      const res = await db.query('SELECT * FROM leads WHERE id = $1', [lead_id]);
      const lead = res.rows[0];
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

      const score = calculateScore(lead);
      await db.query('UPDATE leads SET ai_score = $1 WHERE id = $2', [score, lead_id]);
      return NextResponse.json({ success: true, score });
    } else {
      const res = await db.query('SELECT * FROM leads');
      const leads = res.rows;
      
      // Parallel execution for all leads
      await Promise.all(leads.map(async (lead) => {
        const score = calculateScore(lead);
        return db.query('UPDATE leads SET ai_score = $1 WHERE id = $2', [score, lead.id]);
      }));

      return NextResponse.json({ success: true, updated: leads.length });
    }
  } catch (error) {
    console.error('AI score error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
