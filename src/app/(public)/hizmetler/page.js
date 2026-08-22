"use client";

import Link from 'next/link';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Star, Shield } from 'lucide-react';

const PACKAGES = [
  {
    id: 'starter',
    name: 'Başlangıç Paketi',
    description: 'Küçük işletmeler ve yeni girişimler için ideal profesyonel başlangıç.',
    price: '9.500',
    duration: '1 Yıl Destek',
    shopierUrl: 'https://shopier.com/ornek-link-1', // To be replaced with real link
    features: [
      'Modern, Mobil Uyumlu Tasarım',
      'Temel SEO Optimizasyonu',
      'İletişim Formu ve Harita',
      'Sosyal Medya Entegrasyonu',
      'Ücretsiz SSL Sertifikası',
      '1 Yıl Teknik Destek'
    ]
  },
  {
    id: 'corporate',
    name: 'Kurumsal Paket',
    description: 'Prestijli ve kurumsal bir görünüm arayan köklü firmalar için.',
    price: '18.500',
    duration: '1 Yıl Destek',
    shopierUrl: 'https://shopier.com/ornek-link-2',
    isPopular: true,
    features: [
      'Özel Kurumsal Tasarım',
      'Gelişmiş SEO ve Hız Optimizasyonu',
      'Çoklu Dil Desteği Altyapısı',
      'Blog / Haber Yönetimi',
      'Kurumsal E-posta Hesapları',
      'Google Analytics Entegrasyonu',
      'Öncelikli 1 Yıl Destek'
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Ticaret Paketi',
    description: 'Ürünlerini online satmak isteyen işletmeler için tam kapsamlı çözüm.',
    price: '34.000',
    duration: '1 Yıl Destek',
    shopierUrl: 'https://shopier.com/ornek-link-3',
    features: [
      'Özel E-Ticaret Tasarımı',
      'Sınırsız Ürün Ekleme Altyapısı',
      'Sanal Pos Entegrasyonları (PayTR vb.)',
      'Kargo Takip Sistemi',
      'Gelişmiş Filtreleme ve Arama',
      'Kampanya Yönetimi',
      '7/24 Teknik Destek'
    ]
  }
];

export default function HizmetlerPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── HEADER ── */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: 18 }}>
            <img src="/favicon.svg" alt="Kodiva" width="24" height="24" />
            <span>kodiva</span>
          </Link>

          <nav style={{ display: 'flex', gap: 24, fontSize: 14, fontWeight: 600 }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Ana Sayfa</Link>
            <Link href="/analiz" style={{ color: '#94a3b8', textDecoration: 'none' }}>Site Analiz</Link>
            <Link href="/hizmetler" style={{ color: '#fff', textDecoration: 'none' }}>Hizmetler</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: 'rgba(193, 127, 58, 0.1)', border: '1px solid rgba(193, 127, 58, 0.3)', color: '#c17f3a', fontSize: 12, fontWeight: 700, marginBottom: 24 }}>
          <Star size={14} /> KODİVA PROFESYONEL WEB ÇÖZÜMLERİ
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          İşletmenizi Dijitalde Zirveye Taşıyın
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
          Modern, hızlı ve SEO uyumlu altyapımızla işinize en uygun paketi seçin. Satın alma işlemi sonrası uzman ekibimiz sizinle iletişime geçecek ve süreciniz başlayacaktır.
        </p>
      </section>

      {/* ── PRICING CARDS ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: pkg.isPopular ? '2px solid #c17f3a' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 24,
              padding: 40,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: pkg.isPopular ? '0 20px 40px rgba(193, 127, 58, 0.1)' : 'none'
            }}>
              {pkg.isPopular && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #c17f3a, #b06e2e)',
                  color: '#fff', fontSize: 12, fontWeight: 800, padding: '6px 16px', borderRadius: 20,
                  boxShadow: '0 4px 10px rgba(193, 127, 58, 0.4)'
                }}>
                  EN ÇOK TERCİH EDİLEN
                </div>
              )}

              <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>{pkg.name}</h3>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5, minHeight: 45, margin: '0 0 24px' }}>{pkg.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{pkg.price}</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#cbd5e1' }}>₺</span>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 32 }}>+ KDV / {pkg.duration}</div>

              <a
                href={`/api/shopier/checkout?product=${pkg.id}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '16px', borderRadius: 14,
                  background: pkg.isPopular ? 'linear-gradient(135deg, #c17f3a, #995c21)' : 'rgba(255,255,255,0.05)',
                  color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15,
                  border: pkg.isPopular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s', marginBottom: 32
                }}
              >
                Hemen Başla <ArrowRight size={16} />
              </a>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                {pkg.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <CheckCircle2 size={18} color={pkg.isPopular ? '#c17f3a' : '#6366f1'} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ── INFO SECTION ── */}
      <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.1)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Shield size={20} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>%100 Güvenli Ödeme</h4>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>Ödemeleriniz Shopier güvencesiyle 3D Secure sistemi üzerinden gerçekleşir. Kart bilgileriniz kesinlikle kaydedilmez.</p>
          </div>
          <div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(193, 127, 58, 0.1)', color: '#c17f3a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Zap size={20} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>Hızlı Başlangıç</h4>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>Satın alma işlemi tamamlandıktan hemen sonra proje yöneticimiz sizi arar ve teknik süreçler 24 saat içinde başlatılır.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
        <p style={{ margin: '0 0 8px' }}>© {new Date().getFullYear()} Kodiva Web Tasarım Ajansı. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}
