"use client";

import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Sparkles, Check, Star, MessageCircle, Wrench, Zap, AlertTriangle } from 'lucide-react';
import DemoFloatingBar from './DemoFloatingBar';

export default function TechnicalServiceTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const waUrl = `https://wa.me/${cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, acil servis / arıza kaydı oluşturmak istiyorum.`)}`;

  return (
    <div style={{ background: '#09111e', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @media (max-width: 480px) {
          .phone-text { display: none; }
          .nav-phone-btn { padding: 9px !important; }
          .nav-cta-btn { padding: 9px 12px !important; font-size: 13px !important; }
          .nav-buttons { gap: 8px !important; }
        }
      `}</style>
      
      {/* Top Emergency Notice */}
      <div style={{ background: '#dc2626', color: '#fff', padding: '8px 16px', textAlign: 'center', fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: 800, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <AlertTriangle size={16} /> 7/24 ACİL SERVİS &bull; 30 DAKİKADA KAPINIZDA USTA DESTEĞİ
      </div>

      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(9,17,30,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Wrench size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>{businessName}</div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>TESİSAT & TEKNİK SERVİS</div>
          </div>
        </div>

        <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {phone && (
            <a href={`tel:${phone}`} className="nav-phone-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '8px' }}>
              <Phone size={15} color="#ef4444" /> <span className="phone-text">{phone}</span>
            </a>
          )}
          <a href={phone ? `tel:${phone}` : waUrl} className="nav-cta-btn" style={{ background: '#dc2626', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={16} /> Acil Usta Çağır
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 14px', borderRadius: '999px', color: '#f87171', fontSize: '13px', fontWeight: 700, marginBottom: '20px' }}>
            <Zap size={15} /> Kırmadan Dökmeden Cihazla Arıza Tespiti
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1px' }}>
            Tesisat & Arızalara <span style={{ background: 'linear-gradient(135deg, #f87171, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hızlı, Garantili & Kesin</span> Çözüm
          </h1>

          <p style={{ fontSize: '17px', color: '#cbd5e1', margin: '0 0 32px', lineHeight: 1.6 }}>
            <strong>{businessName}</strong> sertifikalı usta kadrosu ve son teknoloji termal kameralı tespit cihazlarıyla ev ve iş yerinizdeki tüm arızaları garantili olarak çözer.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {phone && (
              <a href={`tel:${phone}`} style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(220,38,38,0.4)' }}>
                <Phone size={18} /> 7/24 Acil Usta Ara: {phone}
              </a>
            )}
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={18} color="#22c55e" /> WhatsApp Arıza Bildir
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '48px', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <strong>{rating || '4.9'}</strong> Puan ({reviewCount || '300+'} Başarılı Onarım)
            </div>
            <div>&bull;</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="#22c55e" /> 1 Yıl İşçilik & Parça Garantisi
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px' }}>Teknik Hizmetlerimiz</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>Ev ve iş yeriniz için profesyonel tesisat ve bakım hizmetleri</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[
            { title: "Termal Kameralı Su Kaçağı Tespiti", desc: "Evinizi kırmadan dökmeden, noktasal olarak su sızıntısını ve boru çatlaklarını bulup onarıyoruz.", icon: "🔍", tag: "Kırmadan" },
            { title: "Robotla Tıkanıklık Açma", desc: "Mutfak, banyo ve tuvalet giderlerindeki tıkanıklıkları özel spiral robotlarla borulara zarar vermeden açıyoruz.", icon: "🚿", tag: "Hızlı Çözüm" },
            { title: "Kombi & Petek Temizliği", desc: "Özel kimyasal ve çift yönlü yıkama makineleriyle peteklerin ısı verimini %40 artırıyoruz.", icon: "🔥", tag: "Tasarruf" },
            { title: "Elektrik Arıza & Tesisat Yenileme", desc: "Sigorta atması, kaçak akım rölesi montajı, avize ve aydınlatma montajı, komple hat çekimi.", icon: "⚡", tag: "7/24 Acil" },
            { title: "Klima Bakım & Gaz Dolumu", desc: "Klima dezenfeksiyonu, filtre temizliği, kompresör kontrolü ve orijinal gaz dolumu.", icon: "❄️", tag: "Sezonluk" },
            { title: "Batarya, Musluk & Rezervuar Değişimi", desc: "Su damlatan musluklar, gömme rezervuar tamiri ve vitrifiye montajı.", icon: "🔧", tag: "Orijinal Parça" }
          ].map((srv, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{srv.icon}</span>
                  <span style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{srv.tag}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>{srv.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{srv.desc}</p>
              </div>

              <a href={phone ? `tel:${phone}` : waUrl} style={{ color: '#f87171', textDecoration: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Hemen Usta Çağır &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Location & Contact Section */}
      <section style={{ padding: '60px 24px 120px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px' }}>7/24 Nöbetçi Teknik Ekip</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Günün her saati arıza kaydı bırakabilir veya acil usta talebinde bulunabilirsiniz. Ekibimiz bölgenize göre 30-45 dakika içinde adrese ulaşır.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <MapPin size={18} color="#f87171" /> <span>{address}</span>
                </div>
              )}
              {phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <Phone size={18} color="#f87171" /> <span>{phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                <Clock size={18} color="#f87171" /> <span>7 Gün 24 Saat Kesintisiz Acil Hizmet</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <Phone size={28} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Acil Durum Numarası</h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Vakit kaybetmeden hemen arayın, en yakın ustayı yönlendirelim.</p>
            {phone && (
              <a href={`tel:${phone}`} style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '15px' }}>
                Hemen Ara: {phone} 📞
              </a>
            )}
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
