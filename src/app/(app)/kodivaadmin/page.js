"use client";
import { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { Search, Map, Users, BarChart2, Clock, Settings as SettingsIcon, Mail, FileText, Target, Menu, X, MessageSquare } from 'lucide-react';
import SearchTab from '@/components/SearchTab';
import CRMTab from '@/components/CRMTab';
import AnalysisTab from '@/components/AnalysisTab';
import ScheduleTab from '@/components/ScheduleTab';
import SettingsTab from '@/components/SettingsTab';
import EmailTab from '@/components/EmailTab';
import QuotesTab from '@/components/QuotesTab';
import CompetitorTab from '@/components/CompetitorTab';
import PortalNotesTab from '@/components/PortalNotesTab';
import ReferencesTab from '@/components/ReferencesTab';
import GuidedSalesTab from '@/components/GuidedSalesTab';
import OutreachTab from '@/components/OutreachTab';
import AgentsTab from '@/components/AgentsTab';

import dynamic from 'next/dynamic';
const MapTab = dynamic(() => import('@/components/MapTab'), { ssr: false });

const MENU_CATEGORIES = [
  {
    title: "Ana Operasyon",
    items: [
      { key: 'guided-sales', label: 'Hızlı Satış Asistanı', icon: Target },
      { key: 'agents', label: 'Satış Ekibi & Temsilciler', icon: Users },
      { key: 'outreach', label: 'Toplu İlk Temas', icon: Users },
      { key: 'crm', label: 'CRM & Kanban', icon: Users },
      { key: 'quotes', label: 'Teklifler', icon: FileText },
      { key: 'email', label: 'E-posta', icon: Mail },
      { key: 'portal-notes', label: 'Portal Notları', icon: MessageSquare },
    ]
  },
  {
    title: "Müşteri Bulucu",
    items: [
      { key: 'search', label: 'Yeni Bul', icon: Search },
      { key: 'map', label: 'Harita', icon: Map },
      { key: 'schedule', label: 'Oto Arama', icon: Clock },
    ]
  },
  {
    title: "Rapor & Sistem",
    items: [
      { key: 'analysis', label: 'Analiz', icon: BarChart2 },
      { key: 'competitor', label: 'Rakipler', icon: Target },
      { key: 'references', label: 'Referanslar', icon: FileText },
      { key: 'settings', label: 'Ayarlar', icon: SettingsIcon },
    ]
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('guided-sales'); // Default to Guided Sales
  const [leads, setLeads] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { 
    if (localStorage.getItem('kodiva_auth') === 'true') {
      setIsAuthenticated(true);
    }
    fetchLeads(); 
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/api/leads');
      setLeads(res.data || []);
    } catch (e) { console.error(e); }
  };

  const todayCount = leads.filter(l => l.next_followup_date === new Date().toISOString().split('T')[0]).length;
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    setIsMobileMenuOpen(false);
    if (key !== 'search') fetchLeads();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'kodiva' && password === 'EFW9AVFNVUHFUf*') {
      localStorage.setItem('kodiva_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Hatalı kullanıcı adı veya şifre!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <img src="/logo.jpg" alt="Kodiva CRM" style={{ width: '120px', borderRadius: '8px' }} />
          </div>
          {error && <div style={{ color: '#ef4444', textAlign: 'center', fontSize: 14 }}>{error}</div>}
          <div className="input-group">
            <label>Kullanıcı Adı</label>
            <input type="text" placeholder="Kullanıcı Adı" className="glass-input" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
          <div className="input-group">
            <label>Şifre</label>
            <input type="password" placeholder="Şifre" className="glass-input" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" style={{ padding: '12px 24px', borderRadius: 10, marginTop: 8, border: 'none', background: 'var(--accent-color)', color: 'white', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--accent-hover)'} onMouseOut={e => e.currentTarget.style.background = 'var(--accent-color)'}>Giriş Yap</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      
      {/* Mobile Menu Toggle */}
      <div className="mobile-header" style={{ display: 'none', padding: '16px 20px', background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Para Makinesi CRM</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: 280, borderRight: '1px solid var(--glass-border)', background: 'rgba(15, 17, 26, 0.95)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, zIndex: 40, flexShrink: 0 }}>
        <div style={{ padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          <img src="/logo.jpg" alt="Kodiva CRM Logo" style={{ width: '140px', height: 'auto', borderRadius: '8px' }} />
        </div>

        <div style={{ overflowY: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {MENU_CATEGORIES.map((category, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '8px', paddingLeft: '12px' }}>
                {category.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {category.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button key={item.key} onClick={() => handleTabChange(item.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        color: isActive ? '#818cf8' : 'var(--text-primary)',
                        border: 'none', borderRadius: '10px', cursor: 'pointer',
                        fontSize: '14px', fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s', textAlign: 'left', position: 'relative'
                      }}
                      onMouseOver={(e) => { if(!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseOut={(e) => { if(!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Icon size={18} style={{ color: isActive ? '#818cf8' : 'var(--text-secondary)' }} />
                      {item.label}
                      {item.key === 'crm' && todayCount > 0 && (
                        <span style={{ position: 'absolute', right: 12, background: '#f59e0b', color: 'black', borderRadius: '999px', fontSize: '11px', fontWeight: 800, padding: '2px 6px' }}>
                          {todayCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', marginTop: 'auto' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Version 1.0.1
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '32px', height: '100vh', position: 'relative' }}>
        
        {/* Tab Content Rendering */}
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {activeTab === 'guided-sales' && <GuidedSalesTab leads={leads} onRefresh={fetchLeads} />}
          {activeTab === 'agents' && <AgentsTab leads={leads} onRefresh={fetchLeads} />}
          {activeTab === 'outreach' && <OutreachTab leads={leads} onRefresh={fetchLeads} />}
          {activeTab === 'search' && <SearchTab fetchLeads={fetchLeads} />}
          {activeTab === 'crm' && <CRMTab leads={leads} fetchLeads={fetchLeads} />}
          {activeTab === 'analysis' && <AnalysisTab leads={leads} />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'email' && <EmailTab leads={leads} />}
          {activeTab === 'quotes' && <QuotesTab leads={leads} />}
          {activeTab === 'competitor' && <CompetitorTab leads={leads} />}
          {activeTab === 'map' && <MapTab fetchLeads={fetchLeads} />}
          {activeTab === 'portal-notes' && <PortalNotesTab />}
          {activeTab === 'references' && <ReferencesTab />}
        </div>
      </main>

      {/* Injecting basic CSS for responsive sidebar via styled block to avoid globals.css merge conflicts right now, but globals.css is better */}
      <style>{`
        @media (max-width: 900px) {
          .mobile-header { display: flex !important; }
          .sidebar {
            position: fixed !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main-content {
            padding: 80px 16px 32px !important; 
          }
        }
      `}</style>
    </div>
  );
}
