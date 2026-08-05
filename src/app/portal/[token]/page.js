"use client";
import { useState, useEffect } from 'react';
import { use } from 'react';

export default function PortalPage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionDone, setActionDone] = useState('');

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b' }}>Yükleniyor...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <h2 style={{ color: '#1e293b' }}>Portal bulunamadı</h2>
        <p style={{ color: '#64748b' }}>{error}</p>
      </div>
    </div>
  );

  const { lead, quotes } = data;
  const latestQuote = quotes?.[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        body { background: linear-gradient(135deg, #f0f4ff 0%, #faf0ff 100%); min-height: 100vh; }
      `}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '16px 32px', borderRadius: 16, marginBottom: 20 }}>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>🚀 Müşteri Portalı</h1>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{lead.name}</h2>
          <p style={{ color: '#64748b' }}>{lead.address}</p>
        </div>

        {/* Action Done Banner */}
        {actionDone && (
          <div style={{ padding: '20px 24px', borderRadius: 12, marginBottom: 24, textAlign: 'center', fontWeight: 600, fontSize: 18,
            background: actionDone === 'approved' ? '#f0fdf4' : '#fef2f2',
            color: actionDone === 'approved' ? '#16a34a' : '#dc2626',
            border: `2px solid ${actionDone === 'approved' ? '#86efac' : '#fca5a5'}`,
          }}>
            {actionDone === 'approved' ? '✅ Teklifi onayladınız! En kısa sürede iletişime geçeceğiz.' : '❌ Teklifi reddettiniz. Daha uygun bir teklif için bize ulaşabilirsiniz.'}
          </div>
        )}

        {/* Latest Quote */}
        {latestQuote ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid #f1f5f9' }}>
              💼 {latestQuote.title || 'Teklif Detayı'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {latestQuote.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                  <span style={{ fontWeight: 500, color: '#334155' }}>{item.desc}</span>
                  <span style={{ fontWeight: 700, color: '#6366f1', fontSize: 18 }}>{parseFloat(item.price).toLocaleString('tr-TR')}₺</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12 }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: 18 }}>Toplam</span>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 24 }}>{latestQuote.total?.toLocaleString('tr-TR')}₺</span>
            </div>
            {latestQuote.notes && (
              <p style={{ marginTop: 16, color: '#64748b', fontSize: 14, lineHeight: 1.6, padding: '12px 16px', background: '#fffbeb', borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
                📝 {latestQuote.notes}
              </p>
            )}

            {/* Action Buttons */}
            {!actionDone && latestQuote.status === 'draft' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
                <button onClick={() => handleAction('approve')}
                  style={{ padding: '16px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                  ✅ Teklifi Onayla
                </button>
                <button onClick={() => handleAction('reject')}
                  style={{ padding: '16px', borderRadius: 12, border: '2px solid #dc2626', background: 'white', color: '#dc2626', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                  ❌ Reddet
                </button>
              </div>
            )}
            {latestQuote.status === 'approved' && !actionDone && (
              <div style={{ marginTop: 16, padding: 16, background: '#f0fdf4', borderRadius: 10, textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>✅ Bu teklif daha önce onaylandı.</div>
            )}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: '#64748b' }}>Henüz hazırlanmış bir teklif bulunmuyor. En kısa sürede size ulaşacağız.</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          Bu portal özel olarak sizin için oluşturulmuştur. Sorularınız için lütfen iletişime geçin.
        </div>
      </div>
    </>
  );
}
