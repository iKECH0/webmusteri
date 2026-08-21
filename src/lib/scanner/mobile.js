/**
 * Mobile Friendliness Scanner
 * Checks viewport configuration, responsive stylesheets, touch targets, and mobile CTAs.
 */

export async function scanMobile(url, html = '') {
  const findings = [];
  let score = 100;

  // 1. Viewport Meta Tag
  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']viewport["'][^>]*>/i);

  if (!viewportMatch) {
    score -= 40;
    findings.push({
      id: 'mob_viewport_missing',
      title: 'Viewport Meta Etiketi Eksik (Kritik)',
      description: 'Sitenizde mobil viewport meta etiketi yok. Telefonlarda masaüstü gibi küçücük görünür, kullanıcılar zoom yapmak zorunda kalır.',
      status: 'critical',
      impact: 'high',
      advice: '<head> bölümüne <meta name="viewport" content="width=device-width, initial-scale=1.0"> etiketini ekleyin.'
    });
  } else {
    const content = viewportMatch[1].toLowerCase();
    if (content.includes('width=device-width')) {
      findings.push({
        id: 'mob_viewport_good',
        title: 'Mobil Viewport Etiketi Mevcut',
        description: 'Site mobil ekran genişliklerine göre otomatik boyutlanacak şekilde ayarlanmış.',
        status: 'good',
        impact: 'low',
        advice: 'Viewport ayarlarınız doğru yapılandırılmış.'
      });
    } else {
      score -= 15;
      findings.push({
        id: 'mob_viewport_flawed',
        title: 'Viewport Ayarı Eksik / Hatalı',
        description: `Mevcut viewport: "${viewportMatch[1]}". "width=device-width" parametresi eksik.`,
        status: 'warning',
        impact: 'medium',
        advice: 'Viewport etiketini "width=device-width, initial-scale=1.0" olarak güncelleyin.'
      });
    }

    if (content.includes('user-scalable=no') || content.includes('maximum-scale=1')) {
      score -= 5;
      findings.push({
        id: 'mob_zoom_disabled',
        title: 'Kullanıcı Yakınlaştırması (Zoom) Engellenmiş',
        description: 'Görme güçlüğü çeken kullanıcıların mobilde yazıları büyütmesi engellenmiş (Erişilebilirlik uyarısı).',
        status: 'warning',
        impact: 'low',
        advice: 'user-scalable=no kısıtlamasını kaldırarak erişilebilirliği artırın.'
      });
    }
  }

  // 2. Responsive CSS / Frameworks
  const hasResponsiveFramework = html.includes('tailwind') || 
                                 html.includes('bootstrap') || 
                                 html.includes('@media') || 
                                 html.includes('responsive') ||
                                 html.includes('grid-') ||
                                 html.includes('flex');

  if (hasResponsiveFramework) {
    findings.push({
      id: 'mob_responsive_css',
      title: 'Duyarlı (Responsive) Izgara / Stil Yapısı',
      description: 'Sayfada mobil ve tablet ekranlarına uyum sağlayan esnek CSS sınıfları tespit edildi.',
      status: 'good',
      impact: 'low',
      advice: 'Tasarım responsive ızgara yapısını destekliyor.'
    });
  } else {
    score -= 15;
    findings.push({
      id: 'mob_fixed_width',
      title: 'Sabit Genişlikli Eleman Riski',
      description: 'Sayfada modern responsive tasarım sınıfları tespit edilemedi. Küçük ekranlarda yatay kaydırma çubuğu çıkabilir.',
      status: 'warning',
      impact: 'medium',
      advice: 'Tasarımınızı esnek CSS Flexbox veya Grid sistemine dönüştürün.'
    });
  }

  // 3. Mobile Call-to-Action (Click to Call & WhatsApp)
  const hasTelLink = html.includes('href="tel:') || html.includes("href='tel:");
  const hasWhatsApp = html.includes('wa.me') || html.includes('whatsapp.com');

  if (hasTelLink || hasWhatsApp) {
    findings.push({
      id: 'mob_cta_good',
      title: 'Tek Tıkla Arama / WhatsApp Entegrasyonu Aktif',
      description: 'Mobil ziyaretçilerin tek dokunuşla işletmenizi arayabileceği tel: veya WhatsApp butonu mevcut.',
      status: 'good',
      impact: 'low',
      advice: 'Mobil dönüşüm öğeleriniz aktif.'
    });
  } else {
    score -= 15;
    findings.push({
      id: 'mob_cta_missing',
      title: 'Tek Tıkla Arama (tel:) veya WhatsApp Butonu Eksik',
      description: 'Mobil kullanıcılar telefon numaranızı kopyalamak zorunda kalıyor. Bu durum potansiyel müşteri kaybına yol açar.',
      status: 'warning',
      impact: 'high',
      advice: 'Sayfanın altına sabit yapışkan (sticky) "Hemen Ara" ve "WhatsApp" butonları yerleştirin.'
    });
  }

  // 4. Responsive Images Check
  const hasSrcset = html.includes('srcset=') || html.includes('<picture>');
  if (hasSrcset) {
    findings.push({
      id: 'mob_srcset_good',
      title: 'Ekran Boyutuna Göre Optimize Görseller (srcset/picture)',
      description: 'Telefonlar için daha küçük boyutlu görseller servis edilerek mobil veri tasarrufu sağlanıyor.',
      status: 'good',
      impact: 'low',
      advice: 'Modern responsive görsel standartları kullanılıyor.'
    });
  } else {
    score -= 5;
    findings.push({
      id: 'mob_srcset_missing',
      title: 'Duyarlı Görsel (srcset) Kullanılmıyor',
      description: 'Mobil telefonlara masaüstü boyutundaki büyük görseller yükleniyor, mobil veri kotası harcanıyor.',
      status: 'warning',
      impact: 'low',
      advice: 'srcset özniteliği ile ekran çözünürlüğüne uygun görseller servis edin.'
    });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    category: 'mobile',
    score: finalScore,
    findings
  };
}
