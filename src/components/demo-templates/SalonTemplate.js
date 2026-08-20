"use client";

import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Sparkles, Check, Star, MessageCircle, Scissors, Calendar, Heart } from 'lucide-react';
import DemoFloatingBar from './DemoFloatingBar';

export default function SalonTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const waUrl = `https://wa.me/${cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, randevu oluşturmak istiyorum.`)}`;

  return (
    <div style={{ background: '#120d18', color: '#fdf4ff', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(18,13,24,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #ec4899, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Scissors size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>{businessName}</div>
            <div style={{ fontSize: '11px', color: '#f472b6', fontWeight: 600 }}>SAÇ TASARIM & GÜZELLİK SALONU</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {phone && (
            <a href={`tel:${phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '8px' }}>
              <Phone size={15} color="#f472b6" /> {phone}
            </a>
          )}
          <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} /> Randevu Al
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', padding: '6px 14px', borderRadius: '999px', color: '#f472b6', fontSize: '13px', fontWeight: 700, marginBottom: '20px' }}>
            <Heart size={15} /> Kişiye Özel Saç ve Güzellik Bakımı
          </div>

          <h1 style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1px' }}>
            Güzelliğinizi ve Tarzınızı <span style={{ background: 'linear-gradient(135deg, #f472b6, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Uzman Ellere</span> Bırakın
          </h1>

          <p style={{ fontSize: '17px', color: '#cbd5e1', margin: '0 0 32px', lineHeight: 1.6 }}>
            <strong>{businessName}</strong> olarak en trend saç modelleri, profesyonel renklendirme ve yenileyici cilt bakımlarıyla kendinizi özel hissettiriyoruz.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(236,72,153,0.4)' }}>
              <Calendar size={18} /> Online Randevu Oluştur
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
              <strong>{rating || '4.9'}</strong> Puan ({reviewCount || '180+'} Değerlendirme)
            </div>
            <div>&bull;</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="#f472b6" /> %100 Memnuniyet Garantisi
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px' }}>Popüler Hizmetlerimiz</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>Size en çok yakışacak tarzı birlikte tasarlayalım</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[
            { title: "Saç Tasarım & Kesim", desc: "Yüz tipinize en uygun modern kesimler ve kusursuz fön uygulamaları.", icon: "✂️", tag: "Trend" },
            { title: "Ombre, Sombre & Röfle", desc: "Doğal ışıltılar ve saç yapısını yıpratmayan lüks organik renklendirme.", icon: "🎨", tag: "Popüler" },
            { title: "Keratin & Botoks Bakımı", desc: "Yıpranmış saç telleri için yoğun onarıcı, parlaklık verici ve kalıcı pürüzsüzlük.", icon: "✨", tag: "Onarım" },
            { title: "Gelin Başı & Özel Gün Makyajı", desc: "En özel günlerinizde gün boyu kalıcı profesyonel porselen makyaj ve saç tasarımı.", icon: "👑", tag: "Özel Gün" },
            { title: "Medikal Manikür & Kalıcı Oje", desc: "Steril aletlerle kusursuz tırnak bakımı ve haftalarca bozulmayan nail art.", icon: "💅", tag: "Bakım" },
            { title: "Cilt Yenileme & Hydrafacial", desc: "Derinlemesine gözenek temizliği, siyah nokta arındırma ve nem terapisi.", icon: "🌸", tag: "Canlandırıcı" }
          ].map((srv, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{srv.icon}</span>
                  <span style={{ background: 'rgba(236,72,153,0.1)', color: '#f472b6', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{srv.tag}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>{srv.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{srv.desc}</p>
              </div>

              <a href={waUrl} target="_blank" rel="noreferrer" style={{ color: '#f472b6', textDecoration: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Randevu Al &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Location & Contact Section */}
      <section style={{ padding: '60px 24px 120px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px' }}>Salonumuza Bekliyoruz</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Sıcak bir kahve eşliğinde tarzınızı yenilemek için randevunuzu kolayca oluşturun.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <MapPin size={18} color="#f472b6" /> <span>{address}</span>
                </div>
              )}
              {phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <Phone size={18} color="#f472b6" /> <span>{phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                <Clock size={18} color="#f472b6" /> <span>Salı - Pazar: 09:00 - 20:00 (Pazartesi Kapalı)</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
              <MessageCircle size={28} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Hızlı WhatsApp Randevu</h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Tarih ve saat belirterek anında randevunuzu kesinleştirin.</p>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ width: '100%', background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>
              WhatsApp'tan Yaz 💌
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
