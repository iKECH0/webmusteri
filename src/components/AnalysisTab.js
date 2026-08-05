"use client";
import { useEffect, useRef } from 'react';

export default function AnalysisTab({ leads }) {
  const funnelRef = useRef(null);
  const sectorRef = useRef(null);
  const revenueRef = useRef(null);

  const total = leads.length;
  const contacted = leads.filter(l => l.status !== 'new').length;
  const interested = leads.filter(l => l.status === 'interested' || l.status === 'closed').length;
  const closed = leads.filter(l => l.status === 'closed').length;
  const totalRevenue = leads.reduce((sum, l) => sum + (l.revenue || 0), 0);
  const noWebsite = leads.filter(l => !l.has_website).length;

  // Region analysis
  const regionMap = {};
  leads.forEach(l => {
    if (!l.address) return;
    const parts = l.address.split(',');
    const region = parts[parts.length > 2 ? parts.length - 2 : 0]?.trim() || 'Diğer';
    regionMap[region] = (regionMap[region] || 0) + 1;
  });
  const topRegions = Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Sector analysis
  const sectorMap = {};
  leads.forEach(l => {
    const sector = l.category || 'Diğer';
    sectorMap[sector] = (sectorMap[sector] || 0) + 1;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !leads.length) return;

    import('chart.js/auto').then(({ default: Chart }) => {
      // Destroy existing charts
      [funnelRef, sectorRef, revenueRef].forEach(ref => {
        if (ref.current?._chartInstance) {
          ref.current._chartInstance.destroy();
        }
      });

      const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

      // Funnel Chart
      if (funnelRef.current) {
        funnelRef.current._chartInstance = new Chart(funnelRef.current, {
          type: 'bar',
          data: {
            labels: ['Toplam Bulunan', 'İletişim Kuruldu', 'İlgileniyor', 'Müşteri Oldu'],
            datasets: [{
              label: 'Firma Sayısı',
              data: [total, contacted, interested, closed],
              backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'],
              borderRadius: 8,
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            }
          }
        });
      }

      // Sector / Region Chart
      if (sectorRef.current && topRegions.length) {
        sectorRef.current._chartInstance = new Chart(sectorRef.current, {
          type: 'doughnut',
          data: {
            labels: topRegions.map(([r]) => r),
            datasets: [{
              data: topRegions.map(([, c]) => c),
              backgroundColor: COLORS,
              borderColor: 'rgba(0,0,0,0.2)',
              borderWidth: 2,
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });
      }

      // Website ratio chart
      if (revenueRef.current) {
        revenueRef.current._chartInstance = new Chart(revenueRef.current, {
          type: 'pie',
          data: {
            labels: ['Web Sitesi Yok (Fırsat)', 'Web Sitesi Var'],
            datasets: [{
              data: [noWebsite, total - noWebsite],
              backgroundColor: ['#ef4444', '#10b981'],
              borderColor: 'rgba(0,0,0,0.2)',
              borderWidth: 2,
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });
      }
    });

    return () => {
      [funnelRef, sectorRef, revenueRef].forEach(ref => {
        if (ref.current?._chartInstance) ref.current._chartInstance.destroy();
      });
    };
  }, [leads]);

  if (!leads.length) {
    return (
      <div className="glass-panel loader-container">
        <span style={{ fontSize: '48px' }}>📈</span>
        <p style={{ marginTop: '16px' }}>Henüz analiz verisi yok.<br />Önce firma araması yapın.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Dönüşüm Oranı', value: total ? `${Math.round((closed / total) * 100)}%` : '0%', color: '#34d399', desc: 'Kazanılan/Toplam' },
          { label: 'İletişim Oranı', value: total ? `${Math.round((contacted / total) * 100)}%` : '0%', color: '#818cf8', desc: 'İletişim/Toplam' },
          { label: 'Fırsat Havuzu', value: noWebsite, color: '#f87171', desc: 'Web sitesi olmayan' },
          { label: 'Toplam Gelir', value: `${totalRevenue.toLocaleString('tr-TR')}₺`, color: '#fbbf24', desc: 'Kazanılan müşterilerden' },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel" style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{kpi.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>📊 Satış Hunisi (Funnel)</h3>
          <canvas ref={funnelRef}></canvas>
        </div>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>🗺️ Bölge Dağılımı</h3>
          {topRegions.length ? <canvas ref={sectorRef}></canvas> : <p style={{ color: 'var(--text-secondary)' }}>Bölge verisi yetersiz.</p>}
        </div>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>🌐 Web Sitesi Oranı</h3>
          <canvas ref={revenueRef}></canvas>
          <p style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {noWebsite} firma potansiyel müşteri ({total ? Math.round((noWebsite / total) * 100) : 0}%)
          </p>
        </div>
      </div>

      {/* Region Table */}
      {topRegions.length > 0 && (
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>📍 Bölge Bazında Firma Sayısı</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topRegions.map(([region, count], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '180px', fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{region}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / topRegions[0][1]) * 100}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ width: '30px', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
