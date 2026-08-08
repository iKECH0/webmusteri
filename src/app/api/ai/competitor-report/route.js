import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { lead_id } = await request.json();
    if (!lead_id) return NextResponse.json({ error: 'lead_id required' }, { status: 400 });

    const keyRes = await db.query("SELECT value FROM settings WHERE key = 'gemini_api_key'");
    const aiKey = keyRes.rows[0]?.value;
    
    const googleRes = await db.query("SELECT value FROM settings WHERE key = 'google_api_key'");
    const googleKey = googleRes.rows[0]?.value;

    if (!aiKey || !googleKey) return NextResponse.json({ error: 'API Anahtarları eksik.' }, { status: 400 });

    const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [lead_id]);
    const lead = leadRes.rows[0];
    if (!lead) return NextResponse.json({ error: 'Müşteri bulunamadı.' }, { status: 404 });

    // Rakipleri Bul (Aynı bölge, aynı kategori)
    const query = `${lead.address || ''} ${lead.category || ''} web sitesi olan`;
    const resGoogle = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      { textQuery: query, languageCode: 'tr' },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleKey,
          'X-Goog-FieldMask': 'places.displayName,places.websiteUri',
        },
      }
    );

    const places = (resGoogle.data?.places || []).filter(p => p.websiteUri).slice(0, 3);
    let competitorsText = places.map(p => p.displayName?.text).join(', ');

    let report = "";
    if (places.length > 0) {
      const prompt = `Sen bir satış uzmanısın. ${lead.name} firması için bir rakip analiz raporu yaz. 
Rakipleri: ${competitorsText}. Bu rakiplerin hepsinin web sitesi var ve internetteki müşterileri onlar kapıyor. ${lead.name} firmasının web sitesi olmadığı için nasıl geri kaldığını "fırsat maliyeti" (kaybedilen kazanç) üzerinden anlat. Sadece 2-3 cümlelik çok vurucu bir metin yaz.`;

      const aiRes = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${aiKey}`, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      });
      
      report = aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      report = "Bölgenizde web sitesi olan güçlü bir rakip tespit edemedik. Bu inanılmaz bir fırsat! Bölgenizdeki ilk profesyonel dijital varlığı siz kurarak tüm müşterileri toplayabilirsiniz.";
    }

    await db.query('UPDATE leads SET competitor_report = $1 WHERE id = $2', [report, lead_id]);

    return NextResponse.json({ success: true, report, competitors: places });
  } catch (error) {
    console.error('AI Competitor Error:', error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.error?.message || error.message || 'Internal Server Error' }, { status: 500 });
  }
}
