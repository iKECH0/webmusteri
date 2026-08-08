import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { lead_id } = await request.json();
    if (!lead_id) return NextResponse.json({ error: 'lead_id required' }, { status: 400 });

    const keyRes = await db.query("SELECT value FROM settings WHERE key = 'gemini_api_key'");
    const apiKey = keyRes.rows[0]?.value;
    if (!apiKey) return NextResponse.json({ error: 'Gemini API Key ayarlanmamış.' }, { status: 400 });

    const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [lead_id]);
    const lead = leadRes.rows[0];
    if (!lead) return NextResponse.json({ error: 'Müşteri bulunamadı.' }, { status: 404 });

    const prompt = `
Sen bir dijital ajans satış uzmanısın. Amacın, web sitesi olmayan bir yerel işletmeye onlara özel, kısa, samimi ve ikna edici bir satış mesajı (WhatsApp veya E-posta için) yazmak.

İşletme Bilgileri:
- Adı: ${lead.name}
- Sektörü: ${lead.category}
- Google Puanı: ${lead.rating || 'Bilinmiyor'} (${lead.review_count || 0} yorum)
- Web Sitesi Durumu: Yok

Yazılacak Mesajın Kuralları:
1. Kurumsal ama çok sıkıcı olmayan, samimi bir dil kullan.
2. İşletmenin mevcut başarısını (Google puanı vb.) öv.
3. Web siteleri olmamasının onlara nasıl müşteri kaybettirdiğini ufak bir "korku/fırsat" psikolojisiyle anlat.
4. Müşteriye bir portal linki göndereceğimizi düşünerek "Size özel hazırladığımız web sitesi şablonunu ve teklifimizi aşağıdaki linkten inceleyebilirsiniz:" şeklinde bitir. (Link kısmını {portal_link} değişkeni olarak bırak).
5. ${lead.design_mockup_url ? `ÇOK ÖNEMLİ: Müşteri için zaten bir tasarım görseli (demo) hazırlanmış. Mesajın içine mutlaka "{portal_link}" değişkeninden ÖNCE şu cümleyi ve linki ekle: "Ayrıca sizin için hazırladığımız özel tasarım görselini (demo) buradan inceleyebilirsiniz: ${lead.design_mockup_url}"` : 'Tasarım linki yok, bu adımı atla.'}
6. Maksimum 3-4 paragraf olsun, çok uzun tutma.
    `;

    const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 }
    });

    const generatedText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    await db.query('UPDATE leads SET ai_pitch = $1 WHERE id = $2', [generatedText, lead_id]);

    return NextResponse.json({ success: true, text: generatedText });
  } catch (error) {
    console.error('AI Pitch Error:', error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.error?.message || error.message || 'Internal Server Error' }, { status: 500 });
  }
}
