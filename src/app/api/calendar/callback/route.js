import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.redirect('http://localhost:3000?cal_error=1');

    const clientId = db.prepare("SELECT value FROM settings WHERE key = 'gcal_client_id'").get()?.value;
    const clientSecret = db.prepare("SELECT value FROM settings WHERE key = 'gcal_client_secret'").get()?.value;
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000/api/calendar/callback');

    const { tokens } = await oauth2Client.getToken(code);
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('gcal_tokens', ?)").run(JSON.stringify(tokens));

    return NextResponse.redirect('http://localhost:3000?cal_success=1');
  } catch (error) {
    console.error('Calendar callback error:', error);
    return NextResponse.redirect('http://localhost:3000?cal_error=1');
  }
}
