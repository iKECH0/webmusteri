import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { queries } = await request.json();
    
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json({ error: 'queries array is required' }, { status: 400 });
    }

    const settingsStmt = db.prepare("SELECT value FROM settings WHERE key = 'google_api_key'");
    const row = settingsStmt.get();
    if (!row?.value) {
      return NextResponse.json({ error: 'Google API Key not configured.' }, { status: 400 });
    }
    const apiKey = row.value;

    const checkStmt = db.prepare("SELECT status FROM leads WHERE place_id = ?");
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO leads (id, place_id, name, address, phone, website, has_website, category, status, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
    `);

    let allResults = [];
    const seenPlaceIds = new Set();

    for (const query of queries) {
      try {
        const url = 'https://places.googleapis.com/v1/places:searchText';
        const requestBody = { textQuery: query.trim(), languageCode: "tr" };
        const headers = {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.primaryType,places.location'
        };

        const response = await axios.post(url, requestBody, { headers });
        const places = response.data?.places || [];

        for (const place of places) {
          const placeId = place.id;
          if (seenPlaceIds.has(placeId)) continue;
          seenPlaceIds.add(placeId);

          const name = place.displayName?.text || 'Bilinmiyor';
          const address = place.formattedAddress || '';
          const phone = place.nationalPhoneNumber || '';
          const website = place.websiteUri || '';
          const hasWebsite = website ? 1 : 0;
          const category = place.primaryType || 'Bilinmiyor';
          const lat = place.location?.latitude || null;
          const lng = place.location?.longitude || null;

          const existing = checkStmt.get(placeId);
          const status = existing ? existing.status : 'new';

          if (!existing) {
            const id = Math.random().toString(36).substring(2, 15);
            insertStmt.run(id, placeId, name, address, phone, website, hasWebsite, category, lat, lng);
          }

          allResults.push({ id: placeId, name, address, phone, website, hasWebsite: !!hasWebsite, category, status, lat, lng, query });
        }

        // Small delay between requests to respect rate limits
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.error(`Error for query "${query}":`, err.response?.data || err.message);
      }
    }

    return NextResponse.json({ results: allResults, total: allResults.length });
  } catch (error) {
    console.error("Batch search error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
