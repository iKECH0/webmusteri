import { NextResponse } from 'next/server';
import axios from 'axios';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { region } = await request.json();
    if (!region) return NextResponse.json({ error: 'region required' }, { status: 400 });

    const settingsRes = await db.query("SELECT value FROM settings WHERE key = 'google_api_key'");
    const apiKey = settingsRes.rows[0]?.value;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google API Key not configured.' }, { status: 400 });
    }

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

    const leadsWithSites = await db.query('SELECT COUNT(*) as count FROM leads WHERE has_website = 1');
    const leadsWithoutSites = await db.query('SELECT COUNT(*) as count FROM leads WHERE has_website = 0');

    return NextResponse.json({
      agencies: allAgencies,
      market_data: {
        our_leads_with_sites: parseInt(leadsWithSites.rows[0].count),
        our_leads_without_sites: parseInt(leadsWithoutSites.rows[0].count),
        total_agencies_found: allAgencies.length,
        region,
      }
    });
  } catch (error) {
    console.error('Competitor error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
