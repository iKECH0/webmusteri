"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, CheckCircle, Search, Users } from 'lucide-react';

export default function OutreachTab({ leads, onRefresh }) {
  const [template, setTemplate] = useState(
    "Merhaba {firma_adi} yetkilisi,\n\nİşletmenizi Google'da öne çıkararak yeni müşterilerin sizi daha kolay bulmasını sağlamak ister misiniz? 🚀\n\nSize özel, Google uyumlu ve modern bir web sitesi hazırlıyoruz:\n✅ Teslim Öncesi Ödeme Yok: Siteyi görüp onaylamadan tek kuruş ödemezsiniz.\n🔝 Google İlk Sayfa Garantisi: Rakiplerinizin önüne geçerek bölgenizdeki müşterileri kazanın.\n\nSizin için tamamen ücretsiz bir taslak (demo) hazırlamamızı isterseniz, bu mesaja dönüş yapmanız yeterlidir.\n\nBol kazançlı günler dileriz!"
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sadece yeni durumdaki ve telefonu olan müşteriler
  const targetLeads = leads.filter(l => l.status === 'new' && l.phone && l.phone.trim().length > 5)
    .filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || (l.category && l.category.toLowerCase().includes(searchTerm.toLowerCase())));

  useEffect(() => {
    const saved = localStorage.getItem('outreach_template');
    if (saved) setTemplate(saved);
  }, []);

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
    localStorage.setItem('outreach_template', e.target.value);
  };

  const generateMessage = (lead) => {
    return template.replace(/{firma_adi}/g, lead.name);
  };

  const handleSend = async (lead) => {
    let phone = lead.phone.replace(/\D/g, '');
    if (phone.length === 10 && phone.startsWith('5')) phone = '90' + phone;
    else if (phone.length === 11 && phone.startsWith('0')) phone = '9' + phone;

    const msg = encodeURIComponent(generateMessage(lead));
    const waLink = `https://wa.me/${phone}?text=${msg}`;

    // Yeni sekmede WhatsApp'ı aç
    window.open(waLink, '_blank');

    // Müşterinin durumunu contacted yap
    try {
      await axios.put('/api/leads', { 
        id: lead.id, 
        status: 'contacted' 
      });
      if(onRefresh) onRefresh();
    } catch (e) {
      console.error("Müşteri güncellenemedi", e);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="glass-panel">
        <h2 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users color="#8b5cf6" /> Toplu İlk Temas (Soğuk Satış)
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          Bu sayfada henüz hiç iletişime geçilmemiş ve sistemde telefon numarası kayıtlı olan "Yeni" durumdaki müşteriler listelenir. "Gönder" butonuna bastığınızda seçili şablon kişiye özel olarak doldurulur, WhatsApp açılır ve kişi otomatik olarak listeden düşer (iletişime geçildi olarak işaretlenir). Müşteri dönüş yaparsa Hızlı Satış Asistanı'nı kullanarak teklif atabilirsiniz.
        </p>

        <div className="input-group">
          <label>Mesaj Şablonu</label>
          <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong>{`{firma_adi}`}</strong> etiketini kullanarak müşterinin adını mesaja otomatik ekleyebilirsiniz.
          </div>
          <textarea 
            className="glass-input" 
            style={{ minHeight: 120, resize: 'vertical' }}
            value={template}
            onChange={handleTemplateChange}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Hedef Kitle ({targetLeads.length} Kişi)</h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Firma adı veya sektör ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 36, padding: '10px 10px 10px 36px' }}
            />
          </div>
        </div>

        {targetLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Kriterlere uygun yeni müşteri bulunamadı. Lütfen önce "Yeni Bul" sekmesinden müşteri arayın veya CRM'den ekleyin.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {targetLeads.map(lead => (
              <div key={lead.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 4 }}>{lead.name}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>📞 {lead.phone}</span>
                    {lead.category && <span>🏷️ {lead.category}</span>}
                  </div>
                </div>
                <button 
                  onClick={() => handleSend(lead)}
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'linear-gradient(to right, #8b5cf6, #7c3aed)' }}
                >
                  <Send size={16} /> Gönder ve İşaretle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
