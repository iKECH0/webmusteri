"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Send, Link, CheckCircle } from 'lucide-react';

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    google_api_key: '', whatsapp_template: '', smtp_email: '', smtp_password: '',
    smtp_host: 'smtp.gmail.com', telegram_bot_token: '', telegram_chat_id: '',
    gcal_client_id: '', gcal_client_secret: '',
  });
  const [saved, setSaved] = useState(false);
  const [telegramTest, setTelegramTest] = useState('');
  const [calConnected, setCalConnected] = useState(false);
  const [aiScoring, setAiScoring] = useState(false);

  useEffect(() => {
    axios.get('/api/settings').then(res => {
      setSettings(prev => ({ ...prev, ...res.data }));
      setCalConnected(!!res.data.gcal_tokens);
    });
  }, []);

  const set = (k, v) => setSettings(prev => ({ ...prev, [k]: v }));

  const saveAll = async (e) => {
    e.preventDefault();
    await axios.post('/api/settings', settings);
    if (settings.whatsapp_template) localStorage.setItem('whatsapp_template', settings.whatsapp_template);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const testTelegram = async () => {
    setTelegramTest('sending');
    try {
      await axios.post('/api/telegram', { type: 'daily_summary' });
      setTelegramTest('ok');
    } catch (err) {
      setTelegramTest('fail');
    }
    setTimeout(() => setTelegramTest(''), 4000);
  };

  const connectCalendar = async () => {
    const res = await axios.get('/api/calendar/auth');
    if (res.data.authUrl) window.open(res.data.authUrl, '_blank');
    else alert(res.data.error || 'Google Calendar bağlanamadı. Client ID/Secret girin.');
  };

  const runAiScoring = async () => {
    setAiScoring(true);
    try {
      const res = await axios.post('/api/ai-score', {});
      alert(`✅ ${res.data.updated} müşteri için AI skoru hesaplandı!`);
    } catch (e) {
      alert('AI skorlama başarısız.');
    } finally {
      setAiScoring(false);
    }
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const Field = ({ label, type = 'text', value, onChange, placeholder, hint }) => (
    <div className="input-group" style={{ marginBottom: 12 }}>
      <label>{label}</label>
      <input type={type} className="glass-input" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      {hint && <small style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{hint}</small>}
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <form onSubmit={saveAll}>
        <div className="glass-panel">
          <h2 style={{ fontSize: 22, marginBottom: 24 }}>⚙️ Sistem Ayarları</h2>

          {/* Google API */}
          <Section title="🔑 Google Places API">
            <Field label="API Anahtarı" type="password" value={settings.google_api_key} onChange={v => set('google_api_key', v)} placeholder="AIzaSyB..." hint="Google Cloud Console → Places API (New) yetkisi olan anahtar gerekli." />
          </Section>

          {/* WhatsApp */}
          <Section title="📱 WhatsApp Mesaj Şablonu">
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>
                Mesaj Şablonu &nbsp;
                <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-secondary)' }}>
                  Değişkenler: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>{'{firma_adi}'}</code>
                </span>
              </label>
              <textarea className="glass-input" rows={4} value={settings.whatsapp_template}
                onChange={e => set('whatsapp_template', e.target.value)}
                placeholder="Merhaba {firma_adi}, size özel bir teklifimiz var..." />
            </div>
          </Section>

          {/* Email SMTP */}
          <Section title="📧 E-posta (Gmail / SMTP) Ayarları">
            <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              💡 Gmail kullanıyorsanız: <strong style={{ color: 'var(--text-primary)' }}>Google Hesabı → Güvenlik → 2 Adımlı Doğrulama</strong>'yı açın, ardından <strong style={{ color: 'var(--text-primary)' }}>Uygulama Şifreleri</strong>'nden yeni bir şifre oluşturun. O şifreyi aşağıya girin.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Gmail Adresi" value={settings.smtp_email} onChange={v => set('smtp_email', v)} placeholder="siz@gmail.com" />
              <Field label="Uygulama Şifresi" type="password" value={settings.smtp_password} onChange={v => set('smtp_password', v)} placeholder="xxxx xxxx xxxx xxxx" />
            </div>
            <Field label="SMTP Sunucu (varsayılan Gmail)" value={settings.smtp_host} onChange={v => set('smtp_host', v)} placeholder="smtp.gmail.com" />
          </Section>

          {/* Telegram */}
          <Section title="🔔 Telegram Bildirimler">
            <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              💡 Telegram'da <strong style={{ color: 'var(--text-primary)' }}>@BotFather</strong>'a yazın → <code>/newbot</code> → Bot Token alın. Sonra <strong style={{ color: 'var(--text-primary)' }}>@userinfobot</strong>'a yazın → Chat ID'nizi alın.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Bot Token" type="password" value={settings.telegram_bot_token} onChange={v => set('telegram_bot_token', v)} placeholder="1234567890:ABCDef..." />
              <Field label="Chat ID" value={settings.telegram_chat_id} onChange={v => set('telegram_chat_id', v)} placeholder="123456789" />
            </div>
            <button type="button" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13, marginTop: 4 }} onClick={testTelegram} disabled={telegramTest === 'sending'}>
              <Send size={14} />
              {telegramTest === 'sending' ? 'Gönderiliyor...' : telegramTest === 'ok' ? '✅ Başarıyla Gönderildi!' : telegramTest === 'fail' ? '❌ Başarısız' : 'Test Mesajı Gönder'}
            </button>
          </Section>

          {/* Google Calendar */}
          <Section title="🗓️ Google Calendar Entegrasyonu">
            <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              💡 Google Cloud Console → OAuth 2.0 İstemci Kimliği (Web Uygulaması) oluşturun. <br/>
              Yönlendirme URI olarak: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>http://localhost:3000/api/calendar/callback</code> ekleyin.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="OAuth2 Client ID" value={settings.gcal_client_id} onChange={v => set('gcal_client_id', v)} placeholder="xxxx.apps.googleusercontent.com" />
              <Field label="OAuth2 Client Secret" type="password" value={settings.gcal_client_secret} onChange={v => set('gcal_client_secret', v)} placeholder="GOCSPX-..." />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 13, borderColor: calConnected ? '#10b981' : undefined, color: calConnected ? '#34d399' : undefined }} onClick={connectCalendar}>
                <Link size={14} /> {calConnected ? '✓ Google Takvim Bağlı' : 'Google Takvim\'e Bağlan'}
              </button>
            </div>
          </Section>

          {/* AI Scoring */}
          <Section title="🤖 AI Müşteri Skorlaması">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Tüm müşterileriniz için AI skoru hesaplar. Skor; web sitesi durumu, Google puanı, yorum sayısı ve iletişim bilgilerine göre 0-100 arası belirlenir.
            </p>
            <button type="button" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }} onClick={runAiScoring} disabled={aiScoring}>
              {aiScoring ? 'Hesaplanıyor...' : '🤖 Tüm Müşteriler İçin AI Skoru Hesapla'}
            </button>
          </Section>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            <Save size={18} /> {saved ? '✓ Kaydedildi!' : 'Tüm Ayarları Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
