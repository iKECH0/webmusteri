"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Phone, MessageSquare, CheckCircle, Clock, 
  Send, ExternalLink, RefreshCw, LogOut, ChevronRight, 
  Plus, Check, Flame, Trophy, Copy, FileText, Search
} from 'lucide-react';

export default function AgentLoginPage({ initialSlug }) {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active session
  const [currentAgent, setCurrentAgent] = useState(null);
  const [myLeads, setMyLeads] = useState([]);
  const [poolLeads, setPoolLeads] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeView, setActiveView] = useState('myleads'); // 'myleads' | 'pool' | 'stats'
  const [leadFilter, setLeadFilter] = useState('all'); // 'all' | 'new' | 'contacted' | 'interested' | 'proposal' | 'won'
  const [searchQuery, setSearchQuery] = useState('');

  // Note modal state
  const [selectedLeadForAction, setSelectedLeadForAction] = useState(null);
  const [actionType, setActionType] = useState('whatsapp'); // 'call' | 'whatsapp' | 'note' | 'status_change'
  const [actionNote, setActionNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // Check saved session
    const savedAgent = localStorage.getItem('kodiva_agent_session');
    if (savedAgent) {
      try {
        const parsed = JSON.parse(savedAgent);
        setCurrentAgent(parsed);
        loadAgentDashboard(parsed.id);
      } catch (e) {
        localStorage.removeItem('kodiva_agent_session');
      }
    }
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      const list = res.data || [];
      setAgents(list);
      if (list.length > 0) {
        if (initialSlug) {
          const match = list.find(a => a.slug === initialSlug);
          if (match) setSelectedAgentId(match.id);
          else setSelectedAgentId(list[0].id);
        } else if (!selectedAgentId) {
          setSelectedAgentId(list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentDashboard = async (agentId) => {
    try {
      const [leadsRes, templatesRes] = await Promise.all([
        axios.get('/api/leads'),
        axios.get('/api/message-templates')
      ]);

      const all = leadsRes.data || [];
      setMyLeads(all.filter(l => l.assigned_to === agentId));
      setPoolLeads(all.filter(l => !l.assigned_to));
      setTemplates(templatesRes.data || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const selected = agents.find(a => a.id === selectedAgentId);
      if (!selected) {
        setError('Lütfen bir temsilci seçin.');
        return;
      }

      const res = await axios.post('/api/agent-auth', {
        slug: selected.slug,
        password: password
      });

      if (res.data?.success) {
        const agentData = res.data.agent;
        setCurrentAgent(agentData);
        localStorage.setItem('kodiva_agent_session', JSON.stringify(agentData));
        loadAgentDashboard(agentData.id);
      } else {
        setError(res.data?.error || 'Giriş başarısız.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Hatalı şifre veya kullanıcı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kodiva_agent_session');
    setCurrentAgent(null);
    setPassword('');
  };

  // Claim lead from pool
  const handleClaimLead = async (leadId) => {
    try {
      await axios.post('/api/leads', {
        action: 'claim',
        assigned_to: currentAgent.id,
        lead_ids: [leadId]
      });
      loadAgentDashboard(currentAgent.id);
    } catch (err) {
      alert('Müşteri alınamadı.');
    }
  };

  // Log activity
  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (!selectedLeadForAction) return;

    try {
      await axios.post('/api/activity-logs', {
        lead_id: selectedLeadForAction.id,
        agent_id: currentAgent.id,
        type: actionType,
        note: actionNote,
        new_status: newStatus || undefined
      });

      setSelectedLeadForAction(null);
      setActionNote('');
      setNewStatus('');
      loadAgentDashboard(currentAgent.id);
    } catch (err) {
      alert('İşlem kaydedilemedi.');
    }
  };

  // Send WhatsApp message
  const handleSendWhatsApp = (lead, customText = '') => {
    let text = customText || `Merhaba ${lead.name}, Kodiva Dijital'den arıyorum. İşletmeniz için hazırladığımız özel web sitesi teklifini iletmek istedim.`;
    
    // Replace variables
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const portalUrl = lead.portal_token ? `${origin}/portal/${lead.portal_token}?ref=${currentAgent?.slug || ''}` : `${origin}/?ref=${currentAgent?.slug || ''}`;
    
    text = text.replace(/{firma_adi}/g, lead.name)
               .replace(/{portal_link}/g, portalUrl)
               .replace(/{temsilci_adi}/g, currentAgent?.name || '');

    const phone = lead.phone?.replace(/[^0-9]/g, '') || '';
    const url = `https://wa.me/${phone.startsWith('90') ? phone : '90' + phone}?text=${encodeURIComponent(text)}`;
    
    window.open(url, '_blank');

    // Auto-open activity log modal
    setSelectedLeadForAction(lead);
    setActionType('whatsapp');
    setActionNote(`WhatsApp mesajı gönderildi: "${text.slice(0, 50)}..."`);
  };

  // Quick Call
  const handleQuickCall = (lead) => {
    const phone = lead.phone?.replace(/[^0-9]/g, '') || '';
    window.location.href = `tel:${phone}`;

    setSelectedLeadForAction(lead);
    setActionType('call');
    setActionNote('Telefon araması yapıldı.');
  };

  const copyMyRefLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/?ref=${currentAgent?.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered Leads
  const filteredMyLeads = myLeads.filter(l => {
    if (leadFilter !== 'all' && l.status !== leadFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.name?.toLowerCase().includes(q) || l.phone?.includes(q) || l.category?.toLowerCase().includes(q);
    }
    return true;
  });

  // --- LOGIN SCREEN ---
  if (!currentAgent) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: 420, padding: 32, borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 12 }}>
              <Users size={32} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Temsilci Satış Paneli</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
              Müşterilerinizi arayın, mesaj atın ve satışlarınızı kaydedin.
            </p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            <div className="input-group">
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Temsilci Seçin</label>
              {loading ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Temsilciler yükleniyor...</div>
              ) : (
                <select 
                  className="glass-input" 
                  value={selectedAgentId} 
                  onChange={e => setSelectedAgentId(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', outline: 'none' }}
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id} style={{ background: '#0f172a', color: '#fff' }}>
                      {a.name} ({a.slug})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="input-group">
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Giriş Şifreniz</label>
              <input 
                type="password" 
                className="glass-input" 
                placeholder="Şifrenizi girin" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12 }}
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || loading}
              style={{ 
                padding: '14px', borderRadius: 12, background: 'var(--accent-color)', 
                color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8 
              }}
            >
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Panele Giriş Yap 🚀'}
            </button>

          </form>

        </div>
      </div>
    );
  }

  // --- AGENT DASHBOARD ---
  const myWonCount = myLeads.filter(l => l.status === 'won').length;
  const myConversionRate = myLeads.length > 0 ? Math.round((myWonCount / myLeads.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', paddingBottom: 60 }}>
      
      {/* Mobile Top Navigation */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15, 17, 26, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
            {currentAgent.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{currentAgent.name}</div>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>● Satış Temsilcisi</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={copyMyRefLink}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: 12, cursor: 'pointer' }}
          >
            {copiedCode ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
            {copiedCode ? 'Kopyalandı!' : 'Ref Linkim'}
          </button>

          <button 
            onClick={handleLogout}
            style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }}
            title="Çıkış Yap"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Quick Stats Banner */}
        <div className="glass-panel" style={{ padding: 18, borderRadius: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Müşterilerim</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', marginTop: 2 }}>{myLeads.length}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Kazanılan</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', marginTop: 2 }}>{myWonCount}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Başarı Oranı</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>%{myConversionRate}</div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12, gap: 4 }}>
          <button 
            onClick={() => setActiveView('myleads')}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 9, border: 'none', background: activeView === 'myleads' ? 'var(--accent-color)' : 'transparent', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            📋 Bana Atananlar ({myLeads.length})
          </button>
          
          <button 
            onClick={() => setActiveView('pool')}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 9, border: 'none', background: activeView === 'pool' ? 'var(--accent-color)' : 'transparent', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            🌊 Müşteri Havuzu ({poolLeads.length})
          </button>
        </div>

        {/* --- TAB 1: MY LEADS --- */}
        {activeView === 'myleads' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Search & Status Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Müşteri adı veya telefon ara..." 
                  className="glass-input" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, fontSize: 13 }}
                />
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {[
                  { key: 'all', label: 'Tümü' },
                  { key: 'new', label: 'Yeni' },
                  { key: 'contacted', label: 'İlk Temas' },
                  { key: 'interested', label: 'İlgileniyor' },
                  { key: 'proposal', label: 'Teklif Verildi' },
                  { key: 'won', label: 'Kazanıldı' }
                ].map(f => (
                  <button 
                    key={f.key}
                    onClick={() => setLeadFilter(f.key)}
                    style={{ 
                      padding: '6px 12px', borderRadius: 20, border: 'none', 
                      background: leadFilter === f.key ? '#818cf8' : 'rgba(255,255,255,0.05)', 
                      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' 
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads List */}
            {filteredMyLeads.length === 0 ? (
              <div className="glass-panel" style={{ padding: 40, textAlign: 'center', borderRadius: 16, color: 'var(--text-secondary)' }}>
                {myLeads.length === 0 ? 'Henüz size atanmış bir müşteri yok. "Müşteri Havuzu" sekmesine geçerek müşteri alabilirsiniz!' : 'Bu filtreye uygun müşteri bulunamadı.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredMyLeads.map(lead => {
                  const statusColors = {
                    new: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: 'Yeni' },
                    contacted: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'İlk Temas' },
                    interested: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', label: 'İlgileniyor' },
                    proposal: { bg: 'rgba(236,72,153,0.15)', text: '#f472b6', label: 'Teklif Verildi' },
                    won: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', label: 'Kazanıldı 🎉' },
                    lost: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: 'Kaybedildi' }
                  };
                  const badge = statusColors[lead.status] || statusColors.new;

                  return (
                    <div key={lead.id} className="glass-panel" style={{ padding: 16, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>{lead.name}</h4>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{lead.category || 'Esnaf'}</span> • <span>{lead.phone || 'Telefon yok'}</span>
                          </div>
                        </div>

                        <span style={{ padding: '4px 10px', borderRadius: 999, background: badge.bg, color: badge.text, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {badge.label}
                        </span>
                      </div>

                      {lead.notes && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid #818cf8' }}>
                          {lead.notes.slice(0, 100)}...
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        
                        {lead.phone && (
                          <>
                            <button 
                              onClick={() => handleQuickCall(lead)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                            >
                              <Phone size={15} /> Ara
                            </button>

                            <button 
                              onClick={() => handleSendWhatsApp(lead)}
                              style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, background: '#22c55e', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                            >
                              <MessageSquare size={15} /> WhatsApp
                            </button>
                          </>
                        )}

                        <button 
                          onClick={() => {
                            setSelectedLeadForAction(lead);
                            setActionType('note');
                            setNewStatus(lead.status);
                          }}
                          style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid var(--glass-border)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Not / Durum ✏️
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* --- TAB 2: UNASSIGNED POOL --- */}
        {activeView === 'pool' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 12, background: 'rgba(99,102,241,0.1)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', fontSize: 13, color: '#c7d2fe' }}>
              🌊 <strong>Müşteri Havuzu:</strong> Henüz kimseye atanmamış potansiyel müşterilerdir. İlgilendiğiniz müşteriyi <strong>"Kendime Al"</strong> butonuna basarak listenize ekleyebilirsiniz!
            </div>

            {poolLeads.length === 0 ? (
              <div className="glass-panel" style={{ padding: 40, textAlign: 'center', borderRadius: 16, color: 'var(--text-secondary)' }}>
                Havuzda şu anda atanmamış müşteri bulunmuyor.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {poolLeads.map(lead => (
                  <div key={lead.id} className="glass-panel" style={{ padding: 16, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>{lead.name}</h4>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {lead.category || 'Esnaf'} • {lead.phone || 'Telefon yok'}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleClaimLead(lead.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: 'var(--accent-color)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    >
                      <Plus size={16} /> Kendime Al
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Action / Note Modal */}
      {selectedLeadForAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 440, padding: 24, borderRadius: 20 }}>
            
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{selectedLeadForAction.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Müşteri ile iletişim detaylarını kaydedin</p>

            <form onSubmit={handleLogActivity} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div className="input-group">
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>İşlem Tipi</label>
                <select 
                  className="glass-input" 
                  value={actionType} 
                  onChange={e => setActionType(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#0f172a', color: '#fff' }}
                >
                  <option value="call">📞 Telefon Araması</option>
                  <option value="whatsapp">💬 WhatsApp Mesajı</option>
                  <option value="visit">📍 Yüz Yüze Ziyaret</option>
                  <option value="note">📝 Sadece Not</option>
                </select>
              </div>

              <div className="input-group">
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Müşteri Durumu Güncelle</label>
                <select 
                  className="glass-input" 
                  value={newStatus} 
                  onChange={e => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#0f172a', color: '#fff' }}
                >
                  <option value="new">Yeni (Arama Bekliyor)</option>
                  <option value="contacted">İlk Temas Kuruldu</option>
                  <option value="interested">İlgileniyor (Sıcak Takip 🔥)</option>
                  <option value="proposal">Teklif Verildi</option>
                  <option value="won">Kazanıldı (Satış Yapıldı 🎉)</option>
                  <option value="lost">Kaybedildi / İlgilenmiyor</option>
                </select>
              </div>

              <div className="input-group">
                <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Görüşme Notu</label>
                <textarea 
                  className="glass-input" 
                  rows={3} 
                  placeholder="Müşteri ne dedi? Fiyat sordu mu? Tekrar ne zaman aranacak?" 
                  value={actionNote} 
                  onChange={e => setActionNote(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: 10 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedLeadForAction(null)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Kapat
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 2, padding: 12, borderRadius: 10, background: 'var(--accent-color)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Kaydet
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
