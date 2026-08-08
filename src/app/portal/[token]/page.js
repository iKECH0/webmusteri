"use client";
import React, { useState, useEffect, use, useRef } from 'react';
import { CheckCircle2, Monitor, ShieldCheck, Zap, BarChart, Clock, MessageSquare, Briefcase, FileText, Smartphone } from 'lucide-react';

export default function PortalPage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionDone, setActionDone] = useState('');

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 hours in seconds
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen, chatLoading]);

  const formatMessageText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return (
        <span key={index}>
          {part.split('\\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </span>
      );
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setData(d);
          setMessages([{ role: 'assistant', content: `Sayın ${d.lead.name} yetkilisi, dijital dönüşüm teklifinize hoş geldiniz. Sunumumuz veya teklif detayları hakkında sormak istediğiniz her konuda size buradan yardımcı olabilirim.` }]);
        }
        setLoading(false);
      })
      .catch(() => { setError('Bağlantı hatası.'); setLoading(false); });
  }, [token]);

  const handleAction = async (action) => {
    const res = await fetch(`/api/portal/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const d = await res.json();
    if (d.success) setActionDone(action === 'approve' ? 'approved' : 'rejected');
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`/api/portal/${token}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const d = await res.json();
      if (d.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: d.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Üzgünüm, şu an bağlantı kuramıyorum.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bağlantı hatası oluştu.' }]);
    }
    setChatLoading(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <h2 style={{ color: '#0f172a', fontWeight: 700, marginBottom: 8 }}>Teklif Bağlantısı Geçersiz</h2>
        <p style={{ color: '#64748b' }}>{error}</p>
      </div>
    </div>
  );

  const { lead, quotes } = data;
  const latestQuote = quotes?.[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #f8fafc; min-height: 100vh; color: #334155; overflow-x: hidden; }
        .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05); border-radius: 24px; }
        .gradient-text { background: linear-gradient(135deg, #2563eb, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .btn-primary { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.5); }
        .btn-outline { background: transparent; color: #0f172a; border: 2px solid #cbd5e1; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; }
        .btn-outline:hover { border-color: #0f172a; }

        /* Responsive Utilities */
        .hero-section { padding: 100px 20px 140px; }
        .hero-title { font-size: 3.5rem; line-height: 1.1; margin-bottom: 24px; letter-spacing: -1px; }
        .hero-subtitle { font-size: 1.125rem; line-height: 1.6; max-width: 600px; margin: 0 auto 40px; }
        .content-container { margin: -80px auto 0; padding: 0 20px; max-width: 1000px; position: relative; z-index: 10; }
        
        .glass-card-padding { padding: 40px; }
        .why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; align-items: center; }
        .competitor-flex { display: flex; gap: 16px; align-items: flex-start; }
        
        .mockup-nav { padding: 24px 40px; display: flex; justify-content: space-between; }
        .mockup-body-padding { padding: 60px 40px; }
        .mockup-hero-title { font-size: 40px; font-weight: 800; color: white; line-height: 1.2; margin-bottom: 24px; }
        
        .pricing-header { padding: 24px 40px; }
        .pricing-item { padding: 20px 40px; }
        .pricing-total { padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; }
        .pricing-total-amount { font-size: 36px; }
        .pricing-notes { padding: 24px 40px; }
        .pricing-actions { padding: 32px 40px; }
        
        .action-buttons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .timeline-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 80px; }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .hero-section { padding: 60px 20px 100px; }
          .hero-title { font-size: 2.2rem; }
          .hero-subtitle { font-size: 1rem; margin-bottom: 30px; }
          .content-container { margin-top: -60px; padding: 0 16px; }
          
          .glass-card-padding { padding: 24px !important; }
          .why-grid { grid-template-columns: 1fr; gap: 24px; }
          .competitor-flex { flex-direction: column; }
          
          .mockup-nav { padding: 16px 20px; flex-direction: column; gap: 16px; text-align: center; }
          .mockup-nav > div:last-child { justify-content: center; flex-wrap: wrap; gap: 12px; }
          .mockup-body-padding { padding: 40px 20px; text-align: center; }
          .mockup-hero-title { font-size: 28px; }
          .mockup-body-padding p { font-size: 14px; margin-bottom: 24px; }
          
          .pricing-header { padding: 20px 24px; }
          .pricing-item { padding: 16px 24px; flex-direction: column; align-items: flex-start; gap: 8px; }
          .pricing-total { padding: 24px; flex-direction: column; text-align: center; gap: 16px; }
          .pricing-total-amount { font-size: 32px; }
          .pricing-notes { padding: 20px 24px; }
          .pricing-actions { padding: 24px; }
          
          .action-buttons-grid { grid-template-columns: 1fr; }
          .timeline-grid { grid-template-columns: 1fr; gap: 32px; margin-bottom: 40px; }
          
          .chatbot-window { width: calc(100vw - 40px) !important; height: 70vh !important; bottom: 80px !important; right: 20px !important; }
        }
      `}</style>

      {/* FOMO Banner */}
      {actionDone !== 'approved' && (
        <div style={{ background: 'linear-gradient(to right, #ef4444, #f97316)', color: 'white', padding: '12px 20px', textAlign: 'center', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Clock size={18} />
          <span>Size Özel İndirimli Teklifin Süresi Doluyor:</span>
          <span style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', fontSize: 16 }}>{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* Hero Section (Corporate Premium) */}
      <div className="hero-section" style={{ background: '#0a1128', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(10,17,40,0) 70%)', zIndex: 1 }}></div>
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 30, color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 32 }}>
            <Briefcase size={16} /> Özel Teklif ve Proje Kapsamı
          </div>
          <h1 className="hero-title" style={{ color: 'white', fontWeight: 800 }}>
            {lead.name} <br/> <span style={{ color: '#3b82f6' }}>Dijital Dönüşüm Projesi</span>
          </h1>
          <p className="hero-subtitle" style={{ color: '#94a3b8' }}>
            İşletmenizin kurumsal kimliğini internete taşıyacak, size 7/24 kesintisiz müşteri kazandıracak premium web sitesi yatırım planı.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="content-container">
        
        {/* Quotes Section (Moved from hero) */}
        {latestQuote && (
          <div style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', color: '#0f172a', margin: '0 0 32px' }}>Yatırım Planı & Kapsam</h2>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#f8fafc', padding: '24px 32px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{latestQuote.title || 'Proje Teklifi'}</h3>
              </div>
              <div style={{ padding: '0 32px' }}>
                {latestQuote.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: i < latestQuote.items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{item.desc}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.price} ₺</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f8fafc', padding: '24px 32px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 18, color: '#64748b', fontWeight: 600 }}>Toplam Yatırım</div>
                <div style={{ fontSize: 32, color: '#3b82f6', fontWeight: 800 }}>{latestQuote.total} ₺</div>
              </div>
              {latestQuote.notes && (
                <div style={{ padding: '24px 32px', background: 'white', color: '#64748b', fontSize: 14, borderTop: '1px dashed #cbd5e1' }}>
                  <strong style={{ color: '#0f172a' }}>Notlar:</strong> {latestQuote.notes}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            {actionDone ? (
              <div style={{ marginTop: 40, textAlign: 'center', padding: 32, background: actionDone === 'approved' ? '#ecfdf5' : '#fef2f2', borderRadius: 16, border: `1px solid ${actionDone === 'approved' ? '#a7f3d0' : '#fecaca'}` }}>
                {actionDone === 'approved' ? (
                  <>
                    <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: 24, fontWeight: 700, color: '#065f46', marginBottom: 8 }}>Teklifi Onayladınız!</h3>
                    <p style={{ color: '#047857' }}>Harika bir karar! Projenizi başlatmak için en kısa sürede sizinle iletişime geçeceğiz.</p>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: 24, fontWeight: 700, color: '#9f1239', marginBottom: 8 }}>Teklifi Reddettiniz</h3>
                    <p style={{ color: '#be123c' }}>Kararınıza saygı duyuyoruz. İleride tekrar görüşmek dileğiyle.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="action-buttons-grid" style={{ marginTop: 32 }}>
                <button onClick={() => handleAction('approve')} className="btn-primary" style={{ padding: '20px', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <CheckCircle2 size={24} /> Teklifi Onaylıyorum, Başlayalım!
                </button>
                <button onClick={() => handleAction('reject')} className="btn-outline" style={{ padding: '20px', fontSize: 16, borderColor: '#ef4444', color: '#ef4444' }}>
                  Şu an ilgilenmiyorum
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Why Digital? (The Problem/Opportunity) */}
        <div className="glass-card glass-card-padding why-grid" style={{ marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Neden Bir Web Sitesine İhtiyacınız Var?</h2>
            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>
              Google Haritalar üzerinden işletmenizi incelediğimizde yüksek bir potansiyele sahip olduğunuzu gördük. Ancak profesyonel bir web sitenizin olmaması, internetten araştırma yapan yüzlerce potansiyel müşteriyi rakiplerinize kaptırmanıza neden oluyor.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#1e40af', fontWeight: 600 }}>
              <CheckCircle2 size={20} /> Kurumsal güvenilirliğinizi artırın.
            </div>
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: 16, padding: 32, borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#0f172a', marginBottom: 8, lineHeight: 1 }}>%85</div>
            <p style={{ color: '#475569', fontWeight: 500 }}>Tüketicilerin %85'i bir işletmeyi ziyaret etmeden veya arama yapmadan önce kurumsal web sitesini inceliyor.</p>
          </div>
        </div>

        {/* AI Competitor Report */}
        {lead.competitor_report && (
          <div className="glass-card glass-card-padding" style={{ marginBottom: 32, borderLeft: '4px solid #f43f5e', background: 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 228, 230, 0.5))' }}>
            <div className="competitor-flex">
              <div style={{ background: '#fff1f2', color: '#e11d48', padding: 12, borderRadius: 12, display: 'inline-flex' }}>
                <BarChart size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#9f1239', marginBottom: 8 }}>Bölgesel Rakip Analizi</h3>
                <p style={{ color: '#881337', lineHeight: 1.6, fontWeight: 500 }}>{lead.competitor_report}</p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Mockup Section */}
        <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', color: '#0f172a', margin: '60px 0 32px' }}>
          Sizin İçin Tasarlayacağımız <span style={{ color: '#3b82f6' }}>Premium</span> Dijital Yapı
        </h2>
        <div style={{ marginBottom: 60, borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', background: 'white' }}>
          {/* Mac Header */}
          <div style={{ background: '#f8fafc', padding: '16px 24px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}></div>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#f59e0b', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}></div>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#10b981', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)' }}></div>
            <div style={{ marginLeft: 'auto', marginRight: 'auto', background: 'white', padding: '8px 24px', borderRadius: 8, fontSize: 13, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '60%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              <span style={{ color: '#10b981' }}>🔒</span> https://www.{lead.name.toLowerCase().replace(/[^a-z0-9ğüşöçı]/g, '') || 'websiteniz'}.com
            </div>
          </div>
          
          {/* Mockup Body (High-end SaaS style) */}
          <div style={{ background: '#0a0f24', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 500, overflow: 'hidden' }}>
            
            {/* Background glowing orbs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, background: '#3b82f6', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, background: '#8b5cf6', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>

            {/* Nav */}
            <div style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: -0.5 }}>
                {lead.name} <span style={{ color: '#3b82f6' }}>.</span>
              </div>
              <div style={{ display: 'none', gap: 32, fontSize: 14, fontWeight: 600, color: '#94a3b8', '@media (min-width: 768px)': { display: 'flex' } }}>
                <span style={{ color: 'white', cursor: 'pointer' }}>Anasayfa</span>
                <span style={{ cursor: 'pointer' }}>Hizmetlerimiz</span>
                <span style={{ cursor: 'pointer' }}>Hakkımızda</span>
              </div>
              <button style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
                Randevu Al
              </button>
            </div>

            {/* Hero Split Layout */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '40px 48px 80px', position: 'relative', zIndex: 10, flexWrap: 'wrap', gap: 48 }}>
              
              {/* Left Content */}
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>
                  Yeni Nesil İşletme
                </div>
                <h1 style={{ fontSize: 48, fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 24, letterSpacing: -1 }}>
                  Bölgenizdeki <br/> <span style={{ background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>En Çok Tercih Edilen</span> İşletme Olun.
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6, marginBottom: 40, maxWidth: 480 }}>
                  Müşterilerinize güven veren, 7/24 randevu ve talep toplayabilen modern dijital şubenizle rakiplerinize fark atın.
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button style={{ background: 'white', color: '#0f172a', padding: '16px 32px', borderRadius: 8, border: 'none', fontWeight: 800, fontSize: 16, boxShadow: '0 4px 14px rgba(255,255,255,0.1)' }}>
                    Hizmetleri İncele
                  </button>
                  <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '16px 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, fontSize: 16 }}>
                    İletişim
                  </button>
                </div>
              </div>

              {/* Right Visuals (Device Mockups) */}
              <div style={{ flex: '1 1 500px', position: 'relative', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                {/* MacBook Frame */}
                <div style={{ position: 'relative', width: '100%', maxWidth: 460, zIndex: 3, transform: 'perspective(1200px) rotateY(-8deg) rotateX(4deg)' }}>
                  {/* Screen enclosure */}
                  <div style={{ background: '#1e293b', border: '8px solid #cbd5e1', borderBottomWidth: 12, borderRadius: '12px 12px 0 0', overflow: 'hidden', aspectRatio: '16/10', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    {lead.desktop_mockup_url ? (
                      <img src={lead.desktop_mockup_url} alt="Masaüstü Tasarım" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#64748b', flexDirection: 'column', gap: 12 }}>
                        <Monitor size={48} opacity={0.3} />
                        <span style={{ fontWeight: 600 }}>Tasarım Hazırlanıyor</span>
                      </div>
                    )}
                  </div>
                  {/* Bottom Base */}
                  <div style={{ background: '#94a3b8', height: 16, width: '110%', marginLeft: '-5%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, position: 'relative', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}>
                    {/* Trackpad indent */}
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 4, background: '#64748b', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}></div>
                  </div>
                </div>

                {/* iPhone Frame */}
                <div style={{ position: 'absolute', right: '0%', bottom: '-5%', width: 130, zIndex: 4, transform: 'perspective(1200px) rotateY(-15deg) rotateX(5deg) translateY(-20px)' }}>
                  <div style={{ background: '#0f172a', border: '6px solid #334155', borderRadius: 24, padding: '2px', overflow: 'hidden', aspectRatio: '9/19', position: 'relative', boxShadow: '-10px 20px 40px rgba(0,0,0,0.6)' }}>
                    {/* iPhone Notch */}
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 50, height: 12, background: '#334155', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, zIndex: 5 }}></div>
                    
                    {/* Content */}
                    <div style={{ background: '#1e293b', width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }}>
                      {lead.mobile_mockup_url ? (
                        <img src={lead.mobile_mockup_url} alt="Mobil Tasarım" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#64748b', flexDirection: 'column', gap: 8 }}>
                          <Smartphone size={24} opacity={0.3} />
                          <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center' }}>Mobil<br/>Hazırlanıyor</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Features / Value Proposition */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 60 }}>
          {[
            { icon: <Monitor size={24} />, title: 'Modern Tasarım', desc: 'Sektörünüze özel, şık ve markanızı yansıtan premium arayüz.' },
            { icon: <Smartphone size={24} />, title: 'Mobil Uyumlu', desc: 'Telefon ve tabletlerde kusursuz çalışan esnek yapı.' },
            { icon: <Zap size={24} />, title: 'SEO ve Hız', desc: 'Google aramalarında sizi üst sıralara taşıyacak altyapı.' },
            { icon: <ShieldCheck size={24} />, title: 'Güvenlik & Destek', desc: 'SSL sertifikalı güvenli altyapı ve kesintisiz teknik destek.' }
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: '#f1f5f9', color: '#3b82f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* The Quote / Investment Plan */}
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', color: '#0f172a', marginBottom: 32 }}>Proje Kapsamı ve Yatırım Planı</h2>
        {latestQuote ? (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 60, border: '1px solid #cbd5e1' }}>
            <div className="pricing-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText color="#3b82f6" size={24} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>{latestQuote.title || 'Kurumsal Web Sitesi Sözleşmesi'}</h3>
            </div>
            
            <div>
              {latestQuote.items.map((item, i) => (
                <div key={i} className="pricing-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: i === latestQuote.items.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 500, color: '#334155', fontSize: 16 }}>{item.desc}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 18 }}>{parseFloat(item.price).toLocaleString('tr-TR')} ₺</span>
                </div>
              ))}
            </div>

            <div className="pricing-total" style={{ background: '#0f172a' }}>
              <div style={{ color: '#94a3b8', fontSize: 14 }}>
                Toplam Proje Bedeli <br/> <span style={{ fontSize: 12, opacity: 0.8 }}>(Vergiler Hariçtir)</span>
              </div>
              <div className="pricing-total-amount" style={{ color: 'white', fontWeight: 800 }}>
                {latestQuote.total?.toLocaleString('tr-TR')} ₺
              </div>
            </div>

            {latestQuote.notes && (
              <div className="pricing-notes" style={{ background: '#fffbeb', color: '#b45309', fontSize: 14, lineHeight: 1.6, borderTop: '1px solid #fde68a' }}>
                <span style={{ fontWeight: 700 }}>Açıklama:</span> {latestQuote.notes}
              </div>
            )}

            {/* Action Area */}
            <div className="pricing-actions" style={{ background: 'white' }}>
              {!actionDone && latestQuote.status === 'draft' ? (
                <div>
                  <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 24, fontSize: 14 }}>
                    Aşağıdaki "Projeyi Onayla" butonuna tıklayarak teklifi kabul edebilir ve dijital dönüşüm sürecinizi hemen başlatabilirsiniz.
                  </p>
                  <div className="action-buttons-grid">
                    <button onClick={() => handleAction('approve')} className="btn-primary" style={{ padding: '16px', fontSize: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={20} /> Projeyi Onayla ve Başlat
                    </button>
                    <button onClick={() => handleAction('reject')} className="btn-outline" style={{ padding: '16px', fontSize: 16, borderColor: '#ef4444', color: '#ef4444' }}>
                      Teklifi Reddet
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, borderRadius: 16, textAlign: 'center', background: actionDone === 'approved' || latestQuote.status === 'approved' ? '#f0fdf4' : '#fef2f2', border: `2px solid ${actionDone === 'approved' || latestQuote.status === 'approved' ? '#bbf7d0' : '#fecaca'}` }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{actionDone === 'approved' || latestQuote.status === 'approved' ? '🎉' : '❌'}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: actionDone === 'approved' || latestQuote.status === 'approved' ? '#15803d' : '#b91c1c', marginBottom: 8 }}>
                    {actionDone === 'approved' || latestQuote.status === 'approved' ? 'Tebrikler, Proje Onaylandı!' : 'Teklif Reddedildi.'}
                  </h3>
                  <p style={{ color: actionDone === 'approved' || latestQuote.status === 'approved' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                    {actionDone === 'approved' || latestQuote.status === 'approved' ? 'En kısa sürede proje yöneticimiz sizinle iletişime geçecektir.' : 'Kararınızı bize ilettiğiniz için teşekkür ederiz.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: 60, textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📝</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Teklif Hazırlanıyor</h3>
            <p style={{ color: '#64748b' }}>Sizin için en uygun proje kapsamı ve yatırım planı ekibimiz tarafından oluşturulmaktadır. Çok yakında bu sayfada görüntülenecektir.</p>
          </div>
        )}

        {/* Timeline */}
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', color: '#0f172a', marginBottom: 40 }}>Süreç Nasıl İşleyecek?</h2>
        <div className="timeline-grid">
          {[
            { step: '1', title: 'Onay ve Planlama', desc: 'Teklifi onaylamanızın ardından, istekleriniz analiz edilir ve yol haritası çizilir.' },
            { step: '2', title: 'Tasarım ve Yazılım', desc: 'Markanıza özel arayüz tasarlanır, yazılım altyapısı güvenle kodlanır.' },
            { step: '3', title: 'Test ve Yayına Alma', desc: 'Son kontrollerinizden sonra siteniz tüm cihazlara uyumlu şekilde yayına alınır.' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0f172a', color: 'white', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)' }}>
                {s.step}
              </div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{s.title}</h4>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '40px 0', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: 14 }}>
          <div style={{ fontWeight: 700, color: '#475569', fontSize: 16, marginBottom: 8 }}>Dijital Çözüm Ortağınız</div>
          &copy; {new Date().getFullYear()} Tüm Hakları Saklıdır. Gizlilik ve güvenlik standartlarına tam uyumludur.
        </footer>
      </div>

      {/* AI Premium Chatbot */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        {!chatOpen ? (
          <button 
            onClick={() => setChatOpen(true)}
            style={{ width: 64, height: 64, borderRadius: '50%', background: '#0f172a', color: 'white', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 15px 30px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
            <MessageSquare size={28} />
          </button>
        ) : (
          <div className="chatbot-window" style={{ width: 360, height: 550, background: 'white', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#0f172a', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Destek Asistanı</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%' }}></div> Çevrimiçi
                  </div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 28, cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Görüşmeniz uçtan uca şifrelenmiştir.</div>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: m.role === 'user' ? '#0f172a' : 'white', color: m.role === 'user' ? 'white' : '#334155', padding: '12px 16px', borderRadius: 16, borderBottomRightRadius: m.role === 'user' ? 4 : 16, borderBottomLeftRadius: m.role === 'assistant' ? 4 : 16, fontSize: 14, lineHeight: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: m.role === 'assistant' ? '1px solid #e2e8f0' : 'none' }}>
                  {formatMessageText(m.content)}
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: 16, borderBottomLeftRadius: 4, color: '#94a3b8', fontSize: 14, border: '1px solid #e2e8f0', display: 'flex', gap: 6 }}>
                  <span className="dot-pulse">●</span><span className="dot-pulse" style={{animationDelay: '0.2s'}}>●</span><span className="dot-pulse" style={{animationDelay: '0.4s'}}>●</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: 16, background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12 }}>
              <input type="text" placeholder="Mesajınızı yazın..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} style={{ flex: 1, padding: '12px 16px', background: '#f1f5f9', border: 'none', borderRadius: 20, fontSize: 14, outline: 'none' }} />
              <button onClick={sendChatMessage} disabled={chatLoading} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 20, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                ➤
              </button>
            </div>
            
            <style>{`
              .dot-pulse { animation: pulse 1.5s infinite; opacity: 0.3; }
              @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
            `}</style>
          </div>
        )}
      </div>
    </>
  );
}
