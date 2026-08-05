"use client";
import { useEffect, useRef } from 'react';

export default function MapTab({ leads }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const leadsWithCoords = leads.filter(l => l.lat && l.lng);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then(L => {
      // Inject leaflet CSS if not already added
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapRef.current) return;

      // Destroy old instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: Turkey
      const defaultCenter = [39.9334, 32.8597];
      const defaultZoom = 6;

      // Find center from data
      let center = defaultCenter;
      let zoom = defaultZoom;
      if (leadsWithCoords.length > 0) {
        center = [leadsWithCoords[0].lat, leadsWithCoords[0].lng];
        zoom = 12;
      }

      const map = L.default.map(mapRef.current, { center, zoom });
      mapInstanceRef.current = map;

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Custom markers
      const redIcon = L.default.divIcon({
        html: `<div style="
          width: 32px; height: 32px; background: #ef4444; border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg); border: 3px solid white;
          box-shadow: 0 4px 12px rgba(239,68,68,0.6);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: ''
      });

      const greenIcon = L.default.divIcon({
        html: `<div style="
          width: 24px; height: 24px; background: #10b981; border-radius: 50%;
          border: 3px solid white; box-shadow: 0 2px 8px rgba(16,185,129,0.5);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: ''
      });

      leadsWithCoords.forEach(lead => {
        const icon = lead.has_website ? greenIcon : redIcon;
        const marker = L.default.marker([lead.lat, lead.lng], { icon });

        const waLink = lead.phone
          ? `<a href="https://wa.me/90${lead.phone.replace(/[^0-9]/g, '').slice(-10)}" target="_blank" style="color:#25D366;font-weight:600;">📱 WhatsApp'tan Yaz</a>`
          : '';

        marker.bindPopup(`
          <div style="min-width:200px; font-family: sans-serif;">
            <strong style="font-size:15px;">${lead.name}</strong><br>
            <span style="font-size:12px;color:${lead.has_website ? '#10b981' : '#ef4444'};">
              ${lead.has_website ? '✓ Web Sitesi Var' : '✗ Potansiyel Müşteri (Site Yok)'}
            </span><br><br>
            ${lead.phone ? `📞 ${lead.phone}<br>` : ''}
            ${lead.address ? `📍 ${lead.address}<br>` : ''}
            ${waLink ? `<br>${waLink}` : ''}
          </div>
        `);

        marker.addTo(map);
      });

      // Fit bounds if multiple markers
      if (leadsWithCoords.length > 1) {
        const group = L.default.featureGroup(
          leadsWithCoords.map(l => L.default.marker([l.lat, l.lng]))
        );
        map.fitBounds(group.getBounds().pad(0.1));
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leads]);

  return (
    <div>
      {/* Legend */}
      <div className="glass-panel" style={{ marginBottom: '16px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Web Sitesi Yok (Potansiyel)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#10b981', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Web Sitesi Var</span>
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Haritada {leadsWithCoords.length} firma gösteriliyor
        </div>
      </div>

      {leadsWithCoords.length === 0 ? (
        <div className="glass-panel loader-container">
          <span style={{ fontSize: '48px' }}>🗺️</span>
          <p style={{ marginTop: '16px' }}>Haritada gösterilecek veri yok.<br />Önce bir arama yapın.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', height: '600px' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
        </div>
      )}
    </div>
  );
}
