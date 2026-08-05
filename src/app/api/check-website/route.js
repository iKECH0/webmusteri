import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    try {
      const response = await fetch(fullUrl, { 
        signal: controller.signal,
        method: 'HEAD',
        redirect: 'follow'
      });
      clearTimeout(timeout);
      return NextResponse.json({ 
        accessible: response.ok || response.status === 301 || response.status === 302,
        status: response.status,
        url: fullUrl
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      return NextResponse.json({ accessible: false, status: 0, error: 'Erişilemiyor', url: fullUrl });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
