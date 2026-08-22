import { scanPerformance } from './performance';
import { scanSEO } from './seo';
import { scanMobile } from './mobile';
import { scanSecurity } from './security';
import { scanTech } from './tech';

/**
 * Normalizes input URL to standard full URL
 */
export function normalizeUrl(input) {
  if (!input) return '';
  let clean = input.trim().toLowerCase();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

/**
 * Validates domain/IP against SSRF risks.
 * Rejects private IPs, loopback, and metadata endpoints.
 */
export function validateUrlForSSRF(normalized) {
  const blockedPatterns = [
    /^localhost$/i,
    /^127\.\d+\.\d+\.\d+$/, // loopback
    /^10\.\d+\.\d+\.\d+$/, // private Class A
    /^192\.168\.\d+\.\d+$/, // private Class C
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/, // private Class B
    /^169\.254\.\d+\.\d+$/, // AWS metadata / link-local
    /\[?::1\]?/, // IPv6 loopback
    /\.local$/i,
    /\.internal$/i,
    /\.test$/i,
    /\.arpa$/i
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(normalized)) {
      throw new Error(`Güvenlik politikası gereği bu adrese ( ${normalized} ) analiz yapılamaz.`);
    }
  }
}

export function toFullUrl(normalized) {
  return `https://${normalized}`;
}

/**
 * Executes a full comprehensive scan for the target URL
 */
export async function runFullWebsiteScan(targetUrl) {
  const normalized = normalizeUrl(targetUrl);
  validateUrlForSSRF(normalized);
  let fullUrl = `https://${normalized}`;

  let html = '';
  let responseHeaders = {};
  let isAccessible = true;

  // 1. Initial Page Fetch with 10s Timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(fullUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 KodivaBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    clearTimeout(timeout);

    fullUrl = response.url || fullUrl;
    response.headers.forEach((val, key) => {
      responseHeaders[key.toLowerCase()] = val;
    });

    html = await response.text();
  } catch (err) {
    // If HTTPS failed, attempt HTTP fallback
    try {
      fullUrl = `http://${normalized}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(fullUrl, {
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'KodivaBot/1.0' }
      });
      clearTimeout(timeout);

      response.headers.forEach((val, key) => {
        responseHeaders[key.toLowerCase()] = val;
      });
      html = await response.text();
    } catch (httpErr) {
      isAccessible = false;
      throw new Error(`Siteye erişilemedi (${normalized}). Lütfen alan adını ve internet bağlantısını kontrol edin.`);
    }
  }

  // 2. Parallel Execution of All Category Scanners
  const [perfResult, seoResult, mobileResult, secResult, techResult] = await Promise.allSettled([
    scanPerformance(fullUrl, html, responseHeaders),
    scanSEO(fullUrl, html),
    scanMobile(fullUrl, html),
    scanSecurity(fullUrl, html, responseHeaders),
    scanTech(fullUrl, html, responseHeaders)
  ]);

  const categories = {
    performance: perfResult.status === 'fulfilled' ? perfResult.value : { category: 'performance', score: 50, findings: [] },
    seo: seoResult.status === 'fulfilled' ? seoResult.value : { category: 'seo', score: 50, findings: [] },
    mobile: mobileResult.status === 'fulfilled' ? mobileResult.value : { category: 'mobile', score: 50, findings: [] },
    security: secResult.status === 'fulfilled' ? secResult.value : { category: 'security', score: 50, findings: [] },
    tech: techResult.status === 'fulfilled' ? techResult.value : { category: 'tech', score: 70, findings: [] }
  };

  // 3. Calculate Weighted Overall Health Score (0 - 100)
  // Weights: Performance (30%), SEO (25%), Mobile (20%), Security (15%), Tech (10%)
  const overallScore = Math.round(
    (categories.performance.score * 0.30) +
    (categories.seo.score * 0.25) +
    (categories.mobile.score * 0.20) +
    (categories.security.score * 0.15) +
    (categories.tech.score * 0.10)
  );

  // 4. Aggregate Critical & Warning Counts
  let criticalCount = 0;
  let warningCount = 0;
  let goodCount = 0;

  Object.values(categories).forEach(cat => {
    (cat.findings || []).forEach(f => {
      if (f.status === 'critical') criticalCount++;
      else if (f.status === 'warning') warningCount++;
      else if (f.status === 'good') goodCount++;
    });
  });

  return {
    url: fullUrl,
    normalizedUrl: normalized,
    overallScore: Math.max(0, Math.min(100, overallScore)),
    summary: {
      criticalCount,
      warningCount,
      goodCount,
      totalChecks: criticalCount + warningCount + goodCount
    },
    categories,
    scannedAt: new Date().toISOString()
  };
}
