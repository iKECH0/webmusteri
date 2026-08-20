"use client";
import { useState } from 'react';
import axios from 'axios';
import { Download, Filter, Search, MessageCircle, AlignLeft, Save, Trash2, Phone, MapPin, Globe, ExternalLink, PhoneCall, Mail, Calendar, Link, Tag, Star, Activity, MessageSquare, Copy, X } from 'lucide-react';

const STATUS_MAP = {
  new: { label: 'Yeni', cls: 'status-warning' },
  contacted: { label: 'İletişime Geçildi', cls: 'status-info' },
  interested: { label: 'İlgileniyor', cls: 'status-success' },
  rejected: { label: 'İlgilenmiyor', cls: 'status-danger' },
  closed: { label: 'Müşteri Oldu 🎉', cls: 'status-success' }
};

const SUGGESTED_TAGS = ['Sıcak Lead', 'VIP', 'Sezonluk', 'Halı Yıkama', 'Oto Yıkama', 'Büyük İşletme'];

export default function CRMTab({ leads, onRefresh }) {
  const [crmSearch, setCrmSearch] = useState('');
  const [crmFilter, setCrmFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [agents, setAgents] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  
  const [notes, setNotes] = useState({});
  const [followupDates, setFollowupDates] = useState({});
  const [revenues, setRevenues] = useState({});
  const [emails, setEmails] = useState({});
  const [tags, setTags] = useState({});
  const [desktopMockups, setDesktopMockups] = useState({});
  const [mobileMockups, setMobileMockups] = useState({});

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data || []);
    } catch (e) {
      console.error("Agents fetch error:", e);
    }
  };
  
  const [callLogInputs, setCallLogInputs] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [callLogs, setCallLogs] = useState({});
  const [checkingWebsite, setCheckingWebsite] = useState({});
  const [portalCopied, setPortalCopied] = useState({});
  const [calSyncing, setCalSyncing] = useState({});
  const [aiPitches, setAiPitches] = useState({});
  const [generatingPitch, setGeneratingPitch] = useState({});
  const [competitorReports, setCompetitorReports] = useState({});
  const [generatingReport, setGeneratingReport] = useState({});
  const [salesModalLead, setSalesModalLead] = useState(null);

  const initLeadData = (lead) => {
    if (notes[lead.id] === undefined) setNotes(p => ({ ...p, [lead.id]: lead.notes || '' }));
    if (followupDates[lead.id] === undefined) setFollowupDates(p => ({ ...p, [lead.id]: lead.next_followup_date || '' }));
    if (revenues[lead.id] === undefined) setRevenues(p => ({ ...p, [lead.id]: lead.revenue || '' }));
    if (emails[lead.id] === undefined) setEmails(p => ({ ...p, [lead.id]: lead.email || '' }));
    if (tags[lead.id] === undefined) setTags(p => ({ ...p, [lead.id]: lead.tags || [] }));
    if (desktopMockups[lead.id] === undefined) setDesktopMockups(p => ({ ...p, [lead.id]: lead.desktop_mockup_url || '' }));
    if (mobileMockups[lead.id] === undefined) setMobileMockups(p => ({ ...p, [lead.id]: lead.mobile_mockup_url || '' }));
    if (aiPitches[lead.id] === undefined) setAiPitches(p => ({ ...p, [lead.id]: lead.ai_pitch || '' }));
    if (competitorReports[lead.id] === undefined) setCompetitorReports(p => ({ ...p, [lead.id]: lead.competitor_report || '' }));
  };

  const updateLead = async (id, data) => {
    await axios.put('/api/leads', { id, ...data });
    onRefresh();
  };

  const saveLead = async (lead) => {
    try {
      await updateLead(lead.id, {
        notes: notes[lead.id],
        next_followup_date: followupDates[lead.id] || null,
        revenue: revenues[lead.id] ? parseFloat(revenues[lead.id]) : null,
        email: emails[lead.id] || null,
        tags: tags[lead.id] || [],
        desktop_mockup_url: desktopMockups[lead.id] || null,
        mobile_mockup_url: mobileMockups[lead.id] || null
      });
      alert('✅ Bilgiler başarıyla kaydedildi!');
    } catch (e) {
      alert('Kaydedilirken bir hata oluştu.');
    }
  };

  const deleteLead = async (id) => {
    if (!confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
    await axios.delete('/api/leads', { data: { id } });
    onRefresh();
  };

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow drop
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      updateLead(leadId, { status: newStatus });
    }
  };

  const toggleTag = (leadId, tag) => {
    setTags(p => {
      const current = p[leadId] || [];
      const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
      return { ...p, [leadId]: updated };
    });
  };

  const addCallLog = async (leadId) => {
    const note = callLogInputs[leadId];
    if (!note?.trim()) return;
    await axios.post('/api/call-logs', { lead_id: leadId, note });
    setCallLogInputs(p => ({ ...p, [leadId]: '' }));
    fetchCallLogs(leadId);
  };

  const fetchCallLogs = async (leadId) => {
    const res = await axios.get(`/api/call-logs?lead_id=${leadId}`);
    setCallLogs(p => ({ ...p, [leadId]: res.data }));
  };

  const toggleCard = (lead) => {
    if (expandedCard === lead.id) {
      setExpandedCard(null);
    } else {
      setExpandedCard(lead.id);
      initLeadData(lead);
      fetchCallLogs(lead.id);
    }
  };

  const openWhatsApp = async (lead) => {
    if (!lead.phone) return alert('Bu müşterinin telefon numarası yok.');
    
    // Auto-generate token if it doesn't exist
    let token = lead.portal_token;
    if (!token) {
      token = Math.random().toString(36).substring(2, 20) + Date.now().toString(36);
      await axios.put('/api/leads', { id: lead.id, portal_token: token });
      onRefresh(); // Trigger a background refresh
    }
    const portalLink = `${window.location.origin}/portal/${token}`;

    const clean = lead.phone.replace(/[^0-9]/g, '');
    const formatted = clean.startsWith('90') ? clean : (clean.startsWith('0') ? '90' + clean.slice(1) : '90' + clean);
    
    let text = '';
    const aiText = aiPitches[lead.id];
    
    if (aiText && !generatingPitch[lead.id]) {
      text = aiText.replace('{portal_link}', portalLink);
    } else {
      let templateStmt = localStorage.getItem('whatsapp_template');
      if (!templateStmt || templateStmt.includes('\uFFFD')) {
        templateStmt = `Merhaba {firma_adi} ailesi 👋\n\nİnternette işletmenizi incelerken harika müşteri yorumlarınız dikkatimi çekti. Ancak fark ettim ki, bu kalitenizi dijitale taşıyacak kurumsal bir web siteniz henüz yok.\n\nMüşterilerin büyük bir kısmı işletmeye gitmeden önce web sitesini inceliyor. Rakiplerinizin dijitalde müşteri kazandığı bu dönemde sizin geride kalmanızı istemedik.\n\nSizin için hazırladığımız özel sunum portalını ve teklifimizi aşağıdaki linkten hemen inceleyebilirsiniz:\n{portal_link}\n\nİnceledikten sonra görüşlerinizi paylaşırsanız çok sevinirim! 😊`;
      }
      text = templateStmt.replace(/{firma_adi}/g, lead.name).replace(/{portal_link}/g, portalLink);
    }

    if (desktopMockups[lead.id] || mobileMockups[lead.id]) {
        text += `\n\nTasarım Önizlemeleri:\n`;
        if (desktopMockups[lead.id]) text += `💻 Masaüstü: ${desktopMockups[lead.id]}\n`;
        if (mobileMockups[lead.id]) text += `📱 Mobil: ${mobileMockups[lead.id]}\n`;
    }
    
    const msg = encodeURIComponent(text);
    window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank');
  };

  const openEmail = async (lead) => {
    if (!lead.email) return alert('Bu müşterinin e-posta adresi bulunmuyor. Önce bilgilerine ekleyin.');
    let token = lead.portal_token;
    if (!token) {
      token = Math.random().toString(36).substring(2, 20) + Date.now().toString(36);
      await axios.put('/api/leads', { id: lead.id, portal_token: token });
      onRefresh();
    }
    const portalLink = `${window.location.origin}/portal/${token}`;
    let text = aiPitches[lead.id] || '';
    if (text) text = text.replace('{portal_link}', portalLink);
    
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent(lead.name + ' - Web Sitesi Teklifi')}&body=${encodeURIComponent(text)}`);
  };

  const applyTemplate = (lead, type) => {
    let tpl = '';
    const city = lead.address ? lead.address.split(',')[0].trim() : 'bölgenizdeki';
    const sector = lead.category || 'sektörünüzdeki';
    const link = '{portal_link}';
    const mockupText = lead.design_mockup_url ? `\nAyrıca sizin için hazırladığımız özel tasarım görselini (demo) buradan inceleyebilirsiniz: ${lead.design_mockup_url}\n` : '';

    if (type === 'email') {
      tpl = `Merhaba,

