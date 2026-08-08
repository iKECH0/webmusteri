"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, CheckCircle, XCircle, Link, Image as ImageIcon } from 'lucide-react';

export default function ReferencesTab() {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, title: '', url: '', image_url: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/portfolio');
      setReferences(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await axios.put('/api/portfolio', form);
    } else {
      await axios.post('/api/portfolio', form);
    }
    resetForm();
    fetchReferences();
  };

  const handleDelete = async (id) => {
    if (confirm('Bu referansı silmek istediğinize emin misiniz?')) {
      await axios.delete('/api/portfolio', { data: { id } });
      fetchReferences();
    }
  };

  const resetForm = () => {
    setForm({ id: null, title: '', url: '', image_url: '', description: '' });
    setIsEditing(false);
  };

  const handleEdit = (ref) => {
    setForm(ref);
    setIsEditing(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="glass-panel">
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>{isEditing ? 'Referansı Düzenle' : 'Yeni Referans Ekle'}</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Başlık (Firma Adı / Proje)</label>
              <input className="glass-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Örn: Kodiva Web Tasarım" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Web Sitesi URL</label>
              <input className="glass-input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="Örn: https://kodivawebsite.com" />
            </div>
          </div>
          
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Görsel URL (Resim Linki)</label>
            <input className="glass-input" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="Örn: https://resim-linki.com/gorsel.jpg" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Açıklama</label>
            <textarea className="glass-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Proje hakkında kısa bilgi..." />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isEditing ? <CheckCircle size={18} /> : <Plus size={18} />}
              {isEditing ? 'Güncelle' : 'Ekle'}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-outline" onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={18} /> İptal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-panel">
        <h2 style={{ fontSize: 20, marginBottom: 20 }}>Tüm Referanslar ({references.length})</h2>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</p>
        ) : references.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Henüz referans eklenmedi.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {references.map(ref => (
              <div key={ref.id} className="glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ref.image_url ? (
                  <div style={{ width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={ref.image_url} alt={ref.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 160, borderRadius: 8, background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <ImageIcon size={40} opacity={0.3} />
                  </div>
                )}
                
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{ref.title}</h3>
                  {ref.url && (
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Link size={12} /> {ref.url}
                    </a>
                  )}
                </div>
                
                {ref.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ref.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                  <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => handleEdit(ref)}>
                    <Edit size={14} /> Düzenle
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: 12, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDelete(ref.id)}>
                    <Trash2 size={14} /> Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
