"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

// Lazy-load heavy components to improve initial page load performance
const ROICalculator = lazy(() => import("@/components/ROICalculator"));
const PublicChatWidget = lazy(() => import("@/components/PublicChatWidget"));

// ── FONTS ──────────────────────────────────────────────────────────────
// Self-hosted by Next.js (next/font) — no extra npm install needed.
// Display face carries the "build/ship" personality, body face stays warm
// and readable for non-technical visitors, mono face is used sparingly
// for terminal-style labels (a nod to the fact that this is a dev studio).
const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

// ── Referans kodu URL'den al ve sakla (client-side hydration öncesi) ──
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref && !localStorage.getItem("referral_code")) {
    localStorage.setItem("referral_code", ref);
    fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: ref, action: "click" }),
    }).catch(() => { });
  }
}

const FAQS = [
  { q: "Süreç ne kadar sürüyor?", a: "Projenin kapsamına bağlı olarak genellikle 1–3 hafta içerisinde sitenizi anahtar teslim yayına alıyoruz." },
  { q: "Alan adı ve hosting dahil mi?", a: "Evet, tüm paketlerimizde ilk yıl alan adı ve yüksek hızlı sunucu (hosting) ücretsiz olarak sunulmaktadır." },
  { q: "Daha sonra kendi sitemi güncelleyebilir miyim?", a: "Kesinlikle! Size özel hazırladığımız yönetim paneli sayesinde metinleri ve görselleri kolayca değiştirebilirsiniz." },
  { q: "Arama motorlarında (Google) üst sırada çıkar mıyım?", a: "Sitenizi en güncel SEO kurallarına göre kodluyoruz. Bu sayede organik yükselişiniz garanti altına alınır." },
];

const TESTIMONIALS = [
  { text: "Sitemiz eski ve yavaştı. Kodiva ile çalıştıktan sonra hem harika bir tasarıma kavuştuk hem de Google'da ilk sayfaya çıktık.", name: "Ahmet Yılmaz", role: "Cafe Roma İşletmecisi", grad: "linear-gradient(135deg, #f6d365, #fda085)" },
  { text: "Randevu sistemimizi entegre eden muhteşem bir site yaptı. Müşterilerimiz artık telefonla aramak yerine online rezervasyon yapıyor.", name: "Selin Kaya", role: "Güzellik Uzmanı", grad: "linear-gradient(135deg, #a18cd1, #fbc2eb)" },
  { text: "E-ticaret sitemizi açtıktan sonra satışlarımız %40 arttı. Hem mobil hem masaüstünde mükemmel çalışıyor.", name: "Murat Demir", role: "TechStore Sahibi", grad: "linear-gradient(135deg, #4facfe, #00f2fe)" },
  { text: "Portföy sitemiz artık benim adıma iş yapıyor. Müşteriler sitemi görünce hemen iletişime geçiyor.", name: "Zeynep Arslan", role: "Mimar", grad: "linear-gradient(135deg, #43e97b, #38f9d7)" },
  { text: "Çok hızlı teslim etti ve her detayı düşünmüş. Revize taleplerimi sabırla karşıladı.", name: "Tarık Şahin", role: "İnşaat Firması Ortağı", grad: "linear-gradient(135deg, #fa709a, #fee140)" },
  { text: "Kurumsal kimliğimizi tam yansıtan bir site oldu. Artık rakiplerimizden çok daha profesyonel görünüyoruz.", name: "Elif Çelik", role: "Hukuk Bürosu Müdürü", grad: "linear-gradient(135deg, #667eea, #764ba2)" },
];

const PROCESS_STEPS = [
  { step: "01", icon: "target", title: "Strateji ve Planlama", desc: "İhtiyaç analizi, hedef belirleme ve dijital yol haritası çıkarılması." },
  { step: "02", icon: "pen-nib", title: "Tasarım ve Arayüz", desc: "Kurumsal kimliğinize uygun, premium ve kullanıcı dostu UI/UX tasarımı." },
  { step: "03", icon: "code", title: "Yazılım ve Kodlama", desc: "Son teknoloji altyapı ile sıfırdan kodlama ve SEO altyapısı kurulumu." },
  { step: "04", icon: "check-circle", title: "Test ve Optimizasyon", desc: "Mobil uyum, güvenlik taraması ve Google PageSpeed testleri." },
  { step: "05", icon: "rocket", title: "Yayına Alma", desc: "Anahtar teslim canlıya alma ve yönetim paneli eğitimi." },
];

