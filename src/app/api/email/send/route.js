import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import db from '@/lib/db';

function getTransporter() {
  const settings = db.prepare('SELECT key, value FROM settings WHERE key IN (?, ?, ?)').all(
    'smtp_email', 'smtp_password', 'smtp_host'
  );
  const s = {};
  settings.forEach(r => { s[r.key] = r.value; });

  if (!s.smtp_email || !s.smtp_password) {
    throw new Error('E-posta ayarları eksik. Lütfen Ayarlar sayfasını doldurun.');
  }

  return nodemailer.createTransport({
    host: s.smtp_host || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: s.smtp_email,
      pass: s.smtp_password,
    },
  });
}

export async function POST(request) {
  try {
    const { lead_ids, subject, body, campaign_id } = await request.json();

    if (!lead_ids?.length || !subject || !body) {
      return NextResponse.json({ error: 'lead_ids, subject and body are required' }, { status: 400 });
    }

    const transporter = getTransporter();
    const fromSettings = db.prepare("SELECT value FROM settings WHERE key = 'smtp_email'").get();
    const from = fromSettings?.value || 'noreply@system.com';

    const leads = db.prepare(
      `SELECT * FROM leads WHERE id IN (${lead_ids.map(() => '?').join(',')})`
    ).all(...lead_ids);

    const results = { sent: 0, failed: 0, errors: [] };

    for (const lead of leads) {
      if (!lead.email) {
        results.failed++;
        continue;
      }

      // Replace variables in template
      const portalLink = lead.portal_token
        ? `http://localhost:3000/portal/${lead.portal_token}`
        : '';
      const personalizedBody = body
        .replace(/{firma_adi}/g, lead.name)
        .replace(/{portal_link}/g, portalLink)
        .replace(/{telefon}/g, lead.phone || '');

      try {
        await transporter.sendMail({
          from: `"CRM Sistemi" <${from}>`,
          to: lead.email,
          subject: subject.replace(/{firma_adi}/g, lead.name),
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px;">${personalizedBody.replace(/\n/g, '<br>')}</div>`,
        });

        // Log success
        const logId = Math.random().toString(36).substring(2, 15);
        db.prepare('INSERT INTO email_logs (id, lead_id, campaign_id, email, status, sent_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
          .run(logId, lead.id, campaign_id || null, lead.email, 'sent');

        results.sent++;
      } catch (err) {
        const logId = Math.random().toString(36).substring(2, 15);
        db.prepare('INSERT INTO email_logs (id, lead_id, campaign_id, email, status) VALUES (?, ?, ?, ?, ?)')
          .run(logId, lead.id, campaign_id || null, lead.email, 'failed');
        results.failed++;
        results.errors.push({ lead: lead.name, error: err.message });
      }
    }

    // Update campaign sent_count
    if (campaign_id) {
      db.prepare('UPDATE email_campaigns SET sent_count = sent_count + ? WHERE id = ?')
        .run(results.sent, campaign_id);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