${lead.name} işletmenizi Google Haritalar üzerinden incelerken, hâlâ bir web sitenizin olmadığını fark ettim. Bugün müşterilerin büyük çoğunluğu bir işletmeyi tercih etmeden önce internetten araştırıyor — web sitesi olmayan işletmeler bu potansiyel müşterilerin önemli bir kısmını kaçırıyor.

${city} bölgesindeki ${sector} işletmeleri için modern, hızlı yüklenen ve mobil uyumlu web siteleri hazırlıyorum. Size özel olarak şunları sunabilirim:

✅ Google'da üst sıralarda görünmenizi sağlayacak SEO uyumlu tasarım
✅ Mobil ve masaüstü uyumlu, hızlı yüklenen bir site
✅ İletişim formu, konum, çalışma saatleri gibi tüm bilgiler tek sayfada
✅ Uygun fiyatlı ve hızlı teslim
${mockupText}
${lead.name} için size özel bir fiyat teklifi hazırlamak isterim. Hazırladığımız projenin detaylarını incelemek isterseniz:
${link}

Kısa bir görüşme yapabilir miyiz?

İyi çalışmalar dilerim,`;
    } else if (type === 'whatsapp_short') {
      tpl = `Merhaba ${lead.name} 👋

Google Haritalar'da işletmenizi gördüm ama bir web siteniz olmadığını fark ettim. ${city} bölgesinde ${sector} işletmelere özel, uygun fiyatlı ve hızlı web sitesi hazırlıyorum.
${mockupText}
Size özel hazırladığımız detaylı teklife ve sunuma buradan göz atabilirsiniz:
${link}

