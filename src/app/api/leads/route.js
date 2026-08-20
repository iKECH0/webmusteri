import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get('assigned_to');
    const unassigned = searchParams.get('unassigned') === 'true';
    const status = searchParams.get('status');

    let query = 'SELECT * FROM leads';
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (assignedTo) {
      conditions.push(`assigned_to = $${paramIndex++}`);
      params.push(assignedTo);
    } else if (unassigned) {
      conditions.push(`assigned_to IS NULL`);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ai_score DESC, created_at DESC';

    const res = await db.query(query, params);
    const leads = res.rows;
    return NextResponse.json(leads.map(l => ({
      ...l,
      has_website: !!l.has_website,
      tags: JSON.parse(l.tags || '[]'),
    })));
  } catch (error) {
    console.error("Leads GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, category, status, notes, tags, revenue, desktop_mockup_url, mobile_mockup_url, next_followup_date, portal_token, portal_viewed, assigned_to, email, referred_by } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const query = `
      UPDATE leads
      SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        status = COALESCE($3, status),
        notes = COALESCE($4, notes),
        tags = COALESCE($5, tags),
        revenue = COALESCE($6, revenue),
        desktop_mockup_url = COALESCE($7, desktop_mockup_url),
        mobile_mockup_url = COALESCE($8, mobile_mockup_url),
        next_followup_date = COALESCE($9, next_followup_date),
        portal_token = COALESCE($10, portal_token),
        portal_viewed = COALESCE($11, portal_viewed),
        assigned_to = COALESCE($12, assigned_to),
        referred_by = COALESCE($13, referred_by),
        email = COALESCE($14, email),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
    `;
    const params = [name, category, status, notes, tags ? JSON.stringify(tags) : null, revenue, desktop_mockup_url, mobile_mockup_url, next_followup_date, portal_token, portal_viewed, assigned_to, referred_by, email, id];

    await db.query(query, params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leads PUT error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST - Toplu atama ve yeni lead oluşturma
export async function POST(request) {
  try {
    const { lead_ids, assigned_to, action } = await request.json();

    // Toplu atama
    if (action === 'bulk_assign' && lead_ids && lead_ids.length > 0 && assigned_to) {
      await db.query(
        `UPDATE leads SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2)`,
        [assigned_to, lead_ids]
      );

      // Aktivite logu ekle
      for (const leadId of lead_ids) {
        const logId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        await db.query(
          `INSERT INTO activity_logs (id, lead_id, agent_id, type, note) VALUES ($1, $2, $3, 'note', $4)`,
          [logId, leadId, assigned_to, `Temsilciye atandı (Toplu atama)`]
        );
      }

      return NextResponse.json({ success: true, count: lead_ids.length });
    }

    // Havuzdan çekme (temsilci kendine atar)
    if (action === 'claim' && lead_ids && lead_ids.length > 0 && assigned_to) {
      // Sadece atanmamış olanları al
      const res = await db.query(
        `UPDATE leads SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2) AND assigned_to IS NULL`,
        [assigned_to, lead_ids]
      );

      for (const leadId of lead_ids) {
        const logId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        await db.query(
          `INSERT INTO activity_logs (id, lead_id, agent_id, type, note) VALUES ($1, $2, $3, 'note', $4)`,
          [logId, leadId, assigned_to, `Havuzdan alındı`]
        );
      }

      return NextResponse.json({ success: true, count: res.rowCount });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error("Leads POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { id, ids } = await request.json();
  if (ids && ids.length > 0) {
    await db.query('DELETE FROM leads WHERE id = ANY($1)', [ids]);
    return NextResponse.json({ success: true, count: ids.length });
  }
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  // FOREIGN KEY CASCADE is set, but let's be explicit if we want
  await db.query('DELETE FROM leads WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
