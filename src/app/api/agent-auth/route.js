import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'kodiva_salt_2024').digest('hex');
}

function generateToken() {
  return Math.random().toString(36).substring(2, 30) + Date.now().toString(36);
}

// POST - Temsilci girişi
export async function POST(request) {
  try {
    const { slug, password } = await request.json();

    if (!slug || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre zorunludur' }, { status: 400 });
    }

    const res = await db.query(
      'SELECT id, name, slug, phone, role, password_hash, is_active FROM agents WHERE slug = $1',
      [slug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 });
    }

    const agent = res.rows[0];

    if (!agent.is_active) {
      return NextResponse.json({ error: 'Bu hesap devre dışı bırakılmış' }, { status: 403 });
    }

    const passwordHash = hashPassword(password);
    if (agent.password_hash !== passwordHash) {
      return NextResponse.json({ error: 'Hatalı şifre' }, { status: 401 });
    }

    // Session token oluştur
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 gün

    // Basit session saklama (gerçek projede ayrı tablo veya JWT kullanılmalı)
    // Şimdilik token'ı agent tablosunda tutalım (tek session)
    await db.query('UPDATE agents SET session_token = $1, session_expires = $2 WHERE id = $3', [token, expiresAt.toISOString(), agent.id]);

    const response = NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        phone: agent.phone,
        role: agent.role
      }
    });

    // HttpOnly cookie olarak token ayarla
    response.cookies.set('agent_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 gün
      path: '/'
    });

    return response;
  } catch (error) {
    console.error("Agent auth POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// DELETE - Çıkış yap
export async function DELETE(request) {
  try {
    const token = request.cookies.get('agent_session')?.value;

    if (token) {
      await db.query('UPDATE agents SET session_token = NULL, session_expires = NULL WHERE session_token = $1', [token]);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('agent_session');
    return response;
  } catch (error) {
    console.error("Agent auth DELETE error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

// GET - Mevcut oturumu kontrol et
export async function GET(request) {
  try {
    const token = request.cookies.get('agent_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const res = await db.query(
      'SELECT id, name, slug, phone, role, is_active, session_expires FROM agents WHERE session_token = $1',
      [token]
    );

    if (res.rows.length === 0) {
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete('agent_session');
      return response;
    }

    const agent = res.rows[0];

    if (!agent.is_active || new Date(agent.session_expires) < new Date()) {
      await db.query('UPDATE agents SET session_token = NULL, session_expires = NULL WHERE id = $1', [agent.id]);
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete('agent_session');
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      agent: {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        phone: agent.phone,
        role: agent.role
      }
    });
  } catch (error) {
    console.error("Agent auth GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}