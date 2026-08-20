"use client";

import { useState } from 'react';
import { Sparkles, MessageCircle, X, CheckCircle, Clock } from 'lucide-react';

export default function DemoFloatingBar({ businessName, phone, refCode }) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  const agencyPhone = "905432300157"; // Kodiva Ajans resmi iletişim ve yayına alma hattı
  const message = `Merhaba Kodiva Ajans, "${businessName}" için hazırladığınız canlı demo web sitesini inceledim. Sitemi yayına almak ve teklifinizi görüşmek istiyorum. (Ref: ${refCode || 'web'})`;
  const whatsappUrl = `https://wa.me/${agencyPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '850px',
      zIndex: 99999,
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(129, 140, 248, 0.3)',
      borderRadius: '16px',
      padding: '12px 18px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(99,102,241,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
      color: '#fff',
      animation: 'slideUp 0.5s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#818cf8' }}>{businessName}</span> Özel Canlı Tasarım Demosu
            <span style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontSize: '10px', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>CANLI ÖNİZLEME</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Bu tasarım işletmeniz için <strong>24 saatliğine</strong> rezerve edilmiştir.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            padding: '9px 16px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(34,197,94,0.4)',
            transition: 'transform 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          <MessageCircle size={16} /> Bu Tasarımı Yayına Al 🚀
        </a>

        <button 
          onClick={() => setClosed(true)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#94a3b8',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Kapat"
        >
          <X size={14} />
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 50px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
