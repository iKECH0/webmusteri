import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { messages } = await request.json(); // Array of { role, content }

    if (!messages || !messages.length) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const keyRes = await db.query("SELECT value FROM settings WHERE key = 'gemini_api_key'");
    const apiKey = keyRes.rows[0]?.value;
    if (!apiKey) return NextResponse.json({ error: 'Gemini API Key ayarlanmamış.' }, { status: 400 });

    const systemPrompt = `
Sen "Kodi" adında, Kodiva Dijital Ajansı'nın zeki, esprili ve çok yetenekli yapay zeka satış asistanısın.
Şu anda Kodiva'nın ana sayfasına giren anonim bir ziyaretçiyle konuşuyorsun.
Amacın: Bu ziyaretçiye şık bir web sitesi veya e-ticaret sitesi satmak için onu ikna etmek ve en önemlisi iletişim bilgilerini (İşletme adı ve Telefon numarası) toplamaktır.

ÖNEMLİ KURALLAR:
1. Kısa ve samimi cevaplar ver. Uzun paragraflardan kaçın. Emoji kullanmayı sev.
2. Kendini tanıtıp, site yaptırmak isteyip istemediğini sor veya doğrudan bir teklif çıkartmayı teklif et.
3. Kullanıcıdan işletme adını ve ulaşabileceğimiz bir TELEFON NUMARASINI (çok önemli) mutlaka iste. "Fiyatlar nedir?" derlerse bile "İşletmenizin ne tür bir siteye ihtiyacı olduğunu anlamam için adınızı ve bir numaranızı bırakır mısınız, hemen harika bir teklif hazırlayıp sizi arayalım" şeklinde yönlendir.
4. Müşteri adını/işletme adını ve TELEFON NUMARASINI verdiği anda, mutlaka "save_lead" fonksiyonunu çağırarak bu kişiyi sistemimize yeni müşteri olarak kaydet!
5. Asla başka ajanslara yönlendirme yapma, Kodiva'nın tasarımlarının çok hızlı, şık ve bütçe dostu olduğunu vurgula.
`;

    const geminiContents = [];
    geminiContents.push({ role: 'user', parts: [{ text: `[SİSTEM TALİMATI: ${systemPrompt}]\n\nMerhaba, az önce sitenize girdim.` }] });

    messages.forEach(m => {
      geminiContents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      });
    });

    const tools = [
      {
        functionDeclarations: [
          {
            name: "save_lead",
            description: "Kullanıcı işletme adını ve telefon numarasını verdiği anda bu fonksiyonu çağırarak kişiyi CRM (Yeni Müşteri) sistemine kaydet.",
            parameters: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING", description: "Müşterinin veya işletmenin adı." },
                phone: { type: "STRING", description: "Müşterinin ilettiği telefon numarası." }
              },
              required: ["name", "phone"]
            }
          }
        ]
      }
    ];

    const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      contents: geminiContents,
      tools: tools,
      generationConfig: { temperature: 0.7 }
    });

    const candidate = res.data.candidates?.[0];
    let botMessage = 'Cevap alınamadı.';

    if (candidate?.content?.parts) {
      const part = candidate.content.parts[0];
      if (part.functionCall && part.functionCall.name === 'save_lead') {
        const { name, phone } = part.functionCall.args;
        
        try {
          // 1. Save Lead to DB
          const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.query(
            'INSERT INTO leads (id, name, phone, status, category, notes) VALUES ($1, $2, $3, $4, $5, $6)', 
            [leadId, name, phone, 'new', 'Potansiyel Müşteri', 'Web sitesi asistanı (Kodi) üzerinden numara bıraktı.']
          );

          // 2. Reply to function call gracefully
          botMessage = 'Harika! Telefon numaranızı proje yöneticimize anında ilettim. Size çok yakında muhteşem bir teklif ile dönüş yapacağız. Başka sormak istediğiniz bir şey var mı? 🚀';
        } catch(e) {
          console.error("Lead saving failed:", e.message);
          botMessage = 'Numaranızı not aldım, teşekkürler! Size en kısa sürede ulaşacağız.';
        }
      } else {
        botMessage = part.text || botMessage;
      }
    }

    return NextResponse.json({ success: true, message: botMessage });
  } catch (error) {
    console.error('Public Chat Error:', error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.error?.message || error.message || 'Internal Server Error' }, { status: 500 });
  }
}
