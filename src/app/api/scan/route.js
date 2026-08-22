import { NextResponse } from 'next/server';
import db, { ensureInit } from '@/lib/db';
import { runFullWebsiteScan, normalizeUrl, validateUrlForSSRF } from '@/lib/scanner';
import crypto from 'crypto';

// Rate limiting map (in-memory per instance)
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10;

  const records = rateLimitMap.get(ip) || [];
  const validRecords = records.filter(time => now - time < windowMs);

  if (validRecords.length >= maxRequests) {
    return true;
  }

  validRecords.push(now);
  rateLimitMap.set(ip, validRecords);
  return false;
}

export async function POST(request) {
  try {
    await ensureInit();

    // 1. Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Çok fazla istek gönderildi. Lütfen 1 dakika sonra tekrar deneyin.' }, { status: 429 });
    }

    const body = await request.json();
    const { url, email, phone, force = false } = body;

    if (!url) {
      return NextResponse.json({ error: 'Lütfen analiz edilecek bir web sitesi adresi girin.' }, { status: 400 });
    }

    const normalized = normalizeUrl(url);
    if (!normalized || normalized.length < 3 || !normalized.includes('.')) {
      return NextResponse.json({ error: 'Geçersiz web sitesi adresi. Örn: ornekfirma.com' }, { status: 400 });
    }

    try {
      validateUrlForSSRF(normalized);
    } catch (ssrfErr) {
      return NextResponse.json({ error: ssrfErr.message }, { status: 400 });
    }

    // 2. Cache Check (Recent scan within last 2 hours)
    if (!force) {
      const cachedScan = await db.query(
        `SELECT id, overall_score, status, created_at 
         FROM scans 
         WHERE normalized_url = $1 AND status = 'completed' AND created_at > NOW() - INTERVAL '2 hours' 
         ORDER BY created_at DESC LIMIT 1`,
        [normalized]
      );

      if (cachedScan.rows && cachedScan.rows.length > 0) {
        const existing = cachedScan.rows[0];
        return NextResponse.json({
          success: true,
          scanId: existing.id,
          cached: true,
          overallScore: existing.overall_score
        });
      }
    }

    // 3. Create Scan Record in DB
    const scanId = 'scan_' + crypto.randomBytes(8).toString('hex');
    await db.query(
      `INSERT INTO scans (id, url, normalized_url, email, phone, status) 
       VALUES ($1, $2, $3, $4, $5, 'running')`,
      [scanId, url, normalized, email || null, phone || null]
    );

    // 4. Optional Lead Capture into leads table
    if (email || phone) {
      try {
        const leadId = 'lead_' + crypto.randomBytes(6).toString('hex');
        await db.query(
          `INSERT INTO leads (id, name, phone, email, website, category, notes, status)
           VALUES ($1, $2, $3, $4, $5, 'Site Analiz Lead', 'Ücretsiz site analiz aracı üzerinden form doldurdu.', 'new')
           ON CONFLICT DO NOTHING`,
          [leadId, normalized, phone || null, email || null, `https://${normalized}`]
        );
      } catch (leadErr) {
        // Ignore lead capture error
      }
    }

    // 5. Execute Full Scanner
    try {
      const scanResult = await runFullWebsiteScan(normalized);

      // 6. Save Category Results
      for (const [categoryKey, catData] of Object.entries(scanResult.categories)) {
        const resultId = 'res_' + crypto.randomBytes(8).toString('hex');
        await db.query(
          `INSERT INTO scan_results (id, scan_id, category, score, findings)
           VALUES ($1, $2, $3, $4, $5::jsonb)`,
          [resultId, scanId, categoryKey, catData.score, JSON.stringify(catData.findings || [])]
        );
      }

      // 7. Update Scan Record as Completed
      await db.query(
        `UPDATE scans 
         SET status = 'completed', overall_score = $1, completed_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [scanResult.overallScore, scanId]
      );

      return NextResponse.json({
        success: true,
        scanId,
        overallScore: scanResult.overallScore,
        summary: scanResult.summary,
        url: scanResult.url
      });
    } catch (scanErr) {
      console.error('Scan execution error:', scanErr);
      await db.query(
        `UPDATE scans SET status = 'failed', error_message = $1 WHERE id = $2`,
        [scanErr.message || 'Tarama sırasında bir hata oluştu', scanId]
      );
      return NextResponse.json({ error: scanErr.message || 'Web sitesi taranamadı.' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /api/scan error:', error);
    return NextResponse.json({ error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' }, { status: 500 });
  }
}

// GET: Recent public scans for social proof
export async function GET() {
  try {
    await ensureInit();
    const result = await db.query(
      `SELECT id, normalized_url, overall_score, created_at 
       FROM scans 
       WHERE status = 'completed' AND overall_score IS NOT NULL 
       ORDER BY created_at DESC LIMIT 8`
    );

    return NextResponse.json({
      recentScans: result.rows || []
    });
  } catch (error) {
    return NextResponse.json({ recentScans: [] });
  }
}
