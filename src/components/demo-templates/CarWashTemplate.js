"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, MapPin, ChevronRight, Star, Shield, Clock, Zap, Check, MessageCircle } from 'lucide-react';
import DemoFloatingBar from './DemoFloatingBar';
import DemoCursor from './DemoCursor';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target, duration, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

export default function CarWashTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const rawPhone = (phone || '').replace(/\D/g, '');
  const waPhone = rawPhone.startsWith('90') ? rawPhone : '90' + rawPhone;
  const waMsg = encodeURIComponent(`Merhaba, ${businessName} hakkında bilgi almak istiyorum.`);
  const waUrl = `https://wa.me/${waPhone}?text=${waMsg}`;

  const [statsRef, statsInView] = useInView(0.3);
  const [servicesRef, servicesInView] = useInView(0.1);
  const [whyRef, whyInView] = useInView(0.1);
  const [reviewRef, reviewInView] = useInView(0.1);
  const [scrolled, setScrolled] = useState(false);

  const customers = useCountUp(1840, 2000, statsInView);
  const satisfaction = useCountUp(99, 1600, statsInView);
  const projects = useCountUp(12, 1400, statsInView);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const services = [
    {
      title: 'Exterior Detailing',
      subtitle: 'Dış Yüzey & Boya Koruma',
      desc: 'İki aşamalı köpük sistemi, kil çubuğu ve kalıcı polimer mühürle boya yüzeyini koruyoruz.',
      price: 'Başlangıç 250 ₺',
      features: ['Aktif köpük yıkama', 'Kil çubuğu temizliği', 'Polimer mühürleme', 'Lastik & jant bakımı'],
    },
    {
      title: 'Interior Detailing',
      subtitle: 'İç Mekan & Döşeme Bakımı',
      desc: 'Deri, tekstil ve plastik yüzeylere özel ürünlerle kapsamlı iç mekan restorasyonu.',
      price: 'Başlangıç 400 ₺',
      features: ['Derin aspiratör', 'Deri kondisyonlama', 'Plastik yenileme', 'Ozon koku giderme'],
    },
    {
      title: 'Ceramic Coating',
      subtitle: 'Nano Seramik Kaplama',
      desc: '9H sertliğinde nano seramik kaplama ile 3 yıla kadar fabrika çıkışı parlaklık ve UV koruması.',
      price: 'Başlangıç 3.500 ₺',
      features: ['9H sertlik', '3 yıl garanti', 'UV koruması', 'Hidrofobik yüzey'],
    },
    {
      title: 'Full Detailing',
      subtitle: 'Komple Paket',
      desc: 'Dış yıkama, iç temizlik, motor yıkama ve boya cilası tek seferde, garantili sonuç.',
      price: 'Başlangıç 1.200 ₺',
      features: ['Tüm hizmetler dahil', 'Motor yıkama', 'Boya cilası', 'Teslimat garantisi'],
    },
  ];

  const stats = [
    { value: customers, suffix: '+', label: 'Memnun Araç Sahibi' },
    { value: satisfaction, suffix: '%', label: 'Müşteri Memnuniyeti' },
    { value: projects, suffix: '+', label: 'Yıllık Deneyim' },
  ];

  const reviews = [
    { name: 'Sercan A.', title: 'BMW 5 Serisi Sahibi', text: 'Seramik kaplama sonucu inanılmaz. Üç aydır yağmur altında yıkamadım, hâlâ ayna gibi. Ekip gerçekten profesyonel.', rating: 5 },
    { name: 'Merve T.', title: 'Range Rover Sahibi', text: 'Interior detailing\'den sonra arabam sıfır gibiydi. Deri koltuklar yenilenmiş gibi oldu. Fiyat/kalite dengesi mükemmel.', rating: 5 },
    { name: 'Burak Ö.', title: 'Mercedes C180 Sahibi', text: 'Full detailing paketi aldım. Motor dahil tertemiz, boya cilası da çok başarılı oldu. Kesinlikle tavsiye ederim.', rating: 5 },
  ];

  return (
    <div style={{ background: '#080c14', color: '#e8edf5', fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif', overflowX: 'hidden' }}>
      <DemoCursor color="#38bdf8" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(56,189,248,0.25); }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes borderPulse {
          0%,100% { border-color: rgba(56,189,248,0.2); }
          50%      { border-color: rgba(56,189,248,0.5); }
        }
        @keyframes gradientMove {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .nav-item { color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-item:hover { color: #e8edf5; }

        .btn-primary {
          background: #0ea5e9;
          color: #fff;
          border: none;
          padding: 13px 28px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          letter-spacing: -0.2px;
        }
        .btn-primary:hover {
          background: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(14,165,233,0.35);
        }

        .btn-secondary {
          background: transparent;
          color: #e8edf5;
          border: 1px solid rgba(255,255,255,0.12);
          padding: 13px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.04);
          transform: translateY(-1px);
        }

        .service-card {
          background: #0d1220;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 32px;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          cursor: default;
        }
        .service-card:hover {
          border-color: rgba(56,189,248,0.25);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(56,189,248,0.08);
        }

        .review-card {
          background: #0d1220;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 28px;
          transition: border-color 0.3s, transform 0.3s;
        }
        .review-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }

        .why-item {
          display: flex;
          gap: 18px;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
          transition: border-color 0.25s, background 0.25s;
        }
        .why-item:hover {
          border-color: rgba(56,189,248,0.15);
          background: rgba(56,189,248,0.03);
        }
      `}</style>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0 32px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,12,20,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 2c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7zm-1 3v4l3 3-1.4 1.4L9 13.4V8h2z" fill="white"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>{businessName}</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#services" className="nav-item">Hizmetler</a>
          <a href="#why" className="nav-item">Hakkımızda</a>
          <a href="#reviews" className="nav-item">Referanslar</a>
          <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
            Randevu Al
          </a>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ 
        position: 'relative', minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        padding: '80px 32px',
        overflow: 'hidden',
      }}>
        {/* Background mesh */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div style={{
            position: 'absolute', width: 800, height: 800,
            top: -200, right: -200,
            background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.07) 0%, transparent 65%)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', width: 600, height: 600,
            bottom: -100, left: -100,
            background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.04) 0%, transparent 65%)',
            borderRadius: '50%',
          }} />
          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, #080c14 100%)',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          
          {/* Left — copy */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(14,165,233,0.08)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: 999, padding: '6px 14px',
              marginBottom: 28,
              animation: 'heroFadeUp 0.7s ease both',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7dd3fc', letterSpacing: 0.3 }}>{rating} puan · {reviewCount} değerlendirme</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 4.5vw, 58px)',
              fontWeight: 900, lineHeight: 1.1,
              letterSpacing: '-2px', marginBottom: 24,
              animation: 'heroFadeUp 0.7s 0.1s ease both',
            }}>
              Aracınız İçin<br />
              <span style={{
                background: 'linear-gradient(90deg, #38bdf8, #0ea5e9, #7dd3fc)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientMove 4s linear infinite',
              }}>Profesyonel</span>
              <br />Detailing
            </h1>

            <p style={{
              fontSize: 17, color: '#64748b', lineHeight: 1.7,
              maxWidth: 440, marginBottom: 40,
              animation: 'heroFadeUp 0.7s 0.2s ease both',
            }}>
              Yılların deneyimi ve uzman ekibimizle aracınıza gerçek değerini veriyoruz. Seramik kaplamadan interior detailing'e premium çözümler.
            </p>

            <div style={{ display: 'flex', gap: 12, animation: 'heroFadeUp 0.7s 0.3s ease both' }}>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle size={16} /> WhatsApp ile Randevu
              </a>
              {phone && (
                <a href={`tel:${phone}`} className="btn-secondary">
                  <Phone size={16} /> {phone}
                </a>
              )}
            </div>

            {address && (
              <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13, animation: 'heroFadeUp 0.7s 0.4s ease both' }}>
                <MapPin size={14} style={{ flexShrink: 0 }} />
                <span>{address}</span>
              </div>
            )}
          </div>

          {/* Right — visual */}
          <div style={{ position: 'relative', animation: 'heroFadeUp 0.9s 0.2s ease both' }}>
            {/* Main card */}
            <div style={{
              background: '#0d1220',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
            }}>
              {/* Top bar */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ marginLeft: 8, fontSize: 12, color: '#475569' }}>{businessName} · Premium Detailing Studio</span>
              </div>

              {/* Car visual */}
              <div style={{
                height: 200,
                background: 'linear-gradient(135deg, #0a1628 0%, #0e1f35 50%, #0a1628 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', width: 300, height: 300, background: 'radial-gradient(circle, rgba(14,165,233,0.12), transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                <svg width="200" height="100" viewBox="0 0 200 100" fill="none">
                  <path d="M10 70 L30 40 L60 30 L140 30 L170 40 L190 70 L10 70Z" fill="rgba(14,165,233,0.08)" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5"/>
                  <path d="M40 40 L55 25 L145 25 L160 40" fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="1"/>
                  <circle cx="45" cy="75" r="15" fill="#0d1220" stroke="rgba(56,189,248,0.4)" strokeWidth="2"/>
                  <circle cx="45" cy="75" r="8" fill="rgba(56,189,248,0.15)" stroke="rgba(56,189,248,0.3)" strokeWidth="1"/>
                  <circle cx="155" cy="75" r="15" fill="#0d1220" stroke="rgba(56,189,248,0.4)" strokeWidth="2"/>
                  <circle cx="155" cy="75" r="8" fill="rgba(56,189,248,0.15)" stroke="rgba(56,189,248,0.3)" strokeWidth="1"/>
                  <path d="M190 70 L10 70" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                </svg>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { label: 'Hizmet', val: 'Premium' },
                  { label: 'Garanti', val: 'Var' },
                  { label: 'Teslimat', val: 'Zamanında' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '18px 16px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ fontSize: 11, color: '#475569', fontWeight: 500, letterSpacing: 0.5 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, color: '#38bdf8' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: 'absolute', top: -16, right: -16,
              background: '#0ea5e9',
              borderRadius: 12, padding: '12px 16px',
              boxShadow: '0 8px 24px rgba(14,165,233,0.4)',
              animation: 'borderPulse 3s ease-in-out infinite',
              border: '1px solid rgba(56,189,248,0.4)',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{rating}</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="#fff" stroke="none" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div ref={statsRef} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '48px 32px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              opacity: statsInView ? 1 : 0,
              transition: `opacity 0.6s ${i * 0.15}s ease`,
            }}>
              <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px', color: '#f1f5f9', lineHeight: 1 }}>
                {statsInView ? s.value.toLocaleString('tr-TR') : '0'}{s.suffix}
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '96px 32px', maxWidth: 1100, margin: '0 auto' }} ref={servicesRef}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>Hizmetlerimiz</div>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Her aracın ihtiyacına göre<br />özel paket seçenekleri
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {services.map((s, i) => (
            <div key={i} className="service-card" style={{
              opacity: servicesInView ? 1 : 0,
              transform: servicesInView ? 'translateY(0)' : 'translateY(32px)',
              transition: `opacity 0.6s ${i * 0.1}s ease, transform 0.6s ${i * 0.1}s cubic-bezier(0.2, 0, 0, 1)`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>{s.subtitle}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, marginBottom: 24 }}>{s.desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
                {s.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
                    <Check size={13} style={{ color: '#38bdf8', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{s.price}</span>
                <a href={waUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#38bdf8', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Bilgi Al <ChevronRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY ── */}
      <section id="why" style={{ padding: '96px 32px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} ref={whyRef}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>Neden Biz</div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 24 }}>
              Sonuçta fark yaratan<br />detaylar belirler
            </h2>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, marginBottom: 40 }}>
              {businessName} olarak her araçla ayrı ayrı ilgileniyoruz. Seri üretim değil, her biri ayrı özen gerektiren işler yapıyoruz.
            </p>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle size={16} /> Ücretsiz Konsültasyon
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} >
            {[
              { icon: <Shield size={20} style={{ color: '#38bdf8' }} />, title: 'Kalite Garantisi', desc: 'Her hizmetimiz için yazılı memnuniyet garantisi veriyoruz. Sonuçtan memnun kalmazsanız yeniden yaparız.' },
              { icon: <Clock size={20} style={{ color: '#38bdf8' }} />, title: 'Randevu Sistemı', desc: 'Belirlenen saate tam uyum. Bekleme yoktur, zamanınıza saygı gösteririz.' },
              { icon: <Zap size={20} style={{ color: '#38bdf8' }} />, title: 'Uzman Ekip', desc: 'Alanında sertifikalı ve yıllarca deneyim kazanmış teknisyenlerimizle çalışıyoruz.' },
              { icon: <Star size={20} style={{ color: '#38bdf8' }} />, title: 'Premium Ürünler', desc: 'Sadece profesyonel marka ürünler. Ucuz kimyasallardan uzak duruyoruz.' },
            ].map((w, i) => (
              <div key={i} className="why-item" style={{
                opacity: whyInView ? 1 : 0,
                transform: whyInView ? 'translateX(0)' : 'translateX(24px)',
                transition: `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s ease`,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(56,189,248,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {w.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{w.title}</div>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" style={{ padding: '96px 32px', maxWidth: 1100, margin: '0 auto' }} ref={reviewRef}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>Müşteri Referansları</div>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, letterSpacing: '-1.5px' }}>
            Müşterilerimiz ne diyor?
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {reviews.map((r, i) => (
            <div key={i} className="review-card" style={{
              opacity: reviewInView ? 1 : 0,
              transform: reviewInView ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.55s ${i * 0.12}s ease, transform 0.55s ${i * 0.12}s ease`,
            }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[...Array(r.rating)].map((_, j) => <Star key={j} size={14} fill="#fbbf24" stroke="none" />)}
              </div>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                  {r.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{r.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '96px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
            Aracınız için<br />
            <span style={{
              background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>hemen randevu alın</span>
          </h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, marginBottom: 40 }}>
            Aynı gün veya ertesi gün randevu imkânı. WhatsApp'tan ulaşın, size en uygun zamanı birlikte belirleyelim.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '15px 32px', fontSize: 15 }}>
              <MessageCircle size={18} /> WhatsApp ile Yaz
            </a>
            {phone && (
              <a href={`tel:${phone}`} className="btn-secondary" style={{ padding: '15px 28px', fontSize: 15 }}>
                <Phone size={18} /> {phone}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{businessName}</div>
        {address && <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} />{address}</div>}
        <div style={{ fontSize: 12, color: '#334155' }}>Kodiva Ajans tarafından tasarlandı</div>
      </footer>

      <DemoFloatingBar businessName={businessName} phone={phone} refCode={refCode} />
    </div>
  );
}
