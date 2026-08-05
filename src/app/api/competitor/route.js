import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { region } = await request.json();
    if (!region) return NextResponse.json({ error: 'region required' }, { status: 400 });

    const settingsRow = db.prepare("SELECT value FROM settings WHERE key = 'google_api_key'").get();
    if (!settingsRow?.value) {
      return NextResponse.json({ error: 'Google API Key not configured.' }, { status: 400 });
    }
    const apiKey = settingsRow.value;

    // Search for web agencies in the region
    const queries = [
      `${region} web tasarım`,
      `${region} web ajansı`,
      `${region} dijital ajans`,
    ];

    const allAgencies = [];
    const seen = new Set();

    for (const q of queries) {
      try {
        const res = await axios.post(
          'https://places.googleapis.com/v1/places:searchText',
          { textQuery: q, languageCode: 'tr' },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount',
            },
          }
        );

        const places = res.data?.places || [];
        for (const p of places) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            allAgencies.push({
              id: p.id,
              name: p.displayName?.text || 'Bilinmiyor',
              address: p.formattedAddress || '',
              phone: p.nationalPhoneNumber || '',
              website: p.websiteUri || '',
              rating: p.rating || null,
              reviewCount: p.userRatingCount || 0,
            });
          }
        }
        await new Promise(r => setTimeout(r, 200));
      } catch (e) {
        console.error(`Competitor search error for "${q}":`, e.message);
      }
    }

    // Also find how many of OUR leads have websites (potential clients of these agencies)
    const leadsWithSites = db.prepare('SELECT COUNT(*) as count FROM leads WHERE has_website = 1').get();
    const leadsWithoutSites = db.prepare('SELECT COUNT(*) as count FROM leads WHERE has_website = 0').get();

    return NextResponse.json({
      agencies: allAgencies,
      market_data: {
        our_leads_with_sites: leadsWithSites.count,
        our_leads_without_sites: leadsWithoutSites.count,
        total_agencies_found: allAgencies.length,
        region,
      }
    });
  } catch (error) {
    console.error('Competitor error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
