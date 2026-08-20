"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Phone, Trophy, TrendingUp, CheckCircle, 
  Clock, MessageSquare, Copy, Check, Shield, Trash2, Edit3, 
  ExternalLink, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';

export default function AgentsTab({ leads = [], onRefresh }) {
  const [agents, setAgents] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    phone: '',
    password: '',
    role: 'agent'
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, logsRes, refRes] = await Promise.all([
        axios.get('/api/agents'),
        axios.get('/api/activity-logs?limit=30'),
        axios.get('/api/referrals')
      ]);
      setAgents(agentsRes.data || []);
      setActivityLogs(logsRes.data || []);
      setReferrals(refRes.data || []);
    } catch (err) {
      console.error("Agents fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.slug || !formData.password) {
      setFormError('İsim, URL takma adı (slug) ve şifre zorunludur.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/agents', formData);
      setShowAddModal(false);
      setFormData({ name: '', slug: '', phone: '', password: '', role: 'agent' });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Temsilci eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (agentId, agentName) => {
    if (!confirm(`${agentName} adlı temsilciyi silmek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete(`/api/agents?id=${agentId}`);
      fetchData();
    } catch (err) {
      alert('Silme işlemi başarısız.');
    }
  };

  const copyReferralLink = (code) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Metrics calculation
  const totalAssignedLeads = leads.filter(l => l.assigned_to).length;
  const totalWonLeads = leads.filter(l => l.assigned_to && l.status === 'won').length;
  const totalRevenue = leads.filter(l => l.assigned_to && l.status === 'won').reduce((sum, l) => sum + (parseFloat(l.revenue) || 0), 0);

  // Leaderboard ranking
  const sortedAgents = [...agents].sort((a, b) => {
    const aWon = parseInt(a.won_count) || 0;
    const bWon = parseInt(b.won_count) || 0;
    if (bWon !== aWon) return bWon - aWon;
    return (parseInt(b.activity_count) || 0) - (parseInt(a.activity_count) || 0);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users style={{ color: '#818cf8' }} /> Satış Ekibi & Temsilciler
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>
            Arkadaşlarınızı ve satış temsilcilerinizi yönetin, performanslarını canlı izleyin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <a 
            href="/temsilci" 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-secondary" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', 
              background: 'rgba(255,255,255,0.05)', borderRadius: 10, color: '#fff', 
              border: '1px solid var(--glass-border)', textDecoration: 'none', fontSize: 14, fontWeight: 600 
            }}
          >
            <ExternalLink size={16} /> Temsilci Giriş Paneli
          </a>

          <button 
            onClick={() => setShowAddModal(true)} 
            className="btn btn-primary"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', 
              background: 'var(--accent-color)', borderRadius: 10, color: '#fff', 
              border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 
            }}
          >
            <UserPlus size={18} /> Yeni Temsilci Ekle
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        
        <div className="glass-panel" style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Aktif Temsilci</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{agents.filter(a => a.is_active).length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Atanan Müşteri</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{totalAssignedLeads} <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>/ {leads.length}</span></div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Ekip Tarafından Kazanılan</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{totalWonLeads} Satış</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Ekip Cirosu</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{totalRevenue.toLocaleString('tr-TR')} ₺</div>
          </div>
        </div>

      </div>

      {/* Leaderboard (Skor Tablosu) */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy style={{ color: '#eab308' }} size={20} /> Temsilci Skor Tablosu (Leaderboard)
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Kazanılan satış ve aktiviteye göre sıralıdır</span>
        </div>

        {sortedAgents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-secondary)' }}>
            Henüz temsilci eklenmemiş. Yukarıdaki "Yeni Temsilci Ekle" butonuna tıklayarak ilk temsilcinizi ekleyin!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Sıra</th>
                  <th style={{ padding: '12px 16px' }}>Temsilci</th>
                  <th style={{ padding: '12px 16px' }}>Giriş URL</th>
                  <th style={{ padding: '12px 16px' }}>Atanan Müşteri</th>
                  <th style={{ padding: '12px 16px' }}>Toplam Temas</th>
                  <th style={{ padding: '12px 16px' }}>Kazanılan</th>
                  <th style={{ padding: '12px 16px' }}>Dönüşüm %</th>
                  <th style={{ padding: '12px 16px' }}>Özel Ref Link</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {sortedAgents.map((agent, index) => {
                  const won = parseInt(agent.won_count) || 0;
                  const total = parseInt(agent.assigned_count) || 0;
                  const convRate = total > 0 ? Math.round((won / total) * 100) : 0;
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

                  return (
                    <tr key={agent.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                      <td style={{ padding: '16px', fontWeight: 800, fontSize: 16 }}>{medal}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14 }}>
                            {agent.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{agent.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{agent.phone || 'Telefon yok'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <code style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                          /temsilci/{agent.slug}
                        </code>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{agent.assigned_count || 0}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6, fontSize: 13 }}>
                          <Activity size={14} style={{ color: '#818cf8' }} /> {agent.activity_count || 0}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#22c55e', fontWeight: 700 }}>
                        {won}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${convRate}%`, height: '100%', background: convRate > 20 ? '#22c55e' : '#f59e0b' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>%{convRate}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button 
                          onClick={() => copyReferralLink(agent.slug)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '5px 10px', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12 }}
                        >
                          {copiedCode === agent.slug ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                          {copiedCode === agent.slug ? 'Kopyalandı!' : 'Linki Al'}
                        </button>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDeleteAgent(agent.id, agent.name)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                          title="Temsilciyi Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Activity Feed (Son Yapılan Aramalar ve İşlemler) */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 18 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity style={{ color: '#818cf8' }} size={20} /> Ekip Canlı Aktivite Günlüğü
        </h3>

        {activityLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
            Henüz temsilciler tarafından kaydedilmiş bir arama veya mesaj aktivitesi bulunmuyor.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto' }}>
            {activityLogs.map((log) => {
              const icon = log.type === 'call' ? <Phone size={16} color="#38bdf8" /> 
                         : log.type === 'whatsapp' ? <MessageSquare size={16} color="#4ade80" />
                         : log.type === 'status_change' ? <CheckCircle size={16} color="#f59e0b" />
                         : <Activity size={16} color="#c084fc" />;

              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        <span style={{ color: '#818cf8' }}>{log.agent_name || 'Temsilci'}</span> &rarr; <strong>{log.lead_name || 'Müşteri'}</strong>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {log.note || 'İşlem kaydı girildi.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} ({new Date(log.created_at).toLocaleDateString('tr-TR')})
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: 28, borderRadius: 20, border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Yeni Satış Temsilcisi Ekle</h3>
            
            {formError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAgent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div className="input-group">
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ad Soyad</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Örn: Ahmet Yılmaz" 
                  value={formData.name} 
                  onChange={e => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
                    setFormData({ ...formData, name, slug: formData.slug || slug });
                  }}
                  required 
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Temsilci URL Kodu (Slug)</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid var(--glass-border)', padding: '0 12px' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/temsilci/</span>
                  <input 
                    type="text" 
                    style={{ background: 'transparent', border: 'none', color: '#fff', padding: '12px 6px', flex: 1, outline: 'none' }} 
                    placeholder="ahmet" 
                    value={formData.slug} 
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    required 
                  />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Temsilcinin giriş yapacağı özel URL uzantısıdır.</span>
              </div>

              <div className="input-group">
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Telefon Numarası (Opsiyonel)</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="05XXXXXXXXX" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>

              <div className="input-group">
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Giriş Şifresi</label>
                <input 
                  type="password" 
                  className="glass-input" 
                  placeholder="Temsilcinin panel şifresi" 
                  value={formData.password} 
                  onChange={e => setFormData({ ...formData, password: e.target.value })} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', cursor: 'pointer', fontWeight: 600 }}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ flex: 2, padding: 12, borderRadius: 10, background: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  {isSubmitting ? 'Ekleniyor...' : 'Temsilciyi Kaydet'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
