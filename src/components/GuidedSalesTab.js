"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, ChevronLeft, CheckCircle2, Image as ImageIcon, Send, FileText, UserCircle, ExternalLink } from 'lucide-react';

export default function GuidedSalesTab({ leads = [], onRefresh }) {
  const [step, setStep] = useState(0);
  const [agentName, setAgentName] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [mockupLinks, setMockupLinks] = useState({ desktop: '', mobile: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuoteId, setGeneratedQuoteId] = useState('');
  const [portalToken, setPortalToken] = useState('');

  // Default quote template
  const [quoteTitle, setQuoteTitle] = useState('Web Sitesi Tasarım ve Geliştirme Projesi');
  const [quotePrice, setQuotePrice] = useState('4500');

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 0));

  const saveMockupsToLead = async () => {
    if (!selectedLead) return false;
    try {
      await axios.put('/api/leads', { 
        id: selectedLead.id, 
        desktop_mockup_url: mockupLinks.desktop, 
        mobile_mockup_url: mockupLinks.mobile,
        assigned_to: agentName 
      });
      return true;
    } catch (e) {
      alert('Görsel linkleri kaydedilirken hata oluştu.');
      return false;
    }
  };

  const createQuoteAndPortal = async () => {
    if (!selectedLead) return;
    setIsSaving(true);
    
    // 1. Ensure lead has portal token
    let token = selectedLead.portal_token;
    if (!token) {
      token = Math.random().toString(36).substring(2, 20) + Date.now().toString(36);
      await axios.put('/api/leads', { id: selectedLead.id, portal_token: token });
    }
    setPortalToken(token);

    // 2. Save Mockups if modified
    await saveMockupsToLead();

    // 3. Create Quote
    try {
      const items = [{ desc: 'Web Sitesi Tasarım ve Geliştirme', price: quotePrice }];
      const notes = `📌 Ödeme, web sitesi tamamen hazırlanıp onayınıza sunulduktan ve teslim edildikten sonra yapılmaktadır. Ön ödeme veya kapora talep edilmez.\n\n👉 [Referanslarımızı İnceleyin](https://kodivawebsite.com/#referanslar)`;
      
      const res = await axios.post('/api/quotes', { 
        lead_id: selectedLead.id, 
        title: quoteTitle, 
        items, 
        notes 
      });
      
      setGeneratedQuoteId(res.data.id);
      if(onRefresh) onRefresh();
      handleNext(); // Move to Step 4
    } catch (e) {
      alert('Teklif oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateWhatsAppLink = () => {
    if (!selectedLead) return '';
    let phone = selectedLead.phone || '';
    // Basic phone formatting for WA: remove spaces, plus, non-digits. Ensure it has country code if missing.
    phone = phone.replace(/\D/g, '');
    if (phone.length === 10 && phone.startsWith('5')) {
      phone = '90' + phone;
    } else if (phone.length === 11 && phone.startsWith('0')) {
      phone = '9' + phone;
    }

    const portalLink = `${window.location.origin}/portal/${portalToken}`;
    const text = `Merhaba ${selectedLead.name} yetkilisi,\n\nFirmanız için hazırladığımız özel web sitesi tasarım taslağını ve detaylı proje teklifimizi aşağıdaki bağlantıdan inceleyebilirsiniz:\n\n👉 ${portalLink}\n\nTeklif içerisinde süreç, fiyatlandırma ve örnek tasarımımızı görebilirsiniz. Sormak istediğiniz her türlü soruyu sistem üzerinden bize iletebilirsiniz.\n\nİyi çalışmalar dileriz.`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
      {/* Stepper Header */}
      <div className="glass-panel" style={{ marginBottom: 24, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' }}>
          Hızlı Satış Asistanı
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 2, background: 'var(--glass-border)', zIndex: 0 }}></div>
          {[
            { num: 0, label: 'Kimsin?', icon: UserCircle },
            { num: 1, label: 'Müşteri', icon: UserCircle },
            { num: 2, label: 'Görseller', icon: ImageIcon },
            { num: 3, label: 'Teklif', icon: FileText },
            { num: 4, label: 'Gönder', icon: Send }
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: 8, width: 80 }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= s.num ? '#818cf8' : 'var(--bg-color)', 
                color: step >= s.num ? 'white' : 'var(--text-secondary)',
                border: `2px solid ${step >= s.num ? '#818cf8' : 'var(--glass-border)'}`,
                transition: 'all 0.3s'
              }}>
                <s.icon size={16} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ minHeight: 400, display: 'flex', flexDirection: 'column' }}>

        {/* STEP 0: Select Agent */}
        {step === 0 && (
          <div className="fade-in" style={{ textAlign: 'center', paddingTop: 20 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>👋 Selam! Harika bir satış gününe hazır mısın?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>Öncelikle lütfen kim olduğunu seç:</p>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {['Ufuk', 'Erdem', 'Arslan'].map(name => (
                <button 
                  key={name}
                  onClick={() => { setAgentName(name); setStep(1); }}
                  style={{
                    padding: '20px 40px',
                    fontSize: 18,
                    fontWeight: 'bold',
                    borderRadius: 16,
                    border: agentName === name ? '2px solid #818cf8' : '2px solid var(--glass-border)',
                    background: agentName === name ? 'rgba(129, 140, 248, 0.1)' : 'var(--bg-color)',
                    color: agentName === name ? '#818cf8' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: agentName === name ? '0 4px 12px rgba(129, 140, 248, 0.2)' : 'none'
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* STEP 1: Select Customer */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCircle color="#818cf8" /> Müşteriyi Seçin
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Öncelikle mesaj göndereceğiniz ve teklif hazırlayacağınız müşteriyi listeden seçin. Eğer müşteri listede yoksa önce CRM sekmesinden müşteriyi ekleyin.
            </p>
            
            <div className="input-group">
              <label>Kayıtlı Müşteriler</label>
              <select className="glass-select" style={{ padding: '16px', fontSize: 16 }} value={selectedLeadId} onChange={e => {
                setSelectedLeadId(e.target.value);
                const lead = leads.find(l => l.id === e.target.value);
                if (lead) {
                  setMockupLinks({ desktop: lead.desktop_mockup_url || '', mobile: lead.mobile_mockup_url || '' });
                }
              }}>
                <option value="">-- Müşteri Seçin --</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.name} {l.phone ? `(${l.phone})` : ''}</option>
                ))}
              </select>
            </div>

            {selectedLead && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(129, 140, 248, 0.1)', borderRadius: 12, border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                <strong>Seçilen Müşteri:</strong> {selectedLead.name} <br/>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Telefon: {selectedLead.phone || 'Girilmemiş'}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Mockup Images */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ImageIcon color="#818cf8" /> Tasarım Görsellerini Ekleyin
            </h2>
            
            <div style={{ background: '#fef3c7', color: '#b45309', padding: 16, borderRadius: 12, marginBottom: 24, fontSize: 14, lineHeight: 1.5 }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>Nasıl Yükleyeceksiniz? (Adım Adım)</strong>
              1. <strong>imgbb.com</strong> sitesini açın ve hazırladığınız tasarımı yükleyin.<br/>
              2. Yükleme tamamlandıktan sonra resmin kendisine tıklayarak tam boy açılmasını sağlayın.<br/>
              3. Resmin üzerine <strong>Sağ Tıklayın</strong> ve <strong>"Resim Adresini Kopyala"</strong> seçeneğini seçin.<br/>
              4. Kopyaladığınız bu linki (https://i.ibb.co/... şeklinde olmalı) aşağıdaki kutucuğa yapıştırın.
            </div>

            <div className="input-group">
              <label>Masaüstü Görsel Linki (Opsiyonel)</label>
              <input type="url" className="glass-input" placeholder="https://i.ibb.co/.../masaustu.jpg" 
                value={mockupLinks.desktop} onChange={e => setMockupLinks({...mockupLinks, desktop: e.target.value})} />
            </div>
            
            <div className="input-group">
              <label>Mobil Görsel Linki (Opsiyonel)</label>
              <input type="url" className="glass-input" placeholder="https://i.ibb.co/.../mobil.jpg" 
                value={mockupLinks.mobile} onChange={e => setMockupLinks({...mockupLinks, mobile: e.target.value})} />
            </div>
          </div>
        )}

        {/* STEP 3: Create Quote */}
        {step === 3 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText color="#818cf8" /> Teklif Detayları
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Müşteriye gönderilecek teklif formunu hazırlıyoruz. Fiyatı veya başlığı müşteri özelinde değiştirebilirsiniz. Her şey tamamsa "Teklifi Oluştur" butonuna basarak bağlantıyı hazırlayın.
            </p>

            <div className="input-group">
              <label>Teklif Başlığı</label>
              <input type="text" className="glass-input" value={quoteTitle} onChange={e => setQuoteTitle(e.target.value)} />
            </div>
            
            <div className="input-group">
              <label>Fiyat (₺)</label>
              <input type="number" className="glass-input" value={quotePrice} onChange={e => setQuotePrice(e.target.value)} />
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: 16, borderRadius: 12, marginTop: 24, fontSize: 13, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle2 size={16} style={{ float: 'left', marginRight: 8 }} />
              <strong>Bilgi:</strong> Teklifi oluşturduğunuz anda müşteriye özel şifreli bir Portal linki oluşturulacak. Bu işlem yaklaşık 2-3 saniye sürebilir.
            </div>
          </div>
        )}

        {/* STEP 4: Send via WhatsApp */}
        {step === 4 && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'inline-flex', padding: 24, background: '#10b981', borderRadius: '50%', marginBottom: 24, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)' }}>
              <Send size={48} color="white" />
            </div>
            
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Her Şey Hazır! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15, maxWidth: 400, margin: '0 auto 32px' }}>
              Müşteriniz için özel teklif ve sunum sayfası hazırlandı. Aşağıdaki butona tıklayarak WhatsApp üzerinden mesajı hemen gönderebilirsiniz.
            </p>

            <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer" 
               className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 32px', fontSize: 18, background: '#25D366', color: 'white', border: 'none', borderRadius: 50, textDecoration: 'none', boxShadow: '0 8px 20px rgba(37, 211, 102, 0.3)' }}>
              <Send size={24} />
              WhatsApp ile Gönder
            </a>

            <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--glass-border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'block', marginBottom: 8 }}>Veya bağlantıyı kopyalayın:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 500, margin: '0 auto' }}>
                <input type="text" readOnly className="glass-input" value={`${window.location.origin}/portal/${portalToken}`} style={{ margin: 0, padding: 12, background: 'rgba(0,0,0,0.2)' }} />
                <button className="btn btn-outline" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }} onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/portal/${portalToken}`);
                  alert('Kopyalandı!');
                }}>Kopyala</button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={handlePrev} disabled={step === 0 || isSaving} style={{ visibility: step === 0 ? 'hidden' : 'visible', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
            <ChevronLeft size={16} /> Geri
          </button>
          
          {step > 0 && step < 3 && (
            <button className="btn btn-primary" onClick={handleNext} disabled={(step === 1 && !selectedLeadId) || (step === 0 && !agentName)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
              İleri <ChevronRight size={16} />
            </button>
          )}

          {step === 3 && (
            <button className="btn btn-primary" onClick={createQuoteAndPortal} disabled={isSaving || !quoteTitle || !quotePrice} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(to right, #10b981, #059669)' }}>
              {isSaving ? 'Hazırlanıyor...' : 'Teklifi Oluştur ve İlerle'} <ChevronRight size={16} />
            </button>
          )}

          {step === 4 && (
            <button className="btn btn-outline" onClick={() => { setStep(1); setSelectedLeadId(''); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
              Yeni Bir Satışa Başla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