Size özel bir teklif hazırlamak isterim, kısa bir konuşabilir miyiz? 🙂`;
    } else if (type === 'whatsapp_alt') {
      tpl = `Merhaba ${lead.name} ailesi 👋
İnternette işletmenizi incelerken harika müşteri yorumlarınız dikkatimi çekti. Ancak fark ettim ki, bu kalitenizi dijitale taşıyacak kurumsal bir web siteniz henüz yok.

Müşterilerin büyük bir kısmı işletmeye gitmeden önce web sitesini inceliyor. Rakiplerinizin dijitalde müşteri kazandığı bu dönemde sizin geride kalmanızı istemedik.
${mockupText}
Sizin için hazırladığımız özel sunum portalını ve teklifimizi aşağıdaki linkten hemen inceleyebilirsiniz:
${link}

İnceledikten sonra görüşlerinizi paylaşırsanız çok sevinirim! 😊`;
    }
    
    setAiPitches(p => ({ ...p, [lead.id]: tpl }));
  };

  const generateAiPitch = async (lead) => {
    setGeneratingPitch(p => ({ ...p, [lead.id]: true }));
    try {
      const res = await axios.post('/api/ai/generate-pitch', { lead_id: lead.id });
      setAiPitches(p => ({ ...p, [lead.id]: res.data.text }));
    } catch (e) {
      alert('AI Metni üretilirken hata oluştu: ' + (e.response?.data?.error || e.message));
    } finally {
      setGeneratingPitch(p => ({ ...p, [lead.id]: false }));
    }
  };

  const generateCompetitorReport = async (lead) => {
    setGeneratingReport(p => ({ ...p, [lead.id]: true }));
    try {
      const res = await axios.post('/api/ai/competitor-report', { lead_id: lead.id });
      setCompetitorReports(p => ({ ...p, [lead.id]: res.data.report }));
      alert('Rakip analizi başarıyla oluşturuldu!');
    } catch (e) {
      alert('Rakip analizi üretilirken hata: ' + (e.response?.data?.error || e.message));
    } finally {
      setGeneratingReport(p => ({ ...p, [lead.id]: false }));
    }
  };

  const checkWebsite = async (lead) => {
    if (!lead.website) return;
    setCheckingWebsite(p => ({ ...p, [lead.id]: 'loading' }));
    try {
      const res = await axios.post('/api/check-website', { url: lead.website });
      setCheckingWebsite(p => ({ ...p, [lead.id]: res.data.accessible ? 'ok' : 'fail' }));
    } catch {
      setCheckingWebsite(p => ({ ...p, [lead.id]: 'fail' }));
    }
  };

  const syncToCalendar = async (lead) => {
    const date = followupDates[lead.id] || lead.next_followup_date;
    if (!date) return alert('Önce bir takip tarihi seçin ve kaydedin.');
    
    setCalSyncing(p => ({ ...p, [lead.id]: true }));
    try {
      const res = await axios.post('/api/calendar/sync', { lead_id: lead.id, date });
      alert('✅ Takvim etkinliği oluşturuldu!');
    } catch (e) {
      alert(e.response?.data?.error || 'Takvime eklerken hata oluştu. Ayarlardan Google hesabınızı bağladığınızdan emin olun.');
    } finally {
      setCalSyncing(p => ({ ...p, [lead.id]: false }));
    }
  };

  const copyPortalLink = async (lead) => {
    let token = lead.portal_token;
    if (!token) {
      token = Math.random().toString(36).substring(2, 20) + Date.now().toString(36);
      await axios.put('/api/leads', { id: lead.id, portal_token: token });
      onRefresh(); // Refresh lead data to get the new token
    }
    const link = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(link);
    setPortalCopied(p => ({ ...p, [lead.id]: true }));
    setTimeout(() => setPortalCopied(p => ({ ...p, [lead.id]: false })), 2500);
  };

  const downloadCSV = () => {
    let csv = "\uFEFFDFirma Adı,Telefon,E-posta,Adres,Kategori,Durum,Web Sitesi,Kazanılan Gelir,Yapay Zeka Skoru,Notlar,Takip Tarihi,Etiketler\r\n";
    filteredLeads.forEach(l => {
      csv += [
        `"${l.name || ''}"`, `"${l.phone || ''}"`, `"${l.email || ''}"`, `"${l.address || ''}"`,
        `"${l.category || ''}"`, `"${STATUS_MAP[l.status]?.label || l.status}"`,
        l.has_website ? 'Var' : 'Yok',
        l.revenue ? `${l.revenue}₺` : '0₺',
        `"${l.ai_score || 0}"`,
        `"${(l.notes || '').replace(/"/g, '""')}"`,
        `"${l.next_followup_date || ''}"`,
        `"${(l.tags || []).join(', ')}"`,
      ].join(',') + '\r\n';
    });
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = `musteriler_${new Date().toLocaleDateString('tr-TR').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(lead => {
    const q = crmSearch.toLowerCase();
    const matchSearch = !q || lead.name.toLowerCase().includes(q) || (lead.phone || '').includes(q) || (lead.tags || []).some(t => t.toLowerCase().includes(q));
    const matchFilter =
      crmFilter === 'all' ? true :
      crmFilter === 'nowebsite' ? !lead.has_website :
      crmFilter === 'contacted' ? lead.status !== 'new' :
      crmFilter === 'closed' ? lead.status === 'closed' : 
      crmFilter === 'hot' ? lead.ai_score >= 80 : true;

    const matchAgent = 
      agentFilter === 'all' ? true :
      agentFilter === 'unassigned' ? !lead.assigned_to :
      lead.assigned_to === agentFilter;

    return matchSearch && matchFilter && matchAgent;
  });

  const getScoreColor = (score) => {
    if (score >= 80) return '#ef4444'; // Red (Hot)
    if (score >= 60) return '#f59e0b'; // Yellow (Warm)
    return '#94a3b8'; // Gray (Cold)
  };

  // Stats
  const total = leads.length;
  const noWebsite = leads.filter(l => !l.has_website).length;
  const contacted = leads.filter(l => l.status !== 'new').length;
  const closed = leads.filter(l => l.status === 'closed').length;
  const totalRevenue = leads.reduce((sum, l) => sum + (l.revenue || 0), 0);
  const today = new Date().toISOString().split('T')[0];
  const todayFollowups = leads.filter(l => l.next_followup_date === today);

  return (
    <div>
      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Toplam Kayıt', value: total, color: 'var(--text-primary)' },
          { label: 'Potansiyel Müşteri', value: noWebsite, color: '#f87171', border: '#ef4444' },
          { label: 'İletişim Kuruldu', value: contacted, color: '#818cf8', border: '#6366f1' },
          { label: 'Müşteri Kazanıldı', value: closed, color: '#34d399', border: '#10b981' },
          { label: 'Toplam Gelir', value: `${totalRevenue.toLocaleString('tr-TR')}₺`, color: '#fbbf24', border: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ textAlign: 'center', padding: '20px', borderBottom: s.border ? `3px solid ${s.border}` : 'none' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* TODAY'S FOLLOWUPS */}
      {todayFollowups.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '24px', borderLeft: '4px solid #f59e0b', background: 'rgba(245,158,11,0.08)' }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '12px' }}>⏰ Bugün Takip Edilecekler ({todayFollowups.length})</h3>
          {todayFollowups.map(l => (
            <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontWeight: 600 }}>{l.name}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {l.phone && <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{l.phone}</span>}
                {l.phone && (
                  <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px', borderColor: '#25D366', color: '#25D366' }}
                    onClick={() => openWhatsApp(l)}>
                    <MessageCircle size={14} /> WA
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel">
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Müşteri Listesi ({filteredLeads.length}/{total})</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 8 }}>
              <button onClick={() => setViewMode('list')} style={{ padding: '6px 12px', background: viewMode === 'list' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Liste</button>
              <button onClick={() => setViewMode('kanban')} style={{ padding: '6px 12px', background: viewMode === 'kanban' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Kanban Board</button>
            </div>
            <button onClick={downloadCSV} className="btn btn-outline" style={{ borderColor: '#10b981', color: '#10b981', padding: '8px 16px' }}>
              <Download size={16} /> Excel İndir
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-secondary)' }} />
            <input className="glass-input" style={{ paddingLeft: '38px', width: '100%' }}
              placeholder="İsim, telefon veya etiketle ara..."
              value={crmSearch} onChange={e => setCrmSearch(e.target.value)} />
          </div>

          <select 
            className="glass-select" 
            value={agentFilter} 
            onChange={e => setAgentFilter(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '13px', borderRadius: 8 }}
          >
            <option value="all">👥 Tüm Temsilciler</option>
            <option value="unassigned">🌊 Atanmamış (Havuz)</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>👤 {a.name}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'Tümü' },
              { key: 'hot', label: '🔥 Sıcak Fırsat (AI > 80)' },
              { key: 'nowebsite', label: '🔴 Site Yok' },
              { key: 'contacted', label: '📞 İletişim' },
              { key: 'closed', label: '🏆 Müşteri' },
            ].map(f => (
              <button key={f.key} className={`btn btn-outline ${crmFilter === f.key ? 'active-filter' : ''}`}
                style={{ padding: '8px 14px', fontSize: '13px' }}
                onClick={() => setCrmFilter(f.key)}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* Lead Cards / Kanban */}
        {filteredLeads.length === 0 ? (
          <div className="loader-container"><p>Eşleşen sonuç bulunamadı.</p></div>
        ) : viewMode === 'kanban' ? (
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16 }}>
            {Object.entries(STATUS_MAP).map(([statusKey, statusInfo]) => {
              const columnLeads = filteredLeads.filter(l => l.status === statusKey);
              return (
                <div key={statusKey} 
                  onDragOver={handleDragOver} 
                  onDrop={(e) => handleDrop(e, statusKey)}
                  style={{ minWidth: 320, width: 320, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                    <h3 style={{ fontSize: 16, margin: 0, color: 'var(--text-primary)' }}>{statusInfo.label}</h3>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{columnLeads.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 150 }}>
                    {columnLeads.map(lead => {
                      initLeadData(lead);
                      const wsStatus = checkingWebsite[lead.id];
                      return (
                        <div key={lead.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          style={{ background: 'white', color: '#0f172a', padding: 16, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'grab', borderLeft: `4px solid ${statusKey === 'closed' ? '#10b981' : (statusKey === 'rejected' ? '#ef4444' : '#3b82f6')}` }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: 15 }}>{lead.name}</h4>
                          <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {lead.phone && <div>📞 {lead.phone}</div>}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <span style={{ fontWeight: 600, color: lead.has_website ? '#10b981' : '#ef4444' }}>{lead.has_website ? 'Site Var' : 'Site Yok'}</span>
                              {lead.portal_viewed > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }} title="Portal Görüntülenmesi">👁 {lead.portal_viewed}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {columnLeads.length === 0 && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '20px 0', fontSize: 14 }}>Buraya sürükleyin</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="data-grid">
            {filteredLeads.map(lead => {
              initLeadData(lead);
              const wsStatus = checkingWebsite[lead.id];
              const aiScore = lead.ai_score || 0;

              return (
                <div key={lead.id} className={`data-card glass-panel ${!lead.has_website ? 'card-highlight' : ''}`} style={{ padding: '20px' }}>
                  {/* Header */}
                  <div className="card-header" style={{ marginBottom: 12 }}>
                    <h4 className="card-title" style={{ flex: 1, paddingRight: '8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {lead.name}
                      {lead.portal_viewed > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(56,189,248,0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }} title="Müşteri Portala Baktı!">
                          👁 {lead.portal_viewed}
                        </span>
                      )}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className={`status-badge ${STATUS_MAP[lead.status]?.cls || 'status-warning'}`} style={{ whiteSpace: 'nowrap' }}>
                        {STATUS_MAP[lead.status]?.label || 'Yeni'}
                      </span>
                      {aiScore > 0 && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(aiScore), display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Activity size={12} /> AI Skor: {aiScore}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges / Tags Summary */}
                  {lead.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {lead.tags.map(t => (
                        <span key={t} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>#{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(lead.rating || lead.review_count > 0) && (
                      <div className="card-info">
                        <Star size={14} style={{ color: '#f59e0b' }} />
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>{lead.rating}</span> 
                        <span style={{ fontSize: 11 }}>({lead.review_count} Yorum)</span>
                      </div>
                    )}
                    {lead.address && <div className="card-info"><MapPin size={14} /><span>{lead.address}</span></div>}
                    {lead.phone && <div className="card-info"><Phone size={14} /><span>{lead.phone}</span></div>}
                    {lead.email && <div className="card-info"><Mail size={14} /><span>{lead.email}</span></div>}
                    <div className="card-info">
                      <Globe size={14} />
                      {lead.has_website ? (
                        <span style={{ color: '#34d399' }}>
                          Site Var {wsStatus === 'fail' && <span style={{ color: '#f87171' }}>(⚠️ Erişilemiyor!)</span>}
                          {wsStatus === 'ok' && <span style={{ color: '#34d399' }}>(✓ Aktif)</span>}
                        </span>
                      ) : (
                        <strong style={{ color: '#f87171' }}>Potansiyel Müşteri (Site Yok)</strong>
                      )}
                    </div>
                  </div>

                  {/* Assigned Agent & Status Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Temsilci:
                      </label>
                      <select 
                        className="glass-select" 
                        style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                        value={lead.assigned_to || ''}
                        onChange={e => updateLead(lead.id, { assigned_to: e.target.value || null })}
                      >
                        <option value="">(Havuzda)</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>👤 {a.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Durum:
                      </label>
                      <select className="glass-select" style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                        value={lead.status}
                        onChange={e => updateLead(lead.id, { status: e.target.value })}>
                        <option value="new">Yeni</option>
                        <option value="contacted">İletişime Geçildi</option>
                        <option value="interested">İlgileniyor</option>
                        <option value="rejected">İlgilenmiyor</option>
                        <option value="closed">Müşteri Oldu 🎉</option>
                      </select>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button className="btn btn-outline" style={{ marginTop: '12px', width: '100%', fontSize: '13px', padding: '8px' }}
                    onClick={() => toggleCard(lead)}>
                    ▼ Müşteri Detayları & İşlemler
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Lead Details Modal */}
      {expandedCard && leads.find(l => l.id === expandedCard) && (() => {
        const lead = leads.find(l => l.id === expandedCard);
        const wsStatus = checkingWebsite[lead.id];
        return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
            <button className="btn btn-outline" style={{ position: 'absolute', top: 20, right: 20, padding: 8 }} onClick={() => setExpandedCard(null)}>
              <X size={16} />
            </button>
            <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--text-primary)' }}>{lead.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Müşteri ile ilgili notları, bilgileri ve mockupları düzenleyin.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Tags Editor */}
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}><Tag size={12} style={{ display: 'inline' }} /> Etiketler</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {SUGGESTED_TAGS.map(t => {
                            const active = (tags[lead.id] || []).includes(t);
                            return (
                              <button key={t} type="button" onClick={() => toggleTag(lead.id, t)}
                                style={{ padding: '4px 10px', fontSize: 11, borderRadius: 12, border: `1px solid ${active ? '#6366f1' : 'var(--glass-border)'}`, background: active ? 'rgba(99,102,241,0.2)' : 'transparent', color: active ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Contact Info (Email) */}
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>📧 E-posta Adresi</label>
                        <input type="email" className="glass-input" style={{ width: '100%', fontSize: '13px' }}
                          placeholder="Müşteri e-postası..."
                          value={emails[lead.id] || ''}
                          onChange={e => setEmails(p => ({ ...p, [lead.id]: e.target.value }))} />
                      </div>

                      {/* Followup Date */}
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>⏰ Takip Tarihi</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="date" className="glass-input" style={{ flex: 1, fontSize: '13px' }}
                            value={followupDates[lead.id] || ''}
                            onChange={e => setFollowupDates(p => ({ ...p, [lead.id]: e.target.value }))} />
                          <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: 13, borderColor: '#818cf8', color: '#818cf8' }} 
                            onClick={() => syncToCalendar(lead)} disabled={calSyncing[lead.id]}>
                            <Calendar size={14} /> {calSyncing[lead.id] ? 'Ekleniyor' : 'Takvime Ekle'}
                          </button>
                        </div>
                      </div>

                      {/* Revenue */}
                      {lead.status === 'closed' && (
                        <div>
                          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>💰 Kazanılan Ücret (₺)</label>
                          <input type="number" className="glass-input" style={{ width: '100%', fontSize: '13px' }}
                            placeholder="Proje ücreti..."
                            value={revenues[lead.id] || ''}
                            onChange={e => setRevenues(p => ({ ...p, [lead.id]: e.target.value }))} />
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}><AlignLeft size={12} style={{ display: 'inline' }} /> Özel Notlar</label>
                        <textarea className="glass-input" style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontSize: '13px' }}
                          placeholder="Müşteriyle görüşme notları..."
                          value={notes[lead.id] || ''}
                          onChange={e => setNotes(p => ({ ...p, [lead.id]: e.target.value }))} />
                      </div>

                      {/* Mockup URLs */}
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>💻 Masaüstü Tasarım Görseli (Opsiyonel Link)</label>
                        <input type="text" className="glass-input" style={{ width: '100%', fontSize: '13px', marginBottom: '12px' }}
                          placeholder="Masaüstü mockup görsel linki (Örn: Canva/Imgur URL)"
                          value={desktopMockups[lead.id] || ''}
                          onChange={e => setDesktopMockups(p => ({ ...p, [lead.id]: e.target.value }))} />
                          
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>📱 Mobil Tasarım Görseli (Opsiyonel Link)</label>
                        <input type="text" className="glass-input" style={{ width: '100%', fontSize: '13px' }}
                          placeholder="Mobil mockup görsel linki"
                          value={mobileMockups[lead.id] || ''}
                          onChange={e => setMobileMockups(p => ({ ...p, [lead.id]: e.target.value }))} />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                          onClick={() => saveLead(lead)}>
                          <Save size={14} /> Bilgileri Kaydet
                        </button>
                        <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: 13, borderColor: portalCopied[lead.id] ? '#10b981' : undefined, color: portalCopied[lead.id] ? '#34d399' : undefined }}
                          onClick={() => copyPortalLink(lead)}>
                          <Link size={14} /> {portalCopied[lead.id] ? 'Kopyalandı!' : 'Portal Linki'}
                        </button>
                        <button className="btn btn-outline" style={{ padding: '8px 12px', borderColor: '#ef4444', color: '#ef4444' }}
                          onClick={() => deleteLead(lead.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <button className="btn btn-outline" style={{ width: '100%', padding: '10px', marginTop: 16, borderColor: '#6366f1', color: '#6366f1', fontWeight: 600 }}
                        onClick={() => setSalesModalLead(lead)}>
                        <MessageSquare size={16} /> Satış Asistanı & AI Raporu
                      </button>

                      <div style={{ display: 'flex', gap: '8px', marginTop: 12, flexWrap: 'wrap' }}>
                        {lead.phone && (
                          <button className="btn" style={{ flex: 1, background: '#25D366', color: 'white', padding: '10px', fontSize: '13px' }}
                            onClick={() => openWhatsApp(lead)}>
                            <MessageCircle size={16} /> WhatsApp'tan Gönder
                          </button>
                        )}
                        {lead.email && (
                          <button className="btn" style={{ flex: 1, background: '#3b82f6', color: 'white', padding: '10px', fontSize: '13px' }}
                            onClick={() => openEmail(lead)}>
                            <Mail size={16} /> E-posta Gönder
                          </button>
                        )}
                        {lead.has_website && (
                          <button className="btn btn-outline" style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                            onClick={() => checkWebsite(lead)} disabled={wsStatus === 'loading'}>
                            <ExternalLink size={14} /> {wsStatus === 'loading' ? 'Kontrol Ediliyor...' : 'Siteyi Kontrol Et'}
                          </button>
                        )}
                      </div>

                      {/* Call Logs */}
                      <div style={{ marginTop: 8 }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}><PhoneCall size={12} style={{ display: 'inline' }} /> Arama Geçmişi & Notları</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input className="glass-input" style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                            placeholder="Arama notu ekle..."
                            value={callLogInputs[lead.id] || ''}
                            onChange={e => setCallLogInputs(p => ({ ...p, [lead.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addCallLog(lead.id)} />
                          <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={() => addCallLog(lead.id)}>+</button>
                        </div>
                        {(callLogs[lead.id] || []).length === 0 ? (
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Henüz arama kaydı yok.</p>
                        ) : (
                          <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                            {(callLogs[lead.id] || []).map((log, i) => (
                              <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px', fontSize: '13px' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px' }}>
                                  {new Date(log.created_at).toLocaleString('tr-TR')}
                                </div>
                                {log.note || <span style={{ opacity: 0.5 }}>Not yok</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
            </div>
          </div>
        </div>
        );
      })()}
      
      {/* Sales Assistant Modal */}
      {salesModalLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
            <button className="btn btn-outline" style={{ position: 'absolute', top: 20, right: 20, padding: 8 }} onClick={() => setSalesModalLead(null)}>
              <Trash2 size={16} /> Kapat
            </button>
            <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--text-primary)' }}>{salesModalLead.name} - Satış Asistanı</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Bu müşteri için satış mesajı şablonları oluşturun ve rakip analizi yapın.</p>
            
            <div style={{ padding: 20, background: 'rgba(99,102,241,0.05)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <h5 style={{ margin: 0, fontSize: 16, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 6 }}>Satış Mesajı</h5>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: 12, borderColor: '#3b82f6', color: '#3b82f6' }} onClick={() => applyTemplate(salesModalLead, 'email')}>E-posta Şablonu</button>
                  <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: 12, borderColor: '#10b981', color: '#10b981' }} onClick={() => applyTemplate(salesModalLead, 'whatsapp_short')}>Kısa Şablon (WA)</button>
                  <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: 12, borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => applyTemplate(salesModalLead, 'whatsapp_alt')}>Detaylı Şablon (WA)</button>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12, marginLeft: 10 }} onClick={() => generateAiPitch(salesModalLead)} disabled={generatingPitch[salesModalLead.id]}>
                    {generatingPitch[salesModalLead.id] ? 'Üretiliyor...' : '✨ Yapay Zeka (AI) Üretsin'}
                  </button>
                </div>
              </div>
              {aiPitches[salesModalLead.id] ? (
                <>
                  <textarea className="glass-input" style={{ width: '100%', minHeight: 200, fontSize: 14, resize: 'vertical' }} value={aiPitches[salesModalLead.id]} onChange={(e) => setAiPitches(p => ({...p, [salesModalLead.id]: e.target.value}))} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 12 }}>
                    <button className="btn btn-outline" style={{ padding: '10px 20px', color: 'var(--text-secondary)' }} onClick={() => { navigator.clipboard.writeText(aiPitches[salesModalLead.id]); alert('Mesaj kopyalandı!'); }}>
                      <Copy size={16} style={{ marginRight: 6 }} /> Kopyala
                    </button>
                    <button className="btn btn-primary" style={{ padding: '10px 20px', background: '#25D366', borderColor: '#25D366', color: 'white' }} onClick={() => {
                      const text = encodeURIComponent(aiPitches[salesModalLead.id]);
                      let phone = salesModalLead.phone ? salesModalLead.phone.replace(/[^0-9]/g, '') : '';
                      if (phone.startsWith('0')) phone = '9' + phone;
                      if (phone.length === 10) phone = '90' + phone;
                      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                    }}>
                      WhatsApp'tan Gönder 🚀
                    </button>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Bu müşteri için yapay zeka destekli, dönüşüm oranı yüksek bir satış mesajı oluşturun.</p>
              )}
            </div>

            <div style={{ padding: 20, background: 'rgba(225,29,72,0.05)', borderRadius: 12, border: '1px solid rgba(225,29,72,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h5 style={{ margin: 0, fontSize: 16, color: '#be123c', display: 'flex', alignItems: 'center', gap: 6 }}>📊 AI Rakip Tehdidi Raporu</h5>
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 12, background: '#e11d48', borderColor: '#e11d48' }} onClick={() => generateCompetitorReport(salesModalLead)} disabled={generatingReport[salesModalLead.id]}>
                  {generatingReport[salesModalLead.id] ? 'Analiz Ediliyor...' : '🔍 Rakipleri Bul & Analiz Et'}
                </button>
              </div>
              {competitorReports[salesModalLead.id] ? (
                <p style={{ fontSize: 14, color: '#881337', lineHeight: 1.6 }}>{competitorReports[salesModalLead.id]}</p>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Bu müşterinin bölgesindeki rakipleri analiz edip müşteri portalına ekleyin.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Trigger hot reload
