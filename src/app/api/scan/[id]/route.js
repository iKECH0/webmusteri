import { NextResponse } from 'next/server';
import db, { ensureInit } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    await ensureInit();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Scan ID gerekli' }, { status: 400 });
    }

    // 1. Fetch Main Scan Details
    const scanRes = await db.query(
      `SELECT id, url, normalized_url, status, overall_score, error_message, created_at, completed_at 
       FROM scans 
       WHERE id = $1`,
      [id]
    );

    if (!scanRes.rows || scanRes.rows.length === 0) {
      return NextResponse.json({ error: 'Analiz raporu bulunamadı.' }, { status: 404 });
    }

    const scan = scanRes.rows[0];

    // If still running or failed, return status immediately
    if (scan.status !== 'completed') {
      return NextResponse.json({
        scan: {
          id: scan.id,
          url: scan.url,
          normalizedUrl: scan.normalized_url,
          status: scan.status,
          errorMessage: scan.error_message,
          createdAt: scan.created_at
        }
      });
    }

    // 2. Fetch Category Results and Findings
    const resultsRes = await db.query(
      `SELECT category, score, findings 
       FROM scan_results 
       WHERE scan_id = $1 
       ORDER BY id ASC`,
      [id]
    );

    const categories = {};
    let criticalCount = 0;
    let warningCount = 0;
    let goodCount = 0;

    (resultsRes.rows || []).forEach(row => {
      const findingsList = typeof row.findings === 'string' ? JSON.parse(row.findings) : (row.findings || []);
      categories[row.category] = {
        category: row.category,
        score: row.score,
        findings: findingsList
      };

      findingsList.forEach(f => {
        if (f.status === 'critical') criticalCount++;
        else if (f.status === 'warning') warningCount++;
        else if (f.status === 'good') goodCount++;
      });
    });

    return NextResponse.json({
      scan: {
        id: scan.id,
        url: scan.url,
        normalizedUrl: scan.normalized_url,
        status: scan.status,
        overallScore: scan.overall_score,
        createdAt: scan.created_at,
        completedAt: scan.completed_at,
        summary: {
          criticalCount,
          warningCount,
          goodCount,
          totalChecks: criticalCount + warningCount + goodCount
        },
        categories
      }
    });
  } catch (error) {
    console.error('API /api/scan/[id] error:', error);
    return NextResponse.json({ error: 'Rapor yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}
