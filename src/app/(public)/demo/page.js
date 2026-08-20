"use client";

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { detectSector } from '@/lib/detectSector';
import CarWashTemplate from '@/components/demo-templates/CarWashTemplate';
import CarpetCleaningTemplate from '@/components/demo-templates/CarpetCleaningTemplate';
import SalonTemplate from '@/components/demo-templates/SalonTemplate';
import RestaurantTemplate from '@/components/demo-templates/RestaurantTemplate';
import TechnicalServiceTemplate from '@/components/demo-templates/TechnicalServiceTemplate';
import CorporateTemplate from '@/components/demo-templates/CorporateTemplate';

function DemoContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Örnek İşletme';
  const category = searchParams.get('category') || '';
  const sectorParam = searchParams.get('sector') || '';
  const phone = searchParams.get('phone') || '0555 000 00 00';
  const address = searchParams.get('address') || 'İstanbul, Türkiye';
  const rating = searchParams.get('rating') || '4.9';
  const reviewCount = searchParams.get('reviews') || '180+';
  const refCode = searchParams.get('ref') || 'demo';

  const sector = useMemo(() => detectSector(category, name, sectorParam), [category, name, sectorParam]);

  const props = { businessName: name, phone, address, rating, reviewCount, refCode };

  switch (sector) {
    case 'oto-yikama':   return <CarWashTemplate {...props} />;
    case 'hali-yikama':  return <CarpetCleaningTemplate {...props} />;
    case 'kuafor':       return <SalonTemplate {...props} />;
    case 'restoran':     return <RestaurantTemplate {...props} />;
    case 'teknik-servis': return <TechnicalServiceTemplate {...props} />;
    default:             return <CorporateTemplate {...props} />;
  }
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a0d14', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        Demo Yükleniyor...
      </div>
    }>
      <DemoContent />
    </Suspense>
  );
}
