import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const res = await db.query('SELECT * FROM portfolio_references ORDER BY created_at DESC');
    return NextResponse.json(res.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, url, image_url, description } = await request.json();
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
    
    const id = Math.random().toString(36).substring(2, 15);
    await db.query(
      'INSERT INTO portfolio_references (id, title, url, image_url, description) VALUES ($1, $2, $3, $4, $5)',
      [id, title, url || '', image_url || '', description || '']
    );
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, title, url, image_url, description } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await db.query(
      'UPDATE portfolio_references SET title = COALESCE($1, title), url = COALESCE($2, url), image_url = COALESCE($3, image_url), description = COALESCE($4, description) WHERE id = $5',
      [title, url, image_url, description, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    await db.query('DELETE FROM portfolio_references WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
