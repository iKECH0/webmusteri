"use client";
import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a1128',
      color: '#fff',
      fontFamily: '"Inter", sans-serif',
      textAlign: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Soft Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(10,17,40,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <div style={{ position: 'relative', zIndex: 1, animation: 'float 6s ease-in-out infinite' }}>
        <h1 style={{
          fontSize: '8rem',
          fontWeight: 900,
          margin: 0,
          background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1
        }}>
          404
        </h1>
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '10px', color: '#f8fafc' }}>
          Uzay boşluğunda kayboldunuz
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 30px', lineHeight: 1.6 }}>
          Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
        </p>

        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 28px',
          background: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '100px',
          fontWeight: 600,
          fontSize: '1rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Ana Sayfaya Dön
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
}
