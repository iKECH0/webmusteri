"use client";
import { useState } from 'react';
import axios from 'axios';
import { Search, List, Zap, BarChart2 } from 'lucide-react';

export default function SearchTab({ onSearchComplete }) {
  const [mode, setMode] = useState('single'); // single | batch
  const [query, setQuery] = useState('Kadıköy oto yıkama');
  const [batchQueries, setBatchQueries] = useState(
    'Kadıköy oto yıkama\nÜsküdar oto yıkama\nKadıköy halı yıkama'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const handleSingleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');
    try {
      const res = await axios.post('/api/search', { query });
      if (res.data.error) { setError(res.data.error); }
      else {
        setResults(res.data.results || []);
        onSearchComplete();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Arama sırasında hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBatchSearch = async (e) => {
    e.preventDefault();
    const queries = batchQueries.split('\n').map(q => q.trim()).filter(Boolean);
    if (!queries.length) return;
    
    setIsSearching(true);
    setError('');
    setBatchProgress({ current: 0, total: queries.length });

    try {
      const res = await axios.post('/api/search/batch', { queries });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResults(res.data.results || []);
        setBatchProgress({ current: queries.length, total: queries.length });
        onSearchComplete();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Toplu arama sırasında hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  const noWebsite = results.filter(r => !r.hasWebsite);

  return (
    <div className="glass-panel">
      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1 }}
          onClick={() => setMode('single')}
        >
          <Search size={18} /> Tekli Arama
        </button>
        <button
          className={`btn ${mode === 'batch' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1 }}
          onClick={() => setMode('batch')}
        >
          <List size={18} /> Toplu Arama (Çoklu Bölge)
        </button>
      </div>

      {/* Single Search */}
      {mode === 'single' && (
        <form onSubmit={handleSingleSearch} style={{ display: 'flex', gap: '16px' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="text"
              className="glass-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Örn: Ankara Çankaya halı yıkama"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSearching}>
            {isSearching ? 'Taranıyor...' : 'Firmaları Bul'}
          </button>
        </form>
      )}

      {/* Batch Search */}
      {mode === 'batch' && (
        <form onSubmit={handleBatchSearch}>
          <div className="input-group">
            <label style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Her satıra bir arama yazın. Sistem sırayla hepsini tarar.
            </label>
            <textarea
              className="glass-input"
              rows={6}
              value={batchQueries}
              onChange={e => setBatchQueries(e.target.value)}
              placeholder={"Kadıköy oto yıkama\nÜsküdar oto yıkama\nMaltepe halı yıkama"}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSearching}>
            <Zap size={18} />
            {isSearching ? `Taranıyor... (${batchProgress.current}/${batchProgress.total})` : 'Toplu Taramayı Başlat'}
          </button>
          {isSearching && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: batchProgress.total ? `${(batchProgress.current / batchProgress.total) * 100}%` : '0%',
                  height: '100%', background: 'var(--accent-color)',
                  transition: 'width 0.5s ease', borderRadius: '99px'
                }} />
              </div>
            </div>
          )}
        </form>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px', marginTop: '16px' }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {isSearching && !error && (
        <div className="loader-container" style={{ marginTop: '24px' }}>
          <div className="spinner"></div>
          <p>Google Haritalar üzerinde tarama yapılıyor...</p>
        </div>
      )}

      {/* Results */}
      {!isSearching && results.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>
              {results.length} firma bulundu — <span style={{ color: '#f87171', fontWeight: 700 }}>{noWebsite.length} tanesi potansiyel müşteri</span>
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="status-badge status-danger">{noWebsite.length} Site Yok</span>
              <span className="status-badge status-success">{results.length - noWebsite.length} Site Var</span>
            </div>
          </div>
          <div className="data-grid">
            {results.map((r, i) => (
              <div key={i} className={`data-card glass-panel ${!r.hasWebsite ? 'card-highlight' : ''}`} style={{ padding: '20px' }}>
                <div className="card-header">
                  <h4 className="card-title">{r.name}</h4>
                  {r.hasWebsite
                    ? <span className="status-badge status-success">✓ Site Var</span>
                    : <span className="status-badge status-danger">✗ Site Yok</span>
                  }
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {r.address && <div className="card-info"><span>📍</span> <span>{r.address}</span></div>}
                  {r.phone && <div className="card-info"><span>📞</span> <span>{r.phone}</span></div>}
                  {r.website && <div className="card-info"><span>🌐</span> <a href={r.website} target="_blank" rel="noreferrer">Siteye Git</a></div>}
                  {r.query && <div className="card-info"><span>🔍</span> <span style={{ fontSize: '12px', opacity: 0.6 }}>{r.query}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
