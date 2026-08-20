"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, CheckCircle, Search, Users, Trash2, CheckSquare, 
  Square, Sparkles, XCircle, ExternalLink 
} from 'lucide-react';

export default function OutreachTab({ leads = [], onRefresh }) {
  const [template, setTemplate] = useState(
    "Merhaba {firma_adi} ailesi 👋\n\nBölgenizdeki başarılı işletmeleri incelerken kaliteniz dikkatimizi çekti. Firmanıza özel canlı ve çalışan bir web sitesi demosu hazırladık! 🚀\n\nTelefonunuzdan 1 dakikada inceleyebilirsiniz:\n{demo_link}\n\nBeğenirseniz 24 saat içinde kendi alan adınızla yayına alabiliriz. İnceledikten sonra görüşlerinizi paylaşırsanız sevinirim! 😊"
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Sadece yeni durumdaki ve telefonu olan müşteriler
  const targetLeads = (leads || [])
    .filter(l => l && l.status === 'new' && l.phone && l.phone.trim().length > 5)
    .filter(l => (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || ((l.category || '').toLowerCase().includes(searchTerm.toLowerCase())));

  useEffect(() => {
    const saved = localStorage.getItem('outreach_template');
    if (saved) setTemplate(saved);
  }, []);

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
    localStorage.setItem('outreach_template', e.target.value);
  };

  const generateMessage = (lead) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const demoLink = lead.portal_token 
      ? `${origin}/demo/${lead.portal_token}` 
      : `${origin}/demo?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone || '')}`;
    
    return template
      .replace(/{firma_adi}/g, lead.name)
      .replace(/{demo_link}/g, demoLink);
  };

  const handleSend = async (lead) => {
    let phone = lead.phone.replace(/\D/g, '');
    if (phone.length === 10 && phone.startsWith('5')) phone = '90' + phone;
    else if (phone.length === 11 && phone.startsWith('0')) phone = '9' + phone;

    const msg = encodeURIComponent(generateMessage(lead));
    const waLink = `https://wa.me/${phone}?text=${msg}`;

    window.open(waLink, '_blank');

    try {
      await axios.put('/api/leads', { 
        id: lead.id, 
        status: 'contacted' 
      });
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error("Müşteri güncellenemedi", e);
    }
  };

  // Tekli Eleme / Silme
  const handleDeleteOne = async (leadId, leadName) => {
    if (!confirm(`"${leadName}" firmasını silmek/elemek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete('/api/leads', { data: { id: leadId } });
      const next = new Set(selectedIds);
      next.delete(leadId);
      setSelectedIds(next);
      if (onRefresh) onRefresh();
    } catch (e) {
      alert('Silme işlemi başarısız.');
    }
  };

  // İlgilenmiyor olarak işaretle
  const handleMarkRejected = async (leadId) => {
    try {
      await axios.put('/api/leads', { id: leadId, status: 'rejected' });
      if (onRefresh) onRefresh();
    } catch (e) {
      alert('İşlem başarısız.');
    }
  };

  // Toplu Seçim Toggle
  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === targetLeads.length && targetLeads.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(targetLeads.map(l => l.id)));
    }
  };

  // Toplu Silme
  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    if (!confirm(`Seçtiğiniz ${ids.length} firmayı sistemden tamamen silmek istediğinize emin misiniz?`)) return;

    setIsDeleting(true);
    try {
      await axios.delete('/api/leads', { data: { ids } });
      setSelectedIds(new Set());
      if (onRefresh) onRefresh();
    } catch (e) {
      alert('Toplu silme başarısız oldu.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Template Card */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users color="#8b5cf6" size={22} /> Toplu İlk Temas & Otomatik Satış Mesajı
          </h2>
          <span style={{ fontSize: 12, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>
            {targetLeads.length} Yeni Müşteri Bekliyor
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: 18, fontSize: 13, lineHeight: 1.5 }}>
          Bu sayfada henüz iletişime geçilmemiş "Yeni" durumdaki esnaflar listelenir. <strong>"Gönder ve İşaretle"</strong> butonuna bastığınızda seçili şablon müşterinin adına ve canlı demo linkine göre doldurulur, WhatsApp açılır ve kişi otomatik olarak <em>"İletişime Geçildi"</em> durumuna geçer.
        </p>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>WhatsApp Mesaj Şablonu:</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', color: '#a78bfa', padding: '2px 8px', borderRadius: 6 }}>{`{firma_adi}`}</span>
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', color: '#a78bfa', padding: '2px 8px', borderRadius: 6 }}>{`{demo_link}`}</span>
            </div>
          </div>
          <textarea 
            className="glass-input" 
            style={{ minHeight: 110, resize: 'vertical', width: '100%', padding: 12, fontSize: 13, lineHeight: 1.5 }}
            value={template}
            onChange={handleTemplateChange}
          />
        </div>
      </div>

      {/* Target Leads Section */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
        
        {/* Toolbar & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={toggleSelectAll}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {selectedIds.size === targetLeads.length && targetLeads.length > 0 ? (
                <CheckSquare size={18} style={{ color: '#8b5cf6' }} />
              ) : (
                <Square size={18} style={{ color: 'var(--text-secondary)' }} />
              )}
              {selectedIds.size === targetLeads.length && targetLeads.length > 0 ? 'Seçimi Kaldır' : 'Hepsini Seç'}
            </button>

            {selectedIds.size > 0 && (
              <button 
                onClick={handleBatchDelete}
                disabled={isDeleting}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                <Trash2 size={14} /> {isDeleting ? 'Siliniyor...' : `Seçilenleri Ele / Sil (${selectedIds.size})`}
              </button>
            )}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Firma veya sektör ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 36, padding: '9px 12px 9px 36px', fontSize: 13, width: '100%' }}
            />
          </div>

        </div>

        {/* List */}
        {targetLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Kriterlere uygun yeni müşteri bulunamadı. Lütfen "Yeni Bul" sekmesinden arama yapın veya CRM'den müşteri ekleyin.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {targetLeads.map(lead => {
              const isSelected = selectedIds.has(lead.id);

              return (
                <div 
                  key={lead.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 18px', 
                    background: isSelected ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)', 
                    border: isSelected ? '1px solid #8b5cf6' : '1px solid var(--glass-border)', 
                    borderRadius: 14,
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  
                  {/* Checkbox & Lead Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button 
                      onClick={() => toggleSelectOne(lead.id)}
                      style={{ background: 'transparent', border: 'none', color: isSelected ? '#8b5cf6' : 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>

                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {lead.name}
                      </div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>📞 {lead.phone}</span>
                        {lead.category && <span>🏷️ {lead.category}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    
                    <a 
                      href={`/demo/${lead.portal_token || lead.id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                      title="Canlı Demoyu Aç"
                    >
                      <Sparkles size={13} /> Demo Gör
                    </a>

                    <button 
                      onClick={() => handleSend(lead)}
                      className="btn btn-primary" 
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'linear-gradient(to right, #8b5cf6, #7c3aed)', fontSize: 12, fontWeight: 700 }}
                    >
                      <Send size={14} /> Gönder ve İşaretle 🚀
                    </button>

                    <button 
                      onClick={() => handleMarkRejected(lead.id)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
                      title="İlgilenmiyor olarak işaretle"
                    >
                      <XCircle size={17} />
                    </button>

                    <button 
                      onClick={() => handleDeleteOne(lead.id, lead.name)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6 }}
                      title="Firmayı tamamen sil / ele"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
