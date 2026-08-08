"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function DummyAdminPage() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Redirecting (0-2s)
    const timer1 = setTimeout(() => setPhase(1), 2000);
    // Phase 2: Connecting (2-4s)
    const timer2 = setTimeout(() => setPhase(2), 4000);
    // Phase 3: Security check (4-5.5s)
    const timer3 = setTimeout(() => setPhase(3), 5500);
    // Phase 4: Prank (5.5s+)
    const timer4 = setTimeout(() => setPhase(4), 6500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className={phase === 4 ? 'siren-bg' : ''} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: phase === 4 ? '#ef4444' : '#0f172a',
      color: '#fff',
      fontFamily: 'sans-serif',
      transition: 'background 0.3s ease',
      overflow: 'hidden'
    }}>
      <div style={{ textAlign: 'center', maxWidth: 700, padding: 20 }}>
        {phase < 4 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <Loader2 size={56} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>
              {phase === 0 && "Admin paneline yönlendiriliyorsunuz..."}
              {phase === 1 && "Veritabanı bağlantısı kuruluyor..."}
              {phase === 2 && "Güvenlik protokolleri doğrulanıyor..."}
              {phase === 3 && <span style={{ color: '#ef4444' }}>Yetkisiz Giriş Şüphesi! Sistem kilitleniyor...</span>}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Lütfen bekleyin, bu işlem birkaç saniye sürebilir.</p>
          </div>
        ) : (
          <div style={{ animation: 'shake 0.5s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <ShieldAlert size={100} color="#fff" style={{ animation: 'pulse-icon 1s infinite' }} />
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
              İhlal Tespit Edildi!
            </h1>
            <p style={{ fontSize: '1.4rem', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
              Dikkat! Yetkisiz giriş denemesi. IP adresiniz kaydedildi ve Siber Suçlarla Mücadele birimine iletiliyor...
            </p>
            
            <div style={{ 
              marginTop: '40px', 
              padding: '30px', 
              background: 'rgba(0,0,0,0.4)', 
              borderRadius: '16px',
              border: '2px dashed rgba(255,255,255,0.3)',
              transform: 'rotate(-2deg)'
            }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '15px', color: '#fbbf24' }}>🕵️‍♂️ Şaka şaka!</h3>
              <p style={{ fontSize: '1.2rem', lineHeight: 1.5, margin: 0 }}>
                O kadar da kolay değil :) <br/>
                Burayı herkes biliyor, gerçek admin paneli başka bir boyutta.
              </p>
            </div>
            
            <a href="/" style={{
              marginTop: '30px',
              padding: '12px 24px',
              background: '#fff',
              color: '#ef4444',
              borderRadius: '100px',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              Usulca Ana Sayfaya Dön
            </a>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-15px); }
          20%, 40%, 60%, 80% { transform: translateX(15px); }
        }
        @keyframes pulse-icon {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes siren {
          0% { background-color: #ef4444; }
          50% { background-color: #7f1d1d; }
          100% { background-color: #ef4444; }
        }
        .siren-bg {
           animation: siren 1s infinite !important;
        }
      `}} />
    </div>
  );
}
