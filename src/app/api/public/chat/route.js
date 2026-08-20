import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { messages } = await request.json();

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
1. Kısa ve samimi cevaplar ver. Uzun paragraflardan kaçın.
2. Kendini tanıtıp, site yaptırmak isteyip istemediğini sor veya doğrudan bir teklif çıkartmayı teklif et.
3. Kullanıcıdan işletme adını ve ulaşabileceğimiz bir TELEFON NUMARASINI mutlaka iste. 
4. Müşteri telefonunu verdiğinde, "save_lead" fonksiyonunu çağır! 
5. Fonksiyonu çağırdıktan sonra SOHBETİ BİTİRME. "Telefonunuzu kaydettim, harika! Peki hangi sektörde hizmet veriyorsunuz? Nasıl bir tasarıma ihtiyacınız var?" gibi sorular sorarak müşterinin isteklerini de öğren.
6. Müşteri ek bilgiler (sektör, istekler) verdikçe "update_lead_notes" fonksiyonunu çağırarak bu notları sisteme aktar!
`;

    const geminiContents = [];
    geminiContents.push({ role: 'user', parts: [{ text: `[SİSTEM TALİMATI: ${systemPrompt}]\n\nMerhaba, az önce sitenize girdim.` }] });

    messages.forEach(m => {
      const role = m.role === 'assistant' ? 'model' : 'user';
      const lastContent = geminiContents[geminiContents.length - 1];
      if (lastContent && lastContent.role === role) {
        lastContent.parts[0].text += '\n' + m.content;
      } else {
        geminiContents.push({ role, parts: [{ text: m.content }] });
      }
    });

    const tools = [
      {
        functionDeclarations: [
          {
            name: "save_lead",
            description: "Kullanıcı işletme adını ve telefon numarasını verdiği anda bu fonksiyonu çağırarak kişiyi sisteme kaydet.",
            parameters: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING", description: "Müşterinin veya işletmenin adı." },
                phone: { type: "STRING", description: "Müşterinin ilettiği telefon numarası." }
              },
              required: ["name", "phone"]
            }
          },
          {
            name: "update_lead_notes",
            description: "Müşteri, sektörü veya web sitesiyle ilgili yeni istekler (örneğin e-ticaret, randevu sistemi vs.) söylediğinde notları sisteme güncelle.",
            parameters: {
              type: "OBJECT",
              properties: {
                phone: { type: "STRING", description: "Müşterinin daha önce verdiği telefon numarası." },
                notes: { type: "STRING", description: "Müşterinin yeni istekleri ve sektörü ile ilgili eklenecek not." }
              },
              required: ["phone", "notes"]
            }
          }
        ]
      }
    ];

    const generateResponse = async (contents) => {
      const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        contents: contents,
        tools: tools,
        generationConfig: { temperature: 0.7 }
      });
      return res.data.candidates?.[0];
    };

    let candidate = await generateResponse(geminiContents);
    let botMessage = 'Cevap alınamadı.';

    if (candidate?.content?.parts) {
      const part = candidate.content.parts[0];
      
      if (part.functionCall) {
        let functionResponse = { success: true };
        
        if (part.functionCall.name === 'save_lead') {
          const { name, phone } = part.functionCall.args;
          try {
            const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await db.query(
              'INSERT INTO leads (id, name, phone, status, category, notes) VALUES ($1, $2, $3, $4, $5, $6)', 
              [leadId, name, phone, 'new', 'Potansiyel Müşteri', 'Web sitesi asistanı (Kodi) üzerinden numara bıraktı.']
            );
            functionResponse = { message: "Başarıyla kaydedildi." };
          } catch(e) {
            console.error("Lead saving failed:", e.message);
            functionResponse = { message: "Kaydedilirken hata oluştu." };
          }
        } 
        else if (part.functionCall.name === 'update_lead_notes') {
          const { phone, notes } = part.functionCall.args;
          try {
            await db.query(
              "UPDATE leads SET notes = notes || '\nYeni Not: ' || $1 WHERE phone = $2",
              [notes, phone]
            );
            functionResponse = { message: "Notlar başarıyla güncellendi." };
          } catch(e) {
             functionResponse = { message: "Notlar güncellenemedi." };
          }
        }

        // Add function call and response to history
        geminiContents.push({
          role: 'model',
          parts: [{ functionCall: part.functionCall }]
        });
        geminiContents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: part.functionCall.name,
              response: functionResponse
            }
          }]
        });

        // Make second request to let AI respond
        candidate = await generateResponse(geminiContents);
        if (candidate?.content?.parts) {
           botMessage = candidate.content.parts[0].text || botMessage;
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
