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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="text-blue-500" /> 
          Müşteri Notları & Talepleri
        </h2>
        <button onClick={fetchNotes} className="text-sm text-blue-600 hover:underline">Yenile</button>
      </div>

      <div className="divide-y divide-slate-100">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Henüz bir not yok.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className={`p-6 flex flex-col sm:flex-row gap-4 justify-between transition-colors ${note.is_read ? 'bg-white' : 'bg-blue-50/50'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">{note.lead_name}</h3>
                  {!note.is_read && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">Yeni</span>}
                  <span className="text-xs text-slate-400">{new Date(note.created_at).toLocaleString('tr-TR')}</span>
                </div>
                <div className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {note.content}
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 justify-start sm:justify-center">
                {!note.is_read && (
                  <button onClick={() => markAsRead(note.id)} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-green-600 text-sm font-medium transition-colors">
                    <Check size={16} /> Okundu İşaretle
                  </button>
                )}
                <a href={`/portal/${note.portal_token}`} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 text-sm font-medium transition-colors">
                  <ExternalLink size={16} /> Portala Git
                </a>
                <button onClick={() => deleteNote(note.id)} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-red-600 text-sm font-medium transition-colors">
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
