"use client";

import { useState, useEffect } from 'react';
import {
  X, ChevronRight, ChevronLeft, MessageCircle, Phone, Eye,
  ExternalLink, Check, XCircle, Star, Zap, Copy, RefreshCw,
  PlayCircle, SkipForward, ClipboardList, Flame
} from 'lucide-react';

const SECTOR_KEYWORDS = {
  'oto-yikama': ['oto', 'araba', 'araç', 'yıkama', 'detay', 'pasta', 'cila', 'polisaj'],
  'hali-yikama': ['halı', 'koltuk', 'perde', 'yıkama', 'temizlik', 'kuru', 'tekstil'],
  'kuafor': ['kuaför', 'saç', 'berber', 'güzellik', 'estetik', 'tırnak', 'manikür', 'spa'],
  'restoran': ['restoran', 'kafe', 'cafe', 'yemek', 'pizza', 'döner', 'burger', 'lokanta', 'ızgara'],
  'teknik-servis': ['tesisat', 'elektrik', 'kombi', 'klima', 'tadilat', 'boya', 'boya', 'nakliyat', 'servis'],
};

function detectSectorFromLead(lead) {
  const text = `${lead.name || ''} ${lead.category || ''}`.toLowerCase();
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) return sector;
  }
  return 'kurumsal';
}

const SECTOR_LABELS = {
  'oto-yikama': '🚗 Oto Yıkama',
  'hali-yikama': '🧼 Halı Yıkama',
  'kuafor': '✂️ Kuaför & Güzellik',
  'restoran': '🍽️ Restoran & Kafe',
  'teknik-servis': '🔧 Teknik Servis',
  'kurumsal': '🏢 Kurumsal',
  'all': '🔍 Tümü',
};

const DEFAULT_MESSAGE = `Merhaba {firma_adi} ailesi 👋

İşletmeniz için özel bir canlı web sitesi demosu hazırladık. Telefonunuzdan hemen inceleyebilirsiniz:
{demo_link}

Beğenirseniz 24 saat içinde alan adınızla yayına alabiliriz! 🚀`;

