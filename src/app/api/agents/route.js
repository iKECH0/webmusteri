import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Basit şifre hash fonksiyonu
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'kodiva_salt_2024').digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Benzersiz ID üretici
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET - Tüm temsilcileri listele
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    let query = 'SELECT id, name, slug, phone, role, is_active, avatar_url, created_at FROM agents ORDER BY created_at ASC';
    const res = await db.query(query);
    let agents = res.rows;

    if (includeStats) {
      // Her temsilci için istatistikleri hesapla
      for (let agent of agents) {
        // Atanan müşteri sayısı
        const assignedRes = await db.query('SELECT COUNT(*) as count FROM leads WHERE assigned_to = $1', [agent.id]);
        agent.assigned_count = parseInt(assignedRes.rows[0]?.count || 0);

        // Bu ay yapılan arama sayısı
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const callsRes = await db.query(
          `SELECT COUNT(*) as count FROM activity_logs
           WHERE agent_id = $1 AND type IN ('call', 'whatsapp', 'visit') AND created_at >= $2`,
          [agent.id, thisMonth.toISOString()]
        );
        agent.calls_this_month = parseInt(callsRes.rows[0]?.count || 0);

        // İlgilenen müşteri sayısı (interested + closed)
        const interestedRes = await db.query(
          `SELECT COUNT(*) as count FROM leads
           WHERE assigned_to = $1 AND status IN ('interested', 'closed')`,
          [agent.id]
        );
        agent.interested_count = parseInt(interestedRes.rows[0]?.count || 0);

        // Kazanılan müşteri sayısı
        const closedRes = await db.query(
          `SELECT COUNT(*) as count FROM leads WHERE assigned_to = $1 AND status = 'closed'`,
          [agent.id]
        );
        agent.closed_count = parseInt(closedRes.rows[0]?.count || 0);

        // Başarı oranı
        const totalAssigned = agent.assigned_count;
        agent.success_rate = totalAssigned > 0 ? Math.round((agent.closed_count / totalAssigned) * 100) : 0;

        // Referans linki performansı
        const refRes = await db.query('SELECT clicks, conversions FROM referrals WHERE agent_id = $1', [agent.id]);
        if (refRes.rows[0]) {
          agent.referral_clicks = refRes.rows[0].clicks;
          agent.referral_conversions = refRes.rows[0].conversions;
        } else {
          agent.referral_clicks = 0;
          agent.referral_conversions = 0;
        }
      }
    }

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Agents GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST - Yeni temsilci oluştur
export async function POST(request) {
  try {
    const { name, phone, password, role = 'agent' } = await request.json();

    if (!name || !password) {
      return NextResponse.json({ error: 'İsim ve şifre zorunludur' }, { status: 400 });
    }

    const slug = generateSlug(name);
    const id = generateId();
    const passwordHash = hashPassword(password);

    // Slug çakışması kontrolü
    const existing = await db.query('SELECT id FROM agents WHERE slug = $1', [slug]);
    let finalSlug = slug;
    if (existing.rows.length > 0) {
      finalSlug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    await db.query(
      `INSERT INTO agents (id, name, slug, phone, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 1)`,
      [id, name, finalSlug, phone || null, passwordHash, role]
    );

    // Varsayılan referans kodu oluştur
    const refCode = finalSlug;
    await db.query(
      `INSERT INTO referrals (id, agent_id, code) VALUES ($1, $2, $3)`,
      [generateId(), id, refCode]
    );

    return NextResponse.json({
      success: true,
      agent: { id, name, slug: finalSlug, phone, role }
    });
  } catch (error) {
    console.error("Agents POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// PUT - Temsilci güncelle
export async function PUT(request) {
  try {
    const { id, name, phone, password, is_active, role, avatar_url } = await request.json();

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }
    if (password !== undefined && password !== '') {
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(hashPassword(password));
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(is_active ? 1 : 0);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      params.push(avatar_url);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    await db.query(`UPDATE agents SET ${updates.join(', ')} WHERE id = $${paramIndex}`, params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Agents PUT error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// DELETE - Temsilci sil
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // Önce referans linkini sil
    await db.query('DELETE FROM referrals WHERE agent_id = $1', [id]);
    // Sonra temsilciyi sil
    await db.query('DELETE FROM agents WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Agents DELETE error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}