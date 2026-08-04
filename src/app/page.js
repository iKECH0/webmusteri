"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Settings as SettingsIcon, Users, Globe, Phone, MapPin, Building, ChevronRight, Check, X } from 'lucide-react';

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
        // Refresh leads after search since they are auto-saved
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
    } catch (error) {
      console.error("Error fetching leads", error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      await axios.put('/api/leads', { id, status });
      fetchLeads(); // Refresh list
    } catch (error) {
      console.error("Error updating lead", error);
    }
  };

  const renderStatusBadge = (hasWebsite) => {
    if (hasWebsite) {
      return <span className="status-badge status-success"><Check size={14} /> Web Sitesi Var</span>;
    }
    return <span className="status-badge status-danger"><X size={14} /> Web Sitesi Yok</span>;
  };

  const renderCRMStatus = (status) => {
    const statusMap = {
      'new': { label: 'Yeni', className: 'status-warning' },
      'contacted': { label: 'İletişime Geçildi', className: 'status-success' },
      'interested': { label: 'İlgileniyor', className: 'status-success' },
      'rejected': { label: 'İlgilenmiyor', className: 'status-danger' },
      'closed': { label: 'Müşteri Oldu', className: 'status-success' }
    };
    const s = statusMap[status] || statusMap['new'];
    return <span className={`status-badge ${s.className}`}>{s.label}</span>;
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
        <div className="glass-panel">
          <h2 style={{ marginBottom: '24px', fontSize: '22px' }}>Müşteri Takibi (CRM)</h2>
          
          {isLoadingLeads ? (
            <div className="loader-container">
              <div className="spinner"></div>
              <p>Müşteriler yükleniyor...</p>
            </div>
          ) : (
            <div className="data-grid">
              {leads.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Henüz müşteri bulunmuyor. Lütfen önce "Harita Taraması" yapın.</p>
              ) : (
                leads.map((lead) => (
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
                        <Globe size={16} /> <span>{lead.has_website ? 'Web Sitesi Var' : <strong style={{color: '#f87171'}}>Web Sitesi Yok (Potansiyel Müşteri!)</strong>}</span>
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      <select 
                        className="glass-select" 
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        style={{ width: '100%', padding: '8px 12px' }}
                      >
                        <option value="new">Yeni</option>
                        <option value="contacted">İletişime Geçildi</option>
                        <option value="interested">İlgileniyor</option>
                        <option value="rejected">İlgilenmiyor</option>
                        <option value="closed">Müşteri Oldu</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
