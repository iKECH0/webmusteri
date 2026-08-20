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

    const res = await db.query(query, params);
    let templates = res.rows.map(t => ({
      ...t,
      variables: JSON.parse(t.variables || '[]'),
      is_global: !!t.is_global
    }));

    // Auto-seed default templates if empty
    if (templates.length === 0) {
      const defaults = [
        {
          id: 'tpl_demo_1',
          name: '⚡ Canlı Tasarım Demosu (En Çok Satan)',
          category: 'first_contact',
          channel: 'whatsapp',
          content: 'Merhaba {firma_adi} ailesi 👋\n\nBölgenizdeki başarılı işletmeleri incelerken kaliteniz dikkatimizi çekti. Firmanıza özel canlı ve çalışan bir web sitesi demosu tasarladık! 🚀\n\nTelefonunuzdan 1 dakikada inceleyebilirsiniz:\n{demo_link}\n\nBeğenirseniz 24 saat içinde kendi alan adınızla yayına alabiliriz. İnceledikten sonra görüşlerinizi paylaşırsanız sevinirim! 😊',
          variables: JSON.stringify(['{firma_adi}', '{demo_link}', '{temsilci_adi}']),
          is_global: 1
        },
        {
          id: 'tpl_demo_2',
          name: '🔥 Özel İndirimli Demo Tanıtımı',
          category: 'proposal',
          channel: 'whatsapp',
          content: 'Selamlar {firma_adi} yetkilisi,\n\nİşletmeniz için hazırladığımız özel canlı web sitesi önizlemesini buradan görebilirsiniz:\n{demo_link}\n\nBu aya özel indirimli anahtar teslim paketimizle sitenizi kurup Google Haritalar\'da müşteri sayınızı katlayabiliriz. Detayları konuşalım mı?',
          variables: JSON.stringify(['{firma_adi}', '{demo_link}', '{temsilci_adi}']),
          is_global: 1
        },
        {
          id: 'tpl_demo_3',
          name: '⏰ Takip & Hatırlatma (Demo İnceleme)',
          category: 'follow_up',
          channel: 'whatsapp',
          content: 'Merhaba {firma_adi},\n\nGeçtiğimiz günlerde firmanız için hazırladığımız canlı web sitesi tasarımını inceleme fırsatınız oldu mu? 😊\n\nLink: {demo_link}\n\nHerhangi bir sorunuz varsa veya düzenleme istediğiniz bir yer olursa yardımcı olmaktan mutluluk duyarım.',
          variables: JSON.stringify(['{firma_adi}', '{demo_link}', '{temsilci_adi}']),
          is_global: 1
        }
      ];

      for (const d of defaults) {
        try {
          await db.query(
            `INSERT INTO message_templates (id, name, category, channel, content, variables, is_global)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
            [d.id, d.name, d.category, d.channel, d.content, d.variables, d.is_global]
          );
        } catch (e) {
          console.error("Seed error:", e);
        }
      }

      const reCheck = await db.query(query, params);
      templates = reCheck.rows.map(t => ({
        ...t,
        variables: JSON.parse(t.variables || '[]'),
        is_global: !!t.is_global
      }));
    }

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

    const validCategories = ['first_contact', 'follow_up', 'proposal', 'closing', 'ai_prompt', 'cold_call', 'objection', 'social', 'custom'];
    const validChannels = ['whatsapp', 'email', 'sms', 'ai', 'phone', 'social', 'general'];

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
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (e) {}
    }
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.query('DELETE FROM message_templates WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message templates DELETE error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}