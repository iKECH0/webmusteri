import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// GET - Aktivite loglarını getir (filtreli)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    const agentId = searchParams.get('agent_id');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT al.*, a.name as agent_name, a.slug as agent_slug, l.name as lead_name
      FROM activity_logs al
      LEFT JOIN agents a ON al.agent_id = a.id
      LEFT JOIN leads l ON al.lead_id = l.id
    `;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (leadId) {
      conditions.push(`al.lead_id = $${paramIndex++}`);
      params.push(leadId);
    }
    if (agentId) {
      conditions.push(`al.agent_id = $${paramIndex++}`);
      params.push(agentId);
    }
    if (type) {
      conditions.push(`al.type = $${paramIndex++}`);
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const res = await db.query(query, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Activity logs GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST - Yeni aktivite logu ekle
export async function POST(request) {
  try {
    const { lead_id, agent_id, type, note, duration_seconds } = await request.json();

    if (!lead_id || !agent_id || !type) {
      return NextResponse.json({ error: 'lead_id, agent_id ve type zorunludur' }, { status: 400 });
    }

    // Geçerli type kontrolü
    const validTypes = ['call', 'whatsapp', 'visit', 'email', 'note', 'status_change'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Geçersiz aktivite tipi' }, { status: 400 });
    }

    const id = generateId();
    await db.query(
      `INSERT INTO activity_logs (id, lead_id, agent_id, type, note, duration_seconds)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, lead_id, agent_id, type, note || null, duration_seconds || null]
    );

    // Eğer durum değişikliği ise lead'in status'unu da güncelle
    if (type === 'status_change' && note) {
      // Not formatı: "status:new->interested" veya sadece yeni status
      const statusMatch = note.match(/status:(\w+)->(\w+)/);
      let newStatus = null;
      if (statusMatch) {
        newStatus = statusMatch[2];
      } else if (['new', 'contacted', 'interested', 'rejected', 'closed'].includes(note)) {
        newStatus = note;
      }
      if (newStatus) {
        await db.query('UPDATE leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newStatus, lead_id]);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Activity logs POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// PUT - Aktivite logu güncelle
export async function PUT(request) {
  try {
    const { id, note, duration_seconds } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (note !== undefined) {
      updates.push(`note = $${paramIndex++}`);
      params.push(note);
    }
    if (duration_seconds !== undefined) {
      updates.push(`duration_seconds = $${paramIndex++}`);
      params.push(duration_seconds);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    params.push(id);
    await db.query(`UPDATE activity_logs SET ${updates.join(', ')} WHERE id = $${paramIndex}`, params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity logs PUT error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// DELETE - Aktivite logu sil
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.query('DELETE FROM activity_logs WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity logs DELETE error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}