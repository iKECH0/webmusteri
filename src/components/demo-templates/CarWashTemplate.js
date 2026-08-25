"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Phone, MapPin, ChevronRight, Star, Shield, Clock, Zap, Check,
  MessageCircle, Menu, X, Camera, ArrowRight
} from 'lucide-react';
import DemoFloatingBar from './DemoFloatingBar';
import DemoCursor from './DemoCursor';

/* ----------------------------- Hooks ----------------------------- */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { threshold });
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

/* ------------------- Before/After Slider Component ------------------- */
function BeforeAfterSlider({ beforeImg, afterImg, beforeLabel = 'ÖNCE', afterLabel = 'SONRA' }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updateFromEvent = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPos(pct);
  }, []);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updateFromEvent(e);
  };
  const handleMouseMove = (e) => {
    if (isDragging.current) updateFromEvent(e);
  };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleTouchStart = (e) => { isDragging.current = true; updateFromEvent(e); };
  const handleTouchMove = (e) => { if (isDragging.current) updateFromEvent(e); };
  const handleTouchEnd = () => { isDragging.current = false; };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preventDefault = (e) => { if (isDragging.current) e.preventDefault(); };
    el.addEventListener('touchmove', preventDefault, { passive: false });
    return () => el.removeEventListener('touchmove', preventDefault);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        overflow: 'hidden',
        borderRadius: '16px',
        cursor: 'ew-resize',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Before image (bottom) */}
      <img
        src={beforeImg}
        alt="Before"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        draggable={false}
      />
      {/* After image (top, clipped) */}
      <img
        src={afterImg}
        alt="After"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          clipPath: `inset(0 ${100 - pos}% 0 0)`,
          pointerEvents: 'none',
        }}
        draggable={false}
      />
      {/* Divider line */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${pos}%`,
        width: '2px',
        background: '#fff',
        transform: 'translateX(-50%)',
        zIndex: 2,
      }} />
      {/* Handle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: `${pos}%`,
        transform: 'translate(-50%, -50%)',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: '#0ea5e9',
        border: '3px solid #fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        color: '#fff',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 7l5 5-5 5" />
          <path d="M13 7l5 5-5 5" />
        </svg>
      </div>
      {/* Labels */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 2, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '6px', color: '#fff', fontSize: 12, fontWeight: 700 }}>
        {beforeLabel}
      </div>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 2, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '6px', color: '#fff', fontSize: 12, fontWeight: 700 }}>
        {afterLabel}
      </div>
    </div>
  );
}

/* ---------------------------- Main Component ---------------------------- */
export default function CarWashTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const rawPhone = (phone || '').replace(/\D/g, '');
  const waPhone = rawPhone.startsWith('90') ? rawPhone : '90' + rawPhone;
  const waMsg = encodeURIComponent(`Merhaba, ${businessName} hakkında bilgi almak istiyorum.`);
  const waUrl = `https://wa.me/${waPhone}?text=${waMsg}`;

  const [servicesRef, servicesInView] = useInView(0.1);
  const [reviewRef, reviewInView] = useInView(0.1);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const services = [
    {
      title: 'Premium Oto Yıkama',
      desc: 'Aktif köpük, kil çubuğu ve polimer mühürleme ile boya yüzeyinizi koruyoruz.',
      image: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=2070&auto=format&fit=crop',
    },
    {
      title: 'Detaylı İç Temizlik',
      desc: 'Deri, tekstil ve plastik yüzeylere özel ürünlerle kapsamlı iç mekan restorasyonu.',
      image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070&auto=format&fit=crop',
    },
    {
      title: 'Seramik Kaplama',
      desc: '9H sertliğinde nano seramik kaplama ile 3 yıla kadar fabrika çıkışı parlaklık.',
      image: 'https://images.unsplash.com/photo-1600661653561-629509216228?q=80&w=2070&auto=format&fit=crop',
    },
    {
      title: 'Boya Koruma',
      desc: 'Uzun süreli boya koruma uygulamaları ile dış etkenlere karşı maksimum koruma.',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=2070&auto=format&fit=crop',
    },
    {
      title: 'Jant & Lastik Bakımı',
      desc: 'Jantlarda asitsiz temizlik, lastiklerde UV koruma ve parlatıcı uygulama.',
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=2070&auto=format&fit=crop',
    },
  ];

  const packages = [
    {
      name: 'EXPRESS',
      price: '350',
      features: ['Dış yıkama', 'Köpük uygulaması', 'Jant temizliği', 'Kurulama'],
      featured: false,
    },
    {
      name: 'PREMIUM',
      price: '750',
      features: ['İç + dış temizlik', 'Torpido bakımı', 'Jant temizliği', 'Detaylı kurulama'],
      featured: true,
    },
    {
      name: 'VIP DETAILING',
      price: '1.500',
      features: ['Detaylı iç temizlik', 'Boya bakım uygulaması', 'Motor temizliği', 'Premium bakım'],
      featured: false,
    },
  ];

  const reviews = [
    { name: 'Sercan A.', rating: 5, text: 'Seramik kaplama sonucu inanılmaz. Üç aydır yağmur altında yıkamadım, hâlâ ayna gibi.' },
    { name: 'Merve T.', rating: 5, text: 'Interior detailing sonrası arabam sıfır gibiydi. Deri koltuklar yenilenmiş gibi oldu.' },
    { name: 'Burak Ö.', rating: 5, text: 'Full detailing paketi aldım. Motor dahil tertemiz, boya cilası çok başarılı.' },
    { name: 'Elif K.', rating: 5, text: 'Jant temizliği ve lastik bakımı harika. Kesinlikle tavsiye ederim.' },
    { name: 'Can D.', rating: 5, text: 'Randevu saatine tam uyum, sonuç mükemmel. Premium hissettiriyor.' },
  ];

  const galleryImages = [
    'https://images.unsplash.com/photo-1552930294-6b595f4c2974?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600661653561-629509216228?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=800&auto=format&fit=crop',
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
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
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          letter-spacing: -0.2px;
          white-space: nowrap;
        }
        .btn-primary:hover {
          background: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(14,165,233,0.35);
        }

        .btn-whatsapp {
          background: #25D366;
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
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .btn-whatsapp:hover {
          background: #1da851;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,211,102,0.35);
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
          justify-content: center;
          gap: 8px;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          white-space: nowrap;
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
          padding: 24px;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          cursor: default;
          display: flex;
          flex-direction: column;
        }
        .service-card:hover {
          border-color: rgba(56,189,248,0.25);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(56,189,248,0.08);
        }
        .service-card img {
          transition: transform 0.5s ease;
        }
        .service-card:hover img {
          transform: scale(1.05);
        }

        .review-card {
          background: #0d1220;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 28px;
          min-width: 300px;
          scroll-snap-align: start;
          transition: border-color 0.3s, transform 0.3s;
        }
        .review-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }

        .package-card {
          background: #0d1220;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .package-card.featured {
          border-color: rgba(56,189,248,0.4);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(56,189,248,0.1);
          transform: scale(1.02);
        }
        .package-card ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .package-card li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #94a3b8; }

        .hamburger {
          display: none;
          background: transparent;
          border: none;
          color: #e8edf5;
          cursor: pointer;
          padding: 8px;
        }

        @media (max-width: 768px) {
          .hamburger { display: block; }
          .desktop-nav { display: none; }
          .mobile-menu {
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            background: rgba(8,12,20,0.98);
            backdrop-filter: blur(20px);
            padding: 24px 32px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            z-index: 99;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
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

        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#services" className="nav-item">Hizmetler</a>
          <a href="#packages" className="nav-item">Paketler</a>
          <a href="#before-after" className="nav-item">Öncesi & Sonrası</a>
          <a href="#reviews" className="nav-item">Yorumlar</a>
          <a href="#contact" className="nav-item">İletişim</a>
          <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
            Randevu Al
          </a>
        </nav>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {menuOpen && (
          <div className="mobile-menu">
            <a href="#services" className="nav-item" onClick={() => setMenuOpen(false)}>Hizmetler</a>
            <a href="#packages" className="nav-item" onClick={() => setMenuOpen(false)}>Paketler</a>
            <a href="#before-after" className="nav-item" onClick={() => setMenuOpen(false)}>Öncesi & Sonrası</a>
            <a href="#reviews" className="nav-item" onClick={() => setMenuOpen(false)}>Yorumlar</a>
            <a href="#contact" className="nav-item" onClick={() => setMenuOpen(false)}>İletişim</a>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Randevu Al
            </a>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        backgroundImage: 'url(https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 32px',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,12,20,0.85) 30%, rgba(8,12,20,0.4) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 20, animation: 'heroFadeUp 0.7s ease both' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700, letterSpacing: 2, fontSize: 13 }}>PREMIUM AUTO DETAILING</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            color: '#fff',
            marginBottom: 24,
            textTransform: 'uppercase',
            animation: 'heroFadeUp 0.7s 0.1s ease both',
          }}>
            Aracınızı<br />Yeni Gibi<br />Teslim Ediyoruz.
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 500, lineHeight: 1.6, marginBottom: 40, animation: 'heroFadeUp 0.7s 0.2s ease both' }}>
            Profesyonel oto yıkama, detaylı iç temizlik ve araç bakım hizmetleri.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 60, animation: 'heroFadeUp 0.7s 0.3s ease both' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '15px 32px', fontSize: 15 }}>
              RANDEVU AL
            </a>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-whatsapp" style={{ padding: '15px 28px', fontSize: 15 }}>
              <MessageCircle size={18} /> WHATSAPP'TAN YAZ
            </a>
          </div>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', animation: 'heroFadeUp 0.7s 0.4s ease both' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{rating || '4.9'}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Google Puanı</div>
            </div>div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{reviewCount || '328'}+</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Mutlu Müşteri</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>5+</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Yıllık Deneyim</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HİZMETLER ── */}
      <section id="services" style={{ padding: '96px 32px', maxWidth: 1100, margin: '0 auto' }} ref={servicesRef}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>Hizmetlerimiz</div>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Hazırız. Sizin Aracınız İçin de.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {services.map((s, i) => (
            <div key={i} className="service-card" style={{
              opacity: servicesInView ? 1 : 0,
              transform: servicesInView ? 'translateY(0)' : 'translateY(32px)',
              transition: `opacity 0.6s ${i * 0.1}s ease, transform 0.6s ${i * 0.1}s cubic-bezier(0.2, 0, 0, 1)`,
            }}>
              <div style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                <img src={s.image} alt={s.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', letterSpacing: 1, marginBottom: 8 }}>{String(i + 1).padStart(2, '0')}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{s.desc}</p>
              <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                Detayları Gör <ChevronRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÖNCESİ / SONRASI ── */}
      <section id="before-after" style={{ padding: '96px 32px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Gerçek Değişimi Görün.</h2>
          </div>
          <BeforeAfterSlider
            beforeImg="https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=2070&auto=format&fit=crop"
            afterImg="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?q=80&w=2070&auto=format&fit=crop"
          />
        </div>
      </section>

      {/* ── PAKETLER ── */}
      <section id="packages" style={{ padding: '96px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Aracınız İçin Doğru Bakımı Seçin.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'center' }}>
          {packages.map((pkg, i) => (
            <div key={i} className={`package-card ${pkg.featured ? 'featured' : ''}`}>
              {pkg.featured && (
                <div style={{
                  background: '#0ea5e9',
                  color: '#fff',
                  textAlign: 'center',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}>
                  EN ÇOK TERCİH EDİLEN
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>{pkg.name}</h3>
              <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px' }}>₺{pkg.price}</div>
              <ul>
                {pkg.features.map((f, j) => (
                  <li key={j}><Check size={14} style={{ color: '#38bdf8' }} /> {f}</li>
                ))}
              </ul>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                Paketi Seç
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── GOOGLE YORUMLARI ── */}
      <section id="reviews" style={{ padding: '96px 32px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} ref={reviewRef}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Müşterilerimiz Ne Diyor?</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 24 }}>
              <div style={{ fontSize: 64, fontWeight: 900 }}>{rating || '4.9'}</div>
              <div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="#fbbf24" stroke="none" />)}
                </div>
                <div style={{ color: '#94a3b8', marginTop: 4 }}>{reviewCount || '328'}+ Google değerlendirmesi</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', overflowX: 'auto', gap: 16, paddingBottom: 16, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            {reviews.map((r, i) => (
              <div key={i} className="review-card" style={{
                opacity: reviewInView ? 1 : 0,
                transform: reviewInView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.55s ${i * 0.12}s ease, transform 0.55s ${i * 0.12}s ease`,
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {[...Array(r.rating)].map((_, j) => <Star key={j} size={14} fill="#fbbf24" stroke="none" />)}
                </div>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM GALERİ ── */}
      <section style={{ padding: '96px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Son İşlerimiz</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {galleryImages.map((img, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '1/1', position: 'relative' }}>
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '13px 24px' }}>
            <Camera size={18} /> INSTAGRAM'DA BİZİ TAKİP EDİN
          </a>
        </div>
      </section>

      {/* ── KONUM & İLETİŞİM ── */}
      <section id="contact" style={{ padding: '96px 32px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'start' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(address || '')}&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Google Maps"
            />
          </div>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>İletişim</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 15 }}>
              <div><MapPin size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> {address}</div>
              <div><Clock size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Pazartesi - Cumartesi: 09:00 - 20:00</div>
              <div><Phone size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> {phone}</div>
              <div><MessageCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> WhatsApp: {phone}</div>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ marginTop: 16, justifyContent: 'center' }}>
                RANDEVU AL
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 32px', background: 'linear-gradient(180deg, #080c14 0%, #0d1220 100%)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20 }}>
            Aracınız İçin Hak Ettiği Bakımı Yapalım.
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 40 }}>Randevunuzu oluşturun, aracınızı bize bırakın.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '15px 32px', fontSize: 15 }}>
              RANDEVU AL
            </a>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-whatsapp" style={{ padding: '15px 28px', fontSize: 15 }}>
              <MessageCircle size={18} /> WHATSAPP'TAN YAZ
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>{businessName}</div>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>Premium oto yıkama ve detailing hizmetleri.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Hızlı Linkler</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="#services" style={{ color: '#94a3b8', textDecoration: 'none' }}>Hizmetler</a>
              <a href="#packages" style={{ color: '#94a3b8', textDecoration: 'none' }}>Paketler</a>
              <a href="#before-after" style={{ color: '#94a3b8', textDecoration: 'none' }}>Öncesi & Sonrası</a>
              <a href="#reviews" style={{ color: '#94a3b8', textDecoration: 'none' }}>Yorumlar</a>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>İletişim</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#94a3b8', fontSize: 14 }}>
              <span><Phone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {phone}</span>
              <span><MessageCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> WhatsApp</span>
              <span><Camera size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Instagram</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Çalışma Saatleri</div>
            <div style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
              Pazartesi - Cumartesi: 09:00 - 20:00<br />Pazar: Kapalı
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: 13 }}>
          © 2026 {businessName}. Tüm hakları saklıdır.
        </div>
      </footer>

      {/* Demo sistemine bağlı floating bar */}
      <DemoFloatingBar businessName={businessName} phone={phone} refCode={refCode} />
    </div>
  );
}