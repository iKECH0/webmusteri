import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get API key from settings
    const stmt = db.prepare("SELECT value FROM settings WHERE key = 'google_api_key'");
    const row = stmt.get();
    
    if (!row || !row.value) {
      return NextResponse.json({ error: 'Google API Key not configured. Please set it in Settings.' }, { status: 400 });
    }

    const apiKey = row.value;

    // Use Google Places API (New)
    const url = 'https://places.googleapis.com/v1/places:searchText';
    const requestBody = {
      textQuery: query,
      languageCode: "tr"
    };

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
    
    // Prepare statement to check existing leads
    const checkStmt = db.prepare("SELECT status FROM leads WHERE place_id = ?");
    
    // Prepare statement to insert new leads
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO leads (id, place_id, name, address, phone, website, has_website, category, status, lat, lng, rating, review_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)
    `);

    const results = places.map(place => {
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

      const existing = checkStmt.get(placeId);
      const status = existing ? existing.status : 'new';

      if (!existing) {
        const id = Math.random().toString(36).substring(2, 15);
        insertStmt.run(id, placeId, name, address, phone, website, hasWebsite, category, lat, lng, rating, reviewCount);
      }

      return { id: placeId, name, address, phone, website, hasWebsite: !!hasWebsite, category, status, lat, lng, rating, reviewCount };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: 'An error occurred while searching. Check API Key or try again later.' },
      { status: 500 }
    );
  }
}
