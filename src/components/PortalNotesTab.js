"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Check, Trash2, ExternalLink } from 'lucide-react';

export default function PortalNotesTab() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get('/api/portal-notes');
      setNotes(res.data.notes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put('/api/portal-notes', { id });
      setNotes(notes.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      alert('Hata oluştu');
    }
  };

  const deleteNote = async (id) => {
    if (!confirm('Emin misiniz?')) return;
    try {
      await axios.delete('/api/portal-notes', { data: { id } });
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      alert('Silinemedi');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare color="#3b82f6" /> 
          Müşteri Notları & Talepleri
        </h2>
        <button onClick={fetchNotes} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>Yenile</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notes.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Henüz bir not yok.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} style={{ padding: '20px', borderRadius: '16px', background: note.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(59,130,246,0.05)', border: `1px solid ${note.is_read ? 'var(--glass-border)' : 'rgba(59,130,246,0.2)'}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px', margin: 0 }}>{note.lead_name}</h3>
                  {!note.is_read && <span style={{ background: '#3b82f6', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>Yeni Not</span>}
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(note.created_at).toLocaleString('tr-TR')}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                  {note.content}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {!note.is_read && (
                  <button onClick={() => markAsRead(note.id)} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '13px', borderColor: '#10b981', color: '#10b981' }}>
                    <Check size={16} /> Okundu İşaretle
                  </button>
                )}
                <a href={`/portal/${note.portal_token}`} target="_blank" className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '13px', borderColor: '#3b82f6', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <ExternalLink size={16} /> Portala Git
                </a>
                <button onClick={() => deleteNote(note.id)} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '13px', borderColor: '#ef4444', color: '#ef4444' }}>
                  <Trash2 size={16} /> Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
