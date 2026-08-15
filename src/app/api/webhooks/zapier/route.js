import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const rawText = await request.text();
    let data = {};
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      // Eğer JSON değilse, düz form formatında gelmiş olabilir
      const params = new URLSearchParams(rawText);
      data = Object.fromEntries(params);
    }

    // Zapier'dan gelen veriler (Meta'nın orijinal key'leri farklı olabilir)
    const name = data.name || data.full_name || data.first_name || "İsimsiz Meta Lead";
    const email = data.email || data.email_address || null;
    const phone = data.phone || data.phone_number || null;
    const notes = data.notes || data.campaign_name || "Meta Ads formundan geldi.";
    
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
