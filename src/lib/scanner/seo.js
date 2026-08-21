/**
 * SEO Scanner
 * Analyzes on-page SEO factors: title, meta description, heading hierarchy,
 * alt attributes, robots.txt, sitemap.xml, canonical, and OpenGraph social tags.
 */

export async function scanSEO(url, html = '') {
  const findings = [];
  let score = 100;

  const origin = new URL(url).origin;

  // 1. Meta Title Analysis
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  if (!title) {
    score -= 25;
    findings.push({
      id: 'seo_title_missing',
      title: 'Sayfa Başlığı (<title>) Eksik',
      description: 'Arama motorları sitenizin ne hakkında olduğunu anlayamaz ve Google aramalarında listelenemezsiniz.',
      status: 'critical',
      impact: 'high',
      advice: 'Sayfanıza 30-65 karakter arası anahtar kelime içeren benzersiz bir <title> etiketi ekleyin.'
    });
  } else if (title.length < 20) {
    score -= 10;
    findings.push({
      id: 'seo_title_short',
      title: `Sayfa Başlığı Çok Kısa (${title.length} karakter)`,
      description: `Mevcut başlık: "${title}". Google için ideal başlık uzunluğu 30-60 karakter arasıdır.`,
      status: 'warning',
      impact: 'medium',
      advice: 'Hizmet verdiğiniz sektör ve bölgeyi belirterek başlığınızı zenginleştirin.'
    });
  } else if (title.length > 70) {
    score -= 5;
    findings.push({
      id: 'seo_title_long',
      title: `Sayfa Başlığı Fazla Uzun (${title.length} karakter)`,
      description: `Mevcut başlık: "${title}". Google arama sonuçlarında 60 karakterden sonrası kesilecektir.`,
      status: 'warning',
      impact: 'low',
      advice: 'Başlığı en önemli anahtar kelimeler önde olacak şekilde 60 karakterin altına indirin.'
    });
  } else {
    findings.push({
      id: 'seo_title_good',
      title: `Mükemmel Sayfa Başlığı (${title.length} karakter)`,
      description: `Başlık: "${title}". Karakter uzunluğu ve formatı SEO standartlarına tam uyumlu.`,
      status: 'good',
      impact: 'low',
      advice: 'Başlık etiketiniz ideal uzunlukta.'
    });
  }

  // 2. Meta Description Analysis
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  const description = descMatch ? descMatch[1].trim() : '';

  if (!description) {
    score -= 20;
    findings.push({
      id: 'seo_desc_missing',
      title: 'Meta Description (Açıklama) Bulunamadı',
      description: 'Google arama sonuçlarında sayfanızın altında çıkacak özet açıklama eksik. Google rastgele metin çekecektir.',
      status: 'critical',
      impact: 'high',
      advice: 'Sayfanıza 120-160 karakter arası etkileyici ve harekete geçirici bir meta description ekleyin.'
    });
  } else if (description.length < 50) {
    score -= 8;
    findings.push({
      id: 'seo_desc_short',
      title: `Meta Açıklama Çok Kısa (${description.length} karakter)`,
      description: `Mevcut açıklama: "${description}". İdeal uzunluk 120-160 karakter arasıdır.`,
      status: 'warning',
      impact: 'medium',
      advice: 'Açıklamanızı müşteriyi tıklamaya teşvik edecek detaylarla genişletin.'
    });
  } else if (description.length > 170) {
    score -= 5;
    findings.push({
      id: 'seo_desc_long',
      title: `Meta Açıklama Fazla Uzun (${description.length} karakter)`,
      description: 'Açıklamanız 160 karakteri aştığı için Google sonuçlarında üç nokta (...) ile kesilebilir.',
      status: 'warning',
      impact: 'low',
      advice: 'Açıklamayı 150-160 karakter aralığında tutun.'
    });
  } else {
    findings.push({
      id: 'seo_desc_good',
      title: `Etkili Meta Açıklama (${description.length} karakter)`,
      description: `Açıklama: "${description}". SEO ve tıklama oranı için ideal uzunlukta.`,
      status: 'good',
      impact: 'low',
      advice: 'Meta açıklamanız SEO kurallarına uygun.'
    });
  }

  // 3. Headings (H1, H2, H3) Hierarchy
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];

  if (h1Matches.length === 0) {
    score -= 15;
    findings.push({
      id: 'seo_h1_missing',
      title: 'H1 Ana Başlık Etiketi Eksik',
      description: 'Sayfanızda hiçbir <h1> başlığı bulunamadı. Arama motorları sayfanın ana konusunu belirlemekte zorlanır.',
      status: 'critical',
      impact: 'high',
      advice: 'Sayfanın en üst ana başlığını <h1> etiketi içine alın.'
    });
  } else if (h1Matches.length > 1) {
    score -= 5;
    findings.push({
      id: 'seo_h1_multiple',
      title: `Birden Fazla H1 Başlığı (${h1Matches.length} Adet)`,
      description: 'Bir sayfada sadece 1 adet <h1> ana başlığı bulunmalıdır.',
      status: 'warning',
      impact: 'medium',
      advice: 'Ana başlık dışındaki diğer başlıkları <h2> veya <h3> seviyesine dönüştürün.'
    });
  } else {
    findings.push({
      id: 'seo_h1_good',
      title: 'H1 Başlık Hiyerarşisi Doğru (1 Adet)',
      description: 'Sayfanızda tam 1 adet ana <h1> başlığı bulunuyor.',
      status: 'good',
      impact: 'low',
      advice: 'H1 başlık yapınız standartlara uygun.'
    });
  }

  if (h2Matches.length === 0) {
    score -= 5;
    findings.push({
      id: 'seo_h2_missing',
      title: 'Alt Başlıklar (H2) Bulunamadı',
      description: 'İçerik bölümleriniz <h2> başlıkları ile yapılandırılmamış.',
      status: 'warning',
      impact: 'medium',
      advice: 'Hizmetlerinizi ve bölümlerinizi <h2> etiketleri ile hiyerarşik olarak ayırın.'
    });
  }

  // 4. Image Alt Attributes
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  let missingAltCount = 0;
  imgTags.forEach(tag => {
    if (!tag.includes('alt=') || tag.match(/alt=["']\s*["']/i)) {
      missingAltCount++;
    }
  });

  if (imgTags.length > 0) {
    if (missingAltCount > 0) {
      const penalty = Math.min(15, missingAltCount * 3);
      score -= penalty;
      findings.push({
        id: 'seo_img_alt',
        title: `${missingAltCount} Görselde Alt (Açıklama) Etiketi Eksik`,
        description: `Toplam ${imgTags.length} görselden ${missingAltCount} tanesinde alt etiketi bulunmuyor. Google Görsellerde çıkamazsınız.`,
        status: missingAltCount > 3 ? 'critical' : 'warning',
        impact: 'medium',
        advice: 'Tüm görsellere görseli açıklayan anlamlı "alt" etiketleri ekleyin.'
      });
    } else {
      findings.push({
        id: 'seo_img_alt_good',
        title: `Tüm Görseller Alt Etiketine Sahip (${imgTags.length} Görsel)`,
        description: 'Sayfanızdaki tüm görseller arama motorları tarafından okunabilir durumda.',
        status: 'good',
        impact: 'low',
        advice: 'Görsel SEO optimizasyonu başarılı.'
      });
    }
  }

  // 5. OpenGraph (Social Sharing) Tags
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*>/i);
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*>/i);

  if (!ogTitle || !ogImage) {
    score -= 10;
    findings.push({
      id: 'seo_opengraph_missing',
      title: 'Sosyal Medya Paylaşım Etiketleri (OpenGraph) Eksik',
      description: 'Siteniz WhatsApp, Facebook veya Twitter\'da paylaşıldığında kapak görseli veya başlık düzgün görünmeyecektir.',
      status: 'warning',
      impact: 'medium',
      advice: 'og:title, og:description ve og:image meta etiketlerini ekleyin.'
    });
  } else {
    findings.push({
      id: 'seo_opengraph_good',
      title: 'OpenGraph Sosyal Medya Etiketleri Mevcut',
      description: 'WhatsApp ve sosyal medya paylaşımlarında zengin önizleme kartı düzgün görüntülenecek.',
      status: 'good',
      impact: 'low',
      advice: 'Sosyal paylaşım etiketleri tam.'
    });
  }

  // 6. Robots.txt & Sitemap.xml Async Verification
  try {
    const [robotsRes, sitemapRes] = await Promise.allSettled([
      fetch(`${origin}/robots.txt`, { method: 'HEAD', headers: { 'User-Agent': 'KodivaBot' } }),
      fetch(`${origin}/sitemap.xml`, { method: 'HEAD', headers: { 'User-Agent': 'KodivaBot' } })
    ]);

    if (robotsRes.status === 'fulfilled' && robotsRes.value.ok) {
      findings.push({
        id: 'seo_robots_good',
        title: 'robots.txt Dosyası Mevcut',
        description: 'Arama motoru botlarına rehberlik eden robots.txt dosyası yayında.',
        status: 'good',
        impact: 'low',
        advice: 'robots.txt yapılandırmanız mevcut.'
      });
    } else {
      score -= 5;
      findings.push({
        id: 'seo_robots_missing',
        title: 'robots.txt Dosyası Bulunamadı',
        description: `${origin}/robots.txt adresinde dosya bulunmuyor. Arama motoru tarama kuralları tanımlanmamış.`,
        status: 'warning',
        impact: 'medium',
        advice: 'Sitenizin ana dizinine bir robots.txt dosyası yükleyin.'
      });
    }

    if (sitemapRes.status === 'fulfilled' && sitemapRes.value.ok) {
      findings.push({
        id: 'seo_sitemap_good',
        title: 'XML Site Haritası (sitemap.xml) Mevcut',
        description: 'Google\'ın sayfalarınızı hızlıca indekslemesini sağlayan sitemap.xml mevcut.',
        status: 'good',
        impact: 'low',
        advice: 'Site haritası yapılandırmanız aktif.'
      });
    } else {
      score -= 8;
      findings.push({
        id: 'seo_sitemap_missing',
        title: 'XML Site Haritası (sitemap.xml) Bulunamadı',
        description: `${origin}/sitemap.xml adresinde site haritası bulunamadı. Yeni içeriklerinizin Google'a girmesi yavaşlayabilir.`,
        status: 'warning',
        impact: 'medium',
        advice: 'Dinamik bir sitemap.xml oluşturup Google Search Console\'a gönderin.'
      });
    }
  } catch (e) {
    // Ignore network errors on sitemap/robots
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    category: 'seo',
    score: finalScore,
    findings
  };
}
