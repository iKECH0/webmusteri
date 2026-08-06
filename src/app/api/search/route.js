import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const res = await db.query("SELECT value FROM settings WHERE key = 'google_api_key'");
    const apiKey = res.rows[0]?.value;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Google API Key not configured. Please set it in Settings.' }, { status: 400 });
    }

    const url = 'https://places.googleapis.com/v1/places:searchText';
    const requestBody = { textQuery: query, languageCode: "tr" };
    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.primaryType,places.location,places.rating,places.userRatingCount'
    };

    const response = await axios.post(url, requestBody, { headers });
    
    if (!response.data || !response.data.places) {
      return NextResponse.json({ results: [] });
    }

    const places = response.data.places;
    const results = [];

    for (const place of places) {
      const placeId = place.id;
      const name = place.displayName?.text || 'Bilinmiyor';
      const address = place.formattedAddress || '';
      const phone = place.nationalPhoneNumber || '';
      const website = place.websiteUri || '';
      const hasWebsite = website ? 1 : 0;
      const category = place.primaryType || 'Bilinmiyor';
      const lat = place.location?.latitude || null;
      const lng = place.location?.longitude || null;
      const rating = place.rating || null;
      const reviewCount = place.userRatingCount || 0;

      const checkRes = await db.query("SELECT status FROM leads WHERE place_id = $1", [placeId]);
      const existing = checkRes.rows[0];
      const status = existing ? existing.status : 'new';

      if (!existing) {
        const id = Math.random().toString(36).substring(2, 15);
        await db.query(`
          INSERT INTO leads (id, place_id, name, address, phone, website, has_website, category, status, lat, lng, rating, review_count)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new', $9, $10, $11, $12)
          ON CONFLICT (place_id) DO NOTHING
        `, [id, placeId, name, address, phone, website, hasWebsite, category, lat, lng, rating, reviewCount]);
      }

      results.push({ id: placeId, name, address, phone, website, hasWebsite: !!hasWebsite, category, status, lat, lng, rating, reviewCount });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: 'An error occurred while searching. Check API Key or try again later.' },
      { status: 500 }
    );
  }
}
