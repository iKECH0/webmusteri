"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function PublicChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Selam ben Kodi! 👋\nSite yaptırmak istiyorsanız size özel bir teklif çıkartayım hemen. İşletmenizin adı nedir?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/public/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Üzgünüm, şu an bağlantı kuramıyorum.' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Bağlantı hatası oluştu.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '90px', right: '20px', zIndex: 9999 }}>
      {isOpen ? (
        <div style={{
          width: '320px',
          height: '450px',
          backgroundColor: 'var(--bg-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '50%' }}></div>
              <span style={{ fontWeight: '600' }}>Kodi (AI Asistan)</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <i className="ph ph-x" style={{ fontSize: '20px' }}></i>
            </button>
          </div>
          
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                color: m.role === 'user' ? 'white' : 'var(--text-color)',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '14px 14px 0 14px' : '14px 14px 14px 0',
                maxWidth: '85%',
                fontSize: '0.95rem',
                whiteSpace: 'pre-wrap'
              }}>
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '14px 14px 14px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Yazıyor...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', backgroundColor: 'var(--bg-color)' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-color)',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: (isLoading || !input.trim()) ? 0.6 : 1
              }}
            >
              <i className="ph ph-paper-plane-right" style={{ fontSize: '18px' }}></i>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--text-color)',
            color: 'var(--bg-color)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-lg)',
            animation: 'pulse 2s infinite'
          }}
        >
          <i className="ph ph-robot" style={{ fontSize: '28px' }}></i>
          {messages.length === 1 && (
             <div style={{
               position: 'absolute',
               top: '-10px',
               right: '-5px',
               backgroundColor: '#ef4444',
               color: 'white',
               width: '20px',
               height: '20px',
               borderRadius: '50%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '12px',
               fontWeight: 'bold'
             }}>1</div>
          )}
        </button>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(var(--text-color), 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(var(--text-color), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--text-color), 0); }
        }
      `}} />
    </div>
  );
}
