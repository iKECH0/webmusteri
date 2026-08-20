"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Phone, MapPin, ChevronRight, Star, Shield, Clock, Zap, Check, MessageCircle, Layers } from 'lucide-react';
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

const ACCENT = '#10b981';
const ACCENT_DIM = 'rgba(16,185,129,0.12)';
const BG = '#070d0a';
const CARD = '#0b1410';

export default function CarpetCleaningTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const raw = (phone || '').replace(/\D/g, '');
  const waPhone = raw.startsWith('90') ? raw : '90' + raw;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, halı/koltuk yıkama hakkında bilgi almak istiyorum.`)}`;

  const [statsRef, statsInView] = useInView(0.3);
  const [servicesRef, servicesInView] = useInView(0.1);
  const [whyRef, whyInView] = useInView(0.1);
  const [reviewRef, reviewInView] = useInView(0.1);
  const [scrolled, setScrolled] = useState(false);

  const c1 = useCountUp(2400, 2000, statsInView);
  const c2 = useCountUp(99, 1600, statsInView);
  const c3 = useCountUp(8, 1400, statsInView);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const services = [
    { title: 'Halı Yıkama', sub: 'Makine & El Yıkama', desc: 'İpek, yün ve sentetik halılara uygun profesyonel yıkama. Leke ve koku giderme garantili.', price: '500 ₺\'den', features: ['Ön leke tedavisi', 'Derin temizleme makinesi', 'Koku giderici', 'Hızlı kurutma'] },
    { title: 'Koltuk Yıkama', sub: 'Kumaş & Deri Servis', desc: 'Köşe takımı, tekli koltuk ve berjer için özel ıslak-kuru sistemle mükemmel temizlik.', price: '350 ₺\'den', features: ['Kumaş & deri uyumlu', 'Derin aspirasyon', 'Antibakteriyel işlem', 'Nem giderme'] },
    { title: 'Perde Yıkama', sub: 'Yerinde Söküm Dahil', desc: 'Perdelerinizi yerinden söküyor, yıkıyor ve aynı gün takıyoruz. Ekstra pratik çözüm.', price: '200 ₺\'den', features: ['Yerinde söküm/takım', 'Kuru temizleme', 'Ütüleme', 'Aynı gün teslimat'] },
    { title: 'Komple Paket', sub: 'Halı + Koltuk + Perde', desc: 'Evinizin tamamı için tek seferde kapsamlı hizmet. En avantajlı fiyat garantisi.', price: '1.200 ₺\'den', features: ['Tüm hizmetler dahil', 'Öncelikli randevu', 'Ücretsiz taşıma', 'Fiyat garantisi'] },
  ];

  return (
    <div style={{ background: BG, color: '#e8edf5', fontFamily: '"Inter", system-ui, sans-serif', overflowX: 'hidden' }}>
      <DemoCursor color={ACCENT} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes heroFadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientMove { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .btn-primary { background: ${ACCENT}; color: #fff; border: none; padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: filter .2s, transform .2s, box-shadow .2s; letter-spacing: -.2px; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 8px 24px ${ACCENT}40; }
        .btn-secondary { background: transparent; color: #e8edf5; border: 1px solid rgba(255,255,255,.12); padding: 13px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: border-color .2s, background .2s, transform .2s; }
        .btn-secondary:hover { border-color: rgba(255,255,255,.28); background: rgba(255,255,255,.04); transform: translateY(-2px); }
        .scard { background: ${CARD}; border: 1px solid rgba(255,255,255,.06); border-radius: 16px; padding: 30px; transition: border-color .3s, transform .3s, box-shadow .3s; }
        .scard:hover { border-color: ${ACCENT}40; transform: translateY(-5px); box-shadow: 0 24px 48px rgba(0,0,0,.4); }
        .why-row { display: flex; gap: 18px; padding: 22px; border-radius: 12px; border: 1px solid rgba(255,255,255,.04); transition: border-color .25s, background .25s; }
        .why-row:hover { border-color: ${ACCENT}30; background: ${ACCENT}06; }
        .rcard { background: ${CARD}; border: 1px solid rgba(255,255,255,.06); border-radius: 16px; padding: 28px; transition: border-color .3s, transform .3s; }
        .rcard:hover { border-color: rgba(255,255,255,.12); transform: translateY(-3px); }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, height: 64, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(7,13,10,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,.06)' : '1px solid transparent', transition: 'all .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, #34d399)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{businessName}</div>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 700, letterSpacing: 1.5 }}>HALI & KOLTUK YIKAMA</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="#services" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Hizmetler</a>
          <a href="#why" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Hakkımızda</a>
          <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>Randevu Al</a>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '80px 32px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 700, height: 700, top: -200, right: -150, background: `radial-gradient(ellipse, ${ACCENT}0a 0%, transparent 65%)`, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.016) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 60%, ${BG} 100%)` }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}30`, borderRadius: 999, padding: '6px 14px', marginBottom: 28, animation: 'heroFadeUp .7s ease both' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6ee7b7' }}>{rating} puan · {reviewCount} değerlendirme</span>
            </div>
            <h1 style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, animation: 'heroFadeUp .7s .1s ease both' }}>
              Evinizin En Temiz<br />
              <span style={{ background: `linear-gradient(90deg, ${ACCENT}, #34d399, #6ee7b7)`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradientMove 4s linear infinite' }}>Versiyonunu</span>
              <br />Sunuyoruz
            </h1>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.75, maxWidth: 420, marginBottom: 40, animation: 'heroFadeUp .7s .2s ease both' }}>
              Uzman ekibimiz ve endüstriyel ekipmanlarımızla halı, koltuk ve perdelerinizi sıfır gibi yapıyoruz. Evden almadan veya kapıda teslimat seçenekleriyle.
            </p>
            <div style={{ display: 'flex', gap: 12, animation: 'heroFadeUp .7s .3s ease both' }}>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle size={16} /> WhatsApp ile Randevu</a>
              {phone && <a href={`tel:${phone}`} className="btn-secondary"><Phone size={16} /> {phone}</a>}
            </div>
            {address && <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13, animation: 'heroFadeUp .7s .4s ease both' }}><MapPin size={14} /><span>{address}</span></div>}
          </div>

          {/* SVG Illustration */}
          <div style={{ animation: 'heroFadeUp .9s .2s ease both' }}>
            <div style={{ background: CARD, border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,.5)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ marginLeft: 8, fontSize: 12, color: '#475569' }}>{businessName} · Premium Yıkama Servisi</span>
              </div>
              <div style={{ height: 200, background: 'linear-gradient(135deg, #0b1a12, #0e2018)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', width: 260, height: 260, background: `radial-gradient(circle, ${ACCENT}12, transparent 70%)`, borderRadius: '50%' }} />
                <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
                  <rect x="20" y="20" width="140" height="100" rx="6" stroke={`${ACCENT}50`} strokeWidth="1.5" fill="none"/>
                  <rect x="30" y="30" width="120" height="80" rx="4" stroke={`${ACCENT}30`} strokeWidth="1" fill="none"/>
                  {[...Array(6)].map((_, i) => <line key={i} x1="30" y1={42 + i*12} x2="150" y2={42 + i*12} stroke={`${ACCENT}20`} strokeWidth="1"/>)}
                  {[...Array(8)].map((_, i) => <line key={i} x1={45 + i*15} y1="30" x2={45 + i*15} y2="110" stroke={`${ACCENT}20`} strokeWidth="1"/>)}
                  <circle cx="90" cy="70" r="20" stroke={`${ACCENT}60`} strokeWidth="1.5" fill={`${ACCENT}08`}/>
                  <path d="M82 70 Q90 58 98 70 Q90 82 82 70Z" fill={`${ACCENT}30`} stroke={`${ACCENT}60`} strokeWidth="1"/>
                </svg>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                {[{ l: 'Teslimat', v: 'Aynı Gün' }, { l: 'Garanti', v: '100%' }, { l: 'Ücretsiz', v: 'Taşıma' }].map((s, i) => (
                  <div key={i} style={{ padding: '16px', borderRight: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                    <div style={{ fontSize: 11, color: '#475569' }}>{s.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, marginTop: 4 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div ref={statsRef} style={{ borderTop: '1px solid rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[{ v: c1, s: '+', l: 'Memnun Müşteri' }, { v: c2, s: '%', l: 'Müşteri Memnuniyeti' }, { v: c3, s: '+', l: 'Yıllık Deneyim' }].map((s, i) => (
            <div key={i} style={{ padding: '48px 32px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none', opacity: statsInView ? 1 : 0, transition: `opacity .6s ${i * .15}s ease` }}>
              <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px', color: '#f1f5f9', lineHeight: 1 }}>{statsInView ? s.v.toLocaleString('tr-TR') : '0'}{s.s}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section id="services" style={{ padding: '96px 32px', maxWidth: 1100, margin: '0 auto' }} ref={servicesRef}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>Hizmetlerimiz</div>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1 }}>Evinizin her köşesi<br />tertemiz</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {services.map((s, i) => (
            <div key={i} className="scard" style={{ opacity: servicesInView ? 1 : 0, transform: servicesInView ? 'translateY(0)' : 'translateY(32px)', transition: `opacity .6s ${i * .1}s ease, transform .6s ${i * .1}s cubic-bezier(.2,0,0,1)` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>{s.sub}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, letterSpacing: '-.5px' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, marginBottom: 20 }}>{s.desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {s.features.map((f, j) => <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}><Check size={13} style={{ color: ACCENT, flexShrink: 0 }} />{f}</li>)}
              </ul>
              <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{s.price}</span>
                <a href={waUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: ACCENT, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Bilgi Al <ChevronRight size={14} /></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section id="why" style={{ padding: '96px 32px', background: 'rgba(255,255,255,.012)', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)' }} ref={whyRef}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>Neden Biz</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 24 }}>Güven, hız ve<br />mükemmel sonuç</h2>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, marginBottom: 36 }}>{businessName} olarak her müşterimize özel ilgi gösteriyoruz. Standardize değil, kişiselleştirilmiş hizmet.</p>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle size={16} /> Ücretsiz Fiyat Al</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <Shield size={20} style={{ color: ACCENT }} />, title: 'Hasar Sigortası', desc: 'Tüm yıkama işlemlerimiz sigortalıdır. Olası hasarda tam sorumluluk üstleniriz.' },
              { icon: <Clock size={20} style={{ color: ACCENT }} />, title: 'Aynı Gün Teslimat', desc: 'Sabah teslim edilen halı ve koltuklar aynı gün akşam kapınıza bırakılır.' },
              { icon: <Zap size={20} style={{ color: ACCENT }} />, title: 'Kapıdan Teslim', desc: 'Siz hiçbir şey taşımak zorunda değilsiniz. Biz gelir, alır, yıkar, teslim ederiz.' },
              { icon: <Star size={20} style={{ color: ACCENT }} />, title: 'Ekolojik Ürünler', desc: 'Çocuk ve evcil hayvan dostu, sertifikalı organik temizlik maddeleri kullanıyoruz.' },
            ].map((w, i) => (
              <div key={i} className="why-row" style={{ opacity: whyInView ? 1 : 0, transform: whyInView ? 'translateX(0)' : 'translateX(24px)', transition: `opacity .5s ${i * .08}s ease, transform .5s ${i * .08}s ease` }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${ACCENT}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{w.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{w.title}</div>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" style={{ padding: '96px 32px', maxWidth: 1100, margin: '0 auto' }} ref={reviewRef}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>Müşteri Referansları</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Onlar ne diyor?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { n: 'Ayşe K.', t: 'Apartman Sakini', txt: 'Halılarım ve 3\'lü koltuk takımım inanılmaz temizlendi. Koku bile kalmadı. Kapıdan teslim almak çok pratik.' },
            { n: 'Kerem B.', t: 'Villa Sahibi', txt: 'Kilimlerimin temizleneceğinden emin değildim ama sonuç gerçekten şaşırtıcıydı. Artık başka bir yere gitmem.' },
            { n: 'Selin A.', t: 'Ofis Yöneticisi', txt: 'Ofisimizdeki tüm koltuklar ve halılar yıkandı. Hem hızlı hem çok uygun fiyatlıydı. Kesinlikle tavsiye ederim.' },
          ].map((r, i) => (
            <div key={i} className="rcard" style={{ opacity: reviewInView ? 1 : 0, transform: reviewInView ? 'translateY(0)' : 'translateY(24px)', transition: `opacity .55s ${i * .12}s ease, transform .55s ${i * .12}s ease` }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>{[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#fbbf24" stroke="none" />)}</div>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{r.txt}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${ACCENT}, #34d399)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{r.n[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.n}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{r.t}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 32px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 46px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>Temiz bir ev için<br /><span style={{ background: `linear-gradient(90deg, ${ACCENT}, #34d399)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>hemen randevu alın</span></h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, marginBottom: 40 }}>WhatsApp'tan yazın, aynı gün veya ertesi gün için uygun zaman ayarlayalım.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '15px 32px', fontSize: 15 }}><MessageCircle size={18} /> WhatsApp ile Yaz</a>
            {phone && <a href={`tel:${phone}`} className="btn-secondary" style={{ padding: '15px 28px', fontSize: 15 }}><Phone size={18} /> {phone}</a>}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{businessName}</div>
        {address && <div style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} />{address}</div>}
        <div style={{ fontSize: 12, color: '#334155' }}>Kodiva Ajans tarafından tasarlandı</div>
      </footer>

      <DemoFloatingBar businessName={businessName} phone={phone} refCode={refCode} />
    </div>
  );
}
