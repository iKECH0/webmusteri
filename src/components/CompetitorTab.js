"use client";
import { useState } from 'react';
import axios from 'axios';
import { Search, Globe, Star, Phone } from 'lucide-react';

export default function CompetitorTab({ leads }) {
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.post('/api/competitor', { region });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analiz sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const noWebsite = leads.filter(l => !l.has_website).length;
  const withWebsite = leads.filter(l => l.has_website).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Search Form */}
      <div className="glass-panel">
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>🔍 Rakip Analizi</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          Seçtiğiniz bölgedeki web tasarım ajanslarını ve rakiplerinizi görmek için bölge girin.
        </p>
        <form onSubmit={analyze} style={{ display: 'flex', gap: 12 }}>
          <input className="glass-input" style={{ flex: 1 }} value={region}
            onChange={e => setRegion(e.target.value)}
            placeholder="Örn: Kadıköy, Ankara Çankaya, Beşiktaş" required />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={18} /> {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
          </button>
        </form>
        {error && <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: '#f87171' }}>{error}</div>}
      </div>

      {/* Market Overview from OUR data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>CRM'inizdeki Müşteriler</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{leads.length}</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', borderBottom: '3px solid #ef4444' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Fırsat (Site Yok)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f87171' }}>{noWebsite}</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', borderBottom: '3px solid #10b981' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Zaten Siteleri Var</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#34d399' }}>{withWebsite}</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center', borderBottom: '3px solid #6366f1' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Pazar Payı Fırsatı</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#818cf8' }}>
            {leads.length ? `%${Math.round((noWebsite / leads.length) * 100)}` : '0%'}
          </div>
        </div>
      </div>

      {/* Competitor Results */}
      {loading && (
        <div className="glass-panel loader-container">
          <div className="spinner" />
          <p>Bölgedeki web ajansları taranıyor...</p>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-panel" style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245,158,11,0.05)' }}>
            <h3 style={{ color: '#fbbf24', marginBottom: 8 }}>📊 {result.market_data.region} Bölgesi Pazar Özeti</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Bu bölgede <strong style={{ color: 'var(--text-primary)' }}>{result.agencies.length}</strong> web tasarım ajansı / rakip tespit edildi.
              CRM'inizde bu bölgede <strong style={{ color: '#f87171' }}>{result.market_data.our_leads_without_sites}</strong> site yok, bu demek ki potansiyel müşteri havuzunuzun büyük bir kısmına henüz ajanslar ulaşamamış.
            </p>
          </div>

          <div className="glass-panel">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Tespit Edilen Ajanslar / Rakipler ({result.agencies.length})</h3>
            {result.agencies.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Bu bölgede kayıtlı ajans bulunamadı — avantaj sizde!</p>
            ) : (
              <div className="data-grid">
                {result.agencies.map((a, i) => (
                  <div key={i} className="data-card glass-panel" style={{ padding: 16 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{a.name}</h4>
                    {a.rating && (
                      <div className="card-info">
                        <Star size={14} style={{ color: '#f59e0b' }} />
                        <span>{a.rating} ({a.reviewCount} yorum)</span>
                      </div>
                    )}
                    {a.phone && <div className="card-info"><Phone size={14} /><span>{a.phone}</span></div>}
                    {a.address && <div className="card-info" style={{ fontSize: 12, alignItems: 'flex-start' }}><span>📍</span><span>{a.address}</span></div>}
                    {a.website && (
                      <div className="card-info"><Globe size={14} />
                        <a href={a.website} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Siteye Git</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
