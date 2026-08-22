import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db, { ensureInit } from '@/lib/db';

export async function GET(request) {
  try {
    await ensureInit();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product');

    if (!productId) {
      return NextResponse.redirect(new URL('/hizmetler', request.url));
    }

    // In a real application, you would:
    // 1. Fetch product price from DB
    // 2. Generate a Shopier payment session using their API
    // 3. Redirect to Shopier URL

    // For this demonstration, we'll simulate the process and immediately 
    // redirect to our callback URL to simulate a successful payment return.
    
    // Create a mock Shopier Order ID
    const shopierOrderId = 'SHOP_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Generate redirect URL
    const callbackUrl = new URL('/api/shopier/callback', request.url);
    callbackUrl.searchParams.set('status', 'success');
    callbackUrl.searchParams.set('order_id', shopierOrderId);
    callbackUrl.searchParams.set('product_id', productId);
    
    // We are bypassing actual Shopier redirect here and going straight to success
    // to simulate the user coming back.
    return NextResponse.redirect(callbackUrl);

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.redirect(new URL('/hizmetler?error=1', request.url));
  }
}
