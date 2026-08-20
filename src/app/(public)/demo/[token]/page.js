import React, { Suspense } from 'react';
import db from '@/lib/db';
import { detectSector } from '../page';
import DemoClientPage from './DemoClientPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { token } = await params;
  try {
    const res = await db.query(
      'SELECT name, category FROM leads WHERE portal_token = $1 OR id::text = $1 LIMIT 1',
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
      'SELECT * FROM leads WHERE portal_token = $1 OR id::text = $1 LIMIT 1',
      [token]
    );
    if (res.rows.length > 0) {
      lead = res.rows[0];
    }
  } catch (err) {
    console.error("Demo fetch error:", err);
  }

  const businessName = lead ? lead.name : decodeURIComponent(token).replace(/-/g, ' ');
  const category = lead ? (lead.category || '') : '';
  const phone = lead ? (lead.phone || '0555 000 00 00') : '0555 000 00 00';
  const address = lead ? (lead.address || 'İstanbul, Türkiye') : 'İstanbul, Türkiye';
  const rating = String(lead?.rating || '4.9');
  const reviewCount = String(lead?.review_count || '150+');
  const refCode = lead?.referred_by || lead?.assigned_to || sParams?.ref || 'web';

  const sector = detectSector(category, businessName, forcedSector);

  return (
    <Suspense fallback={
      <div style={{ background: '#0a0d14', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        Demo Yükleniyor...
      </div>
    }>
      <DemoClientPage
        businessName={businessName}
        phone={phone}
        address={address}
        rating={rating}
        reviewCount={reviewCount}
        refCode={refCode}
        sector={sector}
      />
    </Suspense>
  );
}
