import { NextResponse } from 'next/server';
import db, { ensureInit } from '@/lib/db';

export async function GET() {
  try {
    await ensureInit();
    const result = await db.query(
      `SELECT * FROM payments ORDER BY created_at DESC LIMIT 100`
    );
    return NextResponse.json({ payments: result.rows });
  } catch (error) {
    console.error('GET /api/admin/payments error:', error);
    return NextResponse.json({ payments: [] });
  }
}
