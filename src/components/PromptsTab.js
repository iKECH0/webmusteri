"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Copy, Check, Plus, Trash2, Edit3, Search, Sparkles, 
  MessageSquare, Bot, PhoneCall, ShieldAlert, Tag, 
  Send, ExternalLink, X, HelpCircle, Layers, RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'Tümü', icon: Layers },
  { key: 'first_contact', label: '💬 İlk Temas & Demo', icon: MessageSquare },
  { key: 'ai_prompt', label: '🤖 Yapay Zeka Promptları', icon: Bot },
  { key: 'objection', label: '🛡️ İtiraz Karşılama', icon: ShieldAlert },
  { key: 'cold_call', label: '📞 Telefon & Arama Senaryoları', icon: PhoneCall },
  { key: 'proposal', label: '🔥 Teklif & İndirim', icon: Send },
  { key: 'follow_up', label: '⏰ Takip & Hatırlatma', icon: RefreshCw },
];

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl_demo_1',
    name: '⚡ Canlı Tasarım Demosu Tanıtımı (En Yüksek Dönüşüm)',
    category: 'first_contact',
    channel: 'whatsapp',
    content: 'Merhaba {firma_adi} ailesi 👋\n\nBölgenizdeki başarılı işletmeleri incelerken kaliteniz ve hizmetleriniz dikkatimizi çekti. Firmanıza özel canlı ve çalışan bir web sitesi demosu tasarladık! 🚀\n\nTelefonunuzdan 1 dakikada inceleyebilirsiniz:\n{demo_link}\n\nBeğenirseniz 24 saat içinde kendi alan adınızla yayına alabiliriz. İnceledikten sonra görüşlerinizi paylaşırsanız sevinirim! 😊',
    variables: ['{firma_adi}', '{demo_link}', '{temsilci_adi}']
  },
  {
    id: 'tpl_ai_pitch',
    name: '🤖 AI Prompt: Esnafa Özel İkna Edici Satış Pitchi',
    category: 'ai_prompt',
    channel: 'ai',
    content: 'Aşağıdaki esnaf için son derece samimi, profesyonel ve psikolojik olarak web sitesi yaptırmaya ikna edici 3 farklı WhatsApp açılış mesajı yaz:\n\nİşletme Adı: {firma_adi}\nSektör: {sektor}\nBölge: {bolge}\nEksiklik: Google Haritalarda kayıtlı fakat web sitesi yok.\n\nMesajda web sitesinin rakiplerin önüne nasıl geçireceğini ve müşteriye güven vereceğini vurgula.',
    variables: ['{firma_adi}', '{sektor}', '{bolge}']
  },
  {
    id: 'tpl_ai_seo',
    name: '🤖 AI Prompt: Esnaf İçin Google Harita & SEO Açıklaması',
    category: 'ai_prompt',
    channel: 'ai',
    content: '{firma_adi} isimli {sektor} işletmesi için Google İşletme Profilinde ve web sitesi Hakkımızda kısmında kullanılmak üzere, yerel SEO uyumlu, anahtar kelime zengini ve güven aşılayan 150 kelimelik profesyonel bir tanıtım metni yaz.',
    variables: ['{firma_adi}', '{sektor}']
  },
  {
    id: 'tpl_obj_expensive',
    name: '🛡️ İtiraz Karşılama: "Fiyat Çok Pahalı / Bütçemiz Yok"',
    category: 'objection',
    channel: 'whatsapp',
    content: 'Çok iyi anlıyorum {firma_adi} yetkilisi. Aslında bunu bir masraf değil, dükkanınıza her gün yeni müşteri çeken 7/24 çalışan bir satış elemanı gibi düşünebilirsiniz.\n\nSitemiz sayesinde ayda sadece fazladan 2-3 yeni müşteri kazansanız dahi bu yatırım kendi masrafını ilk aydan çıkartıyor. Size özel 2 taksit kolaylığı sağlasak ne dersiniz? 😊',
    variables: ['{firma_adi}']
  },
  {
    id: 'tpl_obj_social',
    name: '🛡️ İtiraz Karşılama: "Bizim Zaten Instagram\'ımız Var"',
    category: 'objection',
    channel: 'whatsapp',
    content: 'Instagram hesabınız gerçekten harika görünüyor! 👏 Fakat araştırmalara göre Google\'da arama yapan müşterilerin %78\'i Instagram yerine Google Haritalar üzerinden doğrudan resmi web sitesi olan işletmelere güveniyor ve oradan telefon ediyor.\n\nİkisini birbirine bağlayıp Instagram takipçilerinizi de doğrudan siteden randevu almaya yönlendirebiliriz.',
    variables: ['{firma_adi}']
  },
  {
    id: 'tpl_cold_call',
    name: '📞 Telefon Kancası: 30 Saniyelik Soğuk Arama Girişi',
    category: 'cold_call',
    channel: 'phone',
    content: '“Merhaba {firma_adi} ile mi görüşüyorum? Yetkili Ahmet Bey müsait miydi acaba?\n\nAhmet Bey merhaba, ben Kodiva Dijital\'den {temsilci_adi}. Bölgenizde arama yapan müşterilerin doğrudan size ulaşabilmesi için firmanıza özel bir canlı web tasarımı hazırladık. Telefondan bakabilmeniz için WhatsApp\'tan demo linkinizi iletmek istemiştim, bu numaranız WhatsApp\'ta aktif miydi?”',
    variables: ['{firma_adi}', '{temsilci_adi}']
  },
  {
    id: 'tpl_follow_up',
    name: '⏰ 3 Gün Sonra Takip & Hatırlatma Mesajı',
    category: 'follow_up',
    channel: 'whatsapp',
    content: 'Selamlar {firma_adi} 👋\n\nGeçtiğimiz günlerde firmanız için özel hazırladığımız canlı web sitesi tasarımını inceleme fırsatınız oldu mu?\n\nLinkiniz: {demo_link}\n\nBu tasarıma eklemek istediğiniz fotoğraflar veya özel bir kampanya varsa hemen güncelleyip yayına alabiliriz. Nasıl buldunuz tasarımı?',
    variables: ['{firma_adi}', '{demo_link}']
  },
  {
    id: 'tpl_proposal_discount',
    name: '🔥 %25 İndirimli Son Gün Teklifi',
    category: 'proposal',
    channel: 'whatsapp',
    content: 'Merhaba {firma_adi} ailesi,\n\nBu haftaya özel yürüttüğümüz yerel esnaf dijitalleşme kampanyası kapsamında, firmanız için hazırladığımız anahtar teslim web sitesi paketinde %25 indirim tanımladık! 🎁\n\nCanlı önizleme linkiniz: {demo_link}\n\nKontenjanımız sınırlı olduğu için bu fırsatı kaçırmamanızı istedik. Detayları telefonda 2 dakika konuşalım mı?',
    variables: ['{firma_adi}', '{demo_link}']
  }
];

