"use client";

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import CarWashTemplate from '@/components/demo-templates/CarWashTemplate';
import CarpetCleaningTemplate from '@/components/demo-templates/CarpetCleaningTemplate';
import SalonTemplate from '@/components/demo-templates/SalonTemplate';
import RestaurantTemplate from '@/components/demo-templates/RestaurantTemplate';
import TechnicalServiceTemplate from '@/components/demo-templates/TechnicalServiceTemplate';
import CorporateTemplate from '@/components/demo-templates/CorporateTemplate';

export function detectSector(category, name, forcedSector) {
  if (forcedSector) return forcedSector;
  const text = `${category || ''} ${name || ''}`.toLowerCase();
  
  if (text.includes('halı') || text.includes('koltuk') || text.includes('perde') || text.includes('yorgan') || text.includes('kuru temizleme')) {
    return 'hali-yikama';
  }
  if (text.includes('oto') || text.includes('yıkama') || text.includes('detailing') || text.includes('lastik') || text.includes('araba') || text.includes('kaplama')) {
    return 'oto-yikama';
  }
  if (text.includes('kuaför') || text.includes('berber') || text.includes('güzellik') || text.includes('tırnak') || text.includes('makyaj') || text.includes('lazer') || text.includes('epilasyon') || text.includes('salon')) {
    return 'kuafor';
  }
  if (text.includes('restoran') || text.includes('kafe') || text.includes('cafe') || text.includes('kebap') || text.includes('döner') || text.includes('pizza') || text.includes('burger') || text.includes('lokanta') || text.includes('fırın') || text.includes('tatlı')) {
    return 'restoran';
  }
  if (text.includes('tesisat') || text.includes('elektrik') || text.includes('kombi') || text.includes('usta') || text.includes('tamir') || text.includes('klima') || text.includes('servis') || text.includes('çilingir') || text.includes('boya') || text.includes('tadilat')) {
    return 'teknik-servis';
  }
  return 'kurumsal';
}

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

  const props = {
    businessName: name,
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

export default function DemoPage() {
  return (
    <React.Suspense fallback={<div style={{ background: '#0a0d14', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Demo Yükleniyor...</div>}>
      <DemoContent />
    </React.Suspense>
  );
}
