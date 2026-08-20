"use client";

import React from 'react';
import CarWashTemplate from '@/components/demo-templates/CarWashTemplate';
import CarpetCleaningTemplate from '@/components/demo-templates/CarpetCleaningTemplate';
import SalonTemplate from '@/components/demo-templates/SalonTemplate';
import RestaurantTemplate from '@/components/demo-templates/RestaurantTemplate';
import TechnicalServiceTemplate from '@/components/demo-templates/TechnicalServiceTemplate';
import CorporateTemplate from '@/components/demo-templates/CorporateTemplate';

export default function DemoClientPage({ businessName, phone, address, rating, reviewCount, refCode, sector }) {
  const props = { businessName, phone, address, rating, reviewCount, refCode };

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