export default function AgentOutreachWizard({ leads = [], templates = [], currentAgent, onClose, onLeadUpdated }) {
  const [step, setStep] = useState(1); // 1: Sektör Seç  2: Mesajı Kontrol Et  3: Demo Önizle  4: Gönder & Sıradaki
  const [sectorFilter, setSectorFilter] = useState('all');
  const [queue, setQueue] = useState([]); // filtrelenmiş leads sırası
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messageText, setMessageText] = useState(DEFAULT_MESSAGE);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Seçili lead
  const currentLead = queue[currentIndex] || null;

  // Sektör filtresine göre sırayı hazırla
  useEffect(() => {
    const filtered = leads.filter(l => {
      const status = l.status || 'new';
      if (status === 'won' || status === 'rejected' || status === 'lost') return false;
      if (sectorFilter === 'all') return true;
      return detectSectorFromLead(l) === sectorFilter;
    });
    setQueue(filtered);
    setCurrentIndex(0);
  }, [sectorFilter, leads]);

  // Mesajı yeniden doldur her lead değişince
  useEffect(() => {
    if (!currentLead) return;
    setMessageText(DEFAULT_MESSAGE);
    setSent(false);
    setNoteText('');
  }, [currentIndex]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const getDemoUrl = (lead) => {
    if (!lead) return '';
    return lead.portal_token
      ? `${origin}/demo/${lead.portal_token}?ref=${currentAgent?.slug || ''}`
      : `${origin}/demo?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone || '')}&ref=${currentAgent?.slug || ''}`;
  };

  const getFilledMessage = (lead) => {
    if (!lead) return messageText;
    return messageText
      .replace(/{firma_adi}/g, lead.name)
      .replace(/{demo_link}/g, getDemoUrl(lead))
      .replace(/{temsilci_adi}/g, currentAgent?.name || '');
  };

  const handleSendWhatsApp = () => {
    if (!currentLead) return;
    const text = getFilledMessage(currentLead);
    const phone = (currentLead.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone.startsWith('90') ? phone : '90' + phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSent(true);
  };

  const handleMarkStatus = async (status) => {
    if (!currentLead) return;
    try {
      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentLead.id, status }),
      });
      if (onLeadUpdated) onLeadUpdated();
    } catch (e) { /* silent */ }
  };

  const handleNext = async () => {
    // Gönderildiyse otomatik contacted yap
    if (sent) await handleMarkStatus('contacted');
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(i => i + 1);
      setStep(2); // mesaj adımına geri dön (sektör seçimini atla)
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(i => i + 1);
      setStep(2);
    } else {
      onClose();
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(getFilledMessage(currentLead));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyTemplate = (tmpl) => {
    setMessageText(tmpl.content || DEFAULT_MESSAGE);
  };

  // ── STEP 1: Sektör & Sıralama ──
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
          Hangi sektördeki müşterilere odaklanmak istiyorsunuz?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {Object.entries(SECTOR_LABELS).map(([key, label]) => {
            const count = key === 'all'
              ? leads.filter(l => !['won','rejected','lost'].includes(l.status)).length
              : leads.filter(l => !['won','rejected','lost'].includes(l.status) && detectSectorFromLead(l) === key).length;
            return (
              <button
                key={key}
                onClick={() => setSectorFilter(key)}
                style={{
                  padding: '12px 10px',
                  borderRadius: 12,
                  border: sectorFilter === key ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: sectorFilter === key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {label}
                <div style={{ fontSize: 11, color: sectorFilter === key ? '#818cf8' : '#475569', marginTop: 4 }}>
                  {count} müşteri
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {queue.length > 0 ? (
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ fontWeight: 700, color: '#4ade80', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlayCircle size={16} /> {queue.length} müşteri akışa hazır
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {queue.slice(0, 3).map(l => l.name).join(', ')}{queue.length > 3 ? ` ve ${queue.length - 3} daha...` : ''}
          </div>
        </div>
      ) : (
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#f87171' }}>
          Bu sektörde uygun müşteri bulunamadı.
        </div>
      )}

      <button
        disabled={queue.length === 0}
        onClick={() => setStep(2)}
        style={{
          padding: '14px', borderRadius: 12,
          background: queue.length > 0 ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)',
          color: '#fff', border: 'none', fontWeight: 700, fontSize: 15,
          cursor: queue.length > 0 ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <Zap size={18} /> Akışı Başlat — {queue.length} Müşteri
      </button>
    </div>
  );

  // ── STEP 2: Mesajı Kontrol Et ──
  const renderStep2 = () => {
    if (!currentLead) return null;
    const waTemplates = templates.filter(t => t.channel === 'whatsapp' || !t.channel);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Müşteri bilgisi */}
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{currentLead.name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{currentLead.category} · {currentLead.phone}</div>
          </div>
          <div style={{ fontSize: 12, color: '#818cf8', background: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
            {currentIndex + 1} / {queue.length}
          </div>
        </div>

        {/* Şablon Seçimi */}
        {waTemplates.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>HAZIR ŞABLON SEÇ</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {waTemplates.slice(0, 5).map((t, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(t)}
                  style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                >
                  {t.name || `Şablon ${i + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mesaj Editörü */}
        <div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>MESAJ METNİ (düzenleyebilirsiniz)</div>
          <textarea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            rows={8}
            style={{
              width: '100%', padding: 14, borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0', fontSize: 13, lineHeight: 1.65,
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Canlı Önizleme */}
        <div style={{ padding: 14, borderRadius: 12, background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 8, fontWeight: 600 }}>ÖNİZLEME (gönderilecek metin)</div>
          {getFilledMessage(currentLead)}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={copyMessage} style={{ flex: 1, minWidth: 120, padding: '11px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {copied ? <Check size={15} color="#22c55e" /> : <Copy size={15} />}
            {copied ? 'Kopyalandı!' : 'Metni Kopyala'}
          </button>
          <button onClick={handleSkip} style={{ padding: '11px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <SkipForward size={14} /> Atla
          </button>
          <button onClick={() => setStep(3)} style={{ flex: 2, minWidth: 160, padding: '11px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Eye size={15} /> Demoyu Kontrol Et <ChevronRight size={15} />
          </button>
        </div>
      </div>
    );
  };

  // ── STEP 3: Demo Önizle ──
  const renderStep3 = () => {
    if (!currentLead) return null;
    const demoUrl = getDemoUrl(currentLead);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{currentLead.name} — Canlı Demo</div>
          <div style={{ fontSize: 12, color: '#94a3b8', wordBreak: 'break-all' }}>{demoUrl}</div>
        </div>

        {/* Demo link açma */}
        <a
          href={demoUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#818cf8', textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontWeight: 700, fontSize: 14,
          }}
        >
          <ExternalLink size={17} /> Demoyu Yeni Sekmede Aç (Tam Ekran)
        </a>

        {/* iframe önizleme */}
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', height: 280 }}>
          <iframe
            src={demoUrl}
            style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(0.7)', transformOrigin: 'top left', width: '143%', height: '143%' }}
            title="Demo önizleme"
            loading="lazy"
          />
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(34,197,94,0.9)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
            CANLI ÖNİZLEME
          </div>
        </div>

        <button
          onClick={() => setStep(4)}
          style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <MessageCircle size={17} /> Demo Hazır, Müşteriye Gönder <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  // ── STEP 4: Gönder & Sıradaki ──
  const renderStep4 = () => {
    if (!currentLead) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Müşteri özet */}
        <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{currentLead.name}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{currentLead.phone} · {currentLead.category}</div>
          {currentLead.address && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{currentLead.address}</div>}
        </div>

        {/* Ana gönder butonu */}
        <button
          onClick={handleSendWhatsApp}
          style={{
            padding: '16px', borderRadius: 12,
            background: sent ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: sent ? '2px solid #22c55e' : 'none',
            color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: sent ? 'none' : '0 8px 24px rgba(34,197,94,0.4)',
            transition: 'all 0.3s',
          }}
        >
          {sent ? <><Check size={20} /> WhatsApp Açıldı!</> : <><MessageCircle size={20} /> WhatsApp ile Gönder 🚀</>}
        </button>

        {sent && (
          <div style={{ padding: 14, borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 13, color: '#4ade80' }}>
            ✅ Mesaj WhatsApp'ta açıldı! Müşterinin durumu otomatik <strong>"İlk Temas Kuruldu"</strong> yapılacak.
          </div>
        )}

        {/* Hızlı Aksiyonlar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            onClick={async () => { await handleMarkStatus('interested'); handleNext(); }}
            style={{ padding: '12px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Flame size={15} /> İlgilendi (Sıcak)
          </button>

          <button
            onClick={async () => { await handleMarkStatus('won'); handleNext(); }}
            style={{ padding: '12px', borderRadius: 10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Star size={15} /> Satış Yapıldı 🎉
          </button>

          <button
            onClick={async () => { await handleMarkStatus('lost'); handleNext(); }}
            style={{ padding: '12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <XCircle size={14} /> İlgilenmiyor
          </button>

          <button
            onClick={handleSkip}
            style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <SkipForward size={14} /> Şimdilik Atla
          </button>
        </div>

        {/* Sıradaki butonu */}
        <button
          onClick={handleNext}
          style={{ padding: '14px', borderRadius: 12, background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.4)', color: '#818cf8', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <SkipForward size={17} />
          {currentIndex < queue.length - 1 ? `Sıradaki Müşteri (${currentIndex + 2}/${queue.length})` : 'Akışı Tamamla ✅'}
        </button>
      </div>
    );
  };

  const STEPS = [
    { num: 1, label: 'Sektör' },
    { num: 2, label: 'Mesaj' },
    { num: 3, label: 'Demo' },
    { num: 4, label: 'Gönder' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'linear-gradient(180deg, #0f172a 0%, #0c1120 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 24, boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '92vh', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={20} color="#818cf8" /> Satış Akışı Sihirbazı
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                {currentLead ? `${currentLead.name} · ${currentIndex + 1}/${queue.length}` : 'Sektör seçin ve başlayın'}
              </div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>

          {/* Step Indicators */}
          <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 14, left: '50%', width: '100%', height: 2, background: step > s.num ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)', zIndex: 0 }} />
                )}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', zIndex: 1,
                  background: step > s.num ? 'rgba(99,102,241,0.8)' : step === s.num ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.06)',
                  border: step === s.num ? '2px solid #818cf8' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step >= s.num ? '#fff' : '#475569', fontSize: 12, fontWeight: 700,
                  boxShadow: step === s.num ? '0 0 12px rgba(99,102,241,0.6)' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {step > s.num ? <Check size={13} /> : s.num}
                </div>
                <div style={{ fontSize: 10, color: step >= s.num ? '#818cf8' : '#475569', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer nav */}
        {step > 1 && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => step === 2 ? setStep(1) : setStep(s => s - 1)}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ChevronLeft size={15} /> Geri
            </button>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {currentLead ? `${currentIndex + 1}/${queue.length} müşteri` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
