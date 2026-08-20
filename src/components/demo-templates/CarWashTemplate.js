"use client";

import React, { useEffect, useRef, useState } from 'react';
import DemoFloatingBar from './DemoFloatingBar';

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function CarWashTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, randevu almak istiyorum.`)}`;

  const [statsVisible, setStatsVisible] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);
  const statsRef = useRef(null);

  const customers = useCountUp(1240, 2200, statsVisible);
  const satisfaction = useCountUp(98, 1800, statsVisible);
  const experience = useCountUp(8, 1500, statsVisible);

  useEffect(() => {
    setTimeout(() => setHeroReady(true), 100);
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.idx);
            setVisibleCards(prev => [...new Set([...prev, idx])]);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-card]').forEach(el => cardObserver.observe(el));

    return () => {
      observer.disconnect();
      cardObserver.disconnect();
    };
  }, []);

  return (
    <div style={{ background: '#04070f', color: '#f0f6ff', fontFamily: '"Inter", system-ui, sans-serif', overflowX: 'hidden', minHeight: '100vh' }}>
      
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-18px) rotate(2deg); }
          66%       { transform: translateY(-8px) rotate(-1deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(56,189,248,0.3), 0 0 40px rgba(56,189,248,0.1); }
          50%       { box-shadow: 0 0 40px rgba(56,189,248,0.6), 0 0 80px rgba(56,189,248,0.2); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes rotate360 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        @keyframes waterDrop {
          0%   { transform: scale(0.8) translateY(-10px); opacity: 0; }
          60%  { transform: scale(1.05) translateY(5px); opacity: 1; }
          80%  { transform: scale(0.97) translateY(0); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes blob {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50%      { border-radius: 50% 60% 30% 60% / 40% 30% 60% 50%; }
          75%      { border-radius: 40% 60% 50% 40% / 60% 40% 60% 50%; }
        }

        @keyframes particleDrift {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
          50%  { transform: translateY(-120px) translateX(30px) scale(1.2); opacity: 0.9; }
          100% { transform: translateY(-240px) translateX(-20px) scale(0.5); opacity: 0; }
        }

        .hero-gradient {
          background: linear-gradient(135deg, #04070f 0%, #0a1628 40%, #061020 70%, #04070f 100%);
          background-size: 400% 400%;
          animation: gradientShift 12s ease infinite;
        }

        .shimmer-text {
          background: linear-gradient(90deg, #38bdf8, #7dd3fc, #0ea5e9, #38bdf8);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .card-hover {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 30px 60px rgba(56,189,248,0.2), 0 10px 20px rgba(0,0,0,0.5) !important;
          border-color: rgba(56,189,248,0.4) !important;
        }

        .btn-wa {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-wa:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 15px 35px rgba(34,197,94,0.5) !important;
        }

        .btn-call {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          transition: transform 0.2s, background 0.2s;
        }
        .btn-call:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.12);
        }

        .service-icon {
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .card-hover:hover .service-icon {
          transform: scale(1.25) rotate(8deg);
        }

        .nav-blur {
          transition: background 0.3s;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="nav-blur" style={{
        position: 'sticky', top: 0, zIndex: 999,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px',
        background: 'rgba(4,7,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(56,189,248,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo Icon */}
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 4px 16px rgba(56,189,248,0.4)',
            animation: 'pulse-glow 3s ease-in-out infinite'
          }}>💧</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px' }}>{businessName}</div>
            <div style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700, letterSpacing: 1.5 }}>OTO YIKAMA & DETAİLİNG</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {phone && (
            <a href={`tel:${phone}`} className="btn-call" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 10,
              color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600
            }}>
              📞 {phone}
            </a>
          )}
          <a href={waUrl} target="_blank" rel="noreferrer" className="btn-wa" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10,
            color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700,
            boxShadow: '0 6px 20px rgba(34,197,94,0.3)'
          }}>
            💬 Randevu Al
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-gradient" style={{ position: 'relative', padding: '100px 24px 80px', textAlign: 'center', overflow: 'hidden' }}>
        
        {/* Animated blobs */}
        <div style={{
          position: 'absolute', width: 500, height: 500,
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          top: '-100px', left: '-100px',
          animation: 'blob 12s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
          bottom: '-80px', right: '-80px',
          animation: 'blob 14s ease-in-out infinite reverse'
        }} />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 6 + 3,
            height: Math.random() * 6 + 3,
            borderRadius: '50%',
            background: `rgba(56,189,248,${Math.random() * 0.5 + 0.3})`,
            left: `${10 + i * 11}%`,
            bottom: `${20 + (i % 3) * 20}%`,
            animation: `particleDrift ${4 + i * 0.8}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto' }}>
          
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
            padding: '7px 18px', borderRadius: 999, marginBottom: 28,
            opacity: heroReady ? 1 : 0, animation: heroReady ? 'slideInUp 0.7s ease forwards' : 'none'
          }}>
            <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ color: '#7dd3fc', fontSize: 13, fontWeight: 600 }}>Şu An Hizmet Veriyoruz • {rating}⭐ ({reviewCount} Değerlendirme)</span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 68px)',
            fontWeight: 900, lineHeight: 1.08, marginBottom: 24,
            letterSpacing: '-2px',
            opacity: heroReady ? 1 : 0, animation: heroReady ? 'slideInUp 0.8s 0.15s ease both' : 'none'
          }}>
            Aracınız Hak Ettiği{' '}
            <span className="shimmer-text">Mükemmel</span>
            <br />Temizliğe Kavuşsun
          </h1>

          <p style={{
            fontSize: 18, color: '#94a3b8', lineHeight: 1.65, marginBottom: 36,
            opacity: heroReady ? 1 : 0, animation: heroReady ? 'slideInUp 0.8s 0.3s ease both' : 'none'
          }}>
            <strong style={{ color: '#f0f6ff' }}>{businessName}</strong> olarak profesyonel ekibimiz ve son teknoloji ürünlerimizle aracınıza fabrika çıkışı tazeliğini geri kazandırıyoruz.
          </p>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap',
            opacity: heroReady ? 1 : 0, animation: heroReady ? 'slideInUp 0.8s 0.45s ease both' : 'none'
          }}>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-wa" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 32px', borderRadius: 14,
              color: '#fff', textDecoration: 'none',
              fontSize: 16, fontWeight: 800,
              boxShadow: '0 12px 32px rgba(34,197,94,0.4)',
              letterSpacing: '-0.3px'
            }}>
              💬 WhatsApp ile Randevu Al
              <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 6 }}>Ücretsiz</span>
            </a>

            {phone && (
              <a href={`tel:${phone}`} className="btn-call" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 28px', borderRadius: 14,
                color: '#f0f6ff', textDecoration: 'none',
                fontSize: 16, fontWeight: 700
              }}>
                📞 Hemen Ara
              </a>
            )}
          </div>

          {/* Hero Visual — animated car wash */}
          <div style={{
            marginTop: 60, position: 'relative', display: 'inline-block',
            animation: 'float 6s ease-in-out infinite'
          }}>
            <div style={{
              width: 280, height: 280, margin: '0 auto',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(56,189,248,0.15), rgba(14,165,233,0.06) 60%, transparent)',
              border: '1px solid rgba(56,189,248,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 110,
              boxShadow: '0 0 60px rgba(56,189,248,0.15), inset 0 0 40px rgba(56,189,248,0.05)'
            }}>🚗</div>
            
            {/* Water drop badges */}
            {['💧', '✨', '💦'].map((em, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: `${[15, 55, 30][i]}%`,
                right: i === 1 ? '-10%' : 'auto',
                left: i === 0 ? '-5%' : 'auto',
                bottom: i === 2 ? '-5%' : 'auto',
                fontSize: 28,
                animation: `waterDrop 2s ${i * 0.6}s ease-in-out infinite`
              }}>{em}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div ref={statsRef} style={{
        background: 'linear-gradient(90deg, #060e1f 0%, #0a1628 50%, #060e1f 100%)',
        borderTop: '1px solid rgba(56,189,248,0.1)',
        borderBottom: '1px solid rgba(56,189,248,0.1)',
        padding: '36px 24px'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { value: customers, suffix: '+', label: 'Memnun Müşteri' },
            { value: satisfaction, suffix: '%', label: 'Müşteri Memnuniyeti' },
            { value: experience, suffix: ' Yıl', label: 'Sektör Deneyimi' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '8px 0',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none'
            }}>
              <div style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
                {statsVisible ? s.value.toLocaleString('tr-TR') : '0'}{s.suffix}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ color: '#38bdf8', fontSize: 13, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>HİZMETLERİMİZ</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1px' }}>
            Her Araç İçin <span className="shimmer-text">Özel Çözüm</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { icon: '🫧', title: 'Dış Yıkama & Cilalama', desc: 'Aktif köpük, yüksek basınç ve balmumu kaplama ile aracınız ayna gibi parlar.', price: '200₺\'den', color: '#0ea5e9' },
            { icon: '🚿', title: 'İç Temizlik & Aspiratör', desc: 'Döşeme, tavan ve bagaj temizliği. Koku giderici uygulamasıyla tertemiz.', price: '350₺\'den', color: '#a78bfa' },
            { icon: '✨', title: 'Komple Detailing', desc: 'Kil çubuğu, seramik kaplama ve motor yıkama dahil tam paket.', price: '1200₺\'den', color: '#f59e0b' },
            { icon: '🛡️', title: 'Seramik Kaplama', desc: 'Uzun yıllar boyu koruyan nano seramik kaplama ile lak hasarına son.', price: '3500₺\'den', color: '#10b981' },
          ].map((s, i) => (
            <div key={i} data-card data-idx={i} className="card-hover" style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: 28,
              opacity: visibleCards.includes(i) ? 1 : 0,
              transform: visibleCards.includes(i) ? 'translateY(0)' : 'translateY(40px)',
              transition: `opacity 0.6s ${i * 0.12}s ease, transform 0.6s ${i * 0.12}s cubic-bezier(0.34,1.56,0.64,1)`
            }}>
              <div className="service-icon" style={{
                fontSize: 40, marginBottom: 16,
                width: 68, height: 68, borderRadius: 16,
                background: `${s.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 20px ${s.color}25`
              }}>{s.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 18 }}>{s.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: s.color, fontSize: 15 }}>{s.price} başlar</span>
                <a href={waUrl} target="_blank" rel="noreferrer" style={{
                  fontSize: 12, fontWeight: 700, color: '#38bdf8',
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4
                }}>Bilgi Al →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ 
        background: 'linear-gradient(135deg, #060d1e 0%, #0a1525 100%)',
        borderTop: '1px solid rgba(56,189,248,0.08)', borderBottom: '1px solid rgba(56,189,248,0.08)',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>NEDEN BİZ?</div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 24, letterSpacing: '-1px' }}>
              Fark Yaratan <span className="shimmer-text">Kalite</span> ve Özen
            </h2>
            <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 32, fontSize: 15 }}>
              {businessName} olarak her aracı kendi aracımız gibi işliyoruz. Almanya menşeli özel ürünler ve eğitimli ekibimizle rakipsiz sonuçlar sunuyoruz.
            </p>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-wa" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px', borderRadius: 12, color: '#fff',
              textDecoration: 'none', fontSize: 15, fontWeight: 800,
              boxShadow: '0 8px 24px rgba(34,197,94,0.35)'
            }}>
              💬 Hemen Randevu Al
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🏅', title: 'Garantili Hizmet', desc: 'Her yıkama için 100% memnuniyet garantisi veriyoruz.' },
              { icon: '⚡', title: 'Hızlı & Zamanında', desc: 'Randevu saatinize kesinlikle uyuyoruz, bekleme yok.' },
              { icon: '🌿', title: 'Çevre Dostu Ürünler', desc: 'Su tasarruflu ve biyobozunur temizlik ürünleri kullanıyoruz.' },
              { icon: '📍', title: 'Kolay Ulaşım', desc: address || 'Merkezi konumumuzla her yerden kolayca ulaşabilirsiniz.' },
            ].map((w, i) => (
              <div key={i} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                padding: 18, borderRadius: 14,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'border-color 0.2s',
              }}>
                <div style={{
                  fontSize: 22, width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{w.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>{w.title}</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>MÜŞTERİ YORUMLARI</div>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, letterSpacing: '-1px' }}>
            <span className="shimmer-text">{rating} ⭐</span> ile değerlendirdiler
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {[
            { name: 'Ahmet K.', text: `${businessName}'de araç yıkattım, sonuç muhteşemdi. Seramik kaplama gerçekten harika, kesinlikle tavsiye ediyorum!`, stars: 5 },
            { name: 'Zeynep M.', text: 'Detailing paketi aldım. Arabam sıfır gibi oldu! Fiyat/performans açısından şehrin en iyisi. Devam edeceğim.', stars: 5 },
            { name: 'Murat S.', text: 'Randevu saatine tam uydular. İç temizlik eksiksizdi, koku bile kalmadı. Artık düzenli müşteriyim.', stars: 5 },
          ].map((r, i) => (
            <div key={i} className="card-hover" style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: 24
            }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {[...Array(r.stars)].map((_, s) => <span key={s} style={{ color: '#fbbf24', fontSize: 16 }}>★</span>)}
              </div>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.65, marginBottom: 18, fontStyle: 'italic' }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14
                }}>{r.name[0]}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1628, #061020)',
        borderTop: '1px solid rgba(56,189,248,0.12)',
        padding: '80px 24px', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 20, animation: 'float 4s ease-in-out infinite' }}>💎</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1px' }}>
            Aracınız <span className="shimmer-text">Daha İyi Temizliği</span> Hak Ediyor
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
            WhatsApp'tan mesaj atın, size en uygun randevu ve paket seçeneğini birlikte belirleyelim.
          </p>
          {address && (
            <p style={{ color: '#475569', fontSize: 13, marginBottom: 30 }}>📍 {address}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-wa" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 36px', borderRadius: 14, color: '#fff',
              textDecoration: 'none', fontSize: 17, fontWeight: 800,
              boxShadow: '0 12px 32px rgba(34,197,94,0.4)'
            }}>
              💬 WhatsApp ile Randevu Al
            </a>
            {phone && (
              <a href={`tel:${phone}`} className="btn-call" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 28px', borderRadius: 14, color: '#f0f6ff',
                textDecoration: 'none', fontSize: 17, fontWeight: 700
              }}>
                📞 {phone}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── FLOATING BAR ── */}
      <DemoFloatingBar businessName={businessName} phone={phone} refCode={refCode} />
    </div>
  );
}
