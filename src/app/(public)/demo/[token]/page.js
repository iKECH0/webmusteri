import React from 'react';
import db from '@/lib/db';
import CarWashTemplate from '@/components/demo-templates/CarWashTemplate';
import CarpetCleaningTemplate from '@/components/demo-templates/CarpetCleaningTemplate';
import SalonTemplate from '@/components/demo-templates/SalonTemplate';
import RestaurantTemplate from '@/components/demo-templates/RestaurantTemplate';
import TechnicalServiceTemplate from '@/components/demo-templates/TechnicalServiceTemplate';
import CorporateTemplate from '@/components/demo-templates/CorporateTemplate';
import { detectSector } from '../page';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { token } = await params;
  try {
    const res = await db.query(
      'SELECT name, category FROM leads WHERE portal_token = $1 OR id = $1 LIMIT 1',
      [token]
    );
    if (res.rows.length > 0) {
      const lead = res.rows[0];
      return {
        title: `${lead.name} - Özel Web Sitesi Tasarım Önizlemesi`,
        description: `${lead.name} için Kodiva Ajans tarafından hazırlanan özel canlı web sitesi demosu.`
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    title: 'Canlı Web Sitesi Demosu - Kodiva Ajans',
    description: 'İşletmeniz için özel hazırlanmış canlı web sitesi demosu.'
  };
}

export default async function LeadDemoPage({ params, searchParams }) {
  const { token } = await params;
  const sParams = await searchParams;
  const forcedSector = sParams?.sector;

  let lead = null;

  try {
    const res = await db.query(
      'SELECT * FROM leads WHERE portal_token = $1 OR id = $1 LIMIT 1',
      [token]
    );
    if (res.rows.length > 0) {
      lead = res.rows[0];
    }
  } catch (err) {
    console.error("Demo fetch error:", err);
  }

  // If lead found in DB
  const businessName = lead ? lead.name : decodeURIComponent(token).replace(/-/g, ' ');
  const category = lead ? lead.category : '';
  const phone = lead ? lead.phone : '0555 000 00 00';
  const address = lead ? lead.address : 'İstanbul, Türkiye';
  const rating = lead?.rating || '4.9';
  const reviewCount = lead?.review_count || '150+';
  const refCode = lead?.referred_by || lead?.assigned_to || sParams?.ref || 'web';

  const sector = detectSector(category, businessName, forcedSector);

  const props = {
    businessName,
    phone,
    address,
    rating,
    reviewCount,
    refCode
  };

  switch (sector) {
    case 'oto-yikama':
      return <CarWashTemplate {...props} />;
    case 'hali-yikama':
      return <CarpetCleaningTemplate {...props} />;
    case 'kuafor':
      return <SalonTemplate {...props} />;
    case 'restoran':
      return <RestaurantTemplate {...props} />;
    case 'teknik-servis':
      return <TechnicalServiceTemplate {...props} />;
    default:
      return <CorporateTemplate {...props} />;
  }
}
