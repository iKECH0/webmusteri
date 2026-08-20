"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Phone, MapPin, ChevronRight, Star, Shield, Clock, Zap, Check, MessageCircle, Scissors } from 'lucide-react';
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

const ACCENT = '#e879f9';
const BG = '#0c080f';
const CARD = '#130a16';

export default function SalonTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const raw = (phone || '').replace(/\D/g, '');
  const waPhone = raw.startsWith('90') ? raw : '90' + raw;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, randevu almak istiyorum.`)}`;

  const [statsRef, statsInView] = useInView(0.3);
  const [servicesRef, servicesInView] = useInView(0.1);
  const [whyRef, whyInView] = useInView(0.1);
  const [reviewRef, reviewInView] = useInView(0.1);
  const [scrolled, setScrolled] = useState(false);

  const c1 = useCountUp(3200, 2000, statsInView);
  const c2 = useCountUp(98, 1600, statsInView);
  const c3 = useCountUp(12, 1400, statsInView);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const services = [
    { title: 'Saç Kesimi & Şekillendirme', sub: 'Kesim & Fön & Şekil', desc: 'Yüz tipinize özel analiz ile en uygun kesimi belirliyoruz. Deneyimli stilistlerimizle fark yaratın.', price: '300 ₺\'den', features: ['Yüz analizi', 'Stilist danışmanlığı', 'Profesyonel fön', 'Saç bakım serumu'] },
    { title: 'Boya & Röfle', sub: 'Renk & Teknik Boya', desc: 'Balayage, ombre, highlights ve tam boya için uzman ekibimiz. Saçınıza zarar vermeden mükemmel renk.', price: '600 ₺\'den', features: ['Renk danışmanlığı', 'Amonyaksız seçenek', 'Renk koruma bakımı', 'Isı koruması'] },
    { title: 'Keratin & Bakım', sub: 'Onarım & Güçlendirme', desc: 'Hasarlı saçlar için keratin tedavisi, protein bakımı ve saç botoksu ile sağlıklı ve parlak saçlar.', price: '800 ₺\'den', features: ['Saç analizi', 'Keratin tedavisi', 'Protein maskesi', 'Brezilya botoksu'] },
    { title: 'Gelin Saçı & Makyaj', sub: 'Özel Gün Paketi', desc: 'En özel gününüzde en güzel halinizi yaratıyoruz. Deneme seansı ve gelin tırası dahil tam paket.', price: '2.000 ₺\'den', features: ['Deneme seansı', 'Gelin saçı', 'Profesyonel makyaj', 'Gelin tırnağı'] },
  ];

  return (
    <div style={{ background: BG, color: '#f0ebf5', fontFamily: '"Inter", system-ui, sans-serif', overflowX: 'hidden' }}>
      <DemoCursor color={ACCENT} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes heroFadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientMove { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .btn-primary { background: ${ACCENT}; color: #fff; border: none; padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: filter .2s, transform .2s, box-shadow .2s; }
        .btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 8px 24px ${ACCENT}40; }
        .btn-secondary { background: transparent; color: #f0ebf5; border: 1px solid rgba(255,255,255,.12); padding: 13px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: border-color .2s, background .2s, transform .2s; }
        .btn-secondary:hover { border-color: rgba(255,255,255,.28); background: rgba(255,255,255,.04); transform: translateY(-2px); }
        .scard { background: ${CARD}; border: 1px solid rgba(255,255,255,.06); border-radius: 16px; padding: 30px; transition: border-color .3s, transform .3s, box-shadow .3s; }
        .scard:hover { border-color: ${ACCENT}40; transform: translateY(-5px); box-shadow: 0 24px 48px rgba(0,0,0,.4); }
        .why-row { display: flex; gap: 18px; padding: 22px; border-radius: 12px; border: 1px solid rgba(255,255,255,.04); transition: border-color .25s, background .25s; }
        .why-row:hover { border-color: ${ACCENT}30; background: ${ACCENT}06; }
        .rcard { background: ${CARD}; border: 1px solid rgba(255,255,255,.06); border-radius: 16px; padding: 28px; transition: border-color .3s, transform .3s; }
        .rcard:hover { border-color: rgba(255,255,255,.12); transform: translateY(-3px); }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, height: 64, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(12,8,15,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,.06)' : '1px solid transparent', transition: 'all .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${ACCENT}, #c026d3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scissors size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{businessName}</div>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 700, letterSpacing: 1.5 }}>KUAFÖR & GÜZELLİK MERKEZİ</div>
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
          <div style={{ position: 'absolute', width: 700, height: 700, top: -200, right: -150, background: `radial-gradient(ellipse, ${ACCENT}08 0%, transparent 65%)`, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', width: 500, height: 500, bottom: -100, left: -100, background: `radial-gradient(ellipse, #c026d308 0%, transparent 65%)`, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 60%, ${BG} 100%)` }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${ACCENT}10`, border: `1px solid ${ACCENT}28`, borderRadius: 999, padding: '6px 14px', marginBottom: 28, animation: 'heroFadeUp .7s ease both' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f0abfc' }}>{rating} puan · {reviewCount} değerlendirme</span>
            </div>
            <h1 style={{ fontSize: 'clamp(34px, 4.5vw, 56px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, animation: 'heroFadeUp .7s .1s ease both' }}>
              Güzelliğiniz<br />
              <span style={{ background: `linear-gradient(90deg, ${ACCENT}, #c026d3, #a855f7)`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradientMove 4s linear infinite' }}>Uzman Ellerde</span>
            </h1>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.75, maxWidth: 420, marginBottom: 40, animation: 'heroFadeUp .7s .2s ease both' }}>
              Deneyimli stilist ve güzellik uzmanlarımızla saç, cilt ve makyajda kendinizi en iyi hissettirecek dönüşümü yaşayın.
            </p>
            <div style={{ display: 'flex', gap: 12, animation: 'heroFadeUp .7s .3s ease both' }}>
              <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle size={16} /> WhatsApp ile Randevu</a>
              {phone && <a href={`tel:${phone}`} className="btn-secondary"><Phone size={16} /> {phone}</a>}
            </div>
            {address && <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13, animation: 'heroFadeUp .7s .4s ease both' }}><MapPin size={14} />{address}</div>}
          </div>

          <div style={{ animation: 'heroFadeUp .9s .2s ease both' }}>
            <div style={{ background: CARD, border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,.5)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ marginLeft: 8, fontSize: 12, color: '#475569' }}>{businessName} · Premium Güzellik Merkezi</span>
              </div>
              <div style={{ height: 200, background: 'linear-gradient(135deg, #160a1a, #1e0d24)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', width: 260, height: 260, background: `radial-gradient(circle, ${ACCENT}10, transparent 70%)`, borderRadius: '50%' }} />
                <svg width="160" height="140" viewBox="0 0 160 140" fill="none">
                  <circle cx="80" cy="50" r="30" stroke={`${ACCENT}40`} strokeWidth="1.5" fill={`${ACCENT}06`} />
                  <circle cx="80" cy="50" r="18" stroke={`${ACCENT}30`} strokeWidth="1" fill="none" />
                  <line x1="50" y1="90" x2="110" y2="90" stroke={`${ACCENT}40`} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M55 100 L65 120 M80 102 L80 120 M105 100 L95 120" stroke={`${ACCENT}30`} strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M68 42 L75 55 L80 44 L85 55 L92 42" stroke={`${ACCENT}60`} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                {[{ l: 'Randevu', v: 'Online' }, { l: 'Uzman', v: 'Stilist' }, { l: 'Garanti', v: 'Memnuniyet' }].map((s, i) => (
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
          {[{ v: c1, s: '+', l: 'Memnun Müşteri' }, { v: c2, s: '%', l: 'Memnuniyet Oranı' }, { v: c3, s: '+', l: 'Yıllık Deneyim' }].map((s, i) => (
            <div key={i} style={{ padding: '48px 32px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,.05)' : 'none', opacity: statsInView ? 1 : 0, transition: `opacity .6s ${i * .15}s ease` }}>
              <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px', color: '#f0ebf5', lineHeight: 1 }}>{statsInView ? s.v.toLocaleString('tr-TR') : '0'}{s.s}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section id="services" style={{ padding: '96px 32px', maxWidth: 1100, margin: '0 auto' }} ref={servicesRef}>
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>Hizmetlerimiz</div>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1 }}>Her güzellik ihtiyacınız<br />için profesyonel çözüm</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {services.map((s, i) => (
            <div key={i} className="scard" style={{ opacity: servicesInView ? 1 : 0, transform: servicesInView ? 'translateY(0)' : 'translateY(32px)', transition: `opacity .6s ${i * .1}s ease, transform .6s ${i * .1}s cubic-bezier(.2,0,0,1)` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>{s.sub}</div>
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, letterSpacing: '-.5px' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, marginBottom: 20 }}>{s.desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {s.features.map((f, j) => <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}><Check size={13} style={{ color: ACCENT, flexShrink: 0 }} />{f}</li>)}
              </ul>
              <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{s.price}</span>
                <a href={waUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: ACCENT, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Randevu <ChevronRight size={14} /></a>
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
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: 24 }}>Güzellik bir deneyimdir,<br />biz bunu yaşatırız</h2>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.75, marginBottom: 36 }}>{businessName} olarak her müşterimize özel zaman ve özen ayırıyoruz. Randevusuz bekleme yok, koşturmaca yok.</p>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle size={16} /> Online Randevu Al</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <Scissors size={20} style={{ color: ACCENT }} />, title: 'Uzman Stilistler', desc: 'Yurt içi ve yurt dışı eğitim almış sertifikalı stilistlerimizle çalışıyoruz.' },
              { icon: <Shield size={20} style={{ color: ACCENT }} />, title: 'Premium Ürünler', desc: 'Saçınıza sadece Kerastase, L\'Oreal Professionnel ve Wella gibi markaları uyguluyoruz.' },
              { icon: <Clock size={20} style={{ color: ACCENT }} />, title: 'Randevu Sistemi', desc: 'Online randevu alın, geldiğinizde sizi bekliyoruz. Bekleme süresi sıfır.' },
              { icon: <Zap size={20} style={{ color: ACCENT }} />, title: 'Kişisel Analiz', desc: 'Yüz şekilinize ve saç tipinize özel kişiselleştirilmiş danışmanlık hizmeti.' },
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
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Müşterilerimiz ne diyor?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { n: 'Defne S.', t: 'Düzenli Müşteri', txt: 'Saç boyası ve kesimden mükemmel çıktım. Stilist benim istediğimi tam anladı, hiç açıklama yapmak zorunda kalmadım.' },
            { n: 'Ceren Y.', t: 'Gelin Müşterisi', txt: 'Düğünümde gelin saçı ve makyajım için geldim. Hayatımın en güzel günüydü, bunda büyük payları var.' },
            { n: 'Merve K.', t: 'Keratin Müşterisi', txt: 'Keratin tedavisinden sonra saçlarım inanılmaz yumuşadı. 3 aydır düzgünce devam ediyor. Çok memnunum.' },
          ].map((r, i) => (
            <div key={i} className="rcard" style={{ opacity: reviewInView ? 1 : 0, transform: reviewInView ? 'translateY(0)' : 'translateY(24px)', transition: `opacity .55s ${i * .12}s ease, transform .55s ${i * .12}s ease` }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>{[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#fbbf24" stroke="none" />)}</div>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{r.txt}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${ACCENT}, #c026d3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{r.n[0]}</div>
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
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 46px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>En güzel halinizi<br /><span style={{ background: `linear-gradient(90deg, ${ACCENT}, #c026d3)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>keşfetmeye hazır mısınız?</span></h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7, marginBottom: 40 }}>Whatsapp'tan yazın, size en uygun randevu zamanını ayarlayalım.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '15px 32px', fontSize: 15 }}><MessageCircle size={18} /> WhatsApp ile Randevu</a>
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
