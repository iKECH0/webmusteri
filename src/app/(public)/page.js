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

      <style jsx global>{`
        body.dark-theme .kdv-root {
          --bg: #0a0d13;
          --bg-2: #0e1219;
          --surface: rgba(255, 255, 255, 0.045);
          --surface-strong: rgba(255, 255, 255, 0.07);
          --border: rgba(255, 255, 255, 0.09);
          --text: #f3f1ec;
          --text-muted: #9aa2b4;
          --shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.6);
        }
        body:not(.dark-theme) .kdv-root {
          --bg: #f7f4ee;
          --bg-2: #f1ede4;
          --surface: rgba(20, 16, 10, 0.035);
          --surface-strong: rgba(20, 16, 10, 0.06);
          --border: rgba(20, 16, 10, 0.09);
          --text: #1c1a16;
          --text-muted: #6b6459;
          --shadow: 0 24px 60px -24px rgba(20, 16, 10, 0.18);
        }
      `}</style>

      <style jsx>{`
        .kdv-root {
          --brass: #c68a4a;
          --brass-dark: #a9702f;
          --violet: #8b7cf6;
          --violet-dark: #6d5cd6;
          --signal: #3ddc97;
          --flame: #f2665f;
          --radius-sm: 12px;
          --radius-md: 18px;
          --radius-lg: 28px;
          --radius-xl: 36px;
          font-family: var(--font-body), -apple-system, "Segoe UI", sans-serif;
          background: var(--bg);
          color: var(--text);
          position: relative;
          overflow-x: clip;
          min-height: 100vh;
        }
        .kdv-root :global(h1),
        .kdv-root :global(h2),
        .kdv-root :global(h3),
        .kdv-root :global(h4) {
          font-family: var(--font-display), "Space Grotesk", sans-serif;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .kdv-root :global(*) { box-sizing: border-box; }
        .kdv-root :global(a) { text-decoration: none; color: inherit; }
        .kdv-root :global(ul) { list-style: none; margin: 0; padding: 0; }
        .kdv-root :global(button) { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }

        .container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }

        /* ── background atmosphere ── */
        .kdv-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; filter: blur(48px); opacity: 0.4; will-change: transform; }
        .orb-brass { width: 480px; height: 480px; top: -140px; right: -100px; background: radial-gradient(circle, var(--brass), transparent 72%); }
        .orb-violet { width: 420px; height: 420px; top: 40vh; left: -140px; background: radial-gradient(circle, var(--violet), transparent 72%); }
        .grain { position: absolute; inset: 0; opacity: 0.025; background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 4px 4px; }

        main, nav, footer, .floating-wa, .floating-banner { position: relative; z-index: 1; }

        /* ── scroll progress ── */
        .scroll-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--brass), var(--violet)); transform-origin: left; z-index: 200; }

        /* ── reveal ── */
        :global(.reveal) { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        :global(.reveal.active) { opacity: 1; transform: translateY(0); }

        /* ── glass panel ── */
        .glass-panel { background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1); border-radius: var(--radius-md); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }

        /* ── navbar ── */
        .navbar { position: sticky; top: 0; z-index: 100; padding: 18px 0; transition: background 0.3s ease, padding 0.3s ease, border-color 0.3s ease; border-bottom: 1px solid transparent; }
        .navbar.scrolled { background: rgba(0,0,0,0.1); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 12px 0; border-color: rgba(0,0,0,0.1); }
        .nav-container { max-width: 1160px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .logo a { display: flex; align-items: center; gap: 10px; font-family: var(--font-display), sans-serif; font-weight: 700; font-size: 19px; }
        .logo span { color: var(--brass); }
        .nav-links { display: flex; align-items: center; gap: 26px; font-size: 14.5px; font-weight: 600; }
        .nav-links a { opacity: 0.85; transition: opacity 0.2s; }
        .nav-links a:hover { opacity: 1; }
        .nav-link-accent { color: var(--brass) !important; font-weight: 800 !important; opacity: 1 !important; }
        .nav-link-violet { color: var(--violet) !important; font-weight: 800 !important; opacity: 1 !important; }
        .nav-actions { display: flex; align-items: center; gap: 14px; }
        .theme-toggle { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border); display: grid; place-items: center; font-size: 17px; transition: transform 0.2s; }
        .theme-toggle:hover { transform: rotate(20deg); }
        .hamburger { display: none; font-size: 22px; }

        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px; border-radius: 999px; font-weight: 700; font-size: 14px; transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; white-space: nowrap; }
        .btn:hover { transform: translateY(-2px); }
        .btn-large { padding: 15px 26px; font-size: 15px; }
        .btn-primary { background: linear-gradient(135deg, var(--brass), var(--brass-dark)); color: #fff !important; box-shadow: 0 10px 26px -8px rgba(0,0,0,0.1); }
        .btn-accent { background: linear-gradient(135deg, var(--violet), var(--violet-dark)); color: #fff !important; box-shadow: 0 10px 26px -8px rgba(0,0,0,0.1); }
        .btn-outline { border: 1.5px solid var(--border); color: var(--text); }
        .btn-outline:hover { border-color: var(--brass); }
        .btn-whatsapp { background: #25d366; color: #04250f; }
        .btn-email { background: var(--surface-strong); border: 1px solid var(--border); color: var(--text); }

        .mobile-menu { display: none; }

        /* ── hero ── */
        .hero { padding: 96px 24px 56px; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .status-chip { display: inline-flex; align-items: center; gap: 9px; padding: 7px 16px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.1); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); margin-bottom: 26px; }
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--signal); box-shadow: 0 0 0 0 rgba(61, 220, 151, 0.6); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(61, 220, 151, 0.55); } 70% { box-shadow: 0 0 0 8px rgba(61, 220, 151, 0); } 100% { box-shadow: 0 0 0 0 rgba(61, 220, 151, 0); } }
        .status-mono { font-family: var(--font-mono), monospace; font-size: 12.5px; color: var(--text-muted); }
        .status-mono b { color: var(--signal); }

        .hero-title { font-size: clamp(38px, 6vw, 64px); line-height: 1.08; font-weight: 700; max-width: 820px; }
        .highlight { background: linear-gradient(100deg, var(--brass), var(--violet) 70%); -webkit-background-clip: text; background-clip: text; color: transparent; position: relative; }
        .hero-subtitle { margin: 22px 0 36px; max-width: 560px; font-size: 17px; line-height: 1.65; color: var(--text-muted); }
        .hero-cta { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
        .hero-badges { display: flex; justify-content: center; gap: 22px; flex-wrap: wrap; margin-top: 30px; font-size: 13px; font-weight: 600; color: var(--text-muted); }
        .hero-badges span { display: flex; align-items: center; gap: 6px; }
        .hero-badges i { color: var(--signal); font-size: 15px; }

        /* ── wave divider (Wave is its own component, so these must be :global) ── */
        :global(.wave-divider) { line-height: 0; margin-top: -1px; }
        :global(.wave-divider svg) { width: 100%; height: 60px; display: block; }
        :global(.wave-divider path) { fill: var(--surface); }
        :global(.wave-divider.flip) { transform: scaleY(-1); }

        /* ── marquee ── */
        .marquee-container { overflow: hidden; padding: 20px 0; border-top: 1px solid rgba(0,0,0,0.1); border-bottom: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.1); }
        .marquee-content { display: flex; gap: 10px; width: max-content; animation: scroll-left 32s linear infinite; font-family: var(--font-mono), monospace; font-size: 14px; color: var(--text-muted); }
        .marquee-content .dot { color: var(--brass); }
        @keyframes scroll-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* ── section header ── */
        .section-header { text-align: center; max-width: 560px; margin: 0 auto 48px; }
        .section-label { font-family: var(--font-mono), monospace; font-size: 12.5px; font-weight: 600; color: var(--brass); letter-spacing: 0.02em; }
        .section-header h2 { font-size: clamp(28px, 4vw, 38px); margin: 10px 0 12px; }
        .section-header p { color: var(--text-muted); font-size: 15.5px; line-height: 1.6; }

        section.container { padding: 88px 24px; content-visibility: auto; contain-intrinsic-size: auto 700px; }

        /* ── projects ── */
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .project-card { border-radius: var(--radius-md); overflow: hidden; background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .project-card:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
        .project-image { height: 200px; background-size: cover; background-position: center; position: relative; }
        .project-category { position: absolute; top: 14px; left: 14px; background: rgba(10, 13, 19, 0.75); color: #fff; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 999px; }
        .project-content { padding: 22px; }
        .project-title { font-size: 19px; margin-bottom: 8px; }
        .project-desc { font-size: 14px; color: var(--text-muted); line-height: 1.55; margin-bottom: 16px; }
        .project-link { font-weight: 700; font-size: 14px; color: var(--brass); display: inline-flex; gap: 6px; align-items: center; }
        .skeleton { background: linear-gradient(90deg, var(--surface) 25%, var(--surface-strong) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
        .skeleton-card .project-image { border-radius: 0; }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .empty-state { grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--text-muted); }

        /* ── flow grid (why-me) ── */
        .flow-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: minmax(150px, auto); gap: 18px; margin-bottom: 40px; }
        .flow-item { padding: 26px; transition: transform 0.3s ease, border-color 0.3s ease; }
        .flow-item:hover { transform: translateY(-4px); border-color: var(--brass); }
        .flow-large { grid-column: span 2; grid-row: span 2; display: flex; flex-direction: column; justify-content: center; }
        .flow-item:nth-child(2) { grid-column: span 2; }
        .flow-item:nth-child(3) { grid-column: span 2; }
        .flow-item:nth-child(4) { grid-column: span 2; }
        .flow-item:nth-child(5) { grid-column: span 2; }
        .feature-icon { width: 46px; height: 46px; border-radius: 12px; background: linear-gradient(135deg, var(--brass), var(--violet)); display: grid; place-items: center; font-size: 21px; color: #fff; margin-bottom: 16px; }
        .flow-item h3 { font-size: 18px; margin-bottom: 8px; }
        .flow-item p { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

        /* ── pricing ── */
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .pricing-card { padding: 34px 28px; position: relative; transition: transform 0.3s ease; background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        .pricing-card:hover { transform: translateY(-6px); }
        .pricing-card.popular { border-color: var(--brass); box-shadow: 0 20px 50px -20px rgba(0,0,0,0.1); }
        .popular-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--brass), var(--brass-dark)); color: #fff; font-size: 11px; font-weight: 800; padding: 5px 16px; border-radius: 999px; letter-spacing: 0.03em; }
        .pricing-title { font-size: 21px; margin-bottom: 10px; }
        .pricing-desc { font-size: 14px; color: var(--text-muted); line-height: 1.55; margin-bottom: 22px; min-height: 44px; }
        .pricing-features { display: flex; flex-direction: column; gap: 12px; margin-bottom: 26px; }
        .pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; }
        .pricing-features i { color: var(--signal); font-size: 17px; flex-shrink: 0; }
        .pricing-btn { width: 100%; justify-content: center; }
        .pricing-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
        .pricing-price-amount { font-size: 38px; font-weight: 900; letter-spacing: -0.02em; line-height: 1; }
        .pricing-price-cur { font-size: 20px; font-weight: 700; color: var(--text-muted); }
        .pricing-price-note { font-size: 12.5px; color: var(--text-muted); font-weight: 600; margin-bottom: 22px; }

        /* ── secure strip (Shopier + GÜVENLİ ÖDEME trust bar) ── */
        .secure-strip { margin-top: 44px; display: flex; align-items: center; justify-content: center; gap: 28px; padding: 26px 34px; border-radius: var(--radius-lg); background: transparent; border: none; box-shadow: none; }
        .secure-strip-logo { flex-shrink: 0; display: flex; align-items: center; padding: 10px 18px; border-radius: 14px; background: #fff; box-shadow: 0 8px 24px -10px rgba(0,0,0,0.35); }
        .secure-strip-logo img { display: block; height: 40px; width: auto; }
        .secure-strip-divider { width: 1px; align-self: stretch; background: linear-gradient(180deg, transparent, var(--border), transparent); }
        .secure-strip-content { display: flex; flex-direction: column; gap: 4px; text-align: left; }
        .secure-strip-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; letter-spacing: 0.04em; color: var(--signal); }
        .secure-strip-badge i { font-size: 15px; }
        .secure-strip-title { font-size: clamp(24px, 3vw, 32px); font-weight: 800; letter-spacing: -0.01em; background: linear-gradient(100deg, var(--brass), var(--violet)); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1.1; }
        .secure-strip-sub { font-size: 14px; color: var(--text-muted); line-height: 1.5; }
        .secure-strip-sub strong { color: var(--text); font-weight: 800; }

        /* ── pipeline (process) ── */
        .pipeline-container { position: relative; max-width: 760px; margin: 0 auto; padding: 20px 0; }
        .pipeline-line, .pipeline-fill { position: absolute; left: 50%; top: 0; width: 2px; transform: translateX(-50%); }
        .pipeline-line { height: 100%; background: var(--border); }
        .pipeline-fill { height: 0%; background: linear-gradient(180deg, var(--brass), var(--violet)); transition: height 0.1s linear; }
        .pipeline-item { position: relative; display: grid; grid-template-columns: 1fr 50px 1fr; gap: 0 28px; margin-bottom: 34px; align-items: center; }
        .pipeline-dot { grid-column: 2; width: 44px; height: 44px; border-radius: 50%; background: var(--bg); border: 2px solid var(--brass); display: grid; place-items: center; font-size: 18px; color: var(--brass); z-index: 2; }
        .pipeline-content { grid-column: 1; }
        .pipeline-item.right .pipeline-content { grid-column: 3; }
        .pipeline-content .glass-panel { padding: 22px 24px; }
        .step-number { font-family: var(--font-mono), monospace; font-size: 12px; color: var(--violet); font-weight: 700; }
        .pipeline-content h4 { font-size: 17px; margin: 8px 0 6px; }
        .pipeline-content p { font-size: 13.5px; color: var(--text-muted); line-height: 1.55; }

        /* ── testimonials ── */
        .testimonials-marquee-container { overflow: hidden; }
        .testimonials-marquee-content { display: flex; gap: 20px; width: max-content; animation: scroll-left 55s linear infinite; }
        .testimonial-card { width: 340px; padding: 26px; flex-shrink: 0; }
        .testimonial-quote-icon { font-size: 26px; color: var(--brass); opacity: 0.5; }
        .testimonial-text { font-size: 14.5px; line-height: 1.65; margin: 14px 0 22px; }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .testimonial-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
        .testimonial-author h4 { font-size: 14.5px; }
        .testimonial-author span { font-size: 12.5px; color: var(--text-muted); }

        /* ── faq ── */
        .faq-list { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
        .faq-item button { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 20px 22px; font-weight: 700; font-size: 15.5px; text-align: left; }
        .faq-item.open { border-color: var(--brass); }
        .faq-answer { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.35s ease; }
        .faq-item.open .faq-answer { grid-template-rows: 1fr; }
        .faq-answer-inner { overflow: hidden; }
        .faq-item.open .faq-answer-inner { padding: 0 22px 20px; }
        .faq-answer-inner { font-size: 14.5px; color: var(--text-muted); line-height: 1.6; padding: 0 22px; }

        /* ── contact ── */
        .contact-card { padding: 60px 40px; text-align: center; }
        .contact-content h2 { font-size: clamp(26px, 3.5vw, 36px); margin-bottom: 14px; }
        .contact-content p { color: var(--text-muted); max-width: 480px; margin: 0 auto 30px; line-height: 1.6; }
        .contact-buttons { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

        /* ── footer ── */
        footer { border-top: 1px solid var(--border); padding: 30px 0; }
        .footer-container { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; }
        .footer-brand span span { color: var(--brass); }
        .footer-social { display: flex; gap: 16px; font-size: 18px; opacity: 0.75; }
        .legal-link { font-size: 13.5px; color: var(--text-muted); }

        /* ── floating whatsapp ── */
        .floating-wa { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: #25d366; display: grid; place-items: center; font-size: 27px; color: #04250f; box-shadow: 0 12px 30px -8px rgba(37, 211, 102, 0.55); z-index: 150; }

        /* ── floating banner ── */
        .floating-banner { position: fixed; bottom: 20px; left: 20px; z-index: 150; background: var(--bg-2); border: 1px solid var(--flame); border-radius: var(--radius-md); padding: 18px 20px 18px 16px; box-shadow: var(--shadow); max-width: 300px; display: flex; gap: 12px; align-items: flex-start; animation: slideUp 0.5s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .floating-banner-emoji { font-size: 22px; flex-shrink: 0; }
        .floating-banner strong { color: var(--flame); display: block; margin-bottom: 4px; font-size: 14px; }
        .floating-banner p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.45; }
        .floating-banner-close { position: absolute; top: 8px; right: 8px; width: 22px; height: 22px; display: grid; place-items: center; opacity: 0.6; }
        .floating-banner-close:hover { opacity: 1; }

        /* ── responsive ── */
        @media (max-width: 900px) {
          .flow-grid { grid-template-columns: repeat(2, 1fr); }
          .flow-large { grid-column: span 2; }
          .pricing-grid { grid-template-columns: 1fr; }
          .pipeline-item, .pipeline-item.right { grid-template-columns: 40px 1fr; }
          .pipeline-dot { grid-column: 1; }
          .pipeline-content, .pipeline-item.right .pipeline-content { grid-column: 2; }
          .pipeline-line, .pipeline-fill { left: 20px; }
        }
        @media (max-width: 760px) {
          .nav-links { display: none; }
          .nav-actions .btn-primary { display: none; }
          .hamburger { display: block; }
          .mobile-menu { display: flex; flex-direction: column; gap: 4px; position: fixed; top: 0; right: -100%; width: 78%; max-width: 320px; height: 100vh; background: var(--bg-2); border-left: 1px solid var(--border); padding: 90px 26px 26px; transition: right 0.3s ease; z-index: 99; }
          .mobile-menu.active { right: 0; }
          .mobile-link { padding: 14px 4px; font-weight: 600; border-bottom: 1px solid var(--border); }
          .mobile-link.accent { color: var(--brass); font-weight: 800; }
          .mobile-link.violet { color: var(--violet); font-weight: 800; }
          .mobile-cta { justify-content: center; margin-top: 16px; }
          .flow-grid { grid-template-columns: 1fr; }
          .flow-large, .flow-item:nth-child(n) { grid-column: span 1; }
          .secure-strip { flex-direction: column; text-align: center; gap: 16px; padding: 24px 20px; }
          .secure-strip-divider { width: 60px; height: 1px; align-self: center; background: linear-gradient(90deg, transparent, var(--border), transparent); }
          .secure-strip-content { text-align: center; align-items: center; }
          section.container { padding: 64px 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.reveal), .orb, .live-dot { animation: none !important; transition: none !important; }
          .testimonials-marquee-content { animation-play-state: paused !important; }
          .marquee-content { animation-play-state: paused !important; }
        }
      `}</style>
    </div>
  );
}
