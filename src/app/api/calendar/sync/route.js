import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { lead_id, date, title } = await request.json();
    if (!lead_id || !date) return NextResponse.json({ error: 'lead_id and date required' }, { status: 400 });

    const clientRes = await db.query("SELECT value FROM settings WHERE key = 'gcal_client_id'");
    const secretRes = await db.query("SELECT value FROM settings WHERE key = 'gcal_client_secret'");
    const tokensRes = await db.query("SELECT value FROM settings WHERE key = 'gcal_tokens'");
    
    const clientId = clientRes.rows[0]?.value;
    const clientSecret = secretRes.rows[0]?.value;
    const tokensValue = tokensRes.rows[0]?.value;

    if (!clientId || !clientSecret || !tokensValue) {
      return NextResponse.json({ error: 'Google Calendar bağlı değil. Lütfen Ayarlar sayfasından bağlayın.' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000/api/calendar/callback');
    oauth2Client.setCredentials(JSON.parse(tokensValue));

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [lead_id]);
    const lead = leadRes.rows[0];

    const eventDate = new Date(date);
    const event = {
      summary: title || `CRM Takip: ${lead?.name || 'Müşteri'}`,
      description: lead ? `Firma: ${lead.name}\nTelefon: ${lead.phone || '-'}\nAdres: ${lead.address || '-'}` : '',
      start: { date: eventDate.toISOString().split('T')[0] },
      end: { date: eventDate.toISOString().split('T')[0] },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'email', minutes: 60 * 24 },
        ],
      },
    };

    const response = await calendar.events.insert({ calendarId: 'primary', resource: event });
    return NextResponse.json({ success: true, eventId: response.data.id, htmlLink: response.data.htmlLink });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
