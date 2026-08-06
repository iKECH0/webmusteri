import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import db from '@/lib/db';

async function getTransporter() {
  const res = await db.query("SELECT key, value FROM settings WHERE key IN ('smtp_email', 'smtp_password', 'smtp_host')");
  const s = {};
  res.rows.forEach(r => { s[r.key] = r.value; });

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

    const transporter = await getTransporter();
    const fromRes = await db.query("SELECT value FROM settings WHERE key = 'smtp_email'");
    const from = fromRes.rows[0]?.value || 'noreply@system.com';

    // Build parameterized query for IN clause
    const placeholders = lead_ids.map((_, i) => `$${i + 1}`).join(',');
    const leadsRes = await db.query(`SELECT * FROM leads WHERE id IN (${placeholders})`, lead_ids);
    const leads = leadsRes.rows;

    const results = { sent: 0, failed: 0, errors: [] };

    for (const lead of leads) {
      if (!lead.email) {
        results.failed++;
        continue;
      }

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

        const logId = Math.random().toString(36).substring(2, 15);
        await db.query('INSERT INTO email_logs (id, lead_id, campaign_id, email, status, sent_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)',
          [logId, lead.id, campaign_id || null, lead.email, 'sent']);

        results.sent++;
      } catch (err) {
        const logId = Math.random().toString(36).substring(2, 15);
        await db.query('INSERT INTO email_logs (id, lead_id, campaign_id, email, status) VALUES ($1, $2, $3, $4, $5)',
          [logId, lead.id, campaign_id || null, lead.email, 'failed']);
        results.failed++;
        results.errors.push({ lead: lead.name, error: err.message });
      }
    }

    if (campaign_id) {
      await db.query('UPDATE email_campaigns SET sent_count = sent_count + $1 WHERE id = $2', [results.sent, campaign_id]);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
