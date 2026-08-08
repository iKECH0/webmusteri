import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { token } = await params;
    const { messages } = await request.json(); // Array of { role, content }

    if (!messages || !messages.length) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const keyRes = await db.query("SELECT value FROM settings WHERE key = 'gemini_api_key'");
    const apiKey = keyRes.rows[0]?.value;
    if (!apiKey) return NextResponse.json({ error: 'Gemini API Key ayarlanmamış.' }, { status: 400 });

    const leadRes = await db.query('SELECT * FROM leads WHERE portal_token = $1', [token]);
    const lead = leadRes.rows[0];
    if (!lead) return NextResponse.json({ error: 'Portal bulunamadı' }, { status: 404 });

    const systemPrompt = `
Sen bir dijital ajansın yapay zeka satış temsilcisisin. 
Şu anda sohbet ettiğin müşteri: ${lead.name} (${lead.category} sektöründe bir işletme).
Amacın: Bu işletmeye modern bir web sitesi satmak. 
Müşteri şu anda kendisi için özel oluşturulmuş bir "Teklif ve Demo Portalında" seninle konuşuyor.

Kurallar:
1. Müşteri itiraz ederse (çok pahalı, vaktim yok, sosyal medya yetiyor) onları çok mantıklı ve ikna edici argümanlarla karşıla. Sosyal medyanın onlara ait olmadığını, algoritmaların değişebileceğini, ama web sitesinin kendi dükkanları olduğunu söyle.
2. Fiyat sorarlarsa, "Ekrandaki teklif dosyasında detayları görebilirsiniz, ancak size özel bir kolaylık veya taksitlendirme yapabiliriz. Detaylı görüşmek için teklifi onaylayın." gibi cevaplar ver.
3. Çok uzun mesajlar yazma. Chatbot gibi, kısa, net ve ikna edici ol.
4. Daima saygılı, profesyonel ama sıcak bir ton kullan.
`;

    const geminiContents = [];
    geminiContents.push({ role: 'user', parts: [{ text: `[SİSTEM TALİMATI: ${systemPrompt}]\n\nMerhaba, az önce portala giriş yaptım ve mesajınızı gördüm.` }] });

    messages.forEach(m => {
      geminiContents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      });
    });

    const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      contents: geminiContents,
      generationConfig: { temperature: 0.7 }
    });

    const botMessage = res.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Cevap alınamadı.';

    return NextResponse.json({ success: true, message: botMessage });
  } catch (error) {
    console.error('AI Chat Error:', error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.error?.message || error.message || 'Internal Server Error' }, { status: 500 });
  }
}
