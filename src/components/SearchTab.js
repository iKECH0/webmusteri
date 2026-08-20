"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, List, Zap, Trash2, CheckSquare, Square, 
  Filter, Users, Phone, Globe, MapPin, ExternalLink, Check 
} from 'lucide-react';

export default function SearchTab({ fetchLeads, onSearchComplete }) {
  const [mode, setMode] = useState('single'); // single | batch
  const [query, setQuery] = useState('Kadıköy oto yıkama');
  const [batchQueries, setBatchQueries] = useState(
    'Kadıköy oto yıkama\nÜsküdar oto yıkama\nKadıköy halı yıkama'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Selection & Filtering state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'nowebsite' | 'haswebsite'
  const [agents, setAgents] = useState([]);
  const [assignAgentId, setAssignAgentId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data || []);
      if (res.data?.length > 0) {
        setAssignAgentId(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const notifyParent = () => {
    if (fetchLeads) fetchLeads();
    if (onSearchComplete) onSearchComplete();
  };

  const handleSingleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');
    setSelectedIds(new Set());
    try {
      const res = await axios.post('/api/search', { query });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResults(res.data.results || []);
        notifyParent();
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
    setSelectedIds(new Set());
    setBatchProgress({ current: 0, total: queries.length });

    try {
      const res = await axios.post('/api/search/batch', { queries });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResults(res.data.results || []);
        setBatchProgress({ current: queries.length, total: queries.length });
        notifyParent();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Toplu arama sırasında hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  // Filtered results
  const filteredResults = results.filter(r => {
    if (filterMode === 'nowebsite') return !r.hasWebsite;
    if (filterMode === 'haswebsite') return r.hasWebsite;
    return true;
  });

  // Toggle selection
  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredResults.length && filteredResults.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResults.map(r => r.id).filter(Boolean)));
    }
  };

  // Single delete
  const handleDeleteOne = async (id, name) => {
    if (!confirm(`"${name}" firmasını silmek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete('/api/leads', { data: { id } });
      setResults(prev => prev.filter(r => r.id !== id));
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
      notifyParent();
    } catch (err) {
      alert('Silme işlemi başarısız.');
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    if (!confirm(`Seçtiğiniz ${ids.length} firmayı sistemden tamamen silmek istediğinize emin misiniz?`)) return;

    setIsDeleting(true);
    try {
      await axios.delete('/api/leads', { data: { ids } });
      setResults(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      notifyParent();
    } catch (err) {
      alert('Toplu silme başarısız.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Assign to Agent
  const handleBulkAssign = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length || !assignAgentId) return;

    const agent = agents.find(a => a.id === assignAgentId);
    if (!confirm(`Seçili ${ids.length} firmayı "${agent?.name}" adlı temsilciye atamak istiyor musunuz?`)) return;

    setIsAssigning(true);
    try {
      await axios.post('/api/leads', {
        action: 'bulk_assign',
        lead_ids: ids,
        assigned_to: assignAgentId
      });
      alert(`✅ ${ids.length} firma başarıyla ${agent?.name} temsilcisine atandı!`);
      setSelectedIds(new Set());
      notifyParent();
    } catch (err) {
      alert('Atama başarısız oldu.');
    } finally {
      setIsAssigning(false);
    }
  };

  const noWebsiteCount = results.filter(r => !r.hasWebsite).length;
  const hasWebsiteCount = results.length - noWebsiteCount;

  return (
    <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
      
      {/* Header & Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={22} style={{ color: '#818cf8' }} /> Google Haritalar Müşteri Bulucu
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>
            Bölge ve sektör yazarak web sitesi olmayan esnafları saniyeler içinde toplayın.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600 }}
            onClick={() => setMode('single')}
          >
            <Search size={16} /> Tekli Arama
          </button>
          <button
            className={`btn ${mode === 'batch' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600 }}
            onClick={() => setMode('batch')}
          >
            <List size={16} /> Toplu Arama (Çoklu Bölge)
          </button>
        </div>
      </div>

      {/* Single Search Form */}
      {mode === 'single' && (
        <form onSubmit={handleSingleSearch} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="text"
              className="glass-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Örn: Kadıköy oto yıkama, Beşiktaş kuaför, Çankaya halı yıkama..."
              required
              style={{ width: '100%', padding: '12px 16px', fontSize: 14 }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSearching}
            style={{ padding: '12px 24px', fontWeight: 700, whiteSpace: 'nowrap' }}
          >
            {isSearching ? 'Taranıyor...' : 'Firmaları Bul 🔍'}
          </button>
        </form>
      )}

      {/* Batch Search Form */}
      {mode === 'batch' && (
        <form onSubmit={handleBatchSearch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'block', marginBottom: 6 }}>
              Her satıra bir arama kelimesi yazın. Sistem sırayla hepsini tarayıp listeye döker:
            </label>
            <textarea
              className="glass-input"
              rows={4}
              value={batchQueries}
              onChange={e => setBatchQueries(e.target.value)}
              placeholder={"Kadıköy oto yıkama\nÜsküdar oto yıkama\nMaltepe halı yıkama\nBeşiktaş tesisatçı"}
              required
              style={{ width: '100%', padding: 12, fontSize: 13 }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSearching}
            style={{ padding: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Zap size={18} />
            {isSearching ? `Taranıyor... (${batchProgress.current}/${batchProgress.total})` : 'Toplu Taramayı Başlat 🚀'}
          </button>

          {isSearching && (
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 4 }}>
              <div style={{
                width: batchProgress.total ? `${(batchProgress.current / batchProgress.total) * 100}%` : '0%',
                height: '100%', background: 'var(--accent-color)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          )}
        </form>
      )}

      {/* Error display */}
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444', borderRadius: 8, marginTop: 16, color: '#ef4444', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Loading animation */}
      {isSearching && !error && (
        <div className="loader-container" style={{ marginTop: 32, textAlign: 'center', padding: '30px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Google Haritalar üzerinden esnaflar ve iletişim bilgileri taranıyor...</p>
        </div>
      )}

      {/* Results Section */}
      {!isSearching && results.length > 0 && (
        <div style={{ marginTop: 32, borderTop: '1px solid var(--glass-border)', paddingTop: 24 }}>
          
          {/* Summary & Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>
                {results.length} Firma Bulundu &bull; <span style={{ color: '#f87171' }}>{noWebsiteCount} tanesinin web sitesi yok!</span>
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {selectedIds.size > 0 ? `(${selectedIds.size} firma seçildi)` : 'Firmaları seçip toplu işlem yapabilirsiniz.'}
              </span>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                onClick={() => setFilterMode('all')}
                style={{ padding: '6px 12px', borderRadius: 20, border: 'none', background: filterMode === 'all' ? '#818cf8' : 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Tümü ({results.length})
              </button>
              <button 
                onClick={() => setFilterMode('nowebsite')}
                style={{ padding: '6px 12px', borderRadius: 20, border: 'none', background: filterMode === 'nowebsite' ? '#ef4444' : 'rgba(239,68,68,0.1)', color: filterMode === 'nowebsite' ? '#fff' : '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                🔴 Sitesi Olmayanlar ({noWebsiteCount})
              </button>
              <button 
                onClick={() => setFilterMode('haswebsite')}
                style={{ padding: '6px 12px', borderRadius: 20, border: 'none', background: filterMode === 'haswebsite' ? '#22c55e' : 'rgba(34,197,94,0.1)', color: filterMode === 'haswebsite' ? '#fff' : '#4ade80', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                🟢 Sitesi Olanlar ({hasWebsiteCount})
              </button>
            </div>
          </div>

          {/* Batch Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--glass-border)', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button 
                onClick={toggleSelectAll}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {selectedIds.size === filteredResults.length && filteredResults.length > 0 ? (
                  <CheckSquare size={18} style={{ color: '#818cf8' }} />
                ) : (
                  <Square size={18} style={{ color: 'var(--text-secondary)' }} />
                )}
                {selectedIds.size === filteredResults.length && filteredResults.length > 0 ? 'Seçimi Kaldır' : 'Hepsini Seç'}
              </button>

              {selectedIds.size > 0 && (
                <span style={{ fontSize: 12, background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                  {selectedIds.size} Seçildi
                </span>
              )}
            </div>

            {/* Actions on Selected */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              
              {agents.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select 
                    className="glass-select"
                    value={assignAgentId}
                    onChange={e => setAssignAgentId(e.target.value)}
                    style={{ padding: '7px 10px', fontSize: 12, borderRadius: 8, background: '#0f172a' }}
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>👤 {a.name}'e Ata</option>
                    ))}
                  </select>

                  <button 
                    onClick={handleBulkAssign}
                    disabled={selectedIds.size === 0 || isAssigning}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--accent-color)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: selectedIds.size === 0 ? 0.5 : 1 }}
                  >
                    <Users size={14} /> {isAssigning ? 'Atanıyor...' : 'Seçilenleri Ata'}
                  </button>
                </div>
              )}

              <button 
                onClick={handleBatchDelete}
                disabled={selectedIds.size === 0 || isDeleting}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: selectedIds.size === 0 ? 0.5 : 1 }}
              >
                <Trash2 size={14} /> {isDeleting ? 'Siliniyor...' : `Seçilenleri Sil (${selectedIds.size})`}
              </button>

            </div>

          </div>

          {/* Cards Grid */}
          <div className="data-grid">
            {filteredResults.map((r, i) => {
              const isSelected = selectedIds.has(r.id);

              return (
                <div 
                  key={r.id || i} 
                  className={`data-card glass-panel ${!r.hasWebsite ? 'card-highlight' : ''}`} 
                  style={{ 
                    padding: 18, 
                    borderRadius: 14, 
                    border: isSelected ? '2px solid #818cf8' : '1px solid var(--glass-border)',
                    position: 'relative'
                  }}
                >
                  {/* Top Bar with Checkbox & Trash */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <button 
                      onClick={() => toggleSelectOne(r.id)}
                      style={{ background: 'transparent', border: 'none', color: isSelected ? '#818cf8' : 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>

                    <h4 className="card-title" style={{ flex: 1, margin: 0, fontSize: 15, fontWeight: 700 }}>
                      {r.name}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {r.hasWebsite ? (
                        <span className="status-badge status-success" style={{ fontSize: 11, padding: '2px 8px' }}>✓ Site Var</span>
                      ) : (
                        <span className="status-badge status-danger" style={{ fontSize: 11, padding: '2px 8px' }}>✗ Site Yok</span>
                      )}

                      <button 
                        onClick={() => handleDeleteOne(r.id, r.name)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}
                        title="Bu firmayı sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Details Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    {r.category && (
                      <div style={{ color: '#818cf8', fontSize: 12, fontWeight: 600 }}>
                        🏢 {r.category}
                      </div>
                    )}
                    {r.address && (
                      <div className="card-info" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin size={13} /> <span>{r.address}</span>
                      </div>
                    )}
                    {r.phone && (
                      <div className="card-info" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        <Phone size={13} style={{ color: '#38bdf8' }} /> <span>{r.phone}</span>
                      </div>
                    )}
                    {r.website && (
                      <div className="card-info">
                        <Globe size={13} />
                        <a href={r.website} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 12 }}>
                          {r.website.replace('http://', '').replace('https://', '').slice(0, 25)}... <ExternalLink size={11} style={{ display: 'inline' }} />
                        </a>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
