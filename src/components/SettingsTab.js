"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

export default function SettingsTab() {
  const [apiKey, setApiKey] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    "Merhaba {firma_adi}, Google Haritalar'daki işletmenizin web sitesi olmadığını gördük. Size özel profesyonel bir web sitesi hazırlayabiliriz. Detaylı bilgi almak ister misiniz?"
  );
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    axios.get('/api/settings').then(res => {
      if (res.data.google_api_key) setApiKey(res.data.google_api_key);
      if (res.data.whatsapp_template) setWhatsappTemplate(res.data.whatsapp_template);
      // Also load from localStorage as fallback
      const local = localStorage.getItem('whatsapp_template');
      if (local && !res.data.whatsapp_template) setWhatsappTemplate(local);
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    await axios.post('/api/settings', { google_api_key: apiKey, whatsapp_template: whatsappTemplate });
    localStorage.setItem('whatsapp_template', whatsappTemplate);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updatePreview = () => {
    setPreview(whatsappTemplate.replace('{firma_adi}', 'Örnek Oto Yıkama'));
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '28px', fontSize: '22px' }}>⚙️ Sistem Ayarları</h2>

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* API Key */}
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-secondary)' }}>🔑 Google Places API</h3>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>API Anahtarı (API Key)</label>
            <input type="password" className="glass-input" value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSyB..." required />
            <small style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Google Cloud Console → Places API (New) yetkisi olan anahtar.
            </small>
          </div>
        </div>

        {/* WhatsApp Template */}
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-secondary)' }}>📱 WhatsApp Mesaj Şablonu</h3>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Mesaj şablonunuzu düzenleyin</label>
            <textarea className="glass-input" rows={5}
              value={whatsappTemplate}
              onChange={e => setWhatsappTemplate(e.target.value)}
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              💡 <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{'{firma_adi}'}</code> yazdığınız yere otomatik olarak firmanın adı eklenir.
            </small>
          </div>
          <button type="button" className="btn btn-outline" style={{ marginTop: '10px', padding: '8px 16px', fontSize: '13px' }}
            onClick={updatePreview}>Önizle</button>
          {preview && (
            <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '10px', fontSize: '14px', lineHeight: 1.6 }}>
              <div style={{ fontSize: '12px', color: '#25D366', marginBottom: '8px', fontWeight: 600 }}>📱 Mesaj Önizleme:</div>
              {preview}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          <Save size={18} /> {saved ? 'Kaydedildi ✓' : 'Ayarları Kaydet'}
        </button>
      </form>
    </div>
  );
}
