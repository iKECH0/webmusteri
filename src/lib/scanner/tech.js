/**
 * Technology Stack & Framework Scanner
 * Detects CMS, Frontend Frameworks, Analytics, Server Engines, and modern tooling.
 */

export async function scanTech(url, html = '', responseHeaders = {}) {
  const findings = [];
  const detected = [];
  let score = 85;

  const htmlLower = html.toLowerCase();
  const serverHeader = (responseHeaders['server'] || '').toLowerCase();
  const poweredBy = (responseHeaders['x-powered-by'] || '').toLowerCase();

  // 1. CMS Detection
  if (htmlLower.includes('wp-content') || htmlLower.includes('wp-includes')) {
    detected.push({ name: 'WordPress', type: 'CMS', icon: 'wordpress' });
    if (htmlLower.includes('woocommerce')) {
      detected.push({ name: 'WooCommerce', type: 'E-Ticaret', icon: 'cart' });
    }
  } else if (htmlLower.includes('shopify.com') || htmlLower.includes('cdn.shopify')) {
    detected.push({ name: 'Shopify', type: 'E-Ticaret CMS', icon: 'cart' });
  } else if (htmlLower.includes('wix.com') || htmlLower.includes('_wix_')) {
    detected.push({ name: 'Wix', type: 'Site Yapıcı', icon: 'wix' });
  } else if (htmlLower.includes('squarespace')) {
    detected.push({ name: 'Squarespace', type: 'Site Yapıcı', icon: 'squarespace' });
  } else if (htmlLower.includes('webflow')) {
    detected.push({ name: 'Webflow', type: 'Tasarım Platformu', icon: 'webflow' });
  }

  // 2. Modern Frontend / Frameworks
  if (htmlLower.includes('__next') || htmlLower.includes('_next/static') || poweredBy.includes('next.js')) {
    detected.push({ name: 'Next.js (React)', type: 'Modern SSR Framework', icon: 'nextjs' });
    score = 100;
  } else if (htmlLower.includes('react') || htmlLower.includes('react-dom')) {
    detected.push({ name: 'React', type: 'UI Kütüphanesi', icon: 'react' });
    score = 95;
  } else if (htmlLower.includes('vue.js') || htmlLower.includes('vue@') || htmlLower.includes('__nuxt')) {
    detected.push({ name: 'Vue / Nuxt', type: 'Modern Frontend', icon: 'vue' });
    score = 95;
  }

  // 3. CSS Frameworks
  if (htmlLower.includes('tailwindcss') || htmlLower.includes('tailwind')) {
    detected.push({ name: 'Tailwind CSS', type: 'CSS Framework', icon: 'tailwind' });
  } else if (htmlLower.includes('bootstrap')) {
    detected.push({ name: 'Bootstrap', type: 'CSS Framework', icon: 'bootstrap' });
  }

  // 4. Analytics & Marketing Pixels
  if (htmlLower.includes('gtm.js') || htmlLower.includes('googletagmanager.com')) {
    detected.push({ name: 'Google Tag Manager', type: 'Etiket Yöneticisi', icon: 'gtm' });
  }
  if (htmlLower.includes('google-analytics.com') || htmlLower.includes('gtag(') || htmlLower.includes('ga4')) {
    detected.push({ name: 'Google Analytics 4', type: 'Web Analitiği', icon: 'analytics' });
  }
  if (htmlLower.includes('connect.facebook.net') || htmlLower.includes('fbq(')) {
    detected.push({ name: 'Meta (Facebook) Pixel', type: 'Dönüşüm Takibi', icon: 'facebook' });
  }
  if (htmlLower.includes('hotjar')) {
    detected.push({ name: 'Hotjar', type: 'Kullanıcı Isı Haritası', icon: 'hotjar' });
  }
  if (htmlLower.includes('mc.yandex.ru')) {
    detected.push({ name: 'Yandex Metrica', type: 'Analitik', icon: 'yandex' });
  }

  // 5. CDN & Server
  if (serverHeader.includes('cloudflare') || responseHeaders['cf-ray']) {
    detected.push({ name: 'Cloudflare CDN', type: 'Güvenlik & CDN', icon: 'cloudflare' });
  } else if (serverHeader.includes('litespeed')) {
    detected.push({ name: 'LiteSpeed Web Server', type: 'Web Sunucusu', icon: 'server' });
  } else if (serverHeader.includes('nginx')) {
    detected.push({ name: 'Nginx', type: 'Web Sunucusu', icon: 'server' });
  } else if (serverHeader.includes('apache')) {
    detected.push({ name: 'Apache', type: 'Web Sunucusu', icon: 'server' });
  }

  // Findings generation
  if (detected.length > 0) {
    findings.push({
      id: 'tech_detected_list',
      title: `${detected.length} Teknoloji / Kütüphane Tespit Edildi`,
      description: `Kullanılan altyapılar: ${detected.map(d => `${d.name} (${d.type})`).join(', ')}.`,
      status: 'good',
      impact: 'low',
      advice: 'Sitenizde kullanılan kütüphaneler güncel tutulmalıdır.'
    });
  } else {
    findings.push({
      id: 'tech_custom_stack',
      title: 'Özel / Gizlenmiş Web Altyapısı',
      description: 'Site başlıkları ve standart kütüphane imzaları gizlenmiş özel bir altyapı kullanıyor.',
      status: 'good',
      impact: 'low',
      advice: 'Altyapı detayları standart imzalara sahip değil.'
    });
  }

  // Analytics check
  const hasAnalytics = detected.some(d => d.type === 'Web Analitiği' || d.type === 'Etiket Yöneticisi');
  if (hasAnalytics) {
    findings.push({
      id: 'tech_analytics_good',
      title: 'Web Analitik ve Takip Sistemi Aktif',
      description: 'Ziyaretçi trafiğinizi ve dönüşümlerinizi ölçen analitik kodları kurulu.',
      status: 'good',
      impact: 'low',
      advice: 'Müşteri davranışları ölçümlenebiliyor.'
    });
  } else {
    score -= 10;
    findings.push({
      id: 'tech_analytics_missing',
      title: 'Google Analytics veya Takip Kodu Bulunamadı',
      description: 'Sitenize kaç kişinin girdiği, hangi sayfalara baktığı ve nereden geldiği ölçümlenemiyor.',
      status: 'warning',
      impact: 'medium',
      advice: 'Google Analytics 4 ve Google Tag Manager kurulumu yapın.'
    });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    category: 'tech',
    score: finalScore,
    detected,
    findings
  };
}
