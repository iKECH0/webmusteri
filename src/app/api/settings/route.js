import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const settings = stmt.all();
    
    const settingsObj = {};
    settings.forEach(row => {
      settingsObj[row.key] = row.value;
    });
    
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const insertStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    const transaction = db.transaction((settings) => {
      for (const [key, value] of Object.entries(settings)) {
        insertStmt.run(key, value);
      }
    });
    
    transaction(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
