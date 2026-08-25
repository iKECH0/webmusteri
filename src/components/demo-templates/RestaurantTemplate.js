"use client";

import React, { useState } from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Sparkles, Check, Star, MessageCircle, Utensils, ShoppingBag } from 'lucide-react';
import DemoFloatingBar from './DemoFloatingBar';

export default function RestaurantTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const waUrl = `https://wa.me/${cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, sipariş vermek / masa ayırtmak istiyorum.`)}`;

  const [activeCategory, setActiveCategory] = useState('ana');

  const menu = {
    ana: [
      { name: "Şefin Özel Izgara Tabağı", desc: "Özel marine edilmiş kuzu pirzola, köfte ve tavuk şiş, fırınlanmış sebzeler ile.", price: "340 ₺", badge: "Şefin Tavsiyesi" },
      { name: "Geleneksel Tereyağlı İskender", desc: "Özel pide üzerinde taze kesim döner, manda yoğurdu ve közlenmiş biber.", price: "290 ₺", badge: "En Çok Satan" },
      { name: "Fırında Kaşarlı Güveç", desc: "Odun ateşinde ağır ağır pişmiş dana eti, mantar ve eritilmiş kaşar peyniri.", price: "270 ₺", badge: "" },
      { name: "Ev Yapımı Gurme Burger", desc: "180gr dana köfte, karamelize soğan, cheddar peyniri ve çıtır patates.", price: "240 ₺", badge: "Popüler" }
    ],
    tatli: [
      { name: "Fıstıklı Sıcak Katmer", desc: "Hakiki Gaziantep boz fıstığı, kaymak ve çıtır yufka.", price: "160 ₺", badge: "Taze" },
      { name: "Fırın Sütlaç", desc: "Geleneksel köy sütü ve vanilya aromasıyla üzeri nar gibi kızarmış.", price: "95 ₺", badge: "" },
      { name: "San Sebastian Cheesecake", desc: "İpeksi akışkan dokulu, sıcak çikolata sos eşliğinde.", price: "140 ₺", badge: "Çok Sevilen" }
    ],
    icecek: [
      { name: "Ev Yapımı Yayık Ayranı", desc: "Bol köpüklü taze yayık ayranı.", price: "40 ₺", badge: "Organik" },
      { name: "Taze Sıkma Portakal Suyu", desc: "Günlük taze portakallardan.", price: "70 ₺", badge: "C Vitamini" },
      { name: "Özel Demleme Çay", desc: "Rize çay yapraklarından taze demlenmiş.", price: "25 ₺", badge: "" }
    ]
  };

  return (
    <div style={{ background: '#120d0a', color: '#fef3c7', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @media (max-width: 480px) {
          .phone-text { display: none; }
          .nav-phone-btn { padding: 9px !important; }
          .nav-cta-btn { padding: 9px 12px !important; font-size: 13px !important; }
          .nav-buttons { gap: 8px !important; }
        }
      `}</style>
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(18,13,10,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Utensils size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>{businessName}</div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>RESTORAN & PAKET SERVİS</div>
          </div>
        </div>

        <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {phone && (
            <a href={`tel:${phone}`} className="nav-phone-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '8px' }}>
              <Phone size={15} color="#f59e0b" /> <span className="phone-text">{phone}</span>
            </a>
          )}
          <a href={waUrl} target="_blank" rel="noreferrer" className="nav-cta-btn" style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingBag size={16} /> Online Sipariş Ver
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(234,88,12,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 14px', borderRadius: '999px', color: '#fbbf24', fontSize: '13px', fontWeight: 700, marginBottom: '20px' }}>
            <Sparkles size={15} /> Geleneksel Tarifler & Taze Malzemeler
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1px' }}>
            Damağınızda İz Bırakacak <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Unutulmaz Lezzetler</span>
          </h1>

          <p style={{ fontSize: '17px', color: '#cbd5e1', margin: '0 0 32px', lineHeight: 1.6 }}>
            <strong>{businessName}</strong> olarak özenle seçilmiş günlük malzemelerle hazırladığımız eşsiz lezzetleri ister sıcak masamızda tadın, ister kapınıza sıcak getirelim.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg, #ea580c, #d97706)', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(234,88,12,0.4)' }}>
              <ShoppingBag size={18} /> WhatsApp'tan Sipariş Ver
            </a>
            {phone && (
              <a href={`tel:${phone}`} style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} /> Masa Rezervasyonu
              </a>
            )}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '48px', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <strong>{rating || '4.8'}</strong> Puan ({reviewCount || '250+'} Mutlu Misafir)
            </div>
            <div>&bull;</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} color="#f59e0b" /> Ortalama 30 Dk Teslimat
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Menu Section */}
      <section style={{ padding: '60px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px' }}>Özel Menümüz</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>Usta ellerden çıkan en lezzetli seçenekler</p>
        </div>

        {/* Category switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
          <button 
            onClick={() => setActiveCategory('ana')}
            style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: activeCategory === 'ana' ? '#ea580c' : 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
          >
            🥩 Ana Yemekler
          </button>
          <button 
            onClick={() => setActiveCategory('tatli')}
            style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: activeCategory === 'tatli' ? '#ea580c' : 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
          >
            🍰 Tatlılar
          </button>
          <button 
            onClick={() => setActiveCategory('icecek')}
            style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: activeCategory === 'icecek' ? '#ea580c' : 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
          >
            🥤 İçecekler
          </button>
        </div>

        {/* Menu Items Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {menu[activeCategory].map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{item.name}</h4>
                  {item.badge && (
                    <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{item.badge}</span>
                  )}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#fbbf24' }}>{item.price}</span>
                <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(234,88,12,0.2)', color: '#fb923c', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}>
                  Sipariş Et +
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location & Contact Section */}
      <section style={{ padding: '60px 24px 120px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px' }}>Lezzet Durağımıza Bekleriz</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Masa rezervasyonu veya paket siparişleriniz için bize dilediğiniz zaman ulaşabilirsiniz.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <MapPin size={18} color="#f59e0b" /> <span>{address}</span>
                </div>
              )}
              {phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <Phone size={18} color="#f59e0b" /> <span>{phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                <Clock size={18} color="#f59e0b" /> <span>Her Gün: 10:00 - 23:30 (Paket Servis Aktif)</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(234,88,12,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
              <MessageCircle size={28} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Hızlı WhatsApp Sipariş</h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Siparişinizi yazın, sıcak sıcak kapınıza getirelim.</p>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ width: '100%', background: 'linear-gradient(135deg, #ea580c, #d97706)', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>
              Sipariş Hattına Bağlan 🛵
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
