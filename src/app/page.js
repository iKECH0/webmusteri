"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Settings as SettingsIcon, Users, Globe, Phone, MapPin, Check, X, MessageCircle, Download, Filter, Save, AlignLeft } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('search');
  
  // Settings State
  const [apiKey, setApiKey] = useState('');
  const [savedSettings, setSavedSettings] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('Kadıköy oto yıkama');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  // CRM State
  const [leads, setLeads] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [crmSearch, setCrmSearch] = useState('');
  const [crmFilter, setCrmFilter] = useState('all'); // all, nowebsite, contacted
  const [editingNotes, setEditingNotes] = useState({});

  useEffect(() => {
    fetchSettings();
    fetchLeads();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data.google_api_key) {
        setApiKey(res.data.google_api_key);
      }
    } catch (error) {
      console.error("Error fetching settings", error);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/settings', { google_api_key: apiKey });
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 3000);
    } catch (error) {
      console.error("Error saving settings", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    try {
      const res = await axios.post('/api/search', { query: searchQuery });
      if (res.data.error) {
        setSearchError(res.data.error);
      } else {
        setSearchResults(res.data.results || []);
        fetchLeads();
      }
    } catch (error) {
      setSearchError(error.response?.data?.error || 'Arama sırasında bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await axios.get('/api/leads');
      setLeads(res.data || []);
      
      // Initialize notes state
      const initialNotes = {};
      (res.data || []).forEach(l => {
        initialNotes[l.id] = l.notes || '';
      });
      setEditingNotes(initialNotes);
    } catch (error) {
      console.error("Error fetching leads", error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const updateLead = async (id, updates) => {
    try {
      await axios.put('/api/leads', { id, ...updates });
      // Update local state for immediate feedback
      setLeads(leads.map(l => l.id === id ? { ...l, ...updates } : l));
      
      // Show success effect for save note button
      if (updates.notes !== undefined) {
         const btn = document.getElementById(`save-note-btn-${id}`);
         if (btn) {
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kaydedildi';
            btn.classList.add('btn-success');
            setTimeout(() => {
              btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Kaydet';
              btn.classList.remove('btn-success');
            }, 2000);
         }
      }
    } catch (error) {
      console.error("Error updating lead", error);
    }
  };

  const handleNoteChange = (id, text) => {
    setEditingNotes(prev => ({...prev, [id]: text}));
  };

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('90') ? cleanPhone : 
                          (cleanPhone.startsWith('0') ? '90' + cleanPhone.substring(1) : '90' + cleanPhone);
    const message = encodeURIComponent("Merhaba, Google Haritalar'daki işletmenizin web sitesi olmadığını gördük. Müşteri sayınızı artırmak için size özel bir web sitesi hazırlayabiliriz. Detaylı görüşmek ister misiniz?");
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Firma Adı,Telefon,Adres,Kategori,Müşteri Durumu,Web Sitesi,Notlar\r\n";
    
    filteredLeads.forEach(lead => {
      const row = [
        `"${lead.name || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.address || ''}"`,
        `"${lead.category || ''}"`,
        `"${lead.status || 'new'}"`,
        lead.has_website ? 'Var' : 'Yok',
        `"${(editingNotes[lead.id] || '').replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "musteriler.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (hasWebsite) => {
    if (hasWebsite) {
      return <span className="status-badge status-success"><Check size={14} /> Web Sitesi Var</span>;
    }
    return <span className="status-badge status-danger"><X size={14} /> Potansiyel Müşteri (Site Yok)</span>;
  };

  const renderCRMStatus = (status) => {
    const statusMap = {
      'new': { label: 'Yeni', className: 'status-warning' },
      'contacted': { label: 'İletişime Geçildi', className: 'status-info' },
      'interested': { label: 'İlgileniyor', className: 'status-success' },
      'rejected': { label: 'İlgilenmiyor', className: 'status-danger' },
      'closed': { label: 'Müşteri Oldu', className: 'status-success' }
    };
    const s = statusMap[status] || statusMap['new'];
    return <span className={`status-badge ${s.className}`}>{s.label}</span>;
  };

  // Filter Logic
  const filteredLeads = leads.filter(lead => {
    const matchSearch = lead.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
                        (lead.phone && lead.phone.includes(crmSearch));
    let matchFilter = true;
    if (crmFilter === 'nowebsite') matchFilter = !lead.has_website;
    if (crmFilter === 'contacted') matchFilter = lead.status !== 'new';
    return matchSearch && matchFilter;
  });

  // Statistics
  const stats = {
    total: leads.length,
    noWebsite: leads.filter(l => !l.has_website).length,
    contacted: leads.filter(l => l.status !== 'new').length,
    closed: leads.filter(l => l.status === 'closed').length
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Oto & Halı Yıkama Müşteri Bulucu</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }}/> 
            Harita Taraması
          </button>
          <button 
            className={`tab ${activeTab === 'crm' ? 'active' : ''}`}
            onClick={() => { setActiveTab('crm'); fetchLeads(); }}
          >
            <Users size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }}/> 
            Müşteri Takibi (CRM)
          </button>
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }}/> 
            Ayarlar
          </button>
        </div>
      </header>

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="glass-panel">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <input 
                type="text" 
                className="glass-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Örn: Ankara Çankaya halı yıkama"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSearching}>
              {isSearching ? 'Taranıyor...' : 'Firmaları Bul'}
            </button>
          </form>

          {searchError && (
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px', marginBottom: '24px' }}>
              {searchError}
            </div>
          )}

          {isSearching && (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Google Haritalar üzerinde tarama yapılıyor...</p>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Bulunan Sonuçlar ({searchResults.length}) - Tüm yeni kayıtlar otomatik olarak CRM'e eklendi.</h3>
              <div className="data-grid">
                {searchResults.map((result, idx) => (
                  <div key={idx} className="data-card glass-panel" style={{ padding: '20px' }}>
                    <div className="card-header">
                      <h4 className="card-title">{result.name}</h4>
                      {renderStatusBadge(result.hasWebsite)}
                    </div>
                    
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="card-info">
                        <MapPin size={16} /> <span>{result.address || 'Adres yok'}</span>
                      </div>
                      <div className="card-info">
                        <Phone size={16} /> <span>{result.phone || 'Telefon yok'}</span>
                      </div>
                      {result.hasWebsite && (
                        <div className="card-info">
                          <Globe size={16} /> <a href={result.website} target="_blank" rel="noreferrer">Siteye Git</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRM TAB */}
      {activeTab === 'crm' && (
        <div className="glass-panel" style={{ background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
          
          {/* STATS DASHBOARD */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel stat-card">
               <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Toplam Kayıt</h4>
               <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.total}</span>
            </div>
            <div className="glass-panel stat-card" style={{ borderBottom: '3px solid var(--danger-color)' }}>
               <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Potansiyel Müşteri (Site Yok)</h4>
               <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--danger-color)' }}>{stats.noWebsite}</span>
            </div>
            <div className="glass-panel stat-card" style={{ borderBottom: '3px solid var(--accent-color)' }}>
               <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>İletişime Geçilen</h4>
               <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#818cf8' }}>{stats.contacted}</span>
            </div>
            <div className="glass-panel stat-card" style={{ borderBottom: '3px solid var(--success-color)' }}>
               <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Kazanılan Müşteri</h4>
               <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--success-color)' }}>{stats.closed}</span>
            </div>
          </div>

          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontSize: '22px', margin: 0 }}>Müşteri Yönetimi</h2>
              <button onClick={downloadCSV} className="btn btn-outline" style={{ borderColor: 'var(--success-color)', color: 'var(--success-color)' }}>
                 <Download size={16} /> Excel İndir (CSV)
              </button>
            </div>

            {/* FILTERS & SEARCH */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="İsim veya telefonla ara..." 
                    style={{ width: '100%', paddingLeft: '40px' }}
                    value={crmSearch}
                    onChange={e => setCrmSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
                <button 
                  className={`btn btn-outline ${crmFilter === 'all' ? 'active-filter' : ''}`}
                  onClick={() => setCrmFilter('all')}
                >Tümü</button>
                <button 
                  className={`btn btn-outline ${crmFilter === 'nowebsite' ? 'active-filter' : ''}`}
                  onClick={() => setCrmFilter('nowebsite')}
                >Site Yok</button>
                <button 
                  className={`btn btn-outline ${crmFilter === 'contacted' ? 'active-filter' : ''}`}
                  onClick={() => setCrmFilter('contacted')}
                >İletişim Kurulanlar</button>
              </div>
            </div>
            
            {isLoadingLeads ? (
              <div className="loader-container">
                <div className="spinner"></div>
                <p>Müşteriler yükleniyor...</p>
              </div>
            ) : (
              <div className="data-grid">
                {filteredLeads.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Eşleşen sonuç bulunamadı.</p>
                ) : (
                  filteredLeads.map((lead) => (
                    <div key={lead.id} className={`data-card glass-panel ${!lead.has_website ? 'highlight' : ''}`} style={{ padding: '20px' }}>
                      <div className="card-header">
                        <h4 className="card-title">{lead.name}</h4>
                        {renderCRMStatus(lead.status)}
                      </div>
                      
                      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="card-info">
                          <MapPin size={16} /> <span>{lead.address || 'Adres yok'}</span>
                        </div>
                        <div className="card-info">
                          <Phone size={16} /> <span>{lead.phone || 'Telefon yok'}</span>
                        </div>
                        <div className="card-info">
                          <Globe size={16} /> <span>{lead.has_website ? 'Web Sitesi Var' : <strong style={{color: '#f87171'}}>Web Sitesi Yok (Fırsat!)</strong>}</span>
                        </div>
                      </div>
                      
                      {/* WhatsApp Button */}
                      {lead.phone && (
                        <button 
                          className="btn" 
                          style={{ marginTop: '12px', width: '100%', backgroundColor: '#25D366', color: 'white', border: 'none' }}
                          onClick={() => openWhatsApp(lead.phone)}
                        >
                          <MessageCircle size={18} /> WhatsApp'tan Yaz
                        </button>
                      )}

                      {/* Notes Section */}
                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            <AlignLeft size={14} /> Özel Notlar
                         </div>
                         <textarea 
                            className="glass-input" 
                            style={{ width: '100%', minHeight: '60px', resize: 'vertical', fontSize: '13px', padding: '10px' }}
                            placeholder="Müşteriyle ilgili notlar alın..."
                            value={editingNotes[lead.id] || ''}
                            onChange={(e) => handleNoteChange(lead.id, e.target.value)}
                         ></textarea>
                         <button 
                           id={`save-note-btn-${lead.id}`}
                           className="btn btn-outline" 
                           style={{ width: '100%', marginTop: '8px', padding: '8px', fontSize: '13px' }}
                           onClick={() => updateLead(lead.id, { notes: editingNotes[lead.id] })}
                         >
                           <Save size={14} /> Kaydet
                         </button>
                      </div>
                      
                      <div className="card-actions" style={{ marginTop: '16px', paddingTop: '16px' }}>
                        <select 
                          className="glass-select" 
                          value={lead.status}
                          onChange={(e) => updateLead(lead.id, { status: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px' }}
                        >
                          <option value="new">Yeni (İşlem Yapılmadı)</option>
                          <option value="contacted">İletişime Geçildi</option>
                          <option value="interested">İlgileniyor</option>
                          <option value="rejected">İlgilenmiyor</option>
                          <option value="closed">Müşteri Oldu (Kazanıldı)</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '22px' }}>Sistem Ayarları</h2>
          
          <form onSubmit={saveSettings}>
            <div className="input-group">
              <label>Google Places API Anahtarı (API Key)</label>
              <input 
                type="password" 
                className="glass-input" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSyB..."
                required
              />
              <small style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                * Google Cloud Console üzerinden alınmış, Places API (New) yetkisi olan bir API anahtarı gereklidir.
              </small>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
              {savedSettings ? 'Kaydedildi ✓' : 'Ayarları Kaydet'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
