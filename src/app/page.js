"use client";
import { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import { Search, Map, Users, BarChart2, Clock, Settings as SettingsIcon } from 'lucide-react';
import SearchTab from '@/components/SearchTab';
import CRMTab from '@/components/CRMTab';
import AnalysisTab from '@/components/AnalysisTab';
import ScheduleTab from '@/components/ScheduleTab';
import SettingsTab from '@/components/SettingsTab';

// Map uses browser-only APIs, import dynamically
import dynamic from 'next/dynamic';
const MapTab = dynamic(() => import('@/components/MapTab'), { ssr: false });

const TABS = [
  { key: 'search', label: 'Arama', icon: Search },
  { key: 'map', label: 'Harita', icon: Map },
  { key: 'crm', label: 'Müşteriler', icon: Users },
  { key: 'analysis', label: 'Analiz', icon: BarChart2 },
  { key: 'schedule', label: 'Zamanlama', icon: Clock },
  { key: 'settings', label: 'Ayarlar', icon: SettingsIcon },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('search');
  const [leads, setLeads] = useState([]);

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('/api/leads');
      setLeads(res.data || []);
    } catch (e) { console.error(e); }
  };

  // Badge count for CRM tab
  const todayCount = leads.filter(l => l.next_followup_date === new Date().toISOString().split('T')[0]).length;
  const noWebsiteCount = leads.filter(l => !l.has_website).length;

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '24px', fontWeight: 700, marginBottom: '16px',
          background: 'linear-gradient(to right, #818cf8, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          🚀 Oto & Halı Yıkama — Müşteri Bulucu & CRM
        </h1>

        {/* Tab Navigation */}
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{
            display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.25)',
            padding: '6px', borderRadius: '14px', border: '1px solid var(--glass-border)',
            width: 'max-content', minWidth: '100%'
          }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key}
                  className={`tab ${isActive ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab.key); if (tab.key !== 'search') fetchLeads(); }}
                  style={{ position: 'relative', whiteSpace: 'nowrap' }}
                >
                  <Icon size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  {tab.label}
                  {tab.key === 'crm' && todayCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      background: '#f59e0b', color: 'black', borderRadius: '999px',
                      fontSize: '10px', fontWeight: 700, padding: '2px 6px', minWidth: '18px'
                    }}>{todayCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Bar */}
        {leads.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Toplam Kayıt', value: leads.length, color: 'var(--text-secondary)' },
              { label: 'Potansiyel', value: noWebsiteCount, color: '#f87171' },
              { label: 'Müşteri', value: leads.filter(l => l.status === 'closed').length, color: '#34d399' },
              { label: 'Bugün Takip', value: todayCount, color: '#fbbf24' },
            ].map((s, i) => (
              <div key={i} style={{ fontSize: '13px', color: s.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{s.value}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                {i < 3 && <span style={{ color: 'var(--glass-border)' }}>·</span>}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Tab Content */}
      {activeTab === 'search' && <SearchTab onSearchComplete={fetchLeads} />}
      {activeTab === 'map' && <MapTab leads={leads} />}
      {activeTab === 'crm' && <CRMTab leads={leads} onRefresh={fetchLeads} />}
      {activeTab === 'analysis' && <AnalysisTab leads={leads} />}
      {activeTab === 'schedule' && <ScheduleTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}
