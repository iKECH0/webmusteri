"use client";
import { useState } from 'react';
import axios from 'axios';
import { Download, Filter, Search, MessageCircle, AlignLeft, Save, Trash2, Phone, MapPin, Globe, ExternalLink, PhoneCall } from 'lucide-react';

const STATUS_MAP = {
  new: { label: 'Yeni', cls: 'status-warning' },
  contacted: { label: 'İletişime Geçildi', cls: 'status-info' },
  interested: { label: 'İlgileniyor', cls: 'status-success' },
  rejected: { label: 'İlgilenmiyor', cls: 'status-danger' },
  closed: { label: 'Müşteri Oldu 🎉', cls: 'status-success' }
};

export default function CRMTab({ leads, onRefresh }) {
  const [crmSearch, setCrmSearch] = useState('');
  const [crmFilter, setCrmFilter] = useState('all');
  const [notes, setNotes] = useState({});
  const [followupDates, setFollowupDates] = useState({});
  const [revenues, setRevenues] = useState({});
  const [callLogInputs, setCallLogInputs] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [callLogs, setCallLogs] = useState({});
  const [checkingWebsite, setCheckingWebsite] = useState({});

  const initNote = (lead) => {
    if (notes[lead.id] === undefined) setNotes(p => ({ ...p, [lead.id]: lead.notes || '' }));
    if (followupDates[lead.id] === undefined) setFollowupDates(p => ({ ...p, [lead.id]: lead.next_followup_date || '' }));
    if (revenues[lead.id] === undefined) setRevenues(p => ({ ...p, [lead.id]: lead.revenue || '' }));
  };

  const updateLead = async (id, data) => {
    await axios.put('/api/leads', { id, ...data });
    onRefresh();
  };

  const saveLead = async (lead) => {
    await updateLead(lead.id, {
      notes: notes[lead.id],
      next_followup_date: followupDates[lead.id] || null,
      revenue: revenues[lead.id] ? parseFloat(revenues[lead.id]) : null
    });
  };

  const deleteLead = async (id) => {
    if (!confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
    await axios.delete('/api/leads', { data: { id } });
    onRefresh();
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

  const toggleCard = (id) => {
    const newExpanded = expandedCard === id ? null : id;
    setExpandedCard(newExpanded);
    if (newExpanded) fetchCallLogs(newExpanded);
  };

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const clean = phone.replace(/[^0-9]/g, '');
    const formatted = clean.startsWith('90') ? clean : (clean.startsWith('0') ? '90' + clean.slice(1) : '90' + clean);
    const templateStmt = localStorage.getItem('whatsapp_template') ||
      "Merhaba {firma_adi}, Google Haritalar'daki işletmenizin web sitesi olmadığını gördük. Size özel profesyonel bir web sitesi hazırlayabiliriz. Detaylı bilgi almak ister misiniz?";
    const msg = encodeURIComponent(templateStmt);
    window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank');
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

  const downloadCSV = () => {
    let csv = "\uFEFFDFirma Adı,Telefon,Adres,Kategori,Durum,Web Sitesi,Kazanılan Gelir,Notlar,Takip Tarihi\r\n";
    filteredLeads.forEach(l => {
      csv += [
        `"${l.name || ''}"`, `"${l.phone || ''}"`, `"${l.address || ''}"`,
        `"${l.category || ''}"`, `"${STATUS_MAP[l.status]?.label || l.status}"`,
        l.has_website ? 'Var' : 'Yok',
        l.revenue ? `${l.revenue}₺` : '0₺',
        `"${(l.notes || '').replace(/"/g, '""')}"`,
        `"${l.next_followup_date || ''}"`,
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
    const matchSearch = !q || lead.name.toLowerCase().includes(q) || (lead.phone || '').includes(q);
    const matchFilter =
      crmFilter === 'all' ? true :
      crmFilter === 'nowebsite' ? !lead.has_website :
      crmFilter === 'contacted' ? lead.status !== 'new' :
      crmFilter === 'closed' ? lead.status === 'closed' : true;
    return matchSearch && matchFilter;
  });

  // Stats
  const total = leads.length;
  const noWebsite = leads.filter(l => !l.has_website).length;
  const contacted = leads.filter(l => l.status !== 'new').length;
  const closed = leads.filter(l => l.status === 'closed').length;
  const totalRevenue = leads.reduce((sum, l) => sum + (l.revenue || 0), 0);

  // Today's followups
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
                    onClick={() => openWhatsApp(l.phone)}>
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
          <button onClick={downloadCSV} className="btn btn-outline" style={{ borderColor: '#10b981', color: '#10b981', padding: '8px 16px' }}>
            <Download size={16} /> Excel İndir
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-secondary)' }} />
            <input className="glass-input" style={{ paddingLeft: '38px', width: '100%' }}
              placeholder="İsim veya telefonla ara..."
              value={crmSearch} onChange={e => setCrmSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'Tümü' },
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

        {/* Lead Cards */}
        {filteredLeads.length === 0 ? (
          <div className="loader-container"><p>Eşleşen sonuç bulunamadı.</p></div>
        ) : (
          <div className="data-grid">
            {filteredLeads.map(lead => {
              initNote(lead);
              const isExpanded = expandedCard === lead.id;
              const wsStatus = checkingWebsite[lead.id];

              return (
                <div key={lead.id} className={`data-card glass-panel ${!lead.has_website ? 'card-highlight' : ''}`} style={{ padding: '20px' }}>
                  {/* Header */}
                  <div className="card-header">
                    <h4 className="card-title" style={{ flex: 1, paddingRight: '8px' }}>{lead.name}</h4>
                    <span className={`status-badge ${STATUS_MAP[lead.status]?.cls || 'status-warning'}`} style={{ whiteSpace: 'nowrap' }}>
                      {STATUS_MAP[lead.status]?.label || 'Yeni'}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {lead.address && <div className="card-info"><MapPin size={14} /><span>{lead.address}</span></div>}
                    {lead.phone && <div className="card-info"><Phone size={14} /><span>{lead.phone}</span></div>}
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

                  {/* WhatsApp + Check Website */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {lead.phone && (
                      <button className="btn" style={{ flex: 1, background: '#25D366', color: 'white', padding: '10px', fontSize: '13px' }}
                        onClick={() => openWhatsApp(lead.phone)}>
                        <MessageCircle size={16} /> WhatsApp
                      </button>
                    )}
                    {lead.has_website && (
                      <button className="btn btn-outline" style={{ padding: '10px 12px', fontSize: '13px' }}
                        onClick={() => checkWebsite(lead)} disabled={wsStatus === 'loading'}>
                        <ExternalLink size={14} /> {wsStatus === 'loading' ? '...' : 'Site Kontrol'}
                      </button>
                    )}
                  </div>

                  {/* Status Selector */}
                  <select className="glass-select" style={{ width: '100%', marginTop: '12px', padding: '8px 12px', fontSize: '13px' }}
                    value={lead.status}
                    onChange={e => updateLead(lead.id, { status: e.target.value })}>
                    <option value="new">Yeni (İşlem Yapılmadı)</option>
                    <option value="contacted">İletişime Geçildi</option>
                    <option value="interested">İlgileniyor</option>
                    <option value="rejected">İlgilenmiyor</option>
                    <option value="closed">Müşteri Oldu 🎉</option>
                  </select>

                  {/* Expand Button */}
                  <button className="btn btn-outline" style={{ marginTop: '12px', width: '100%', fontSize: '13px', padding: '8px' }}
                    onClick={() => toggleCard(lead.id)}>
                    {isExpanded ? '▲ Gizle' : '▼ Not & Arama Geçmişi'}
                  </button>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Followup Date */}
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>⏰ Takip Tarihi</label>
                        <input type="date" className="glass-input" style={{ width: '100%', fontSize: '13px' }}
                          value={followupDates[lead.id] || ''}
                          onChange={e => setFollowupDates(p => ({ ...p, [lead.id]: e.target.value }))} />
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

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                          onClick={() => saveLead(lead)}>
                          <Save size={14} /> Kaydet
                        </button>
                        <button className="btn btn-outline" style={{ padding: '8px 12px', borderColor: '#ef4444', color: '#ef4444' }}
                          onClick={() => deleteLead(lead.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Call Logs */}
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}><PhoneCall size={12} style={{ display: 'inline' }} /> Arama Geçmişi</label>
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
                          (callLogs[lead.id] || []).map((log, i) => (
                            <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '6px', fontSize: '13px' }}>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '4px' }}>
                                {new Date(log.created_at).toLocaleString('tr-TR')}
                              </div>
                              {log.note || <span style={{ opacity: 0.5 }}>Not yok</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
