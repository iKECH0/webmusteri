import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function GET() {
  try {
    await initDB();
    return NextResponse.json({ success: true, message: 'Database initialized successfully on Neon PostgreSQL' });
  } catch (error) {
    console.error('DB Init error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
