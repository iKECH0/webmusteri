import { NextResponse } from 'next/server';
import db, { ensureInit } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    await ensureInit();
    const scanId = params.id;

    // Fetch scan overall data
    const scanRes = await db.query(`SELECT * FROM scans WHERE id = $1`, [scanId]);
    if (!scanRes.rows.length) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }
    const scan = scanRes.rows[0];

    // Check if we already have an AI summary
    const existingSummaryRes = await db.query(`SELECT value FROM settings WHERE key = $1`, [`ai_summary_${scanId}`]);
    if (existingSummaryRes.rows.length > 0) {
      return NextResponse.json({ summary: existingSummaryRes.rows[0].value });
    }

    // Fetch findings
    const resultsRes = await db.query(`SELECT category, score, findings FROM scan_results WHERE scan_id = $1`, [scanId]);
    
    let criticalIssues = [];
    resultsRes.rows.forEach(row => {
      const findings = row.findings || [];
      findings.forEach(f => {
        if (f.status === 'critical' || f.status === 'warning') {
          criticalIssues.push(`${row.category.toUpperCase()}: ${f.title} - ${f.description}`);
        }
      });
    });

    // Limit to top 10 to avoid huge prompt
    criticalIssues = criticalIssues.slice(0, 10);

    const prompt = `Lütfen aşağıdaki web sitesi sağlık analizi verilerini kullanarak profesyonel, kısa ve net bir yönetici özeti oluştur. 
Site: ${scan.normalized_url}
Genel Skor: ${scan.overall_score}/100

Kritik ve Uyarı Bulguları:
${criticalIssues.length > 0 ? criticalIssues.join('\n') : 'Önemli bir sorun bulunamadı, site genel olarak iyi durumda.'}

Kurallar:
- Sadece yukarıdaki gerçek verileri kullan. Ölçülmemiş bir hata uydurma.
- Müşteriye hitap eder gibi, profesyonel bir ajans dilinde yaz (Sen KODİVA'sın).
- Maksimum 3-4 cümle olsun.
- Hataları madde imleri ile uzun uzun yazma, genel bir paragraf özeti ver.`;

    let aiSummary = "Yapay zeka özeti şu an oluşturulamadı. Lütfen bulguları inceleyin.";

    try {
      // First try Gemini if available
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        aiSummary = response.text;
      } 
      // Fallback to OpenAI if available
      else if (process.env.OPENAI_API_KEY) {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4o-mini',
        });
        aiSummary = completion.choices[0].message.content;
      }
    } catch (aiErr) {
      console.error('AI provider error:', aiErr);
    }

    // Save for future
    await db.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`, [`ai_summary_${scanId}`, aiSummary]);

    return NextResponse.json({ summary: aiSummary });

  } catch (err) {
    console.error('API /api/scan/[id]/ai-summary error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
