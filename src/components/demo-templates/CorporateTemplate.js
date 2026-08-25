"use client";

import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Sparkles, Check, Star, MessageCircle, Building2, ArrowRight } from 'lucide-react';
import DemoFloatingBar from './DemoFloatingBar';

export default function CorporateTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const waUrl = `https://wa.me/${cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, hizmetleriniz hakkında bilgi ve teklif almak istiyorum.`)}`;

  return (
    <div style={{ background: '#0a0f1d', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @media (max-width: 480px) {
          .phone-text { display: none; }
          .nav-phone-btn { padding: 9px !important; }
          .nav-cta-btn { padding: 9px 12px !important; font-size: 13px !important; }
          .nav-buttons { gap: 8px !important; }
        }
      `}</style>
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,15,29,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>{businessName}</div>
            <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>KURUMSAL HİZMETLER</div>
          </div>
        </div>

        <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {phone && (
            <a href={`tel:${phone}`} className="nav-phone-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '8px' }}>
              <Phone size={15} color="#818cf8" /> <span className="phone-text">{phone}</span>
            </a>
          )}
          <a href={waUrl} target="_blank" rel="noreferrer" className="nav-cta-btn" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageCircle size={16} /> Teklif Al
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '6px 14px', borderRadius: '999px', color: '#818cf8', fontSize: '13px', fontWeight: 700, marginBottom: '20px' }}>
            <Sparkles size={15} /> Güvenilir, Profesyonel ve Hızlı Çözümler
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1px' }}>
            İhtiyacınıza Özel <span style={{ background: 'linear-gradient(135deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kaliteli & Garantili</span> Hizmet
          </h1>

          <p style={{ fontSize: '17px', color: '#cbd5e1', margin: '0 0 32px', lineHeight: 1.6 }}>
            <strong>{businessName}</strong> olarak sektördeki tecrübemiz ve müşteri odaklı yaklaşımımızla sizlere en yüksek standartlarda hizmet sunuyoruz.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(99,102,241,0.4)' }}>
              WhatsApp'tan Teklif Al <ArrowRight size={18} />
            </a>
            {phone && (
              <a href={`tel:${phone}`} style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} /> Doğrudan Ara
              </a>
            )}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '48px', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <strong>{rating || '4.9'}</strong> Müşteri Memnuniyeti
            </div>
            <div>&bull;</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="#22c55e" /> %100 Güvenilir Hizmet
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px' }}>Öne Çıkan Faaliyetlerimiz</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>Sizin için en doğru çözümleri üretiyoruz</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[
            { title: "Bireysel ve Kurumsal Çözümler", desc: "İhtiyacınıza en uygun paket ve planlamalarla eksiksiz hizmet.", icon: "💼", tag: "Profesyonel" },
            { title: "Hızlı & Zamanında Teslimat", desc: "Planlanan sürede, aksama olmadan işinizi eksiksiz tamamlama güvencesi.", icon: "⚡", tag: "Dakik" },
            { title: "Uzman ve Deneyimli Kadro", desc: "İşinde uzman, eğitimli ve tecrübeli ekip ile güven veren sonuçlar.", icon: "👥", tag: "Deneyim" },
            { title: "Şeffaf Fiyatlandırma", desc: "Sürpriz maliyetler olmadan, en baştan net ve uygun fiyat teklifleri.", icon: "🏷️", tag: "Dürüst" },
            { title: "Garantili ve Belgeli İşçilik", desc: "Hizmet sonrası destek ve tam memnuniyet taahhüdü.", icon: "🛡️", tag: "Güvence" },
            { title: "7/24 İletişim ve Destek", desc: "Sorularınız ve talepleriniz için dilediğiniz an ulaşabileceğiniz destek hattı.", icon: "📞", tag: "Kesintisiz" }
          ].map((srv, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{srv.icon}</span>
                  <span style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{srv.tag}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>{srv.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{srv.desc}</p>
              </div>

              <a href={waUrl} target="_blank" rel="noreferrer" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Detaylı Bilgi &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Location & Contact Section */}
      <section style={{ padding: '60px 24px 120px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px' }}>İletişime Geçin</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Projeniz, talebiniz veya fiyat teklifleri için bizi arayabilir ya da formu doldurarak bize ulaşabilirsiniz.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <MapPin size={18} color="#818cf8" /> <span>{address}</span>
                </div>
              )}
              {phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <Phone size={18} color="#818cf8" /> <span>{phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                <Clock size={18} color="#818cf8" /> <span>Pazartesi - Cumartesi: 09:00 - 18:30</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <MessageCircle size={28} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Hızlı Bilgi Alın</h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>WhatsApp üzerinden hemen mesaj atarak teklifinizi öğrenin.</p>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>
              WhatsApp'tan Ulaşın 🚀
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
        &copy; {new Date().getFullYear()} {businessName}. Tüm Hakları Saklıdır.
      </footer>

      {/* Sticky Conversion Bar */}
      <DemoFloatingBar businessName={businessName} phone={phone} refCode={refCode} />

    </div>
  );
}
