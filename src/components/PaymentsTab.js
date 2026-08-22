"use client";

import { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, Clock, AlertTriangle, 
  Calendar, User, Package, ChevronRight, X, Check,
  RefreshCw, ExternalLink, Shield
} from 'lucide-react';

const STATUS_MAP = {
  'PENDING': { label: 'Beklemede', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  'PAID': { label: 'Ödendi', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
  'FAILED': { label: 'Başarısız', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
};

const SUB_STATUS_MAP = {
  'PENDING_ACTIVATION': { label: 'Aktivasyon Bekliyor', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  'ACTIVE': { label: 'Aktif', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
  'EXPIRED': { label: 'Süresi Doldu', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  'CANCELLED': { label: 'İptal', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export default function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('payments'); // 'payments' or 'subscriptions'
  const [activationModal, setActivationModal] = useState(null); // { subscriptionId, customerEmail, productId }
  const [activationDuration, setActivationDuration] = useState(12); // months
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, subRes] = await Promise.all([
        fetch('/api/admin/payments'),
        fetch('/api/admin/subscriptions')
      ]);
      const payData = await payRes.json();
      const subData = await subRes.json();
      setPayments(payData.payments || []);
      setSubscriptions(subData.subscriptions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivate = async () => {
    if (!activationModal) return;
    setActivating(true);
    try {
      const res = await fetch('/api/admin/subscriptions/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: activationModal.subscriptionId,
          durationMonths: activationDuration,
          adminNote: `Manuel aktivasyon - ${activationDuration} ay`
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Abonelik başarıyla aktif edildi!');
        setActivationModal(null);
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ Hata: ${data.error}`);
      }
    } catch (e) {
      setMessage('❌ Sunucu hatası oluştu.');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Ödemeler & Abonelik Yönetimi</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '4px 0 0' }}>Shopier üzerinden gelen ödemeleri görüntüle ve manuel olarak abonelikleri aktif et.</p>
        </div>
        <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: message.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${message.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: '#fff', fontWeight: 600, marginBottom: 16 }}>
          {message}
        </div>
      )}

      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.02)', padding: 6, borderRadius: 12, width: 'fit-content' }}>
        {[
          { key: 'payments', label: 'Ödemeler', icon: CreditCard },
          { key: 'subscriptions', label: 'Abonelikler & Aktivasyon', icon: Shield }
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
              background: activeSection === s.key ? 'rgba(99,102,241,0.8)' : 'transparent',
              border: 'none', color: activeSection === s.key ? '#fff' : '#94a3b8',
              fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            <s.icon size={15} /> {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Yükleniyor...</div>
      ) : (
        <>
          {/* PAYMENTS TABLE */}
          {activeSection === 'payments' && (
            <div>
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <CreditCard size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  Henüz hiç ödeme kaydı yok.
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Müşteri', 'Paket', 'Tutar', 'Durum', 'Tarih', 'Shopier ID'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => {
                        const st = STATUS_MAP[p.payment_status] || STATUS_MAP.PENDING;
                        return (
                          <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{p.customer_name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{p.customer_email}</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 13, color: '#cbd5e1' }}>{p.product_id}</td>
                            <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#fff' }}>{Number(p.amount).toLocaleString('tr-TR')} ₺</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>{new Date(p.created_at).toLocaleDateString('tr-TR')}</td>
                            <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{p.shopier_order_id || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUBSCRIPTIONS TABLE */}
          {activeSection === 'subscriptions' && (
            <div>
              {subscriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Shield size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  Henüz aktif edilmeyi bekleyen abonelik yok.
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Müşteri', 'Paket', 'Durum', 'Başlangıç', 'Bitiş', 'Aktivasyon İşlemi'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((s, i) => {
                        const st = SUB_STATUS_MAP[s.status] || SUB_STATUS_MAP.PENDING_ACTIVATION;
                        const isPending = s.status === 'PENDING_ACTIVATION';
                        return (
                          <tr key={s.id} style={{ borderBottom: i < subscriptions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: isPending ? 'rgba(245,158,11,0.03)' : 'transparent' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{s.customer_id}</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 13, color: '#cbd5e1' }}>{s.product_id}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                              {s.activated_at ? new Date(s.activated_at).toLocaleDateString('tr-TR') : '-'}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 12, color: s.expires_at ? '#4ade80' : '#64748b' }}>
                              {s.expires_at ? new Date(s.expires_at).toLocaleDateString('tr-TR') : '-'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {isPending ? (
                                <button
                                  onClick={() => setActivationModal({ subscriptionId: s.id, customerEmail: s.customer_id, productId: s.product_id })}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                                >
                                  <Check size={14} /> Aktif Et
                                </button>
                              ) : (
                                <span style={{ fontSize: 12, color: '#64748b' }}>
                                  {s.activated_by ? `Aktif Eden: ${s.activated_by}` : s.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ACTIVATION MODAL */}
      {activationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 36, maxWidth: 480, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#fff' }}>Manuel Aktivasyon</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Bu aboneliği aktif etmek üzeresiniz.</p>
              </div>
              <button onClick={() => setActivationModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Müşteri:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{activationModal.customerEmail}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Paket:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{activationModal.productId}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>Hizmet Süresi (Ay)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 3, 6, 12].map(m => (
                  <button
                    key={m}
                    onClick={() => setActivationDuration(m)}
                    style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: activationDuration === m ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: activationDuration === m ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', color: activationDuration === m ? '#818cf8' : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                  >
                    {m} Ay
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: '#64748b' }}>
                Bitiş Tarihi: <b style={{ color: '#fff' }}>
                  {new Date(Date.now() + activationDuration * 30 * 24 * 3600 * 1000).toLocaleDateString('tr-TR')}
                </b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setActivationModal(null)}
                style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 600, cursor: 'pointer' }}
              >
                İptal
              </button>
              <button
                onClick={handleActivate}
                disabled={activating}
                style={{ flex: 2, padding: '14px', borderRadius: 12, background: activating ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', fontWeight: 800, cursor: activating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {activating ? 'Aktif Ediliyor...' : <><CheckCircle2 size={16} /> Aboneliği Aktif Et</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
