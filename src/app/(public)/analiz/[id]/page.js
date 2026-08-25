"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Zap, Search, ShieldCheck, Smartphone, Globe,
  ArrowRight, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Share2, MessageCircle, Phone, Copy, Check,
  ExternalLink, Layers, ArrowLeft, Sparkles, ChevronRight, Lock
} from 'lucide-react';

const CATEGORY_META = {
  performance: { label: 'Performans & Hız', icon: Zap, color: '#0ea5e9' },
  seo: { label: 'Arama Motoru (SEO)', icon: Search, color: '#a855f7' },
  mobile: { label: 'Mobil Uyumluluk', icon: Smartphone, color: '#10b981' },
  security: { label: 'Güvenlik & SSL', icon: Lock, color: '#f59e0b' },
  tech: { label: 'Teknoloji Altyapısı', icon: Layers, color: '#6366f1' }
};

export default function SiteAnalizReportPage({ params }) {
  const resolvedParams = use(params);
  const scanId = resolvedParams.id;

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, critical, warning, good

  // Fetch scan data
  const fetchScan = async () => {
    try {
      const res = await fetch(`/api/scan/${scanId}`);
      const data = await res.json();

      if (!res.ok || !data.scan) {
        throw new Error(data.error || 'Analiz raporu bulunamadı.');
      }

      setScan(data.scan);

      // If still running, poll after 2 seconds
      if (data.scan.status === 'running' || data.scan.status === 'pending') {
        setTimeout(fetchScan, 2000);
      } else {
        setLoading(false);
        fetchAiSummary();
      }
    } catch (err) {
      setError(err.message || 'Rapor yüklenemedi.');
      setLoading(false);
    }
  };

  const fetchAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/scan/${scanId}/ai-summary`);
      const data = await res.json();
      if (data.summary) setAiSummary(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (scanId) fetchScan();
  }, [scanId]);

  const copyReportLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f4ee', color: '#1c1a16', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1c1a16' }}>Analiz Raporu Hazırlanıyor...</div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div style={{ minHeight: '100vh', background: '#f7f4ee', color: '#1c1a16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 460, textAlign: 'center', padding: 36, background: 'rgba(255,255,255,0.6)', borderRadius: 24, border: '1px solid rgba(20,16,10,0.08)' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Rapor Yüklenemedi</h2>
          <p style={{ color: '#6b6459', fontSize: 14, margin: '0 0 24px' }}>{error || 'Geçersiz analiz kimliği.'}</p>
          <Link href="/analiz" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: '#6366f1', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
            <ArrowLeft size={16} /> Yeni Analiz Yap
          </Link>
        </div>
      </div>
    );
  }

  const score = scan.overallScore || 0;
  const scoreColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const scoreBg = score >= 80 ? 'rgba(34,197,94,0.1)' : score >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
  const scoreLabel = score >= 80 ? 'İyi Durumda' : score >= 50 ? 'Geliştirilmeli' : 'Kritik Düzeyde Hatalar';

  // Extract all findings into a single array with category info
  const allFindings = [];
  Object.entries(scan.categories || {}).forEach(([catKey, catData]) => {
    (catData.findings || []).forEach(finding => {
      allFindings.push({
        ...finding,
        categoryKey: catKey,
        categoryLabel: CATEGORY_META[catKey]?.label || catKey
      });
    });
  });

  // Filter findings
  const filteredFindings = allFindings.filter(f => {
    if (activeCategory !== 'all' && f.categoryKey !== activeCategory) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    return true;
  });

  // Pre-filled WhatsApp CTA message
  const reportUrl = typeof window !== 'undefined' ? window.location.href : '';
  const waMessage = encodeURIComponent(
    `Merhaba Kodiva Ekibi 👋\n\n${scan.normalizedUrl} sitemiz için site analiz raporu aldık (Sağlık Skoru: ${score}/100, ${scan.summary?.criticalCount || 0} Kritik Hata).\n\nRapor Linkimiz: ${reportUrl}\n\nBu sorunları profesyonel olarak çözmek için teklif almak istiyoruz.`
  );
  const waLink = `https://wa.me/905432300157?text=${waMessage}`;

  return (
    <div className="report-page-container" style={{ minHeight: '100vh', background: '#f7f4ee', color: '#1c1a16', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 80 }}>

      {/* ── TOP NAVBAR ── */}
      <header style={{ borderBottom: '1px solid rgba(20,16,10,0.09)', background: 'rgba(247,244,238,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="header-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/analiz" style={{ color: '#6b6459', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <ArrowLeft size={16} /> Yeni Analiz
            </Link>
            <span style={{ color: '#c9c2b6' }}>|</span>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#1c1a16', fontWeight: 800, fontSize: 16 }}>
              <img src="/favicon.svg" alt="Kodiva" width="24" height="24" />
              <span>kodiva<span style={{ color: '#6366f1' }}>website</span></span>
            </Link>
          </div>

          <div className="header-buttons" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => {
                import('@/lib/pdfGenerator').then(({ generateAuditPDF }) => {
                  generateAuditPDF(scan, allFindings, aiSummary);
                });
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, minHeight: '44px',
                background: 'rgba(20,16,10,0.04)',
                border: '1px solid rgba(20,16,10,0.12)',
                color: '#1c1a16', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Layers size={14} /> PDF İndir
            </button>

            <button
              onClick={copyReportLink}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, minHeight: '44px',
                background: 'rgba(20,16,10,0.04)',
                border: '1px solid rgba(20,16,10,0.12)',
                color: '#1c1a16', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#22c55e" /> : <Share2 size={14} />}
              {copied ? 'Link Kopyalandı!' : 'Raporu Paylaş'}
            </button>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10, minHeight: '44px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(34,197,94,0.3)'
              }}
            >
              <MessageCircle size={15} /> Uzmana Danış
            </a>
          </div>
        </div>
      </header>

      {/* ── REPORT HERO & HEADER ── */}
      <div className="hero-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 20px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4f46e5', background: 'rgba(99,102,241,0.12)', padding: '4px 12px', borderRadius: 20, fontWeight: 700, marginBottom: 8 }}>
              <Globe size={13} /> DETAYLI SAĞLIK VE PERFORMANS RAPORU
            </div>
            <h1 className="report-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, margin: 0, color: '#1c1a16', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span>{scan.normalizedUrl}</span>
              <a href={scan.url} target="_blank" rel="noreferrer" style={{ color: '#6b6459', fontSize: 16, display: 'inline-flex', alignItems: 'center' }}>
                <ExternalLink size={18} />
              </a>
            </h1>
            <div style={{ fontSize: 13, color: '#6b6459', marginTop: 4 }}>
              Tarama Tarihi: {new Date(scan.createdAt).toLocaleString('tr-TR')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/analiz"
              style={{ padding: '10px 18px', borderRadius: 12, background: 'rgba(20,16,10,0.04)', border: '1px solid rgba(20,16,10,0.1)', color: '#1c1a16', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} /> Yeni Tarama
            </Link>
          </div>
        </div>

        {/* ── OVERALL SCORE BANNER ── */}
        <div className="overall-score-banner" style={{
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(20,16,10,0.08)',
          borderRadius: 24,
          padding: '32px 36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 28,
          alignItems: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          marginBottom: 32
        }}>

          {/* Left: Big Score Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              background: scoreBg,
              border: `4px solid ${scoreColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px ${scoreColor}40`,
              flexShrink: 0
            }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6b6459', marginTop: 2 }}>/ 100</span>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                GENEL SAĞLIK SKORU
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1c1a16', margin: '4px 0 6px' }}>
                {scoreLabel}
              </h2>
              <p style={{ fontSize: 13, color: '#6b6459', margin: 0, lineHeight: 1.5 }}>
                {score >= 80
                  ? 'Siteniz modern standartları karşılıyor ancak optimize edilebilecek noktalar var.'
                  : score >= 50
                    ? 'Sitenizde müşteri kaybına ve arama sıralamasında düşüşe yol açan önemli eksikler bulundu.'
                    : 'Sitenizde ivedilikle düzeltilmesi gereken kritik teknik ve güvenlik sorunları tespit edildi.'}
              </p>
            </div>
          </div>

          {/* Right: Quick Issue Stats */}
          <div className="quick-issue-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, borderLeft: '1px solid rgba(20,16,10,0.08)', paddingLeft: 24 }}>

            <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#f87171' }}>{scan.summary?.criticalCount || 0}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginTop: 2 }}>Kritik Hata</div>
            </div>

            <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>{scan.summary?.warningCount || 0}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#d97706', marginTop: 2 }}>Uyarı / İyileştirme</div>
            </div>

            <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#4ade80' }}>{scan.summary?.goodCount || 0}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginTop: 2 }}>Başarılı Test</div>
            </div>

          </div>

        </div>

        {/* ── 5 CATEGORY SCORE CARDS ── */}
        <div className="category-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 40 }}>
          {Object.entries(CATEGORY_META).map(([key, meta]) => {
            const catData = scan.categories?.[key] || { score: 0 };
            const Icon = meta.icon;
            const catScore = catData.score;
            const catColor = catScore >= 80 ? '#22c55e' : catScore >= 50 ? '#f59e0b' : '#ef4444';

            return (
              <div
                key={key}
                onClick={() => setActiveCategory(activeCategory === key ? 'all' : key)}
                style={{
                  padding: '20px 18px',
                  borderRadius: 18,
                  background: activeCategory === key ? 'rgba(99,102,241,0.12)' : 'rgba(20,16,10,0.03)',
                  border: activeCategory === key ? '2px solid #6366f1' : '1px solid rgba(20,16,10,0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: catColor }}>
                    {catScore}
                    <span style={{ fontSize: 11, color: '#6b6459', fontWeight: 600 }}>/100</span>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: '#1c1a16', marginBottom: 6 }}>{meta.label}</div>
                <div style={{ width: '100%', height: 4, background: 'rgba(20,16,10,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${catScore}%`, height: '100%', background: catColor, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── PRIORITY RECOMMENDATIONS & AI SUMMARY ── */}
        <div className="priority-ai-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 40 }}>

          {/* AI SUMMARY */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: 24,
            padding: '28px 32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: 8, borderRadius: 10 }}>
                <Sparkles size={20} color="#a855f7" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1c1a16', margin: 0 }}>Yapay Zeka Özeti</h3>
                <div style={{ fontSize: 13, color: '#6b6459' }}>Analiz sonuçlarının akıllı değerlendirmesi</div>
              </div>
            </div>

            {aiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#a855f7', fontSize: 14, fontWeight: 600 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', animation: 'spin 1s linear infinite' }} />
                Yönetici özeti oluşturuluyor...
              </div>
            ) : aiSummary ? (
              <div style={{ fontSize: 14, color: '#1c1a16', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {aiSummary}
              </div>
            ) : null}
          </div>

          {/* PRIORITY RECOMMENDATIONS */}
          {allFindings.filter(f => f.status === 'critical' || f.status === 'warning').length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(20,16,10,0.08)',
              borderRadius: 24,
              padding: '28px 32px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: 10 }}>
                  <AlertTriangle size={20} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1c1a16', margin: 0 }}>Öncelikli Aksiyon Planı</h3>
                  <div style={{ fontSize: 13, color: '#6b6459' }}>En kısa sürede çözmeniz gereken hatalar</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {allFindings
                  .filter(f => f.status === 'critical' || f.status === 'warning')
                  .sort((a, b) => {
                    if (a.status === 'critical' && b.status !== 'critical') return -1;
                    if (a.status !== 'critical' && b.status === 'critical') return 1;
                    return 0;
                  })
                  .slice(0, 5)
                  .map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '16px', background: 'rgba(0,0,0,0.2)',
                      borderRadius: 14, borderLeft: `3px solid ${f.status === 'critical' ? '#ef4444' : '#fbbf24'}`
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: f.status === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                        color: f.status === 'critical' ? '#ef4444' : '#fbbf24',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1a16', marginBottom: 4 }}>{f.title}</div>
                        <div style={{ fontSize: 13, color: '#6b6459', lineHeight: 1.5 }}>{f.advice || f.description}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>


        {/* ── HIGH-CONVERTING CTA (KODIVA LEAD MAGNET) ── */}
        <div className="cta-banner" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 24,
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
          marginBottom: 48,
          boxShadow: '0 15px 40px rgba(99,102,241,0.15)'
        }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>
              <Sparkles size={14} /> KODİVA WEB VE TEKNİK DANIŞMANLIK
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1c1a16', margin: '0 0 8px' }}>
              Sitenizdeki {scan.summary?.criticalCount || 0} Kritik Hatayı 24 Saatte Profesyonelce Çözelim!
            </h3>
            <p style={{ fontSize: 14, color: '#1c1a16', margin: 0, lineHeight: 1.6 }}>
              PageSpeed hızlandırma, SEO altyapı iyileştirmesi veya modern yeni bir web sitesiyle cironuzu katlayın. Raporunuzu inceleyip size özel çözüm sunalım.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '16px 24px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 8px 25px rgba(34,197,94,0.4)',
                textAlign: 'center'
              }}
            >
              <MessageCircle size={18} /> WhatsApp ile Teklif Al
            </a>

            <a
              href="tel:05432300157"
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                background: 'rgba(20,16,10,0.04)',
                border: '1px solid rgba(20,16,10,0.12)',
                color: '#1c1a16',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Phone size={14} /> 0543 230 01 57 (Hemen Ara)
            </a>
          </div>
        </div>

        {/* ── DETAILED FINDINGS SECTION ── */}
        <div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#1c1a16', margin: 0 }}>
                Detaylı Analiz Bulguları ({filteredFindings.length})
              </h3>
              <div style={{ fontSize: 13, color: '#6b6459', marginTop: 2 }}>
                Sitenizde yapılan 100+ kontrolün somut sonuçları ve çözüm tavsiyeleri
              </div>
            </div>

            {/* Status Filter Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: statusFilter === 'all' ? '#1c1a16' : 'rgba(20,16,10,0.04)',
                  color: statusFilter === 'all' ? '#fff' : '#6b6459',
                  border: '1px solid rgba(20,16,10,0.08)'
                }}
              >
                Tümü ({allFindings.length})
              </button>

              <button
                onClick={() => setStatusFilter('critical')}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: statusFilter === 'critical' ? '#ef4444' : 'rgba(239,68,68,0.1)',
                  color: statusFilter === 'critical' ? '#fff' : '#f87171',
                  border: '1px solid rgba(239,68,68,0.25)'
                }}
              >
                Kritik ({scan.summary?.criticalCount || 0})
              </button>

              <button
                onClick={() => setStatusFilter('warning')}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: statusFilter === 'warning' ? '#f59e0b' : 'rgba(245,158,11,0.1)',
                  color: statusFilter === 'warning' ? '#fff' : '#fbbf24',
                  border: '1px solid rgba(245,158,11,0.25)'
                }}
              >
                Uyarılar ({scan.summary?.warningCount || 0})
              </button>

              <button
                onClick={() => setStatusFilter('good')}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: statusFilter === 'good' ? '#22c55e' : 'rgba(34,197,94,0.1)',
                  color: statusFilter === 'good' ? '#fff' : '#4ade80',
                  border: '1px solid rgba(34,197,94,0.25)'
                }}
              >
                Başarılı ({scan.summary?.goodCount || 0})
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                background: activeCategory === 'all' ? 'rgba(99,102,241,0.15)' : 'rgba(20,16,10,0.03)',
                color: activeCategory === 'all' ? '#4f46e5' : '#6b6459',
                border: activeCategory === 'all' ? '1px solid #6366f1' : '1px solid rgba(20,16,10,0.08)'
              }}
            >
              Tüm Kategoriler
            </button>
            {Object.entries(CATEGORY_META).map(([catKey, meta]) => (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                style={{
                  padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: activeCategory === catKey ? 'rgba(99,102,241,0.15)' : 'rgba(20,16,10,0.03)',
                  color: activeCategory === catKey ? '#4f46e5' : '#6b6459',
                  border: activeCategory === catKey ? '1px solid #6366f1' : '1px solid rgba(20,16,10,0.08)'
                }}
              >
                {meta.label}
              </button>
            ))}
          </div>

          {/* Finding Cards List */}
          <div className="finding-cards-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredFindings.map((finding, idx) => {
              const isCrit = finding.status === 'critical';
              const isWarn = finding.status === 'warning';
              const isGood = finding.status === 'good';

              const badgeColor = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#22c55e';
              const badgeBg = isCrit ? 'rgba(239,68,68,0.1)' : isWarn ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)';
              const badgeLabel = isCrit ? 'KRİTİK HATA' : isWarn ? 'UYARI' : 'BAŞARILI';

              return (
                <div
                  key={idx}
                  className="finding-card"
                  style={{
                    padding: '20px 24px',
                    borderRadius: 18,
                    background: 'rgba(255,255,255,0.6)',
                    border: `1px solid ${isCrit ? 'rgba(239,68,68,0.3)' : isWarn ? 'rgba(245,158,11,0.3)' : 'rgba(20,16,10,0.08)'}`,
                    boxShadow: isCrit ? '0 8px 25px rgba(239,68,68,0.05)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div className="header-buttons" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                        background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}30`,
                        letterSpacing: '0.04em'
                      }}>
                        {badgeLabel}
                      </div>
                      <span style={{ fontSize: 12, color: '#6b6459', fontWeight: 600 }}>{finding.categoryLabel}</span>
                    </div>

                    {finding.impact && (
                      <div style={{ fontSize: 11, color: '#6b6459', fontWeight: 600 }}>
                        Etki Derecesi: <span style={{ color: finding.impact === 'high' ? '#f87171' : finding.impact === 'medium' ? '#fbbf24' : '#4ade80' }}>
                          {finding.impact === 'high' ? 'Yüksek' : finding.impact === 'medium' ? 'Orta' : 'Düşük'}
                        </span>
                      </div>
                    )}
                  </div>

                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1c1a16', margin: '0 0 6px' }}>
                    {finding.title}
                  </h4>

                  <p style={{ fontSize: 14, color: '#1c1a16', margin: '0 0 12px', lineHeight: 1.55 }}>
                    {finding.description}
                  </p>

                  {finding.advice && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(20,16,10,0.03)', border: '1px solid rgba(20,16,10,0.08)', display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#6b6459' }}>
                      <span style={{ color: '#4f46e5', fontWeight: 700, flexShrink: 0 }}>💡 Nasıl Düzeltilir:</span>
                      <span>{finding.advice}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="footer-container" style={{ borderTop: '1px solid rgba(20,16,10,0.09)', padding: '30px 24px', textAlign: 'center', color: '#6b6459', fontSize: 13, marginTop: 40 }}>
        <p style={{ margin: '0 0 8px' }}>© {new Date().getFullYear()} Kodiva Web Tasarım Ajansı. Tüm Hakları Saklıdır.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Link href="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>Ana Sayfa</Link>
          <Link href="/analiz" style={{ color: '#4f46e5', textDecoration: 'none' }}>Yeni Analiz Yap</Link>
          <a href="https://wa.me/905432300157" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'none' }}>WhatsApp Destek</a>
        </div>
      </footer>


      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .header-inner {
            padding: 12px 16px !important;
            flex-wrap: wrap;
            gap: 12px;
          }
          .header-buttons {
            flex-wrap: wrap;
            width: 100%;
          }
          .header-buttons button, .header-buttons a {
            flex: 1;
            justify-content: center;
          }
          .hero-section {
            padding: 24px 16px 16px !important;
          }
          .report-title {
            font-size: clamp(20px, 5vw, 28px) !important;
          }
          .overall-score-banner {
            padding: 24px 16px !important;
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .quick-issue-stats {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid rgba(20,16,10,0.08);
            padding-top: 20px !important;
            grid-template-columns: 1fr 1fr 1fr !important;
          }
          .category-cards-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .priority-ai-grid {
            grid-template-columns: 1fr !important;
          }
          .cta-banner {
            padding: 24px 16px !important;
            flex-direction: column;
            text-align: center;
          }
          .cta-banner > div:first-child {
            margin-bottom: 16px;
          }
          .cta-banner a {
            width: 100%;
            min-height: 44px;
          }
          .finding-card {
            padding: 16px !important;
          }
          .footer-container {
            padding: 24px 16px !important;
          }
        }
        @media (max-width: 480px) {
          .quick-issue-stats {
            grid-template-columns: 1fr !important;
          }
          .category-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}