const TECH_STACK = ["Next.js", "React", "Node.js", "PostgreSQL", "Figma", "Vercel", "Supabase", "Tailwind", "TypeScript", "REST API"];

const FALLBACK_PROJECTS = [
  { id: "1", title: "Cafe Roma", category: "Restoran", description: "Modern ve sıcak atmosferi yansıtan, rezervasyon sistemi entegre restoran sitesi.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800", link: "#" },
  { id: "2", title: "TechStore", category: "E-Ticaret", description: "Elektronik ürünler için ödeme altyapılı, tam donanımlı sanal mağaza.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800", link: "#" },
  { id: "3", title: "Güzellik Merkezi", category: "Kurumsal", description: "Premium spa ve güzellik salonu için online randevu sistemli site.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800", link: "#" },
];

function Wave({ flip = false }) {
  return (
    <div className={`wave-divider ${flip ? "flip" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path d="M0,32 C200,80 400,0 600,28 C800,56 1000,8 1200,40 L1200,80 L0,80 Z" />
      </svg>
    </div>
  );
}

export default function PublicHomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

  const rafIdRef = useRef(null);
  const timelineFillRef = useRef(null);
  const timelineContainerRef = useRef(null);

  // ── SMOOTH SCROLL (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function raf(time) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }
    rafIdRef.current = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // ── DATA FETCH
  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(
            data.map((item, idx) => ({
              id: item.id || String(idx),
              title: item.title || "Proje",
              category: item.category || "Referans",
              description: item.description || "",
              image: item.image_url || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
              link: item.url || "#",
            }))
          );
        } else {
          setProjects(FALLBACK_PROJECTS);
        }
      })
      .catch(() => setProjects(FALLBACK_PROJECTS.slice(0, 2)))
      .finally(() => setIsLoading(false));
  }, []);

  // ── THEME (default light theme; toggle available) ──
  useEffect(() => {
    setIsDark(false);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDark);
  }, [isDark]);

  // ── REVEAL ON SCROLL
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("active");
            revealObs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => revealObs.observe(el));
    return () => revealObs.disconnect();
  }, []);

  // ── NAVBAR + SCROLL PROGRESS + PIPELINE FILL — single passive listener
  useEffect(() => {
    let isTicking = false;
    const onScroll = () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          setNavScrolled(window.scrollY > 50);
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          setScrollProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0);
          if (timelineFillRef.current && timelineContainerRef.current) {
            const rect = timelineContainerRef.current.getBoundingClientRect();
            const wh = window.innerHeight;
            if (rect.top < wh / 2) {
              const pct = Math.max(0, Math.min(100, ((wh / 2 - rect.top) / rect.height) * 100));
              timelineFillRef.current.style.height = pct + "%";
            }
          }
          isTicking = false;
        });
        isTicking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`kdv-root ${display.variable} ${body.variable} ${mono.variable}`}>
      {/* Ambient background */}
      <div className="kdv-bg" aria-hidden="true">
        <div className="orb orb-brass" style={{ transform: `translate3d(0, ${scrollProgress * 0.6}px, 0)` }} />
        <div className="orb orb-violet" style={{ transform: `translate3d(0, ${-scrollProgress * 0.4}px, 0)` }} />
        <div className="grain" />
      </div>

      {/* Scroll progress */}
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress / 100})` }} />

      {/* ── NAVBAR ── */}
      <nav className={`navbar ${navScrolled ? "scrolled" : ""}`} role="navigation" aria-label="Ana Navigasyon">
        <div className="nav-container">
          <div className="logo">
            <a href="#" aria-label="Kodiva anasayfa">
              <img src="/favicon.svg" alt="Kodiva" width="30" height="30" />
              kodiva<span>website</span>
            </a>
          </div>
          <div className="nav-links">
            <a href="#projects">Projeler</a>
            <Link href="/hizmetler" className="nav-link-accent">💎 Hizmetler &amp; Fiyatlar</Link>
            <a href="#pricing">Paketler</a>
            <a href="#process">Süreç</a>
            <Link href="/analiz" className="nav-link-violet">⚡ Site Analizi</Link>
            <a href="#contact">İletişim</a>
          </div>
          <div className="nav-actions">
            <button className="theme-toggle" aria-label="Tema değiştir" onClick={() => setIsDark((v) => !v)}>
              <i className={`ph ${isDark ? "ph-sun" : "ph-moon"}`} />
            </button>
            <Link href="/hizmetler" className="btn btn-primary">Paket Satın Al 💳</Link>
            <button className="hamburger" aria-label="Menüyü aç" onClick={() => setMenuOpen((v) => !v)}>
              <i className={`ph ${menuOpen ? "ph-x" : "ph-list"}`} />
            </button>
          </div>
        </div>
        <div className={`mobile-menu ${menuOpen ? "active" : ""}`} role="menu">
          <Link href="/hizmetler" className="mobile-link accent" onClick={() => setMenuOpen(false)}>💎 Hizmetler &amp; Paketler (Shopier)</Link>
          <Link href="/analiz" className="mobile-link violet" onClick={() => setMenuOpen(false)}>⚡ Ücretsiz Site Analizi</Link>
          <a href="#projects" className="mobile-link" onClick={() => setMenuOpen(false)}>Projeler</a>
          <a href="#pricing" className="mobile-link" onClick={() => setMenuOpen(false)}>Paketler</a>
          <a href="#process" className="mobile-link" onClick={() => setMenuOpen(false)}>Süreç</a>
          <a href="#contact" className="mobile-link" onClick={() => setMenuOpen(false)}>İletişim</a>
          <Link href="/hizmetler" className="btn btn-primary mobile-cta" onClick={() => setMenuOpen(false)}>
            Hizmet Paketleri &amp; Güvenli Ödeme 🔒
          </Link>
        </div>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="hero container reveal" aria-label="Hero bölümü">
          <div className="status-chip">
            <span className="live-dot" />
            <span className="status-mono">yeni_musteri: <b>açık</b></span>
          </div>
          <h1 className="hero-title">
            İşletmenizin dijital kimliğini
            <br />
            <span className="highlight">birlikte inşa ederiz.</span>
          </h1>
          <p className="hero-subtitle">
            Farklı sektörlerden işletmeler için hızlı, modern ve mobil uyumlu web siteleri yapıyorum. Şablonla değil — sıfırdan, sizin için kodluyorum.
          </p>
          <div className="hero-cta">
            <Link href="/analiz" className="btn btn-primary btn-large">
              Ücretsiz Site Analizi Yap <i className="ph ph-lightning" />
            </Link>
            <Link href="/hizmetler" className="btn btn-accent btn-large">
              Paketleri İncele &amp; Satın Al <i className="ph ph-shopping-bag" />
            </Link>
            <a href="#projects" className="btn btn-outline btn-large">
              Referanslar <i className="ph ph-arrow-right" />
            </a>
          </div>

          <div className="hero-badges">
            <span><i className="ph-fill ph-shield-check" /> Shopier ile güvenli ödeme</span>
            <span><i className="ph-fill ph-credit-card" /> Tüm kartlara taksit</span>
            <span><i className="ph-fill ph-lightning" /> 24 saatte hızlı başlangıç</span>
          </div>
        </section>

        <Wave />

        {/* ── MARQUEE ── */}
        <div className="marquee-container" aria-hidden="true">
          <div className="marquee-content">
            {[...TECH_STACK, ...TECH_STACK].map((t, i) => (
              <span key={i}>{t}<span className="dot"> ·</span></span>
            ))}
          </div>
        </div>

        {/* ── PROJECTS ── */}
        <section id="projects" className="projects container reveal" aria-label="Projeler">
          <div className="section-header">
            <span className="section-label">// referanslar</span>
            <h2>Öne Çıkan Projeler</h2>
            <p>Yakın zamanda tamamlanan işlerden bazıları</p>
          </div>
          <div className="projects-grid">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                <article key={i} className="project-card skeleton-card">
                  <div className="project-image skeleton" />
                  <div className="project-content">
                    <div className="skeleton skeleton-text" style={{ width: "55%", height: "20px", marginBottom: "10px" }} />
                    <div className="skeleton skeleton-text" style={{ width: "100%", height: "13px", marginBottom: "6px" }} />
                    <div className="skeleton skeleton-text" style={{ width: "80%", height: "13px", marginBottom: "20px" }} />
                    <div className="skeleton skeleton-text" style={{ width: "100px", height: "14px" }} />
                  </div>
                </article>
              ))
              : projects.length > 0
                ? projects.map((p) => (
                  <article key={p.id} className="project-card">
                    <div className="project-image" style={{ backgroundImage: `url('${p.image}')` }}>
                      <span className="project-category">{p.category}</span>
                    </div>
                    <div className="project-content">
                      <h3 className="project-title">{p.title}</h3>
                      <p className="project-desc">{p.description}</p>
                      <a href={p.link} className="project-link" target="_blank" rel="noreferrer">
                        Siteyi Görüntüle <i className="ph ph-arrow-right" />
                      </a>
                    </div>
                  </article>
                ))
                : (
                  <div className="empty-state">
                    <p>Yakında yeni projeler eklenecektir.</p>
                  </div>
                )}
          </div>
        </section>

        {/* ── WHY ME (FLOW GRID) ── */}
        <section id="why-me" className="why-me container reveal" aria-label="Neden ben">
          <div className="section-header">
            <span className="section-label">// değer önerimiz</span>
            <h2>Neden KODİVA?</h2>
            <p>Sıradan bir ajans değiliz. Her proje özel, her çözüm benzersiz.</p>
          </div>
          <div className="flow-grid">
            <div className="flow-item flow-large glass-panel">
              <div className="feature-icon"><i className="ph ph-lightning" /></div>
              <h3>Işık Hızında Performans</h3>
              <p>Sitenizin yüklenme süresini saniyelerin altına indiriyoruz. 100/100 Google PageSpeed skoru birincil hedefimizdir. Rakipleriniz yüklenirken siz zaten karşılanmış oluyorsunuz.</p>
            </div>
            <div className="flow-item glass-panel">
              <div className="feature-icon"><i className="ph ph-device-mobile" /></div>
              <h3>Mobil Öncelikli</h3>
              <p>Kullanıcıların %80'i telefonda. Siteniz uygulamadan ayırt edilemez.</p>
            </div>
            <div className="flow-item glass-panel">
              <div className="feature-icon"><i className="ph ph-magnifying-glass" /></div>
              <h3>Google'da Üst Sıralar</h3>
              <p>Teknik SEO ve hız optimizasyonuyla rakiplerinizin önünde görünün.</p>
            </div>
            <div className="flow-item glass-panel">
              <div className="feature-icon"><i className="ph ph-shield-check" /></div>
              <h3>Güvenli Altyapı</h3>
              <p>SSL, veri şifreleme ve düzenli yedekleme ile verileriniz korumalı.</p>
            </div>
            <div className="flow-item glass-panel">
              <div className="feature-icon"><i className="ph ph-currency-circle-dollar" /></div>
              <h3>Bütçe Dostu</h3>
              <p>Premium kalite, kurumsal fiyatların çok altında. Ekstra masraf yok.</p>
            </div>
          </div>

          <Suspense fallback={null}>
            <ROICalculator />
          </Suspense>
        </section>

        <Wave flip />

        {/* ── PRICING ── */}
        <section id="pricing" className="pricing container reveal pricing-transparent" aria-label="Fiyatlandırma">
          <div className="section-header">
            <span className="section-label">// paketler</span>
            <h2>Hizmet Paketleri</h2>
            <p>İhtiyacınıza ve bütçenize en uygun çözümü seçin</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card glass-panel">
              <h3 className="pricing-title">Başlangıç</h3>
              <p className="pricing-desc">Küçük işletmeler ve kişisel portfolyolar için şık tek sayfalık yapı.</p>
              <div className="pricing-price">
                <span className="pricing-price-amount">9.500</span>
                <span className="pricing-price-cur">₺</span>
              </div>
              <div className="pricing-price-note">+ KDV / 1 Yıl Destek</div>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle" /> Tek Sayfa (One-Page) Tasarım</li>
                <li><i className="ph-fill ph-check-circle" /> Mobil Uyumlu (Responsive)</li>
                <li><i className="ph-fill ph-check-circle" /> İletişim Formu</li>
                <li><i className="ph-fill ph-check-circle" /> Temel SEO Altyapısı</li>
              </ul>
              <a href="/api/shopier/checkout?product=starter" className="btn btn-primary pricing-btn">Paket Satın Al <i className="ph ph-shopping-bag" /></a>
            </div>
            <div className="pricing-card glass-panel popular">
              <div className="popular-badge">EN ÇOK TERCİH</div>
              <h3 className="pricing-title">Kurumsal</h3>
              <p className="pricing-desc">Şirketler ve markalar için çok sayfalı, dinamik ve kapsamlı web sitesi.</p>
              <div className="pricing-price">
                <span className="pricing-price-amount">18.500</span>
                <span className="pricing-price-cur">₺</span>
              </div>
              <div className="pricing-price-note">+ KDV / 1 Yıl Destek</div>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle" /> Çok Sayfalı Premium Tasarım</li>
                <li><i className="ph-fill ph-check-circle" /> Yönetim Paneli</li>
                <li><i className="ph-fill ph-check-circle" /> Gelişmiş SEO &amp; Hız</li>
                <li><i className="ph-fill ph-check-circle" /> 1 Yıl Ücretsiz Domain &amp; Hosting</li>
              </ul>
              <a href="/api/shopier/checkout?product=corporate" className="btn btn-accent pricing-btn">Paket Satın Al <i className="ph ph-shopping-bag" /></a>
            </div>
            <div className="pricing-card glass-panel">
              <h3 className="pricing-title">E-Ticaret</h3>
              <p className="pricing-desc">Ürünlerinizi internetten güvenle satabileceğiniz sanal mağaza.</p>
              <div className="pricing-price">
                <span className="pricing-price-amount">34.000</span>
                <span className="pricing-price-cur">₺</span>
              </div>
              <div className="pricing-price-note">+ KDV / 1 Yıl Destek</div>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle" /> Sınırsız Ürün ve Kategori</li>
                <li><i className="ph-fill ph-check-circle" /> Güvenli Ödeme (Sanal POS)</li>
                <li><i className="ph-fill ph-check-circle" /> Kargo ve Sipariş Takibi</li>
                <li><i className="ph-fill ph-check-circle" /> Sepet Kurtarma</li>
              </ul>
              <a href="/api/shopier/checkout?product=ecommerce" className="btn btn-primary pricing-btn">Paket Satın Al <i className="ph ph-shopping-bag" /></a>
            </div>
          </div>

          {/* ── GÜVENLİ ÖDEME — büyük Shopier logosu + güven vurgusu ── */}
          <div className="secure-strip">
            <div className="secure-strip-logo">
              <img src="/shopier-logo.svg" alt="Shopier" width="150" height="43" loading="lazy" />
            </div>
            <div className="secure-strip-divider" />
            <div className="secure-strip-content">
              <span className="secure-strip-badge"><i className="ph-fill ph-shield-check" /> 256-bit SSL & 3D Secure</span>
              <h3 className="secure-strip-title">GÜVENLİ ÖDEME</h3>
              <p className="secure-strip-sub">Shopier altyapısı ile tüm kartlara <strong>taksit</strong> imkanı</p>
            </div>
          </div>
        </section>

        {/* ── PROCESS (PIPELINE) ── */}
        <section id="process" className="process container reveal" aria-label="Süreç">
          <div className="section-header">
            <span className="section-label">// nasıl çalışıyoruz</span>
            <h2>Fikrinizden Yayına</h2>
            <p>Şeffaf ve hızlı 5 adımlık sürecimiz</p>
          </div>
          <div className="pipeline-container" ref={timelineContainerRef}>
            <div className="pipeline-line" />
            <div className="pipeline-fill" ref={timelineFillRef} />
            {PROCESS_STEPS.map((s, i) => (
              <div key={i} className={`pipeline-item ${i % 2 === 0 ? "left" : "right"}`}>
                <div className="pipeline-dot">
                  <i className={`ph ph-${s.icon}`} />
                </div>
                <div className="pipeline-content">
                  <div className="glass-panel">
                    <span className="step-number">STEP_{s.step}</span>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Wave />

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="testimonials container reveal" aria-label="Referanslar">
          <div className="section-header">
            <span className="section-label">// müşteriler</span>
            <h2>Ne Dediler?</h2>
            <p>Birlikte çalıştığım müşterilerin gerçek deneyimleri</p>
          </div>
          <div className="testimonials-marquee-container">
            <div className="testimonials-marquee-content">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div key={i} className="testimonial-card glass-panel">
                  <i className="ph-fill ph-quotes testimonial-quote-icon" />
                  <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" style={{ background: t.grad }} />
                    <div>
                      <h4>{t.name}</h4>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="faq container reveal" aria-label="Sık sorulan sorular">
          <div className="section-header">
            <span className="section-label">// sss</span>
            <h2>Sıkça Sorulan Sorular</h2>
            <p>Aklınızdaki soru işaretlerini giderelim</p>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item glass-panel ${openFaq === i ? "open" : ""}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  {faq.q}
                  <i className={`ph ${openFaq === i ? "ph-caret-up" : "ph-caret-down"}`} />
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="contact container reveal" aria-label="İletişim">
          <div className="contact-card glass-panel">
            <div className="contact-content">
              <h2>Projenizi Hayata Geçirelim</h2>
              <p>İşletmenizi dijitale taşımak veya mevcut sitenizi yenilemek için hemen iletişime geçin. İlk görüşme tamamen ücretsiz.</p>
              <div className="contact-buttons">
                <a href="https://wa.me/905555555555" target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                  <i className="ph-fill ph-whatsapp-logo" /> WhatsApp&apos;tan Yazın
                </a>
                <a href="mailto:hello@kodiva.com" className="btn btn-email">
                  <i className="ph-fill ph-envelope" /> E-Posta Gönderin
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer role="contentinfo">
        <div className="footer-container container">
          <div className="footer-brand">
            <img src="/favicon.svg" alt="Kodiva Logo" width="22" height="22" />
            <span>kodiva<span>website</span> &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Instagram" aria-disabled="true" tabIndex={-1}><i className="ph ph-instagram-logo" /></a>
            <a href="#" aria-label="LinkedIn" aria-disabled="true" tabIndex={-1}><i className="ph ph-linkedin-logo" /></a>
            <a href="#" aria-label="GitHub" aria-disabled="true" tabIndex={-1}><i className="ph ph-github-logo" /></a>
          </div>
          <div className="footer-legal">
            <Link href="/gizlilik-politikasi" className="legal-link">Gizlilik Politikası</Link>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a href="https://wa.me/905555555555" target="_blank" rel="noreferrer" className="floating-wa" aria-label="WhatsApp'tan Ulaşın">
        <i className="ph ph-whatsapp" />
      </a>

      {/* ── FLOATING SCARCITY BANNER ── */}
      {
        bannerOpen && (
          <div className="floating-banner">
            <button className="floating-banner-close" aria-label="Kapat" onClick={() => setBannerOpen(false)}>
              <i className="ph ph-x" />
            </button>
            <div className="floating-banner-emoji">🔥</div>
            <div>
              <strong>Ağustos Ayına Özel Fırsat</strong>
              <p>Sadece <strong>3 işletme</strong> için geçerli indirimli başlangıç paketi! Kontenjan dolmadan yerinizi ayırtın.</p>
            </div>
          </div>
        )
      }

      <Suspense fallback={null}>
        <PublicChatWidget />
      </Suspense>

      

      
    </div>
  );
}
