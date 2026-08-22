import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db, { ensureInit } from '@/lib/db';

export async function GET(request) {
  try {
    await ensureInit();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');
    const productId = searchParams.get('product_id');

    if (status === 'success' && orderId) {
      // Create payment record (Simulating Shopier Post-Back)
      const paymentId = 'pay_' + crypto.randomBytes(8).toString('hex');
      const customerEmail = `musteri_${crypto.randomBytes(2).toString('hex')}@example.com`; // Mock user
      const customerName = 'Demo Müşteri';
      
      // Determine amount based on mock product
      let amount = 9500;
      if (productId === 'corporate') amount = 18500;
      if (productId === 'ecommerce') amount = 34000;

      await db.query(
        `INSERT INTO payments (id, customer_name, customer_email, product_id, amount, shopier_order_id, payment_status, paid_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'PAID', CURRENT_TIMESTAMP)`,
        [paymentId, customerName, customerEmail, productId, amount, orderId]
      );

      // Create a PENDING subscription
      const subId = 'sub_' + crypto.randomBytes(8).toString('hex');
      await db.query(
        `INSERT INTO subscriptions (id, customer_id, product_id, payment_id, status)
         VALUES ($1, $2, $3, $4, 'PENDING_ACTIVATION')`,
        [subId, customerEmail, productId, paymentId]
      );

      // Redirect to a success page
      return NextResponse.redirect(new URL('/odeme-basarili', request.url));
    }

    return NextResponse.redirect(new URL('/hizmetler?error=payment_failed', request.url));

  } catch (error) {
    console.error('Shopier callback error:', error);
    return NextResponse.redirect(new URL('/hizmetler?error=1', request.url));
  }
}
