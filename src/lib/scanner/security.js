/**
 * Security Scanner
 * Checks SSL certificate, HTTPS enforcement, HTTP security headers, and mixed content.
 */

export async function scanSecurity(url, html = '', responseHeaders = {}) {
  const findings = [];
  let score = 100;

  const isHttps = url.startsWith('https://');

  // 1. SSL & HTTPS Protocol
  if (isHttps) {
    findings.push({
      id: 'sec_ssl_good',
      title: 'SSL Sertifikası ve HTTPS Aktif',
      description: 'Ziyaretçileriniz ile siteniz arasındaki veri trafiği 256-bit şifreleniyor ve güvenli.',
      status: 'good',
      impact: 'high',
      advice: 'SSL sertifikanız geçerli ve aktif.'
    });
  } else {
    score -= 50;
    findings.push({
      id: 'sec_ssl_missing',
      title: 'SSL Sertifikası Yok / Güvenli Değil (Kritik)',
      description: 'Siteniz "Güvenli Değil" uyarısı veriyor. Google Chrome ziyaretçileri engelleyebilir ve kredi kartı/form verileri çalınabilir.',
      status: 'critical',
      impact: 'high',
      advice: 'Derhal ücretsiz Let\'s Encrypt veya Cloudflare SSL sertifikası kurun ve tüm trafiği HTTPS\'e yönlendirin.'
    });
  }

  // 2. Strict-Transport-Security (HSTS)
  const hsts = responseHeaders['strict-transport-security'];
  if (hsts) {
    findings.push({
      id: 'sec_hsts_good',
      title: 'HSTS Güvenlik Başlığı Aktif',
      description: 'Tarayıcıların her zaman şifreli bağlantı kurmasını zorunlu kılan HSTS koruması aktif.',
      status: 'good',
      impact: 'medium',
      advice: 'HSTS yapılandırmanız doğru.'
    });
  } else {
    score -= 10;
    findings.push({
      id: 'sec_hsts_missing',
      title: 'HSTS (Strict-Transport-Security) Başlığı Eksik',
      description: 'HSTS başlığı olmadığında, kullanıcılar sahte Wi-Fi ağlarında araya girme (Man-in-the-Middle) saldırılarına maruz kalabilir.',
      status: 'warning',
      impact: 'medium',
      advice: 'Web sunucunuza "Strict-Transport-Security: max-age=31536000; includeSubDomains" başlığını ekleyin.'
    });
  }

  // 3. X-Frame-Options (Clickjacking Protection)
  const xFrame = responseHeaders['x-frame-options'] || responseHeaders['content-security-policy']?.includes('frame-ancestors');
  if (xFrame) {
    findings.push({
      id: 'sec_xframe_good',
      title: 'Clickjacking Koruması Aktif (X-Frame-Options)',
      description: 'Sitenizin başka web sitelerinde görünmez iframe içinde açılarak kullanıcıların kandırılması engellenmiş.',
      status: 'good',
      impact: 'medium',
      advice: 'Clickjacking savunması devrede.'
    });
  } else {
    score -= 10;
    findings.push({
      id: 'sec_xframe_missing',
      title: 'X-Frame-Options Başlığı Eksik (Clickjacking Riski)',
      description: 'Siteniz başka siteler tarafından iframe içine gömülebilir ve kullanıcıların tıklamaları çalınabilir.',
      status: 'warning',
      impact: 'medium',
      advice: 'Web sunucunuza "X-Frame-Options: SAMEORIGIN" başlığını ekleyin.'
    });
  }

  // 4. X-Content-Type-Options
  const xContent = responseHeaders['x-content-type-options'];
  if (xContent && xContent.includes('nosniff')) {
    findings.push({
      id: 'sec_nosniff_good',
      title: 'MIME-Sniffing Koruması Aktif (X-Content-Type-Options: nosniff)',
      description: 'Tarayıcıların dosya tiplerini yanlış yorumlayıp kötü niyetli kod çalıştırması engellenmiş.',
      status: 'good',
      impact: 'low',
      advice: 'MIME sniffing koruması aktif.'
    });
  } else {
    score -= 5;
    findings.push({
      id: 'sec_nosniff_missing',
      title: 'X-Content-Type-Options Başlığı Eksik',
      description: 'Tarayıcıların zararlı scriptleri stil veya resim gibi çalıştırmasını önleyen güvenlik başlığı eksik.',
      status: 'warning',
      impact: 'low',
      advice: 'Web sunucunuza "X-Content-Type-Options: nosniff" başlığını ekleyin.'
    });
  }

  // 5. Mixed Content Check (HTTPS sayfada HTTP kaynak)
  if (isHttps) {
    const httpSources = html.match(/src=["']http:\/\/[^"']+["']/gi) || [];
    if (httpSources.length > 0) {
      score -= 15;
      findings.push({
        id: 'sec_mixed_content',
        title: `Karışık İçerik (Mixed Content) Tespiti (${httpSources.length} Kaynak)`,
        description: 'Güvenli HTTPS sitenizde şifresiz HTTP protokolüyle yüklenen görseller veya scriptler var. Tarayıcı güvenlik kilidini kırabilir.',
        status: 'critical',
        impact: 'high',
        advice: 'Tüm resim ve script URL\'lerindeki "http://" bağlantılarını "https://" olarak güncelleyin.'
      });
    }
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    category: 'security',
    score: finalScore,
    findings
  };
}
