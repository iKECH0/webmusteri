"use client";

import React, { useState, useEffect } from 'react';

export default function ROICalculator() {
  const [missedCustomers, setMissedCustomers] = useState(10);
  const [customerValue, setCustomerValue] = useState(500);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    // Calculate monthly extra revenue based on 30 days
    // Assume a professional website captures 30% of missed customers
    const capturedCustomersPerDay = missedCustomers * 0.3;
    const extraRevenuePerMonth = capturedCustomersPerDay * 30 * customerValue;
    setMonthlyRevenue(Math.round(extraRevenuePerMonth));
  }, [missedCustomers, customerValue]);

  return (
    <div className="roi-calculator-container glass-panel reveal" style={{ marginTop: '40px', padding: '40px 24px', borderRadius: 'var(--radius-xl)' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Yatırım Getirisi Hesaplayıcı</h2>
        <p style={{ color: 'var(--text-muted)' }}>Profesyonel bir web sitesi size ayda ne kadar kazandırabilir?</p>
      </div>

      <div className="roi-calculator-grid" style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="roi-controls" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="slider-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontWeight: '600' }}>Günde kaç müşteri sizi bulamıyor?</label>
              <span style={{ fontWeight: '700', color: 'var(--accent-color)' }}>{missedCustomers} Kişi</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={missedCustomers} 
              onChange={(e) => setMissedCustomers(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-color)' }}
            />
          </div>

          <div className="slider-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontWeight: '600' }}>Bir müşterinin ortalama kazancı</label>
              <span style={{ fontWeight: '700', color: 'var(--accent-color)' }}>{customerValue} ₺</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="5000" 
              step="50"
              value={customerValue} 
              onChange={(e) => setCustomerValue(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-color)' }}
            />
          </div>

        </div>

        <div className="roi-result" style={{ 
          backgroundColor: 'var(--bg-color)', 
          padding: '32px', 
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '12px' }}>Tahmini Ekstra Aylık Ciro</h4>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-color)', marginBottom: '16px', lineHeight: '1' }}>
            {monthlyRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', lineHeight: '1.5' }}>
            Profesyonel bir web sitesi sadece "masraf" değil, <strong>en kârlı çalışanınızdır</strong>. Siteniz kendini muhtemelen ilk haftasında amorti edecektir!
          </p>
        </div>
      </div>
    </div>
  );
}
