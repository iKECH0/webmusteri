"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap, Search, ShieldCheck, Smartphone, Globe,
  ArrowRight, CheckCircle2, AlertTriangle, RefreshCw,
  Sparkles, Activity, Lock, BarChart3, Clock, Check
} from 'lucide-react';

const SCAN_STEPS = [
  { label: 'Sunucu Bağlantısı & SSL Güvenliği Kontrol Ediliyor...', icon: Lock },
  { label: 'Google PageSpeed & Core Web Vitals Ölçülüyor...', icon: Zap },
  { label: 'Arama Motoru (SEO) Etiketleri & Hiyerarşi Taranıyor...', icon: Search },
  { label: 'Mobil Uyumluluk & Teknoloji Altyapısı Belirleniyor...', icon: Smartphone }
];

export default function SiteAnalizLandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState('');
  const [recentScans, setRecentScans] = useState([]);

  // Fetch recent scans for social proof
  useEffect(() => {
    fetch('/api/scan')
      .then(res => res.json())
      .then(data => {
        if (data.recentScans) setRecentScans(data.recentScans);
      })
      .catch(() => { });
  }, []);

  // Step simulation during scanning
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < SCAN_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 2400);
    } else {
      setCurrentStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Lütfen analiz edilecek web sitesi adresini girin.');
      return;
    }

    setLoading(true);
    setCurrentStepIndex(0);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), email: email.trim(), phone: phone.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analiz başlatılamadı.');
      }

      // Smooth transition to results page
      setTimeout(() => {
        router.push(`/analiz/${data.scanId}`);
      }, 800);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
      setLoading(false);
    }
  };

  return (
    <div className="analiz-page-container" style={{ minHeight: '100vh', background: '#f7f4ee', color: '#1c1a16', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── TOP NAVBAR ── */}
      <header className="header-container" style={{ borderBottom: '1px solid rgba(20,16,10,0.09)', background: 'rgba(247,244,238,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="header-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#1c1a16', fontWeight: 800, fontSize: 18 }}>
            <img src="/favicon.svg" alt="Kodiva" width="28" height="28" />
            <span>kodiva<span style={{ color: '#6366f1' }}>website</span></span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/" style={{ fontSize: 13, color: '#6b6459', textDecoration: 'none', fontWeight: 600 }}>
              Ana Sayfa
            </Link>
            <a
              href="https://wa.me/905432300157?text=Merhaba,%20web%20sitemi%20analiz%20ettirmek%20istiyorum."
              target="_blank"
              rel="noreferrer"
              style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#4f46e5', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}
            >
              Uzmanla Görüş
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="hero-section" style={{ maxWidth: 900, margin: '0 auto', padding: '70px 24px 40px', textAlign: 'center' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 30, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#4f46e5', fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
          <Sparkles size={15} /> 100+ Noktada Kapsamlı & Ücretsiz Site Sağlık Denetimi
        </div>

        <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 20px', color: '#1c1a16' }}>
          Siteniz Müşteri mi Kazanıyor,<br />
          <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Yoksa Kaybettiriyor mu?
          </span>
        </h1>

        <p className="hero-desc" style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#6b6459', maxWidth: 680, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Google PageSpeed hızından SSL güvenlik açıklarına, SEO hatalarından mobil uyumluluğa kadar sitenizin tüm eksiklerini saniyeler içinde ücretsiz raporlayın.
        </p>

        {/* ── ANALİZ FORMU ── */}
        <div className="form-container" style={{
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 25px 60px -15px rgba(20,16,10,0.18), 0 0 40px rgba(99,102,241,0.08)',
          backdropFilter: 'blur(20px)',
          textAlign: 'left'
        }}>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={17} /> {error}
            </div>
          )}

          {!loading ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1c1a16', marginBottom: 8 }}>
                    Web Sitesi Adresiniz *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: 16, color: '#6b6459' }}>
                      <Globe size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="ornekfirma.com veya https://www.siteniz.com"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        borderRadius: 14,
                        background: 'rgba(20,16,10,0.04)',
                        border: '1px solid rgba(20,16,10,0.12)',
                        color: '#1c1a16',
                        fontSize: 16,
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        minHeight: '44px'
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = 'rgba(20,16,10,0.12)'}
                    />
                  </div>
                </div>

                <div className="form-inputs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6459', marginBottom: 6 }}>
                      E-posta Adresiniz (Opsiyonel)
                    </label>
                    <input
                      type="email"
                      placeholder="rapor@sirketiniz.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: 'rgba(20,16,10,0.03)',
                        border: '1px solid rgba(20,16,10,0.08)',
                        color: '#1c1a16',
                        fontSize: 14,
                        outline: 'none',
                        boxSizing: 'border-box',
                        minHeight: '44px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6459', marginBottom: 6 }}>
                      Telefon Numaranız (Opsiyonel)
                    </label>
                    <input
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: 'rgba(20,16,10,0.03)',
                        border: '1px solid rgba(20,16,10,0.08)',
                        color: '#1c1a16',
                        fontSize: 14,
                        outline: 'none',
                        boxSizing: 'border-box',
                        minHeight: '44px'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '18px 28px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 17,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 10px 30px rgba(99,102,241,0.4)',
                    marginTop: 8,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    minHeight: '44px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Zap size={20} /> Ücretsiz Analizi Başlat 🚀
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 12, color: '#6b6459', marginTop: 6, flexWrap: 'wrap' }}>
                  <span>✓ Kredi Kartı Gerekmez</span>
                  <span>✓ Anında Canlı Rapor</span>
                  <span>✓ Paylaşılabilir Kalıcı Link</span>
                </div>

              </div>
            </form>
          ) : (
            /* ── CANLI TARAMA ANİMASYONU ── */
            <div style={{ padding: '20px 0', textAlign: 'center' }}>

              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 20, animation: 'spin 3s linear infinite' }}>
                <Activity size={32} />
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: '#1c1a16' }}>
                {url} Analiz Ediliyor...
              </h3>
              <p style={{ fontSize: 13, color: '#6b6459', margin: '0 0 28px' }}>
                Lütfen bekleyin, siteniz 5 farklı kategoride taranıyor (ortalama 5-10 saniye).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>
                {SCAN_STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: isCurrent ? 'rgba(99,102,241,0.12)' : isDone ? 'rgba(34,197,94,0.08)' : 'rgba(20,16,10,0.03)',
                        border: isCurrent ? '1px solid #6366f1' : isDone ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(20,16,10,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: isDone ? '#22c55e' : isCurrent ? '#6366f1' : 'rgba(20,16,10,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', flexShrink: 0
                      }}>
                        {isDone ? <Check size={14} /> : <Icon size={14} />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 500, color: isDone ? '#16a34a' : isCurrent ? '#fff' : '#6b6459' }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </section>

      {/* ── SON TARANAN SİTELER (SOCIAL PROOF) ── */}
      {recentScans.length > 0 && (
        <section className="recent-scans-section" style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 50px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b6459', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, textAlign: 'center' }}>
            ⚡ Son Yapılan Site Analizleri
          </div>
          <div className="recent-scans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {recentScans.map(scan => (
              <Link
                key={scan.id}
                href={`/analiz/${scan.id}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(20,16,10,0.03)',
                  border: '1px solid rgba(20,16,10,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  color: '#1c1a16',
                  transition: 'all 0.2s',
                  minHeight: '44px'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(20,16,10,0.08)'; e.currentTarget.style.background = 'rgba(20,16,10,0.03)'; }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                  {scan.normalized_url}
                </span>
                <span style={{
                  padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 800,
                  background: scan.overall_score >= 80 ? 'rgba(34,197,94,0.15)' : scan.overall_score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                  color: scan.overall_score >= 80 ? '#16a34a' : scan.overall_score >= 50 ? '#d97706' : '#dc2626',
                }}>
                  {scan.overall_score}/100
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 3 TEMEL AVANTAJ KARTI ── */}
      <section className="advantages-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, margin: '0 0 40px', color: '#1c1a16' }}>
          Site Analizi İşletmenize Ne Kazandırır?
        </h2>

        <div className="advantages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

          <div style={{ padding: 28, borderRadius: 20, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(20,16,10,0.08)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', marginBottom: 16 }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#1c1a16' }}>Hızlı Siteler %300 Daha Çok Satar</h3>
            <p style={{ fontSize: 14, color: '#6b6459', lineHeight: 1.6, margin: 0 }}>
              Sayfa açılışında 1 saniyelik gecikme dönüşüm oranlarını %7 düşürür. Kodiva analiz motoru Google PageSpeed ile sitenizin gerçek yükleme hızını ölçer.
            </p>
          </div>

          <div style={{ padding: 28, borderRadius: 20, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(20,16,10,0.08)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', marginBottom: 16 }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#1c1a16' }}>Google Arama Sıralamasında Yükselin</h3>
            <p style={{ fontSize: 14, color: '#6b6459', lineHeight: 1.6, margin: 0 }}>
              Eksik meta etiketleri, bozuk H1 başlıkları ve eksik görsel açıklamaları Google'da geriye düşmenize neden olur. Raporumuzda tüm SEO hatalarını görün.
            </p>
          </div>

          <div style={{ padding: 28, borderRadius: 20, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(20,16,10,0.08)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', marginBottom: 16 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px', color: '#1c1a16' }}>Müşteri Güvenini Koruyun</h3>
            <p style={{ fontSize: 14, color: '#6b6459', lineHeight: 1.6, margin: 0 }}>
              SSL sertifikası hataları veya eksik güvenlik başlıkları tarayıcılarda "Güvenli Değil" uyarısına yol açar. Ziyaretçilerinizi kaybetmeyin.
            </p>
          </div>

        </div>
      </section>

      {/* ── SSS & SEO İÇERİĞİ ── */}
      <section className="faq-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div className="faq-container" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(20,16,10,0.08)', borderRadius: 24, padding: '40px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 24px', color: '#1c1a16', textAlign: 'center' }}>Sıkça Sorulan Sorular & Web Sitesi Analizi Nedir?</h2>

          <div style={{ display: 'grid', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>Web sitesi sağlık analizi (Site Audit) nedir?</h3>
              <p style={{ fontSize: 14, color: '#6b6459', lineHeight: 1.6, margin: 0 }}>
                Web sitesi analizi, sitenizin arama motoru optimizasyonu (SEO), mobil uyumluluk, performans (sayfa hızı) ve güvenlik kriterlerini detaylıca tarayan bir teşhis aracıdır. Kodiva analiz motoru 100'den fazla farklı kriteri test ederek sitenizin genel bir sağlık skorunu çıkarır ve hataları listeler.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>Ücretsiz analiz sonucunda PDF rapor alabilir miyim?</h3>
              <p style={{ fontSize: 14, color: '#6b6459', lineHeight: 1.6, margin: 0 }}>
                Evet. Tarama tamamlandıktan sonra sonuç sayfasının sağ üst köşesindeki "PDF İndir" butonuna tıklayarak kapsamlı raporunuzu indirebilir ve yazılım ekibinizle veya yöneticilerinizle paylaşabilirsiniz.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>Web sitemin hızı (PageSpeed) neden bu kadar önemli?</h3>
              <p style={{ fontSize: 14, color: '#6b6459', lineHeight: 1.6, margin: 0 }}>
                Google'ın resmi verilerine göre mobil sayfa açılış hızı 1 saniyeden 3 saniyeye çıktığında, ziyaretçinin siteden çıkma (bounce) ihtimali %32 artmaktadır. Core Web Vitals (Önemli Web Metrikleri) skorlarınız doğrudan Google arama sıralamanızı etkiler.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>Analiz sonrasında çıkan hataları nasıl çözebilirim?</h3>
              <p style={{ fontSize: 14, color: '#6b6459', lineHeight: 1.6, margin: 0 }}>
                Raporunuzda sunulan "Öncelikli Aksiyon Planı" ve yapay zeka tavsiyelerini takip ederek kendi yazılımcınızla ilerleyebilirsiniz. Profesyonel destek almak isterseniz KODİVA uzmanlarından WhatsApp üzerinden anında destek ve fiyat teklifi alabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-container" style={{ borderTop: '1px solid rgba(20,16,10,0.09)', padding: '30px 24px', textAlign: 'center', color: '#6b6459', fontSize: 13 }}>
        <p style={{ margin: '0 0 8px' }}>© {new Date().getFullYear()} Kodiva Web Tasarım Ajansı. Tüm Hakları Saklıdır.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Link href="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>Ana Sayfa</Link>
          <Link href="/gizlilik-politikasi" style={{ color: '#4f46e5', textDecoration: 'none' }}>Gizlilik Politikası</Link>
          <a href="https://wa.me/905432300157" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'none', minHeight: '44px', display: 'flex', alignItems: 'center' }}>WhatsApp Destek</a>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .header-inner {
            padding: 12px 16px !important;
          }
          .hero-section {
            padding: 40px 16px 30px !important;
          }
          .hero-title {
            font-size: clamp(28px, 6vw, 42px) !important;
          }
          .form-container {
            padding: 24px 16px !important;
          }
          .form-inputs-grid {
            grid-template-columns: 1fr !important;
          }
          .recent-scans-section, .advantages-section, .faq-section {
            padding: 30px 16px !important;
          }
          .advantages-grid {
            grid-template-columns: 1fr !important;
          }
          .faq-container {
            padding: 24px 16px !important;
          }
          .footer-container {
            padding: 24px 16px !important;
          }
        }
        @media (max-width: 480px) {
          .hero-title {
            font-size: clamp(24px, 7vw, 32px) !important;
          }
        }
      `}} />
    </div>
  );
}