export default function PromptsTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Variable tester state
  const [testBizName, setTestBizName] = useState('Örnek İşletme');
  const [testDemoUrl, setTestDemoUrl] = useState('https://kodivawebsite.com/demo/ornek');
  const [testSector, setTestSector] = useState('Oto Yıkama');
  const [showTester, setShowTester] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'first_contact',
    channel: 'whatsapp',
    content: '',
    variables: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/message-templates');
      if (res.data && res.data.length > 0) {
        // Merge defaults if missing
        const existingIds = new Set(res.data.map(t => t.id || t.name));
        const missingDefaults = DEFAULT_TEMPLATES.filter(d => !existingIds.has(d.id) && !existingIds.has(d.name));
        setTemplates([...res.data, ...missingDefaults]);
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } catch (e) {
      console.error(e);
      setTemplates(DEFAULT_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const getReplacedContent = (content) => {
    return content
      .replace(/{firma_adi}/g, testBizName || '{firma_adi}')
      .replace(/{demo_link}/g, testDemoUrl || '{demo_link}')
      .replace(/{sektor}/g, testSector || '{sektor}')
      .replace(/{temsilci_adi}/g, 'Ufuk Bey')
      .replace(/{bolge}/g, 'Kadıköy / İstanbul');
  };

  const handleCopy = (template) => {
    const textToCopy = showTester ? getReplacedContent(template.content) : template.content;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(template.id || template.name);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      alert('Lütfen başlık ve metin alanlarını doldurun.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTemplate && editingTemplate.id && !editingTemplate.id.startsWith('tpl_')) {
        await axios.put('/api/message-templates', {
          id: editingTemplate.id,
          ...formData
        });
      } else {
        await axios.post('/api/message-templates', formData);
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({ name: '', category: 'first_contact', channel: 'whatsapp', content: '', variables: [] });
      fetchTemplates();
    } catch (err) {
      alert('Kaydedilirken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (template) => {
    if (!confirm(`"${template.name}" metnini silmek istediğinize emin misiniz?`)) return;
    try {
      if (template.id && !template.id.startsWith('tpl_')) {
        await axios.delete(`/api/message-templates?id=${template.id}`);
      }
      setTemplates(prev => prev.filter(t => (t.id || t.name) !== (template.id || template.name)));
    } catch (err) {
      alert('Silme işlemi başarısız.');
    }
  };

  const openAddModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      category: activeCategory !== 'all' ? activeCategory : 'first_contact',
      channel: 'whatsapp',
      content: '',
      variables: []
    });
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditingTemplate(t);
    setFormData({
      name: t.name,
      category: t.category,
      channel: t.channel || 'whatsapp',
      content: t.content,
      variables: t.variables || []
    });
    setShowModal(true);
  };

  const insertVariable = (varText) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + ' ' + varText
    }));
  };

  // Filtered Templates
  const filteredTemplates = templates.filter(t => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      t.name.toLowerCase().includes(q) || 
      t.content.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={22} style={{ color: '#818cf8' }} /> Hazır Satış Metinleri & Prompt Kütüphanesi
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>
            WhatsApp satış mesajlarını, itiraz cevaplarını ve yapay zeka promptlarını tek tıkla kopyalayın.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button 
            onClick={() => setShowTester(!showTester)}
            className={`btn ${showTester ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '9px 16px', fontSize: 13, fontWeight: 700 }}
          >
            {showTester ? '⚡ Canlı Önizleme Açık' : '🔍 Değişkenleri Canlı Doldur'}
          </button>

          <button 
            onClick={openAddModal}
            className="btn btn-primary"
            style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Yeni Metin / Prompt Ekle
          </button>
        </div>
      </div>

      {/* Live Variable Tester Box */}
      {showTester && (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: 18, marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', display: 'block', marginBottom: 4 }}>Firma Adı ({'{firma_adi}'}):</label>
            <input 
              type="text" 
              className="glass-input" 
              value={testBizName} 
              onChange={e => setTestBizName(e.target.value)} 
              placeholder="Örn: Güneş Oto Yıkama" 
              style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', display: 'block', marginBottom: 4 }}>Demo Linki ({'{demo_link}'}):</label>
            <input 
              type="text" 
              className="glass-input" 
              value={testDemoUrl} 
              onChange={e => setTestDemoUrl(e.target.value)} 
              placeholder="https://kodivawebsite.com/demo/..." 
              style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', display: 'block', marginBottom: 4 }}>Sektör ({'{sektor}'}):</label>
            <input 
              type="text" 
              className="glass-input" 
              value={testSector} 
              onChange={e => setTestSector(e.target.value)} 
              placeholder="Örn: Halı Yıkama" 
              style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
            />
          </div>
        </div>
      )}

      {/* Search & Category Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-secondary)' }} />
          <input 
            type="text"
            className="glass-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Başlık veya metin içinde ara (örn: itiraz, indirim, prompt, demo)..."
            style={{ width: '100%', padding: '12px 14px 12px 42px', fontSize: 14 }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 12, top: 12, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const count = cat.key === 'all' 
              ? templates.length 
              : templates.filter(t => t.category === cat.key).length;

            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: 'none',
                  background: activeCategory === cat.key ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat.key ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={14} />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <MessageSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: 15 }}>Aramanıza uygun metin veya prompt bulunamadı.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
          {filteredTemplates.map((t, idx) => {
            const isCopied = copiedId === (t.id || t.name);
            const displayContent = showTester ? getReplacedContent(t.content) : t.content;

            return (
              <div 
                key={t.id || idx}
                className="glass-panel"
                style={{
                  padding: 20,
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.02)',
                  position: 'relative'
                }}
              >
                {/* Card Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {t.name}
                    </h3>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button 
                        onClick={() => openEditModal(t)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
                        title="Düzenle"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                      {t.category === 'ai_prompt' ? '🤖 AI Prompt' : (t.channel === 'whatsapp' ? '💬 WhatsApp' : '📞 Telefon')}
                    </span>
                    {t.variables && t.variables.map((v, i) => (
                      <span key={i} style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                        {v}
                      </span>
                    ))}
                  </div>

                  {/* Content Box */}
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 220,
                    overflowY: 'auto'
                  }}>
                    {displayContent}
                  </div>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '11px',
                    borderRadius: 10,
                    background: isCopied ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(99,102,241,0.15)',
                    color: isCopied ? '#fff' : '#818cf8',
                    border: isCopied ? 'none' : '1px solid rgba(99,102,241,0.3)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isCopied ? '0 4px 12px rgba(34,197,94,0.4)' : 'none'
                  }}
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  {isCopied ? 'Panoya Kopyalandı! ✓' : (showTester ? 'Doldurulmuş Metni Kopyala' : 'Metni Kopyala 📋')}
                </button>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div className="glass-panel" style={{
            background: '#0f172a',
            border: '1px solid var(--glass-border)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 620,
            padding: 28,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                {editingTemplate ? 'Metni / Promptu Düzenle' : 'Yeni Satış Metni veya Prompt Ekle'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Başlık / Açıklama:</label>
                <input 
                  type="text"
                  className="glass-input"
                  required
                  placeholder="Örn: 24 Saat İçinde Kapanış Mesajı"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kategori:</label>
                  <select
                    className="glass-select"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', fontSize: 13, background: '#1e293b' }}
                  >
                    <option value="first_contact">💬 İlk Temas & Demo</option>
                    <option value="ai_prompt">🤖 Yapay Zeka Promptu</option>
                    <option value="objection">🛡️ İtiraz Karşılama</option>
                    <option value="cold_call">📞 Soğuk Arama Senaryosu</option>
                    <option value="proposal">🔥 Teklif & İndirim</option>
                    <option value="follow_up">⏰ Takip & Hatırlatma</option>
                    <option value="custom">📝 Genel / Özel</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kanal:</label>
                  <select
                    className="glass-select"
                    value={formData.channel}
                    onChange={e => setFormData({ ...formData, channel: e.target.value })}
                    style={{ width: '100%', padding: '10px', fontSize: 13, background: '#1e293b' }}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ai">Yapay Zeka (ChatGPT / Claude)</option>
                    <option value="phone">Telefon Görüşmesi</option>
                    <option value="email">E-posta</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>

              {/* Quick variable tag inserters */}
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Hızlı Değişken Ekle (Tıklayınca metne eklenir):
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['{firma_adi}', '{demo_link}', '{sektor}', '{bolge}', '{temsilci_adi}'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertVariable(tag)}
                      style={{
                        background: 'rgba(99,102,241,0.15)',
                        color: '#818cf8',
                        border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Metin veya Prompt İçeriği:</label>
                <textarea 
                  className="glass-input"
                  required
                  rows={6}
                  placeholder="Mesajınızı veya yapay zeka promptunu buraya yazın..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: '12px', fontSize: 13, lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                  style={{ padding: '10px 18px', fontSize: 13 }}
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: 13, fontWeight: 700 }}
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
