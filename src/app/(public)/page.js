"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Lenis from "lenis";

export default function PublicHomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const rafIdRef = useRef(null);

  const faqs = [
    { q: "Süreç ne kadar sürüyor?", a: "Projenin kapsamına bağlı olarak genellikle 1–3 hafta içerisinde sitenizi anahtar teslim yayına alıyoruz." },
    { q: "Alan adı ve hosting dahil mi?", a: "Evet, tüm paketlerimizde ilk yıl alan adı ve yüksek hızlı sunucu (hosting) ücretsiz olarak sunulmaktadır." },
    { q: "Daha sonra kendi sitemi güncelleyebilir miyim?", a: "Kesinlikle! Size özel hazırladığımız yönetim paneli sayesinde metinleri ve görselleri kolayca değiştirebilirsiniz." },
    { q: "Arama motorlarında (Google) üst sırada çıkar mıyım?", a: "Sitenizi en güncel SEO kurallarına göre kodluyoruz. Bu sayede organik yükselişiniz garanti altına alınır." },
  ];

  const testimonials = [
    { text: "Sitemiz eski ve yavaştı. Kodiva ile çalıştıktan sonra hem harika bir tasarıma kavuştuk hem de Google'da ilk sayfaya çıktık.", name: "Ahmet Yılmaz", role: "Cafe Roma İşletmecisi", grad: "linear-gradient(135deg, #f6d365, #fda085)" },
    { text: "Randevu sistemimizi entegre eden muhteşem bir site yaptı. Müşterilerimiz artık telefonla aramak yerine online rezervasyon yapıyor.", name: "Selin Kaya", role: "Güzellik Uzmanı", grad: "linear-gradient(135deg, #a18cd1, #fbc2eb)" },
    { text: "E-ticaret sitemizi açtıktan sonra satışlarımız %40 arttı. Hem mobil hem masaüstünde mükemmel çalışıyor.", name: "Murat Demir", role: "TechStore Sahibi", grad: "linear-gradient(135deg, #4facfe, #00f2fe)" },
    { text: "Portföy sitemiz artık benim adıma iş yapıyor. Müşteriler sitemi görünce hemen iletişime geçiyor.", name: "Zeynep Arslan", role: "Mimar", grad: "linear-gradient(135deg, #43e97b, #38f9d7)" },
    { text: "Çok hızlı teslim etti ve her detayı düşünmüş. Revize taleplerimi sabırla karşıladı.", name: "Tarık Şahin", role: "İnşaat Firması Ortağı", grad: "linear-gradient(135deg, #fa709a, #fee140)" },
    { text: "Kurumsal kimliğimizi tam yansıtan bir site oldu. Artık rakiplerimizden çok daha profesyonel görünüyoruz.", name: "Elif Çelik", role: "Hukuk Bürosu Müdürü", grad: "linear-gradient(135deg, #667eea, #764ba2)" },
  ];

  // ── SMOOTH SCROLL (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    rafIdRef.current = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    });

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
          setProjects(data.map((item, idx) => ({
            id: item.id || String(idx),
            title: item.title || "Proje",
            category: item.category || "Referans",
            description: item.description || "",
            image: item.image_url || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
            link: item.url || "#",
          })));
        } else {
          setProjects([
            { id: "1", title: "Cafe Roma", category: "Restoran", description: "Modern ve sıcak atmosferi yansıtan, rezervasyon sistemi entegre restoran sitesi.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800", link: "#" },
            { id: "2", title: "TechStore", category: "E-Ticaret", description: "Elektronik ürünler için ödeme altyapılı, tam donanımlı sanal mağaza.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800", link: "#" },
            { id: "3", title: "Güzellik Merkezi", category: "Kurumsal", description: "Premium spa ve güzellik salonu için online randevu sistemli site.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800", link: "#" },
          ]);
        }
      })
      .catch(() => {
        setProjects([
          { id: "1", title: "Cafe Roma", category: "Restoran", description: "Modern ve sıcak atmosferi yansıtan restoran sitesi.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800", link: "#" },
          { id: "2", title: "TechStore", category: "E-Ticaret", description: "Elektronik ürünler için full özellikli mağaza.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800", link: "#" },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── ALL SCROLL/INTERACTION EFFECTS
  useEffect(() => {
    // Footer year
    const yearEl = document.getElementById("current-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Theme toggle
    const themeBtn = document.getElementById("theme-toggle");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (systemDark) document.body.classList.add("dark-theme");

    const handleThemeToggle = () => {
      document.body.classList.toggle("dark-theme");
    };
    if (themeBtn) themeBtn.addEventListener("click", handleThemeToggle);

    // Mobile menu
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    const toggleMenu = () => {
      mobileMenu?.classList.toggle("active");
      const icon = hamburger?.querySelector("i");
      if (mobileMenu?.classList.contains("active")) {
        icon?.classList.replace("ph-list", "ph-x");
      } else {
        icon?.classList.replace("ph-x", "ph-list");
      }
    };
    hamburger?.addEventListener("click", toggleMenu);
    document.querySelectorAll(".mobile-link").forEach((l) =>
      l.addEventListener("click", toggleMenu)
    );

    // IntersectionObserver for reveal
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

    // Timeline progress + navbar + scroll progress — single passive listener
    const timelineLine = document.querySelector(".process-timeline-progress-fill");
    const timelineContainer = document.querySelector(".process-timeline-container");
    let isTicking = false;

    const onScroll = () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          // Navbar
          document.querySelector(".navbar")?.classList.toggle("scrolled", window.scrollY > 50);
          // Scroll progress
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          setScrollProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0);
          // Timeline
          if (timelineLine && timelineContainer) {
            const rect = timelineContainer.getBoundingClientRect();
            const wh = window.innerHeight;
            if (rect.top < wh / 2) {
              const pct = Math.max(0, Math.min(100, ((wh / 2 - rect.top) / rect.height) * 100));
              timelineLine.style.height = pct + "%";
            }
          }
          isTicking = false;
        });
        isTicking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Custom cursor — only desktop
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    let cursorAnimFrame;
    if (cursor && follower && window.innerWidth > 768) {
      let mx = 0, my = 0, fx = 0, fy = 0;
      const onMouse = (e) => { mx = e.clientX; my = e.clientY; };
      document.addEventListener("mousemove", onMouse, { passive: true });

      const animCursor = () => {
        fx += (mx - fx) * 0.18;
        fy += (my - fy) * 0.18;
        cursor.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
        follower.style.transform = `translate3d(${fx - 18}px, ${fy - 18}px, 0)`;
        cursorAnimFrame = requestAnimationFrame(animCursor);
      };
      animCursor();

      const hover = () => { cursor.classList.add("hover"); follower.classList.add("hover"); };
      const unhover = () => { cursor.classList.remove("hover"); follower.classList.remove("hover"); };
      document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("mouseenter", hover);
        el.addEventListener("mouseleave", unhover);
      });

      return () => {
        themeBtn?.removeEventListener("click", handleThemeToggle);
        hamburger?.removeEventListener("click", toggleMenu);
        window.removeEventListener("scroll", onScroll);
        revealObs.disconnect();
        document.removeEventListener("mousemove", onMouse);
        cancelAnimationFrame(cursorAnimFrame);
      };
    }

    return () => {
      themeBtn?.removeEventListener("click", handleThemeToggle);
      hamburger?.removeEventListener("click", toggleMenu);
      window.removeEventListener("scroll", onScroll);
      revealObs.disconnect();
    };
  }, []);

  return (
    <>
      {/* Custom Cursor */}
      <div className="custom-cursor" ref={cursorRef} />
      <div className="custom-cursor-follower" ref={followerRef} />

      {/* Grid background */}
      <div className="background-pattern" />

      {/* Scroll progress */}
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress / 100})` }} />

      {/* ── NAVBAR ── */}
      <nav className="navbar" role="navigation" aria-label="Ana Navigasyon">
        <div className="nav-container">
          <div className="logo">
            <a href="#" aria-label="Kodiva anasayfa">
              <img src="/favicon.svg" alt="Kodiva" width="32" height="32" />
              kodiva<span>website</span>
            </a>
          </div>
          <div className="nav-links">
            <a href="#projects">Projeler</a>
            <a href="#why-me">Hizmetler</a>
            <a href="#pricing">Paketler</a>
            <a href="#process">Süreç</a>
            <a href="#contact">İletişim</a>
          </div>
          <div className="nav-actions">
            <button className="theme-toggle" id="theme-toggle" aria-label="Tema değiştir">
              <i className="ph ph-sun sun-icon" />
              <i className="ph ph-moon moon-icon" />
            </button>
            <a href="#contact" className="btn btn-primary">Teklif Al</a>
            <button className="hamburger" id="hamburger" aria-label="Menüyü aç">
              <i className="ph ph-list" />
            </button>
          </div>
        </div>
        <div className="mobile-menu" id="mobile-menu" role="menu">
          <a href="#projects" className="mobile-link">Projeler</a>
          <a href="#why-me" className="mobile-link">Hizmetler</a>
          <a href="#pricing" className="mobile-link">Paketler</a>
          <a href="#process" className="mobile-link">Süreç</a>
          <a href="#contact" className="mobile-link">İletişim</a>
          <a href="#contact" className="btn btn-primary mobile-cta">Teklif Al</a>
        </div>
      </nav>

      <main>
        {/* ── HERO ── */}
        <section className="hero container reveal" aria-label="Hero bölümü">
          <div className="hero-badge">
            <span className="live-indicator" />
            Yeni Müşteri Alımı Açık
          </div>
          <h1 className="hero-title">
            İşletmenizin Dijital Kimliğini<br />
            <span className="highlight">Birlikte Tasarlarız.</span>
          </h1>
          <p className="hero-subtitle">
            Farklı sektörlerden işletmeler için hızlı, modern ve mobil uyumlu web siteleri yapıyorum. Sadece şablonla değil — sıfırdan, sizin için.
          </p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary btn-large">
              Projeleri İncele <i className="ph ph-arrow-right" />
            </a>
            <a href="#contact" className="btn btn-outline btn-large">
              Ücretsiz Danışın
            </a>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="marquee-container" aria-hidden="true">
          <div className="marquee-content">
            {["Next.js", "React", "Node.js", "PostgreSQL", "Figma", "Vercel", "Supabase", "Tailwind", "TypeScript", "REST API",
              "Next.js", "React", "Node.js", "PostgreSQL", "Figma", "Vercel", "Supabase", "Tailwind", "TypeScript", "REST API"].map((t, i) => (
              <span key={i}>{t}<span className="dot"> ·</span></span>
            ))}
          </div>
        </div>

        {/* ── PROJECTS ── */}
        <section id="projects" className="projects container reveal" aria-label="Projeler">
          <div className="section-header">
            <span className="section-label">Referanslar</span>
            <h2>Öne Çıkan Projeler</h2>
            <p>Yakın zamanda tamamlanan işlerden bazıları</p>
          </div>
          <div className="projects-grid" id="projects-grid">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
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
            ) : projects.length > 0 ? (
              projects.map((p) => (
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
            ) : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                <p>Yakında yeni projeler eklenecektir.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── WHY ME (BENTO) ── */}
        <section id="why-me" className="why-me container reveal" aria-label="Neden ben">
          <div className="section-header">
            <span className="section-label">Değer Önerim</span>
            <h2>Neden KODİVA?</h2>
            <p>Sıradan bir ajans değiliz. Her proje özel, her çözüm benzersiz.</p>
          </div>
          <div className="bento-grid">
            <div className="bento-item bento-large glass-panel">
              <div className="feature-icon"><i className="ph ph-lightning" /></div>
              <h3>Işık Hızında Performans</h3>
              <p>Sitenizin yüklenme süresini saniyelerin altına indiriyoruz. 100/100 Google PageSpeed skoru birincil hedefimizdir. Rakipleriniz yüklenirken siz zaten karşılanmış oluyorsunuz.</p>
            </div>
            <div className="bento-item glass-panel">
              <div className="feature-icon"><i className="ph ph-device-mobile" /></div>
              <h3>Mobil Öncelikli</h3>
              <p>Kullanıcıların %80'i telefonda. Siteniz uygulamadan ayırt edilemez.</p>
            </div>
            <div className="bento-item glass-panel">
              <div className="feature-icon"><i className="ph ph-magnifying-glass" /></div>
              <h3>Google'da Üst Sıralar</h3>
              <p>Teknik SEO ve hız optimizasyonuyla rakiplerinizin önünde görünün.</p>
            </div>
            <div className="bento-item glass-panel">
              <div className="feature-icon"><i className="ph ph-shield-check" /></div>
              <h3>Güvenli Altyapı</h3>
              <p>SSL, veri şifreleme ve düzenli yedekleme ile verileriniz korumalı.</p>
            </div>
            <div className="bento-item glass-panel">
              <div className="feature-icon"><i className="ph ph-currency-circle-dollar" /></div>
              <h3>Bütçe Dostu</h3>
              <p>Premium kalite, kurumsal fiyatların çok altında. Ekstra masraf yok.</p>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="pricing reveal" aria-label="Fiyatlandırma">
          <div className="section-header">
            <span className="section-label">Paketler</span>
            <h2>Hizmet Paketleri</h2>
            <p>İhtiyacınıza ve bütçenize en uygun çözümü seçin</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card glass-panel">
              <h3 className="pricing-title">Başlangıç</h3>
              <p className="pricing-desc">Küçük işletmeler ve kişisel portfolyolar için şık tek sayfalık yapı.</p>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle" /> Tek Sayfa (One-Page) Tasarım</li>
                <li><i className="ph-fill ph-check-circle" /> Mobil Uyumlu (Responsive)</li>
                <li><i className="ph-fill ph-check-circle" /> İletişim Formu</li>
                <li><i className="ph-fill ph-check-circle" /> Temel SEO Altyapısı</li>
              </ul>
              <a href="#contact" className="btn btn-outline pricing-btn">Teklif Alın</a>
            </div>
            <div className="pricing-card glass-panel popular">
              <div className="popular-badge">EN ÇOK TERCİH</div>
              <h3 className="pricing-title">Kurumsal</h3>
              <p className="pricing-desc">Şirketler ve markalar için çok sayfalı, dinamik ve kapsamlı web sitesi.</p>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle" /> Çok Sayfalı Premium Tasarım</li>
                <li><i className="ph-fill ph-check-circle" /> Yönetim Paneli</li>
                <li><i className="ph-fill ph-check-circle" /> Gelişmiş SEO & Hız</li>
                <li><i className="ph-fill ph-check-circle" /> 1 Yıl Ücretsiz Domain & Hosting</li>
              </ul>
              <a href="#contact" className="btn btn-accent pricing-btn">Teklif Alın</a>
            </div>
            <div className="pricing-card glass-panel">
              <h3 className="pricing-title">E-Ticaret</h3>
              <p className="pricing-desc">Ürünlerinizi internetten güvenle satabileceğiniz sanal mağaza.</p>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle" /> Sınırsız Ürün ve Kategori</li>
                <li><i className="ph-fill ph-check-circle" /> Güvenli Ödeme (Sanal POS)</li>
                <li><i className="ph-fill ph-check-circle" /> Kargo ve Sipariş Takibi</li>
                <li><i className="ph-fill ph-check-circle" /> Sepet Kurtarma</li>
              </ul>
              <a href="#contact" className="btn btn-outline pricing-btn">Teklif Alın</a>
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section id="process" className="process container reveal" aria-label="Süreç">
          <div className="section-header">
            <span className="section-label">Nasıl Çalışıyoruz</span>
            <h2>Fikrinizden Yayına</h2>
            <p>Şeffaf ve hızlı 5 adımlık sürecimiz</p>
          </div>
          <div className="process-timeline-container">
            <div className="process-timeline-line" />
            <div className="process-timeline-progress-fill" />
            {[
              { step: "01", icon: "target", title: "Strateji ve Planlama", desc: "İhtiyaç analizi, hedef belirleme ve dijital yol haritası çıkarılması." },
              { step: "02", icon: "pen-nib", title: "Tasarım ve Arayüz", desc: "Kurumsal kimliğinize uygun, premium ve kullanıcı dostu UI/UX tasarımı." },
              { step: "03", icon: "code", title: "Yazılım ve Kodlama", desc: "Son teknoloji altyapı ile sıfırdan kodlama ve SEO altyapısı kurulumu." },
              { step: "04", icon: "check-circle", title: "Test ve Optimizasyon", desc: "Mobil uyum, güvenlik taraması ve Google PageSpeed testleri." },
              { step: "05", icon: "rocket", title: "Yayına Alma", desc: "Anahtar teslim canlıya alma ve yönetim paneli eğitimi." },
            ].map((s, i) => (
              <div key={i} className="process-timeline-item">
                <div className="process-timeline-dot">
                  <i className={`ph ph-${s.icon}`} />
                </div>
                <div className="process-timeline-content">
                  <div className="glass-panel">
                    <span className="step-number">Adım {s.step}</span>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="testimonials container reveal" aria-label="Referanslar">
          <div className="section-header">
            <span className="section-label">Müşteriler</span>
            <h2>Ne Dediler?</h2>
            <p>Birlikte çalıştığım müşterilerin gerçek deneyimleri</p>
          </div>
          <div className="testimonials-marquee-container" aria-hidden="true">
            <div className="testimonials-marquee-content">
              {[...testimonials, ...testimonials].map((t, i) => (
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
            <span className="section-label">SSS</span>
            <h2>Sıkça Sorulan Sorular</h2>
            <p>Aklınızdaki soru işaretlerini giderelim</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item glass-panel">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  {faq.q}
                  <i className={`ph ${openFaq === i ? "ph-caret-up" : "ph-caret-down"}`} />
                </button>
                <div className={`faq-answer ${openFaq === i ? "open" : ""}`} role="region">
                  {faq.a}
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
            <img src="/favicon.svg" alt="Kodiva Logo" width="24" height="24" />
            <span>kodiva<span>website</span> &copy; <span id="current-year" /></span>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Instagram"><i className="ph ph-instagram-logo" /></a>
            <a href="#" aria-label="LinkedIn"><i className="ph ph-linkedin-logo" /></a>
            <a href="#" aria-label="GitHub"><i className="ph ph-github-logo" /></a>
          </div>
          <div className="footer-legal">
            <Link href="/gizlilik-politikasi" className="legal-link">Gizlilik Politikası</Link>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a href="https://wa.me/905555555555" target="_blank" rel="noreferrer" className="floating-wa" aria-label="WhatsApp ile iletişime geç">
        <i className="ph-fill ph-whatsapp-logo" />
      </a>
    </>
  );
}