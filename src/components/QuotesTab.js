"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Download, Send, Copy, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function QuotesTab({ leads }) {
  const [selectedLead, setSelectedLead] = useState('');
  const [title, setTitle] = useState('Web Sitesi Teklifi');
  const [items, setItems] = useState([
    { desc: 'Web Sitesi Tasarım ve Geliştirme', price: '3500' },
    { desc: 'Aylık Bakım ve Destek (Yıllık)', price: '1200' },
  ]);
  const [notes, setNotes] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [portalCopied, setPortalCopied] = useState({});

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    const res = await axios.get('/api/quotes');
    setQuotes(res.data);
  };

  const addItem = () => setItems([...items, { desc: '', price: '' }]);
  const updateItem = (i, field, val) => {
    const next = [...items];
    next[i][field] = val;
    setItems(next);
  };
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const total = items.reduce((s, it) => s + (parseFloat(it.price) || 0), 0);

  const saveQuote = async (e) => {
    e.preventDefault();
    if (!selectedLead) return alert('Lütfen bir müşteri seçin.');
    setSaving(true);

    // Generate portal token for lead if not exists
    const lead = leads.find(l => l.id === selectedLead);
    let portalToken = lead?.portal_token;
    if (!portalToken) {
      portalToken = Math.random().toString(36).substring(2, 20) + Date.now().toString(36);
      await axios.put('/api/leads', { id: selectedLead, portal_token: portalToken });
    }

    await axios.post('/api/quotes', { lead_id: selectedLead, title, items, notes });
    await fetchQuotes();
    setSaving(false);
    alert('Teklif oluşturuldu! Müşteriye portal linki gönderin.');
  };

  const downloadPDF = async (quote) => {
    const lead = leads.find(l => l.id === quote.lead_id);
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();

    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TEKLİF', 20, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 140, 15);
    doc.text(`Teklif No: ${quote.id.substring(0, 8).toUpperCase()}`, 140, 22);

    // Lead info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(lead?.name || 'Müşteri', 20, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    if (lead?.address) doc.text(lead.address, 20, 62);
    if (lead?.phone) doc.text(`Tel: ${lead.phone}`, 20, 69);

    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(quote.title || 'Teklif Detayı', 20, 85);

    // Items table
    autoTable(doc, {
      startY: 92,
      head: [['Hizmet / Ürün', 'Tutar (₺)']],
      body: quote.items.map(it => [it.desc, `${parseFloat(it.price).toLocaleString('tr-TR')}₺`]),
      foot: [['TOPLAM', `${quote.total?.toLocaleString('tr-TR')}₺`]],
      styles: { fontSize: 11, cellPadding: 8 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold', fontSize: 12 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    });

    if (quote.notes) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Notlar:', 20, finalY);
      doc.text(quote.notes, 20, finalY + 6);
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Bu teklif bilgilendirme amaçlıdır. Detaylar için iletişime geçiniz.', 20, 280);

    doc.save(`teklif_${(lead?.name || 'musteri').replace(/\s/g, '_')}_${new Date().toLocaleDateString('tr-TR').replace(/\//g, '-')}.pdf`);
  };

  const copyPortalLink = async (quote) => {
    const lead = leads.find(l => l.id === quote.lead_id);
    let token = lead?.portal_token;
    if (!token) {
      token = Math.random().toString(36).substring(2, 20) + Date.now().toString(36);
      await axios.put('/api/leads', { id: lead.id, portal_token: token });
    }
    const link = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(link);
    setPortalCopied(p => ({ ...p, [quote.id]: true }));
    setTimeout(() => setPortalCopied(p => ({ ...p, [quote.id]: false })), 2500);
  };

  const STATUS = { draft: { label: 'Taslak', cls: 'status-warning' }, sent: { label: 'Gönderildi', cls: 'status-info' }, approved: { label: 'Onaylandı ✓', cls: 'status-success' }, rejected: { label: 'Reddedildi', cls: 'status-danger' } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Create Quote */}
      <div className="glass-panel">
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>💰 Yeni Teklif Oluştur</h2>
        <form onSubmit={saveQuote} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Müşteri Seçin</label>
              <select className="glass-select" value={selectedLead} onChange={e => setSelectedLead(e.target.value)} required>
                <option value="">-- Müşteri seçin --</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Teklif Başlığı</label>
              <input className="glass-input" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Kalemler</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input className="glass-input" style={{ flex: 3 }} placeholder="Hizmet/Ürün açıklaması"
                    value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)} required />
                  <input className="glass-input" style={{ flex: 1 }} type="number" placeholder="Tutar (₺)"
                    value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} required />
                  <button type="button" className="btn btn-outline" style={{ padding: '10px 12px', borderColor: '#ef4444', color: '#f87171' }}
                    onClick={() => removeItem(i)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline" style={{ marginTop: 8, padding: '8px 16px', fontSize: 13 }} onClick={addItem}>
              <Plus size={14} /> Kalem Ekle
            </button>
          </div>

          {/* Total Preview */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Toplam:</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#818cf8' }}>{total.toLocaleString('tr-TR')}₺</span>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Ek Notlar (opsiyonel)</label>
            <textarea className="glass-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Özel şartlar, ödeme yöntemi vb." />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
            <CheckCircle size={18} /> {saving ? 'Kaydediliyor...' : 'Teklifi Kaydet'}
          </button>
        </form>
      </div>

      {/* Quote List */}
      <div className="glass-panel">
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>Tüm Teklifler ({quotes.length})</h2>
        {quotes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Henüz teklif oluşturulmadı.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quotes.map(q => {
              const lead = leads.find(l => l.id === q.lead_id);
              const statusInfo = STATUS[q.status] || STATUS.draft;
              return (
                <div key={q.id} className="glass-panel" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{q.title} — {lead?.name || '?'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(q.created_at).toLocaleDateString('tr-TR')} · {q.items?.length || 0} kalem
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#818cf8' }}>{q.total?.toLocaleString('tr-TR')}₺</span>
                    <span className={`status-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                    <button className="btn btn-outline" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => downloadPDF(q)}>
                      <Download size={13} /> PDF
                    </button>
                    <button className="btn btn-outline" style={{ padding: '7px 12px', fontSize: 12, borderColor: portalCopied[q.id] ? '#10b981' : undefined, color: portalCopied[q.id] ? '#34d399' : undefined }}
                      onClick={() => copyPortalLink(q)}>
                      {portalCopied[q.id] ? <><CheckCircle size={13} /> Kopyalandı!</> : <><Copy size={13} /> Portal Linki</>}
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
