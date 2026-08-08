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
Müşteri şu anda kendisi için özel oluşturulmuş bir "Teklif ve İnceleme Portalında" seninle konuşuyor.

ÖNEMLİ BİLGİ VE KURALLAR:
1. Sitede "Canlı Demo", "Önizleme" veya farklı sekmeler (tab) YOKTUR. Müşteri şu an tek sayfalık bir ekrandadır. Tasarım örneği sayfanın üst kısmında yer alan cihaz görselindedir (mockup). Müşteriye kesinlikle "Canlı demo sekmesine tıklayın" gibi yanlış yönergeler VERME. Tasarımı sayfayı yukarı kaydırarak görebileceklerini söyle.
2. Müşteri itiraz ederse (çok pahalı, vaktim yok, sosyal medya yetiyor vb.) onları mantıklı ve ikna edici argümanlarla karşıla. Sosyal medyanın onlara ait olmadığını, algoritmaların aniden değişebileceğini, web sitesinin ise tamamen kendi dükkanları (dijital mülkleri) olduğunu vurgula.
3. Fiyat veya ödeme sorarlarsa, "Ekrandaki yatırım planında tutarı görebilirsiniz. Ödemeyi web siteniz tamamen bitip size teslim edildikten sonra alıyoruz, herhangi bir ön ödeme talep etmiyoruz." diyerek güven ver.
4. Müşteriye harici linkler veya tıklaması için menü isimleri uydurma.
5. Çok uzun paragraflar yazma. WhatsApp veya canlı destekte yazışır gibi samimi, kısa ve net ol.
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
