"use client";

import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Sparkles, Check, Star, Car, ArrowRight, MessageCircle } from 'lucide-react';
import DemoFloatingBar from './DemoFloatingBar';

export default function CarWashTemplate({ businessName, phone, address, rating, reviewCount, refCode }) {
  const cleanPhone = phone?.replace(/[^0-9]/g, '') || '';
  const waUrl = `https://wa.me/${cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone}?text=${encodeURIComponent(`Merhaba ${businessName}, oto yıkama randevusu almak istiyorum.`)}`;

  return (
    <div style={{ background: '#0a0d14', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,13,20,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Car size={22} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>{businessName}</div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>OTO YIKAMA & DETAYLI TEMİZLİK</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {phone && (
            <a href={`tel:${phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Phone size={15} color="#38bdf8" /> {phone}
            </a>
          )}
          <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: '#22c55e', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageCircle size={16} /> Randevu Al
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(2,132,199,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', padding: '6px 14px', borderRadius: '999px', color: '#38bdf8', fontSize: '13px', fontWeight: 700, marginBottom: '20px' }}>
            <Sparkles size={15} /> Profesyonel Detailing & Seramik Kaplama
          </div>

          <h1 style={{ fontSize: '46px', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1px' }}>
            Aracınız İlk Günkü <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kusursuz Parlaklığına</span> Kavuşsun
          </h1>

          <p style={{ fontSize: '17px', color: '#94a3b8', margin: '0 0 32px', lineHeight: 1.6 }}>
            <strong>{businessName}</strong> uzman ekibi ve premium kimyasal bakım ürünleriyle aracınıza hak ettiği profesyonel temizlik ve korumayı sağlıyoruz.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(2,132,199,0.4)' }}>
              Online Randevu Oluştur <ArrowRight size={18} />
            </a>
            {phone && (
              <a href={`tel:${phone}`} style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={18} /> Bizi Arayın
              </a>
            )}
          </div>

          {/* Social Proof */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '48px', flexWrap: 'wrap', color: '#cbd5e1', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <strong>{rating || '4.9'}</strong> Puan ({reviewCount || '150+'} Mutlu Müşteri)
            </div>
            <div>&bull;</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="#22c55e" /> %100 Memnuniyet Garantisi
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px' }}>Hizmetlerimiz</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>Aracınızın ihtiyacı olan her şey tek bir noktada</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {[
            { title: "Detaylı İç & Dış Yıkama", desc: "Özel pH nötr şampuanlar ve mikrofiber bezlerle çiziksiz gövde ve jant temizliği.", icon: "🚗", tag: "En Popüler" },
            { title: "Pasta Cila & Boya Düzeltme", desc: "Güneş yanıkları, kılcal çizikler ve matlaşmış boyayı orijinal fabrikasyon parlaklığına döndürür.", icon: "✨", tag: "Premium" },
            { title: "Seramik Kaplama (1-3 Yıl)", desc: "Su, toz ve UV ışınlarına karşı 9H sertliğinde nano seramik koruma kalkanı.", icon: "🛡️", tag: "Uzun Ömürlü" },
            { title: "Koltuk & Tavan Yıkama", desc: "Buharlı vakum teknolojisiyle döşemelerdeki derin kirleri, lekeleri ve kötü kokuları yok eder.", icon: "🧼", tag: "Hijyenik" },
            { title: "Motor Temizleme & Koruma", desc: "Susuz dielektrik solüsyonlarla motor aksamına zarar vermeden detaylı toz ve yağ arındırma.", icon: "⚙️", tag: "Uzmanlık" },
            { title: "Ozon Gazı Dezenfeksiyonu", desc: "Klima kanalları ve kabin içindeki tüm bakteri, virüs ve sigara kokularını sıfırlar.", icon: "🌿", tag: "Sağlık" }
          ].map((srv, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{srv.icon}</span>
                  <span style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>{srv.tag}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>{srv.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{srv.desc}</p>
              </div>

              <a href={waUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Fiyat & Randevu Bilgisi &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Packages */}
      <section style={{ padding: '60px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px' }}>Popüler Paketler</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 40px' }}>İhtiyacınıza en uygun bakım paketini seçin</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '18px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px' }}>Standart Bakım</h3>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#38bdf8', marginBottom: '16px' }}>Hızlı & Temiz</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Köpüklü Dış Yıkama</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Detaylı İç Süpürme</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Torpido & Kapı Bakımı</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Jant ve Lastik Parlatma</li>
              </ul>
              <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>Randevu Al</a>
            </div>

            <div style={{ background: 'linear-gradient(180deg, rgba(2,132,199,0.15), rgba(0,0,0,0.4))', borderRadius: '18px', padding: '28px', border: '2px solid #0284c7', textAlign: 'left', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px' }}>EN ÇOK TERCİH EDİLEN</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px' }}>VIP Detailing Paketi</h3>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#38bdf8', marginBottom: '16px' }}>Tam Kapsamlı</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Standart Bakım Dahil</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Koltuk & Taban Buharlı Yıkama</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Hızlı Cila Boya Koruması</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Ozonlu Koku & Virüs Temizliği</li>
              </ul>
              <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: '#0284c7', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800 }}>VIP Randevu Al</a>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '18px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px' }}>Seramik & Pasta Cila</h3>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#818cf8', marginBottom: '16px' }}>Orijinal Parlaklık</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> 3 Aşamalı Pasta Cila</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Çizik Giderme & Hare Temizliği</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> 2 Yıl Garantili Seramik Kaplama</li>
                <li style={{ display: 'flex', gap: '8px' }}><Check size={16} color="#22c55e" /> Cam ve Jant Su İtici Kaplama</li>
              </ul>
              <a href={waUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>Fiyat Teklifi İste</a>
            </div>

          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section style={{ padding: '60px 24px 120px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px' }}>Bize Ulaşın</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Randevu almak veya aklınıza takılan soruları sormak için çalışma saatleri içerisinde bizi arayabilir ya da WhatsApp'tan yazabilirsiniz.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <MapPin size={18} color="#38bdf8" /> <span>{address}</span>
                </div>
              )}
              {phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                  <Phone size={18} color="#38bdf8" /> <span>{phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                <Clock size={18} color="#38bdf8" /> <span>Pazartesi - Cumartesi: 08:30 - 20:00</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <MessageCircle size={28} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Hızlı WhatsApp Hattı</h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Konumunuzu gönderin, yol tarifi verelim veya müsaitlik durumunu sorgulayın.</p>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ width: '100%', background: '#22c55e', color: '#fff', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '14px' }}>
              WhatsApp'tan Konuş 💬
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
