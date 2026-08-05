import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import db from '@/lib/db';

function getOAuth2Client() {
  const clientId = db.prepare("SELECT value FROM settings WHERE key = 'gcal_client_id'").get()?.value;
  const clientSecret = db.prepare("SELECT value FROM settings WHERE key = 'gcal_client_secret'").get()?.value;
  const redirectUri = 'http://localhost:3000/api/calendar/callback';

  if (!clientId || !clientSecret) return null;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function GET() {
  try {
    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) {
      return NextResponse.json({ error: 'Google Calendar credentials not configured.' }, { status: 400 });
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
