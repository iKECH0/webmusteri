import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// GET - Referans linklerini listele
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    let query = `
      SELECT r.*, a.name as agent_name, a.slug as agent_slug
      FROM referrals r
      LEFT JOIN agents a ON r.agent_id = a.id
    `;
    const params = [];

    if (agentId) {
      query += ' WHERE r.agent_id = $1';
      params.push(agentId);
    }

    query += ' ORDER BY r.created_at DESC';

    const res = await db.query(query, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Referrals GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST - Referans linki tıklama kaydet / Yeni referans kodu oluştur
export async function POST(request) {
  try {
    const { code, agent_id, action } = await request.json();

    // Tıklama kaydetme (public endpoint)
    if (action === 'click' && code) {
      const res = await db.query('SELECT * FROM referrals WHERE code = $1', [code]);
      if (res.rows.length === 0) {
        return NextResponse.json({ error: 'Geçersiz referans kodu' }, { status: 404 });
      }

      await db.query('UPDATE referrals SET clicks = clicks + 1 WHERE code = $1', [code]);
      return NextResponse.json({ success: true, agent_id: res.rows[0].agent_id });
    }

    // Yeni referans kodu oluşturma (admin)
    if (agent_id) {
      const agentRes = await db.query('SELECT slug FROM agents WHERE id = $1', [agent_id]);
      if (agentRes.rows.length === 0) {
        return NextResponse.json({ error: 'Temsilci bulunamadı' }, { status: 404 });
      }

      let code = agentRes.rows[0].slug;
      // Çakışma kontrolü
      const existingRes = await db.query('SELECT id FROM referrals WHERE code = $1', [code]);
      if (existingRes.rows.length > 0) {
        code = `${code}-${Date.now().toString(36).slice(-4)}`;
      }

      const id = generateId();
      await db.query(
        `INSERT INTO referrals (id, agent_id, code) VALUES ($1, $2, $3)`,
        [id, agent_id, code]
      );

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const referralLink = `${baseUrl}/?ref=${code}`;

      return NextResponse.json({ success: true, id, code, referral_link: referralLink });
    }

    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  } catch (error) {
    console.error("Referrals POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// PUT - Referans güncelle (conversion kaydet)
export async function PUT(request) {
  try {
    const { code, action } = await request.json();

    if (action === 'convert' && code) {
      // Müşteri kaydedildiğinde conversion artır
      await db.query('UPDATE referrals SET conversions = conversions + 1 WHERE code = $1', [code]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error("Referrals PUT error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}