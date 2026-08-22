import { NextResponse } from 'next/server';
import db, { ensureInit } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    await ensureInit();
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Token gerekli.' }, { status: 400 });
    }

    // Find the lead by portal_token
    const leadRes = await db.query(`SELECT email FROM leads WHERE portal_token = $1`, [token]);
    if (!leadRes.rows.length) {
      return NextResponse.json({ subscriptions: [] });
    }

    const email = leadRes.rows[0].email;
    if (!email) {
      return NextResponse.json({ subscriptions: [] });
    }

    // Find subscriptions by customer_id (email)
    const subRes = await db.query(
      `SELECT s.*, p.name as product_name, p.description as product_description
       FROM subscriptions s
       LEFT JOIN products p ON s.product_id = p.slug
       WHERE s.customer_id = $1
       ORDER BY s.created_at DESC`,
      [email]
    );

    return NextResponse.json({ subscriptions: subRes.rows });
  } catch (error) {
    console.error('GET /api/portal/[token]/subscriptions error:', error);
    return NextResponse.json({ subscriptions: [] });
  }
}
