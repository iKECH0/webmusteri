"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Plus, Trash2, Mail } from 'lucide-react';

export default function EmailTab({ leads }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('İşletmenize Özel Web Sitesi Teklifi');
  const [newBody, setNewBody] = useState(`Sayın {firma_adi} Yönetimi,

Google Haritalar üzerinde işletmenizi incelerken web sitenizin olmadığını fark ettik.

Günümüzde müşterilerin %85'i bir işletmeyi internette araştırdıktan sonra ziyaret ediyor. Web sitesi olmayan işletmeler bu müşterilerin büyük çoğunluğunu kaybediyor.

Size özel profesyonel bir web sitesi hazırlayabiliriz:
✅ 7-10 gün içinde yayında
✅ Mobil uyumlu tasarım  
✅ Google'da üst sıralarda çıkmanıza yardımcı SEO
✅ Uygun fiyat garantisi

Detaylı teklif için: {portal_link}

Ayrıca sizi doğrudan arayarak da bilgi verebiliriz.

Saygılarımızla,
Web Tasarım Ekibimiz`);

  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filterNoWebsite, setFilterNoWebsite] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    const res = await axios.get('/api/email/campaigns');
    setCampaigns(res.data);
  };

  const saveCampaign = async (e) => {
    e.preventDefault();
    await axios.post('/api/email/campaigns', { name: newName, subject: newSubject, body: newBody });
    setNewName('');
    fetchCampaigns();
  };

  const deleteCampaign = async (id) => {
    await axios.delete('/api/email/campaigns', { data: { id } });
    fetchCampaigns();
  };

  const eligibleLeads = leads.filter(l => l.email && (filterNoWebsite ? !l.has_website : true));

  const toggleLead = (id) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedLeads(eligibleLeads.map(l => l.id));
  };

  const sendEmails = async () => {
    if (!selectedLeads.length) return alert('En az bir alıcı seçin.');
    if (!newSubject || !newBody) return alert('Konu ve mesaj alanlarını doldurun.');
    setSending(true);
    setSendResult(null);
    try {
      const res = await axios.post('/api/email/send', {
        lead_ids: selectedLeads,
        subject: newSubject,
        body: newBody,
        campaign_id: selectedCampaign || null,
      });
      setSendResult(res.data);
    } catch (err) {
      setSendResult({ sent: 0, failed: selectedLeads.length, errors: [{ error: err.response?.data?.error || err.message }] });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Composer */}
      <div className="glass-panel">
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>📧 E-posta Kampanya Yöneticisi</h2>

        {/* Template Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>E-posta Konusu</label>
              <input className="glass-input" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Konu..." />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Kampanya Adı (Kayıt için)</label>
              <input className="glass-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Örn: Ağustos Kampanyası" />
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>
              Mesaj Şablonu &nbsp;
              <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: 12 }}>
                Değişkenler: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>{'{firma_adi}'}</code> <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>{'{portal_link}'}</code>
              </span>
            </label>
            <textarea className="glass-input" rows={10} value={newBody} onChange={e => setNewBody(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" style={{ fontSize: 13, padding: '8px 14px' }} onClick={saveCampaign} disabled={!newName}>
              <Plus size={14} /> Şablonu Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Saved Campaigns */}
      {campaigns.length > 0 && (
        <div className="glass-panel">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Kayıtlı Kampanyalar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {campaigns.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: selectedCampaign === c.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', borderRadius: 10, border: selectedCampaign === c.id ? '1px solid var(--accent-color)' : '1px solid transparent', cursor: 'pointer' }}
                onClick={() => { setSelectedCampaign(c.id); setNewSubject(c.subject); setNewBody(c.body); }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.subject} · {c.sent_count} kez gönderildi</div>
                </div>
                <button className="btn btn-outline" style={{ padding: '6px 10px', borderColor: '#ef4444', color: '#f87171' }}
                  onClick={e => { e.stopPropagation(); deleteCampaign(c.id); }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipient List */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: 16 }}>Alıcı Listesi</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={filterNoWebsite} onChange={e => setFilterNoWebsite(e.target.checked)} />
              Sadece web sitesi olmayanlar
            </label>
            <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 12 }} onClick={selectAll}>
              Tümünü Seç ({eligibleLeads.length})
            </button>
          </div>
        </div>

        {eligibleLeads.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: 20, textAlign: 'center' }}>
            <Mail size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>E-posta adresi kayıtlı müşteri bulunamadı.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>CRM sekmesinde müşteri kartlarını açıp e-posta ekleyin.</p>
          </div>
        ) : (
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {eligibleLeads.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: selectedLeads.includes(l.id) ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', borderRadius: 8, cursor: 'pointer', border: selectedLeads.includes(l.id) ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent' }}
                onClick={() => toggleLead(l.id)}>
                <input type="checkbox" checked={selectedLeads.includes(l.id)} onChange={() => {}} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.email}</div>
                </div>
                {!l.has_website && <span className="status-badge status-danger" style={{ fontSize: 11 }}>Site Yok</span>}
              </div>
            ))}
          </div>
        )}

        {/* Send Button */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={sendEmails} disabled={sending || !selectedLeads.length}>
            <Send size={18} /> {sending ? 'Gönderiliyor...' : `${selectedLeads.length} Kişiye Gönder`}
          </button>
        </div>

        {/* Results */}
        {sendResult && (
          <div style={{ marginTop: 12, padding: 16, borderRadius: 10, background: sendResult.sent > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${sendResult.sent > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              ✅ {sendResult.sent} gönderildi &nbsp; ❌ {sendResult.failed} başarısız
            </div>
            {sendResult.errors?.map((e, i) => (
              <div key={i} style={{ fontSize: 12, color: '#f87171' }}>{e.lead}: {e.error}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
