import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.redirect('http://localhost:3000?cal_error=1');

    const clientRes = await db.query("SELECT value FROM settings WHERE key = 'gcal_client_id'");
    const secretRes = await db.query("SELECT value FROM settings WHERE key = 'gcal_client_secret'");
    
    const clientId = clientRes.rows[0]?.value;
    const clientSecret = secretRes.rows[0]?.value;
    
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000/api/calendar/callback');
    const { tokens } = await oauth2Client.getToken(code);
    
    await db.query("INSERT INTO settings (key, value) VALUES ('gcal_tokens', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [JSON.stringify(tokens)]);

    return NextResponse.redirect('http://localhost:3000?cal_success=1');
  } catch (error) {
    console.error('Calendar callback error:', error);
    return NextResponse.redirect('http://localhost:3000?cal_error=1');
  }
}
