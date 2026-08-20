"use client";

import React, { useState } from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Sparkles, Check, Star, MessageCircle, Truck, Calculator } from 'lucide-react';
import DemoFloatingBar from './DemoFloatingBar';

export default function CarpetCleaningTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const waUrl = `https://wa.me/${cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, halı/koltuk yıkama için servis çağırmak istiyorum.`)}`;

  // Quick m2 calculator
  const [sqm, setSqm] = useState(12);
  const pricePerSqm = 60; // Average price in TL

  return (
    <div style={{ background: '#0b132b', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,19,43,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>
            🧼
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>{businessName}</div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>HALI & KOLTUK YIKAMA FABRİKASI</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {phone && (
            <a href={`tel:${phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '8px' }}>
              <Phone size={15} color="#38bdf8" /> {phone}
            </a>
          )}
          <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: '#22c55e', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={16} /> Ücretsiz Servis Çağır
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', padding: '6px 14px', borderRadius: '999px', color: '#22d3ee', fontSize: '13px', fontWeight: 700, marginBottom: '20px' }}>
            <Truck size={15} /> Kapınızdan Alıp Kapınıza Teslim Ediyoruz
          </div>

          <h1 style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1px' }}>
            Evinize Derinlemesine <span style={{ background: 'linear-gradient(135deg, #22d3ee, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hijyen & Ferahlık</span> Getiriyoruz
          </h1>

          <p style={{ fontSize: '17px', color: '#94a3b8', margin: '0 0 32px', lineHeight: 1.6 }}>
            <strong>{businessName}</strong> tam otomatik endüstriyel makineleri, bitkisel şampuanları ve antibakteriyel kurutma odalarıyla halı ve koltuklarınızı ilk günkü temizliğine kavuşturur.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(8,145,178,0.4)' }}>
              <Truck size={18} /> Ücretsiz Servis Talebi Oluştur
            </a>
            {phone && (
              <a href={`tel:${phone}`} style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} /> {phone}
              </a>
            )}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '48px', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <strong>{rating || '4.9'}</strong> Puan ({reviewCount || '200+'} Müşteri Yorumu)
            </div>
            <div>&bull;</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="#22c55e" /> %100 Leke Çıkarma Garantisi
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px' }}>Yıkama Hizmetlerimiz</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>En hassas dokumalardan ağır lekelere kadar uzman çözümler</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[
            { title: "Tam Otomatik Halı Yıkama", desc: "10 fırçalı bant sistemiyle toz alma, derin fırçalama, çift taraflı durulama ve sıkma.", icon: "🧶", tag: "En Çok Tercih Edilen" },
            { title: "Yerinde Koltuk Yıkama", desc: "Yüksek vakumlu buharlı makinelerle koltuk süngerine işlemiş mayt ve bakterileri yok eder.", icon: "🛋️", tag: "Yerinde Hizmet" },
            { title: "Yorgan & Battaniye Yıkama", desc: "Geniş tamburlu sanayi tipi makinelerde kişiye özel tek tek hijyenik yıkama.", icon: "🛏️", tag: "Kişiye Özel" },
            { title: "Stor & Zebra Perde Temizliği", desc: "Mekanizmasına zarar vermeden özel kimyasallarla hassas leke arındırma ve ütüleme.", icon: "🪟", tag: "Hassas Bakım" },
            { title: "Yün & El Dokuma Halı Bakımı", desc: "Renk karışmasını önleyen bitkisel kök şampuanlar ve özel el fırçalama teknikleri.", icon: "🎨", tag: "Uzmanlık" },
            { title: "Araç İçi Koltuk & Taban Yıkama", desc: "Aracınızın tüm kumaş ve deri döşemelerindeki sigara kokuları ve zorlu lekelerin temizliği.", icon: "🚗", tag: "Detaylı" }
          ].map((srv, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{srv.icon}</span>
                  <span style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{srv.tag}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>{srv.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{srv.desc}</p>
              </div>

              <a href={waUrl} target="_blank" rel="noreferrer" style={{ color: '#22d3ee', textDecoration: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Servis Çağır &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Price Calculator */}
      <section style={{ padding: '60px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#22d3ee', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
            <Calculator size={16} /> Pratik Fiyat Hesaplayıcı
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 20px' }}>Tahmini Halı Yıkama Tutarı</h2>
          
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '30px', textAlign: 'left' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
              <span>Tahmini Halı Alanınız:</span>
              <span style={{ color: '#22d3ee', fontSize: '18px' }}>{sqm} m² (Yaklaşık {Math.round(sqm / 6)} adet 6m² halı)</span>
            </label>

            <input 
              type="range" 
              min="4" 
              max="60" 
              value={sqm} 
              onChange={e => setSqm(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer', marginBottom: '24px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', padding: '16px 20px', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Tahmini Toplam Fiyat (Ücretsiz Servis Dahil)</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#22d3ee' }}>~{sqm * pricePerSqm} ₺</div>
              </div>
              <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: '#22c55e', color: '#fff', padding: '10px 18px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '13px' }}>
                Hemen Servis İste 🚚
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section style={{ padding: '60px 24px 120px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px' }}>Hemen Servis Yazdırın</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Bizi arayarak veya WhatsApp'tan konumunuzu paylaşarak ücretsiz servis kaydı oluşturabilirsiniz. Halılarınız aynı gün içinde kapınızdan teslim alınır.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <MapPin size={18} color="#22d3ee" /> <span>{address}</span>
                </div>
              )}
              {phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <Phone size={18} color="#22d3ee" /> <span>{phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                <Clock size={18} color="#22d3ee" /> <span>Haftanın 7 Günü: 08:00 - 21:00</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <MessageCircle size={28} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>WhatsApp'tan Konum Atın</h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Servis aracımızı en kısa sürede adresinize yönlendirelim.</p>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ width: '100%', background: '#22c55e', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>
              WhatsApp Servis Hattı 📲
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        &copy; {new Date().getFullYear()} {businessName}. Tüm Hakları Saklıdır.
      </footer>

      {/* Sticky Conversion Bar */}
      <DemoFloatingBar businessName={businessName} phone={phone} refCode={refCode} />

    </div>
  );
}
