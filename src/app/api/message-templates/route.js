import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// GET - Şablonları listele
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const channel = searchParams.get('channel');
    const isGlobal = searchParams.get('is_global');

    let query = 'SELECT * FROM message_templates';
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (channel) {
      conditions.push(`channel = $${paramIndex++}`);
      params.push(channel);
    }
    if (isGlobal !== null) {
      conditions.push(`is_global = $${paramIndex++}`);
      params.push(isGlobal === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY category, created_at DESC';

    const res = await db.query(query, params);
    const templates = res.rows.map(t => ({
      ...t,
      variables: JSON.parse(t.variables || '[]'),
      is_global: !!t.is_global
    }));

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Message templates GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// POST - Yeni şablon oluştur
export async function POST(request) {
  try {
    const { name, category, channel, content, variables, is_global, created_by } = await request.json();

    if (!name || !category || !channel || !content) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const validCategories = ['first_contact', 'follow_up', 'proposal', 'closing', 'custom'];
    const validChannels = ['whatsapp', 'email', 'sms'];

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Geçersiz kategori' }, { status: 400 });
    }
    if (!validChannels.includes(channel)) {
      return NextResponse.json({ error: 'Geçersiz kanal' }, { status: 400 });
    }

    const id = generateId();
    await db.query(
      `INSERT INTO message_templates (id, name, category, channel, content, variables, is_global, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, name, category, channel, content, JSON.stringify(variables || []), is_global ? 1 : 0, created_by || null]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Message templates POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// PUT - Şablon güncelle
export async function PUT(request) {
  try {
    const { id, name, category, channel, content, variables, is_global } = await request.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (channel !== undefined) {
      updates.push(`channel = $${paramIndex++}`);
      params.push(channel);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      params.push(content);
    }
    if (variables !== undefined) {
      updates.push(`variables = $${paramIndex++}`);
      params.push(JSON.stringify(variables));
    }
    if (is_global !== undefined) {
      updates.push(`is_global = $${paramIndex++}`);
      params.push(is_global ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    await db.query(`UPDATE message_templates SET ${updates.join(', ')} WHERE id = $${paramIndex}`, params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message templates PUT error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// DELETE - Şablon sil
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.query('DELETE FROM message_templates WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message templates DELETE error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}