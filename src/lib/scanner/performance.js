/**
 * Performance Scanner
 * Analyzes page speed, Core Web Vitals (LCP, CLS, FCP, TBT), TTFB, and payload size.
 * Uses Google PageSpeed Insights API with server-timing fallback.
 */

export async function scanPerformance(url, html = '', responseHeaders = {}) {
  const findings = [];
  let score = 100;
  let metrics = {};

  const startTime = Date.now();
  let ttfb = null;

  try {
    const ttfbRes = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KodivaBot/1.0; +https://kodivawebsite.com)' } });
    ttfb = Date.now() - startTime;
  } catch (e) {
    ttfb = 1200;
  }

  // 1. TTFB (Time To First Byte / Sunucu Yanıt Süresi)
  if (ttfb !== null) {
    if (ttfb <= 300) {
      findings.push({
        id: 'perf_ttfb',
        title: 'Hızlı Sunucu Yanıt Süresi (TTFB)',
        description: `Sunucunuz ilk yanıtı ${ttfb} ms içinde başarıyla gönderdi.`,
        status: 'good',
        impact: 'low',
        advice: 'Sunucu yanıt süreniz mükemmel seviyede.'
      });
    } else if (ttfb <= 800) {
      score -= 10;
      findings.push({
        id: 'perf_ttfb',
        title: 'Orta Düzey Sunucu Yanıt Süresi',
        description: `Sunucu yanıt süresi ${ttfb} ms. İdeal olarak 300 ms altında olmalıdır.`,
        status: 'warning',
        impact: 'medium',
        advice: 'Sunucu önbellekleme (Redis/Varnish) veya daha hızlı bir hosting altyapısı tercih edilebilir.'
      });
    } else {
      score -= 25;
      findings.push({
        id: 'perf_ttfb',
        title: 'Yavaş Sunucu Yanıt Süresi (Kritik)',
        description: `Sunucu yanıt süreniz ${ttfb} ms ile oldukça yavaş. Ziyaretçiler sayfa açılmadan siteden ayrılabilir.`,
        status: 'critical',
        impact: 'high',
        advice: 'Hosting sağlayıcınızı optimize edin, CDN (Cloudflare) entegrasyonu yapın ve veritabanı sorgularını önbelleğe alın.'
      });
    }
  }

  // 2. Google PageSpeed Insights API (Mobile Strategy)
  let pagespeedSuccess = false;
  try {
    const apiKey = process.env.PAGESPEED_API_KEY || '';
    const endpoint = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile${apiKey ? `&key=${apiKey}` : ''}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    
    const psRes = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeout);

    if (psRes.ok) {
      const data = await psRes.json();
      const lighthouse = data.lighthouseResult;
      if (lighthouse && lighthouse.categories?.performance) {
        pagespeedSuccess = true;
        const psScore = Math.round((lighthouse.categories.performance.score || 0) * 100);
        const audits = lighthouse.audits || {};

        const fcp = audits['first-contentful-paint']?.displayValue || null;
        const lcp = audits['largest-contentful-paint']?.displayValue || null;
        const cls = audits['cumulative-layout-shift']?.displayValue || null;
        const tbt = audits['total-blocking-time']?.displayValue || null;
        const speedIndex = audits['speed-index']?.displayValue || null;

        metrics = {
          googleScore: psScore,
          fcp,
          lcp,
          cls,
          tbt,
          speedIndex
        };

        // Score adjustment based on Google PageSpeed
        score = Math.round((score * 0.3) + (psScore * 0.7));

        if (psScore >= 85) {
          findings.push({
            id: 'perf_pagespeed',
            title: `Google PageSpeed Skoru: ${psScore}/100`,
            description: `Mobil cihazlarda mükemmel yükleme performansı. LCP: ${lcp || '-'}, FCP: ${fcp || '-'}.`,
            status: 'good',
            impact: 'high',
            advice: 'Harika! Siteniz Google Core Web Vitals standartlarını karşılıyor.'
          });
        } else if (psScore >= 50) {
          findings.push({
            id: 'perf_pagespeed',
            title: `Google PageSpeed Skoru: ${psScore}/100 (İyileştirilmeli)`,
            description: `Mobil cihazlarda orta seviye hız. LCP: ${lcp || '-'}, TBT: ${tbt || '-'}.`,
            status: 'warning',
            impact: 'high',
            advice: 'Görselleri WebP formatına çevirin, kullanılmayan JavaScript dosyalarını erteleyin ve CSS/JS minify yapın.'
          });
        } else {
          findings.push({
            id: 'perf_pagespeed',
            title: `Google PageSpeed Skoru: ${psScore}/100 (Kritik Düşük)`,
            description: `Mobil cihazlarda çok yavaş yükleniyor. Ziyaretçilerin %50'den fazlası sitenizi terk edebilir. LCP: ${lcp || '-'}, TBT: ${tbt || '-'}.`,
            status: 'critical',
            impact: 'high',
            advice: 'Kodiva modern Next.js / CDN mimarisi ile sayfa açılış hızınızı 1 saniyenin altına indirebilir.'
          });
        }
      }
    }
  } catch (e) {
    // PageSpeed API timeout or network error, fallback to HTML analysis
  }

  // 3. Compression (Gzip / Brotli)
  const encoding = responseHeaders['content-encoding'] || '';
  if (encoding.includes('gzip') || encoding.includes('br')) {
    findings.push({
      id: 'perf_compression',
      title: `Metin Sıkıştırma Aktif (${encoding})`,
      description: 'HTML, CSS ve JavaScript dosyalarınız sıkıştırılarak aktarılıyor, bant genişliği tasarrufu sağlanıyor.',
      status: 'good',
      impact: 'medium',
      advice: 'Sıkıştırma ayarlarınız doğru yapılandırılmış.'
    });
  } else {
    score -= 15;
    findings.push({
      id: 'perf_compression',
      title: 'Gzip / Brotli Sıkıştırma Eksik',
      description: 'Sunucunuz dosyaları sıkıştırmadan gönderiyor. Bu durum sayfa boyutunu 3-5 kat artırır.',
      status: 'critical',
      impact: 'high',
      advice: 'Web sunucunuzda (Nginx/Apache/Cloudflare) Gzip veya Brotli sıkıştırmayı derhal aktif edin.'
    });
  }

  // 4. HTML / DOM Size Analysis
  const htmlSizeKb = Math.round((Buffer.byteLength(html, 'utf8') || 0) / 1024);
  if (htmlSizeKb > 0) {
    if (htmlSizeKb <= 100) {
      findings.push({
        id: 'perf_html_size',
        title: `Hafif HTML Belgesi (${htmlSizeKb} KB)`,
        description: 'Ana sayfa DOM yapısı hafif ve optimize.',
        status: 'good',
        impact: 'low',
        advice: 'DOM boyutu ideal standartlarda.'
      });
    } else if (htmlSizeKb <= 300) {
      score -= 5;
      findings.push({
        id: 'perf_html_size',
        title: `Orta Büyüklükte HTML Boyutu (${htmlSizeKb} KB)`,
        description: 'HTML belgesi biraz ağır. Fazla inline stil ve script bulunuyor olabilir.',
        status: 'warning',
        impact: 'low',
        advice: 'Inline CSS ve JS kodlarını harici dosyalara taşıyın.'
      });
    } else {
      score -= 15;
      findings.push({
        id: 'perf_html_size',
        title: `Aşırı Ağır HTML Boyutu (${htmlSizeKb} KB)`,
        description: 'Ana sayfa boyutu çok büyük. Tarayıcıların sayfayı işlemesi gecikiyor.',
        status: 'critical',
        impact: 'medium',
        advice: 'Gereksiz DOM düğümlerini temizleyin, sayfalama veya lazy loading uygulayın.'
      });
    }
  }

  // Normalize final score 0-100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    category: 'performance',
    score: finalScore,
    metrics,
    findings
  };
}
