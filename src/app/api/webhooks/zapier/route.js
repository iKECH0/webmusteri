import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();

    // Zapier'dan gelen veriler
    const name = data.name || "İsimsiz Meta Lead";
    const email = data.email || null;
    const phone = data.phone || null;
    const notes = data.notes || "Meta Ads formundan geldi.";
    
    // Benzersiz bir lead id oluştur (Örn: lead_169..._meta)
    const id = `lead_${Date.now()}_meta`;
    
    // Tags içine kaynağını belli edelim
    const tags = JSON.stringify(["Meta Ads", "Zapier"]);

    const query = `
      INSERT INTO leads (id, name, email, phone, notes, tags, status, category)
      VALUES ($1, $2, $3, $4, $5, $6, 'new', 'Meta Reklamları')
    `;
    
    const params = [id, name, email, phone, notes, tags];

    await db.query(query, params);

    return NextResponse.json({ success: true, lead_id: id }, { status: 200 });

  } catch (error) {
    console.error("Zapier Webhook Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
