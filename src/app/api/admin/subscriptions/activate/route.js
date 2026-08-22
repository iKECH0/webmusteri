import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db, { ensureInit } from '@/lib/db';

export async function POST(request) {
  try {
    await ensureInit();
    const { subscriptionId, durationMonths, adminNote } = await request.json();

    if (!subscriptionId || !durationMonths) {
      return NextResponse.json({ error: 'subscriptionId ve durationMonths gerekli.' }, { status: 400 });
    }

    // Fetch the subscription
    const subRes = await db.query(`SELECT * FROM subscriptions WHERE id = $1`, [subscriptionId]);
    if (!subRes.rows.length) {
      return NextResponse.json({ error: 'Abonelik bulunamadı.' }, { status: 404 });
    }

    const sub = subRes.rows[0];
    if (sub.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Bu abonelik zaten aktif.' }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + Number(durationMonths));

    // Activate the subscription
    await db.query(
      `UPDATE subscriptions 
       SET status = 'ACTIVE', activated_at = $1, expires_at = $2, activated_by = $3
       WHERE id = $4`,
      [now.toISOString(), expiresAt.toISOString(), 'admin', subscriptionId]
    );

    // Also update the payment to reflect activation
    if (sub.payment_id) {
      await db.query(
        `UPDATE payments SET payment_status = 'PAID', paid_at = $1 WHERE id = $2`,
        [now.toISOString(), sub.payment_id]
      );
    }

    // Log the admin action
    const logId = 'log_' + crypto.randomBytes(6).toString('hex');
    await db.query(
      `INSERT INTO admin_action_logs (id, admin_id, action_type, details)
       VALUES ($1, $2, $3, $4)`,
      [
        logId,
        'admin',
        'SUBSCRIPTION_ACTIVATED',
        JSON.stringify({
          subscriptionId,
          customerId: sub.customer_id,
          productId: sub.product_id,
          durationMonths,
          activatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          note: adminNote || ''
        })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Abonelik başarıyla aktif edildi.',
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('POST /api/admin/subscriptions/activate error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
