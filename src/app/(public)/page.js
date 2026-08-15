"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Lenis from "lenis";
import VanillaTilt from "vanilla-tilt";

export default function PublicHomePage() {
  // ---------- STATES ----------
  const [openFaq, setOpenFaq] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stats, setStats] = useState({ projects: 0, clients: 0, experience: 0 });
  const [typewriterText, setTypewriterText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [openProcessStep, setOpenProcessStep] = useState(null);

  // ---------- REFS ----------
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const statsRef = useRef(null);
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);
  const marqueeRef = useRef(null);

  // ---------- FAKİ VERİLER (API olmadığında) ----------
  const faqs = [
    { q: "Süreç ne kadar sürüyor?", a: "Projenin kapsamına bağlı olarak genellikle 1-3 hafta içerisinde sitenizi anahtar teslim yayına alıyoruz." },
    { q: "Alan adı ve hosting dahil mi?", a: "Evet, tüm paketlerimizde ilk yıl alan adı ve yüksek hızlı sunucu (hosting) ücretsiz olarak sunulmaktadır." },
    { q: "Daha sonra kendi sitemi güncelleyebilir miyim?", a: "Kesinlikle! Size özel hazırladığımız yönetim paneli sayesinde metinleri ve görselleri kolayca değiştirebilirsiniz." },
    { q: "Arama motorlarında (Google) üst sırada çıkar mıyım?", a: "Sitenizi en güncel SEO kurallarına göre kodluyoruz. Bu sayede organik yükselişiniz garanti altına alınır." }
  ];

  const processSteps = [
    { step: "1", title: "Strateji ve Planlama", desc: "İhtiyaç analizi, hedef belirleme ve dijital harita çıkarılması.", detail: "Bu aşamada sizinle birebir görüşmeler yaparak iş modelinizi, hedef kitlenizi ve rekabet analizini derinlemesine inceliyoruz. Ortaya çıkan verilerle projenin yol haritasını çiziyoruz." },
    { step: "2", title: "Tasarım ve Arayüz", desc: "Kurumsal kimliğinize uygun, premium ve kullanıcı dostu (UI/UX) görünüm.", detail: "Figma üzerinde interaktif prototipler hazırlıyor, renk paleti, tipografi ve görsel dil üzerinde sizinle birlikte karar veriyoruz. Onayınız sonrası kodlamaya geçiyoruz." },
    { step: "3", title: "Yazılım ve Kodlama", desc: "Son teknoloji altyapı ile sıfırdan kodlama ve SEO altyapısı.", detail: "Next.js, Node.js ve PostgreSQL kullanarak hızlı, güvenli ve ölçeklenebilir bir altyapı kuruyoruz. Tüm kodlar temiz ve yorumlanmış şekilde yazılır." },
    { step: "4", title: "Test ve Optimizasyon", desc: "Mobil uyum, güvenlik ve Google PageSpeed testleri.", detail: "Gerçek cihazlarda test edilir, performans iyileştirmeleri yapılır, güvenlik açıkları giderilir. Son olarak hız ve SEO skorları raporlanır." },
    { step: "5", title: "Yayına Alma", desc: "Anahtar teslim canlıya alma ve kontrol paneli teslimi.", detail: "Projeniz sunucuya kurulur, alan adı bağlanır ve 24 saat içinde erişime açılır. Yönetim paneli kullanım kılavuzu ile birlikte teslim edilir." }
  ];

  // ---------- TYPEWRITER ----------
  const typewriterWords = ["İşletmenizin Dijital Vitrinini", "Markanızı Güçlendirin", "Hayalinizdeki Siteyi Oluşturun"];

  useEffect(() => {
    let timer;
    const handleType = () => {
      const i = loopNum % typewriterWords.length;
      const fullText = typewriterWords[i];

      setTypewriterText((prev) => {
        if (!isDeleting) {
          const next = fullText.substring(0, prev.length + 1);
          if (next === fullText) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
          return next;
        } else {
          const next = fullText.substring(0, prev.length - 1);
          if (next === "") {
            setIsDeleting(false);
            setLoopNum(loopNum + 1);
          }
          return next;
        }
      });
    };

    timer = setTimeout(handleType, isDeleting ? 60 : 120);
    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, loopNum]);

  // ---------- SCROLL PROGRESS ----------
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrollY / height) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------- STATS COUNTER (scroll ile say) ----------
  useEffect(() => {
    const targetStats = { projects: 42, clients: 28, experience: 6 };
    let animationFrame;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let start = 0;
            const duration = 2000;
            const startTime = performance.now();
            const animate = (time) => {
              const progress = Math.min((time - startTime) / duration, 1);
              setStats({
                projects: Math.floor(progress * targetStats.projects),
                clients: Math.floor(progress * targetStats.clients),
                experience: Math.floor(progress * targetStats.experience),
              });
              if (progress < 1) animationFrame = requestAnimationFrame(animate);
            };
            animationFrame = requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, []);

  // ---------- LENIS SMOOTH SCROLL, CURSOR, THEME, ETC ----------
  useEffect(() => {
    // 0. Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      smooth: true,
    });
    lenisRef.current = lenis;

    const raf = (time) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    };
    rafIdRef.current = requestAnimationFrame(raf);

    // 1. Fetch Projects
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item, idx) => ({
            id: item.id || String(idx),
            title: item.title || "Proje",
            category: item.category || "Web Tasarım",
            description: item.description || "",
            image: item.image_url || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
            link: item.url || "#",
          }));
          setProjects(mapped);
          setFilteredProjects(mapped);
        } else {
          // Demo veri
          const demo = [
            { id: "1", title: "Cafe Roma", category: "Web Tasarım", description: "Modern ve sıcak bir restoran sitesi.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800", link: "#" },
            { id: "2", title: "TechStore", category: "E-Ticaret", description: "Elektronik ürünler için full özellikli mağaza.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800", link: "#" },
            { id: "3", title: "Güzellik Merkezi", category: "Kurumsal", description: "Premium spa ve güzellik salonu sitesi.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800", link: "#" },
            { id: "4", title: "Emlak Ofisi", category: "Web Tasarım", description: "Portföy ve ilan sistemi entegre.", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800", link: "#" },
          ];
          setProjects(demo);
          setFilteredProjects(demo);
        }
      })
      .catch(() => {
        // Hata durumunda demo
        const demo = [
          { id: "1", title: "Cafe Roma", category: "Web Tasarım", description: "Modern ve sıcak bir restoran sitesi.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800", link: "#" },
          { id: "2", title: "TechStore", category: "E-Ticaret", description: "Elektronik ürünler için full özellikli mağaza.", image: "https://images.unsplash.com/photo-1556742049-0cfed4f0a45d?auto=format&fit=crop&q=80&w=800", link: "#" },
        ];
        setProjects(demo);
        setFilteredProjects(demo);
      })
      .finally(() => setIsLoading(false));

    // 2. Footer year
    document.getElementById("current-year").textContent = new Date().getFullYear();

    // 3. Theme toggle + system preference
    const themeBtn = document.getElementById("theme-toggle");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (systemDark) document.body.classList.add("dark-theme");

    const handleThemeToggle = () => {
      document.body.classList.toggle("dark-theme");
      const iconSun = themeBtn?.querySelector(".sun-icon");
      const iconMoon = themeBtn?.querySelector(".moon-icon");
      if (iconSun && iconMoon) {
        document.body.classList.contains("dark-theme")
          ? (iconSun.style.display = "none", iconMoon.style.display = "inline")
          : (iconSun.style.display = "inline", iconMoon.style.display = "none");
      }
    };
    if (themeBtn) {
      themeBtn.addEventListener("click", handleThemeToggle);
      // Başlangıç ikonları
      const iconSun = themeBtn.querySelector(".sun-icon");
      const iconMoon = themeBtn.querySelector(".moon-icon");
      if (iconSun && iconMoon) {
        if (systemDark) { iconSun.style.display = "none"; iconMoon.style.display = "inline"; }
        else { iconSun.style.display = "inline"; iconMoon.style.display = "none"; }
      }
    }

    // 4. Mobile Menu
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    if (hamburger && mobileMenu) {
      const toggleMenu = () => {
        mobileMenu.classList.toggle("active");
        const icon = hamburger.querySelector("i");
        if (mobileMenu.classList.contains("active")) {
          icon.classList.replace("ph-list", "ph-x");
          document.body.style.overflow = "hidden";
        } else {
          icon.classList.replace("ph-x", "ph-list");
          document.body.style.overflow = "";
        }
      };
      hamburger.addEventListener("click", toggleMenu);
      document.querySelectorAll(".mobile-link").forEach((link) => {
        link.addEventListener("click", () => {
          if (mobileMenu.classList.contains("active")) toggleMenu();
        });
      });
    }

    // 5. Scroll Reveal + Timeline Progress (Performant)
    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -50px 0px" });
    
    reveals.forEach(el => revealObserver.observe(el));

    // Timeline Progress (Throttled via requestAnimationFrame)
    const timelineLine = document.querySelector(".process-timeline-progress-fill");
    const timelineContainer = document.querySelector(".process-timeline-container");
    let isTicking = false;
    
    const updateTimeline = () => {
      if (timelineLine && timelineContainer) {
        const rect = timelineContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight / 2) {
          const progress = Math.max(0, Math.min(100, ((windowHeight / 2 - rect.top) / rect.height) * 100));
          timelineLine.style.height = progress + "%";
        }
      }
      isTicking = false;
    };
    
    const handleScroll = () => {
      // Timeline
      if (!isTicking) {
        window.requestAnimationFrame(updateTimeline);
        isTicking = true;
      }
      // Navbar
      const navbar = document.querySelector(".navbar");
      navbar?.classList.toggle("scrolled", window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // 7. VanillaTilt (kartlar)
    VanillaTilt.init(document.querySelectorAll(".project-card, .pricing-card"), {
      max: 10,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
    });

    // 8. Custom Cursor (Performant translate3d)
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (cursor && follower && window.innerWidth > 768) {
      let mouseX = 0, mouseY = 0;
      let followerX = 0, followerY = 0;

      const onMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      };
      document.addEventListener("mousemove", onMouseMove, { passive: true });

      let animFrame;
      const animateCursor = () => {
        followerX += (mouseX - followerX) * 0.2;
        followerY += (mouseY - followerY) * 0.2;
        
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
        
        animFrame = requestAnimationFrame(animateCursor);
      };
      animateCursor();

      const interactive = document.querySelectorAll("a, button, .project-card, .pricing-card, .bento-item");
      const onHover = () => { cursor.classList.add("hover"); follower.classList.add("hover"); };
      const onLeave = () => { cursor.classList.remove("hover"); follower.classList.remove("hover"); };
      interactive.forEach((el) => {
        el.addEventListener("mouseenter", onHover);
        el.addEventListener("mouseleave", onLeave);
      });

      return () => {
        themeBtn?.removeEventListener("click", handleThemeToggle);
        lenis.destroy();
        cancelAnimationFrame(rafIdRef.current);
        if (window.innerWidth > 768) {
          document.removeEventListener("mousemove", onMouseMove);
          cancelAnimationFrame(animFrame);
          interactive.forEach((el) => {
            el.removeEventListener("mouseenter", onHover);
            el.removeEventListener("mouseleave", onLeave);
          });
        }
        window.removeEventListener("scroll", handleScroll);
        revealObserver.disconnect();
      };
    }
  }, []);

  // ---------- FİLTRELEME ----------
  const filterProjects = (category) => {
    setActiveFilter(category);
    if (category === "Tümü") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter((p) => p.category === category));
    }
  };

  // ---------- RIPPLE EFFECT ----------
  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  // ---------- RENDER ----------
  return (
    <>
      {/* Custom Cursor */}
      <div className="custom-cursor" ref={cursorRef}></div>
      <div className="custom-cursor-follower" ref={followerRef}></div>
      <div className="background-pattern"></div>

      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress / 100})` }}></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container container">
          <div className="logo">
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/favicon.svg" alt="Kodiva Logo" style={{ height: "36px", width: "auto" }} />
              kodiva<span>website</span>
            </a>
          </div>
          <div className="nav-links">
            <a href="#projects">Projeler</a>
            <a href="#why-me">Hakkımda</a>
            <a href="#pricing">Paketler</a>
            <a href="#process">Süreç</a>
            <a href="#contact">İletişim</a>
          </div>
          <div className="nav-actions">
            <button className="theme-toggle" id="theme-toggle" aria-label="Tema Değiştir">
              <i className="ph ph-sun sun-icon"></i>
              <i className="ph ph-moon moon-icon"></i>
            </button>
            <a href="#contact" className="btn btn-primary" onMouseDown={handleRipple}>İletişime Geç</a>
            <button className="hamburger" id="hamburger">
              <i className="ph ph-list"></i>
            </button>
          </div>
        </div>
        <div className="mobile-menu" id="mobile-menu">
          <a href="#projects" className="mobile-link">Projeler</a>
          <a href="#why-me" className="mobile-link">Hakkımda</a>
          <a href="#pricing" className="mobile-link">Paketler</a>
          <a href="#process" className="mobile-link">Süreç</a>
          <a href="#contact" className="mobile-link">İletişim</a>
          <a href="#contact" className="btn btn-primary mobile-cta">İletişime Geç</a>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="hero container reveal">
          <div className="hero-badge">
            <span className="live-indicator"></span>
            Yeni Projeler Eklendi
          </div>
          <h1 className="hero-title">
            <span className="typewriter">{typewriterText}</span>
            <span className="highlight">Birlikte İnşa Ettik.</span>
          </h1>
          <p className="hero-subtitle">
            Farklı sektörlerden işletmeler için hazırladığım, hızlı, modern ve mobil uyumlu web sitelerine buradan göz atabilirsiniz. İhtiyacınıza en uygun çözümleri sunuyorum.
          </p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary btn-large" onMouseDown={handleRipple}>Projeleri İncele <i className="ph ph-arrow-right"></i></a>
            <a href="#contact" className="btn btn-outline btn-large" onMouseDown={handleRipple}>Benimle Çalışın</a>
          </div>
        </section>

        {/* Tech Stack Marquee */}
        <div className="marquee-container">
          <div className="marquee-content">
            <span>React</span><span className="dot">•</span>
            <span>Next.js</span><span className="dot">•</span>
            <span>Node.js</span><span className="dot">•</span>
            <span>PostgreSQL</span><span className="dot">•</span>
            <span>Figma</span><span className="dot">•</span>
            <span>Tailwind</span><span className="dot">•</span>
            <span>Vercel</span><span className="dot">•</span>
            {/* duplicate */}
            <span aria-hidden="true">React</span><span className="dot" aria-hidden="true">•</span>
            <span aria-hidden="true">Next.js</span><span className="dot" aria-hidden="true">•</span>
            <span aria-hidden="true">Node.js</span><span className="dot" aria-hidden="true">•</span>
            <span aria-hidden="true">PostgreSQL</span><span className="dot" aria-hidden="true">•</span>
            <span aria-hidden="true">Figma</span><span className="dot" aria-hidden="true">•</span>
            <span aria-hidden="true">Tailwind</span><span className="dot" aria-hidden="true">•</span>
            <span aria-hidden="true">Vercel</span><span className="dot" aria-hidden="true">•</span>
          </div>
        </div>

        {/* Projects */}
        <section id="projects" className="projects container reveal">
          <div className="section-header">
            <h2>Öne Çıkan Projeler</h2>
            <p>Yakın zamanda tamamlanan işlerden bazıları</p>
          </div>
          {/* Filtre Butonları */}
          <div className="filter-buttons">
            <button className={`filter-btn ${activeFilter === "Tümü" ? "active" : ""}`} onClick={() => filterProjects("Tümü")}>Tümü</button>
            {[...new Set(projects.map(p => p.category))].map(cat => (
              <button key={cat} className={`filter-btn ${activeFilter === cat ? "active" : ""}`} onClick={() => filterProjects(cat)}>{cat}</button>
            ))}
          </div>
          <div className="projects-grid" id="projects-grid">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <article key={idx} className="project-card skeleton-card">
                  <div className="project-image skeleton"></div>
                  <div className="project-content">
                    <div className="skeleton skeleton-text" style={{ width: "50%", height: "24px", marginBottom: "12px" }}></div>
                    <div className="skeleton skeleton-text" style={{ width: "100%", height: "14px", marginBottom: "8px" }}></div>
                    <div className="skeleton skeleton-text" style={{ width: "80%", height: "14px", marginBottom: "24px" }}></div>
                    <div className="skeleton skeleton-text" style={{ width: "120px", height: "16px" }}></div>
                  </div>
                </article>
              ))
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <article key={project.id} className="project-card" suppressHydrationWarning>
                  <div className="project-image" style={{ backgroundImage: `url('${project.image}')` }}>
                    <span className="project-category">{project.category}</span>
                  </div>
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-desc">{project.description}</p>
                    <a href={project.link} className="project-link" target="_blank" rel="noreferrer">
                      Siteyi Görüntüle <i className="ph ph-arrow-right"></i>
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                <p>Bu kategoride henüz proje yok.</p>
              </div>
            )}
          </div>
        </section>

        {/* Why Me + Stats */}
        <section id="why-me" className="why-me container reveal">
          <div className="section-header">
            <h2>Neden Benimle Çalışmalısınız?</h2>
            <p>Projelerinizi hayata geçirirken sunduğum avantajlar</p>
          </div>
          <div className="bento-grid">
            <div className="bento-item bento-large glass-panel">
              <div className="feature-icon"><i className="ph ph-lightning"></i></div>
              <h3>Işık Hızında Performans</h3>
              <p>Sitenizin yüklenme hızını saniyelerin altına indiriyoruz. 100/100 PageSpeed skoru hedeflenir.</p>
            </div>
            <div className="bento-item glass-panel">
              <div className="feature-icon"><i className="ph ph-device-mobile"></i></div>
              <h3>Mobil Öncelikli</h3>
              <p>Kullanıcıların %80'i mobil cihazlarda. Siteniz telefonda bir uygulama gibi hissettirir.</p>
            </div>
            <div className="bento-item glass-panel">
              <div className="feature-icon"><i className="ph ph-magnifying-glass"></i></div>
              <h3>Google Dostu (SEO)</h3>
              <p>Temiz kodlama ve optimize içerik yapısı ile rakiplerinizi organik aramalarda geride bırakın.</p>
            </div>
            <div className="bento-item bento-wide glass-panel">
              <div className="feature-icon"><i className="ph ph-shield-check"></i></div>
              <h3>Üst Düzey Güvenlik ve Uygun Fiyat</h3>
              <p>Premium tasarım, maksimum güvenlik ve bütçe dostu fiyatlandırma. SSL, veri şifreleme, düzenli yedekleme.</p>
            </div>
          </div>
          {/* Stats */}
          <div className="stats-container" ref={statsRef}>
            <div className="stat-item">
              <span className="stat-number">{stats.projects}+</span>
              <span className="stat-label">Tamamlanan Proje</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.clients}+</span>
              <span className="stat-label">Mutlu Müşteri</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.experience}+</span>
              <span className="stat-label">Yıl Deneyim</span>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="pricing container reveal">
          <div className="section-header">
            <h2>Hizmet Paketleri</h2>
            <p>İhtiyacınıza ve bütçenize en uygun çözümü seçin</p>
          </div>
          <div className="pricing-grid">
            {/* Starter */}
            <div className="pricing-card glass-panel">
              <h3 className="pricing-title">Başlangıç</h3>
              <p className="pricing-desc">Küçük işletmeler ve kişisel portfolyolar için ideal tek sayfalık yapı.</p>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle"></i> Tek Sayfa (One-Page) Tasarım</li>
                <li><i className="ph-fill ph-check-circle"></i> Mobil Uyumlu (Responsive)</li>
                <li><i className="ph-fill ph-check-circle"></i> İletişim Formu</li>
                <li><i className="ph-fill ph-check-circle"></i> Temel SEO Altyapısı</li>
              </ul>
              <a href="#contact" className="btn btn-outline pricing-btn" onMouseDown={handleRipple}>Teklif Alın</a>
            </div>
            {/* Professional */}
            <div className="pricing-card glass-panel popular">
              <div className="popular-badge">EN ÇOK TERCİH EDİLEN</div>
              <h3 className="pricing-title">Kurumsal</h3>
              <p className="pricing-desc">Şirketler ve markalar için çok sayfalı, dinamik ve kapsamlı web sitesi.</p>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle"></i> Çok Sayfalı Premium Tasarım</li>
                <li><i className="ph-fill ph-check-circle"></i> Yönetim Paneli (İçerik Yönetimi)</li>
                <li><i className="ph-fill ph-check-circle"></i> Gelişmiş SEO ve Hız Optimizasyonu</li>
                <li><i className="ph-fill ph-check-circle"></i> 1 Yıl Ücretsiz Alan Adı & Hosting</li>
              </ul>
              <a href="#contact" className="btn btn-primary pricing-btn" onMouseDown={handleRipple}>Teklif Alın</a>
            </div>
            {/* E-Commerce */}
            <div className="pricing-card glass-panel">
              <h3 className="pricing-title">E-Ticaret</h3>
              <p className="pricing-desc">Ürünlerinizi internetten güvenle satabileceğiniz sanal mağaza.</p>
              <ul className="pricing-features">
                <li><i className="ph-fill ph-check-circle"></i> Sınırsız Ürün ve Kategori</li>
                <li><i className="ph-fill ph-check-circle"></i> Güvenli Ödeme (Sanal POS)</li>
                <li><i className="ph-fill ph-check-circle"></i> Kargo ve Sipariş Takip Modülü</li>
                <li><i className="ph-fill ph-check-circle"></i> Sepet Kurtarma ve Promosyonlar</li>
              </ul>
              <a href="#contact" className="btn btn-outline pricing-btn" onMouseDown={handleRipple}>Teklif Alın</a>
            </div>
          </div>
        </section>

        {/* Process / Timeline (interaktif) */}
        <section id="process" className="process container reveal">
          <div className="section-header">
            <h2>Nasıl Çalışıyoruz?</h2>
            <p>Fikrinizden yayına kadar geçen şeffaf ve hızlı sürecimiz</p>
          </div>
          <div className="process-timeline-container">
            <div className="process-timeline-line"></div>
            <div className="process-timeline-progress-fill"></div>
            {processSteps.map((step, idx) => (
              <div key={idx} className="process-timeline-item">
                <div className="process-timeline-dot">
                  <i className={`ph ph-${["target", "pen-nib", "code", "check-circle", "rocket"][idx]}`}></i>
                </div>
                <div className="process-timeline-content">
                  <div className="glass-panel" onClick={() => setOpenProcessStep(openProcessStep === idx ? null : idx)}>
                    <div className="step-header">
                      <span className="step-number">Adım {step.step}</span>
                      <h4>{step.title}</h4>
                      <i className={`ph ${openProcessStep === idx ? "ph-caret-up" : "ph-caret-down"}`}></i>
                    </div>
                    <p>{step.desc}</p>
                    {openProcessStep === idx && (
                      <div className="step-detail">{step.detail}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials (marquee durdurma özellikli) */}
        <section id="testimonials" className="testimonials container reveal">
          <div className="section-header">
            <h2>Ne Dediler?</h2>
            <p>Benimle çalışan müşterilerimin deneyimleri</p>
          </div>
          <div className="testimonials-marquee-container" ref={marqueeRef}>
            <div className="testimonials-marquee-content">
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="glass-panel testimonial-card">
                    <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                    <p className="testimonial-text">"Sitemiz eski ve yavaştı. Kodiva ile çalıştıktan sonra hem harika bir tasarıma kavuştuk hem de Google'da ilk sayfaya çıktık."</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" }}></div>
                      <div><h4>Ahmet Yılmaz</h4><span>Cafe Roma İşletmecisi</span></div>
                    </div>
                  </div>
                  <div className="glass-panel testimonial-card">
                    <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                    <p className="testimonial-text">"Estetik ve zarafet bizim sektörde her şeydir. Beklentimizin çok üstünde premium bir site teslim aldık."</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" }}></div>
                      <div><h4>Ayşe K.</h4><span>Güzellik Merkezi Kurucusu</span></div>
                    </div>
                  </div>
                  <div className="glass-panel testimonial-card">
                    <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                    <p className="testimonial-text">"E-ticaret sitemizi kurarken tüm detaylarla bizzat ilgilendi. Sadece siteyi yapmakla kalmadı, satış stratejileri konusunda da ufkumuzu açtı."</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar" style={{ background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)" }}></div>
                      <div><h4>Caner T.</h4><span>TechStore Kurucusu</span></div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="faq container reveal">
          <div className="section-header">
            <h2>Sıkça Sorulan Sorular</h2>
            <p>Aklınızdaki soru işaretlerini giderelim</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel faq-item">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  {faq.q}
                  <i className={`ph ${openFaq === idx ? "ph-caret-up" : "ph-caret-down"}`}></i>
                </button>
                <div className={`faq-answer ${openFaq === idx ? "open" : ""}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="contact container reveal">
          <div className="contact-card glass-panel">
            <div className="contact-content">
              <h2>Sizin de bir web sitesine mi ihtiyacınız var?</h2>
              <p>İşletmenizi dijitale taşımak veya mevcut sitenizi yenilemek için benimle hemen iletişime geçin.</p>
              <div className="contact-buttons">
                <a href="https://wa.me/905555555555" target="_blank" className="btn btn-whatsapp" onMouseDown={handleRipple}>
                  <i className="ph-fill ph-whatsapp-logo"></i> WhatsApp&apos;tan Yazın
                </a>
                <a href="mailto:hello@ufukstudio.com" className="btn btn-email" onMouseDown={handleRipple}>
                  <i className="ph-fill ph-envelope"></i> E-Posta Gönderin
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-container container">
          <div className="footer-brand">
            <img src="/favicon.svg" alt="Kodiva Logo" style={{ height: "28px", width: "auto" }} />
            <span>kodiva<span>website</span> &copy; <span id="current-year"></span></span>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Instagram"><i className="ph ph-instagram-logo"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="ph ph-linkedin-logo"></i></a>
            <a href="#" aria-label="GitHub"><i className="ph ph-github-logo"></i></a>
          </div>
          <div className="footer-legal">
            <Link href="/gizlilik-politikasi" className="legal-link">Gizlilik Politikası</Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/905555555555" target="_blank" rel="noreferrer" className="floating-wa">
        <i className="ph-fill ph-whatsapp-logo"></i>
      </a>

      {/* Global CSS (tüm stiller) */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ---------- ROOT DEĞİŞKENLER ---------- */
        :root {
          --bg-color: #f8fafc;
          --text-color: #0b1120;
          --text-muted: #64748b;
          --accent-color: #7c3aed;
          --accent-hover: #6d28d9;
          --card-bg: rgba(255,255,255,0.7);
          --glass-border: rgba(255,255,255,0.2);
          --glass-shadow: 0 8px 32px rgba(0,0,0,0.06);
          --border-color: #e2e8f0;
          --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark-theme {
          --bg-color: #0b1120;
          --text-color: #f1f5f9;
          --text-muted: #94a3b8;
          --card-bg: rgba(30,41,59,0.7);
          --glass-border: rgba(255,255,255,0.08);
          --glass-shadow: 0 8px 32px rgba(0,0,0,0.3);
          --border-color: #1e293b;
        }

        /* ---------- RESET & BASE ---------- */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: var(--bg-color);
          color: var(--text-color);
          transition: background 0.4s, color 0.4s;
          overflow-x: hidden;
          cursor: none;
        }
        a, button { cursor: none; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* ---------- SCROLL PROGRESS ---------- */
        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-color), #8b5cf6, #10b981);
          transform-origin: left;
          z-index: 9999;
          transition: transform 0.1s linear;
          width: 100%;
        }

        /* ---------- CUSTOM CURSOR ---------- */
        .custom-cursor {
          width: 12px; height: 12px; background: var(--accent-color);
          border-radius: 50%; position: fixed; pointer-events: none;
          z-index: 99999; mix-blend-mode: difference;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s, background 0.2s;
        }
        .custom-cursor.hover { width: 30px; height: 30px; background: #fff; }
        .custom-cursor-follower {
          width: 40px; height: 40px; border: 1px solid var(--accent-color);
          border-radius: 50%; position: fixed; pointer-events: none;
          z-index: 99998; transform: translate(-50%, -50%);
          transition: width 0.4s, height 0.4s, border-color 0.4s, background 0.3s;
        }
        .custom-cursor-follower.hover {
          width: 60px; height: 60px; background: rgba(124,58,237,0.15);
          border-color: transparent;
        }

        /* ---------- NAVBAR ---------- */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0;
          padding: 16px 0; z-index: 1000;
          background: transparent; transition: background 0.4s, box-shadow 0.4s, backdrop-filter 0.4s;
        }
        .navbar.scrolled {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .dark-theme .navbar.scrolled {
          background: rgba(11,17,32,0.75);
        }
        .nav-container {
          display: flex; justify-content: space-between; align-items: center;
        }
        .logo a {
          font-size: 24px; font-weight: 800; color: var(--text-color);
          text-decoration: none; display: flex; align-items: center; gap: 10px;
        }
        .logo span { color: var(--accent-color); }
        .logo span span { font-weight: 300; color: var(--text-muted); }
        .nav-links { display: flex; gap: 32px; }
        .nav-links a {
          color: var(--text-muted); text-decoration: none;
          font-weight: 500; font-size: 15px;
          transition: color 0.3s;
        }
        .nav-links a:hover { color: var(--accent-color); }
        .nav-actions { display: flex; align-items: center; gap: 16px; }
        .theme-toggle {
          background: none; border: none; font-size: 22px;
          color: var(--text-muted); cursor: pointer;
          transition: transform 0.3s, color 0.3s;
        }
        .theme-toggle:hover { transform: rotate(30deg); color: var(--accent-color); }
        .hamburger { display: none; background: none; border: none; font-size: 28px; color: var(--text-color); }
        .mobile-menu {
          display: none; flex-direction: column; gap: 12px;
          padding: 24px; background: var(--card-bg);
          backdrop-filter: blur(20px); border-radius: 16px;
          margin-top: 12px; box-shadow: var(--glass-shadow);
          border: 1px solid var(--glass-border);
        }
        .mobile-menu.active { display: flex; }
        .mobile-link { color: var(--text-color); text-decoration: none; font-weight: 500; padding: 8px 0; }
        .mobile-cta { width: 100%; text-align: center; }

        /* ---------- BUTTONS ---------- */
        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 40px; font-weight: 600;
          font-size: 15px; text-decoration: none; transition: all 0.3s;
          border: none; position: relative; overflow: hidden;
        }
        .btn-primary {
          background: var(--accent-color); color: #fff;
          box-shadow: 0 4px 14px rgba(124,58,237,0.3);
        }
        .btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(124,58,237,0.4); }
        .btn-outline {
          background: transparent; color: var(--text-color);
          border: 1.5px solid var(--border-color);
        }
        .btn-outline:hover { border-color: var(--accent-color); color: var(--accent-color); transform: translateY(-2px); }
        .btn-large { padding: 16px 36px; font-size: 18px; }
        .btn-whatsapp { background: #25D366; color: #fff; }
        .btn-whatsapp:hover { background: #1ebe5a; transform: translateY(-2px); }
        .btn-email { background: #3b82f6; color: #fff; }
        .btn-email:hover { background: #2563eb; transform: translateY(-2px); }

        /* RIPPLE */
        .ripple {
          position: absolute; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: scale(0); animation: rippleAnim 0.6s ease-out forwards;
          pointer-events: none;
        }
        @keyframes rippleAnim {
          to { transform: scale(4); opacity: 0; }
        }

        /* ---------- HERO ---------- */
        .hero {
          min-height: 100vh; display: flex; flex-direction: column;
          justify-content: center; align-items: center; text-align: center;
          position: relative; padding: 120px 24px 60px;
        }
        .hero-glow {
          position: absolute; top: -20%; left: -20%; width: 140%; height: 140%;
          background: radial-gradient(circle at 30% 50%, rgba(124,58,237,0.08), transparent 60%);
          animation: heroGlow 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes heroGlow {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(5%, 5%) scale(1.2); }
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--card-bg); backdrop-filter: blur(8px);
          padding: 8px 18px; border-radius: 40px;
          font-size: 14px; font-weight: 500; color: var(--text-muted);
          border: 1px solid var(--glass-border); margin-bottom: 32px;
          position: relative;
        }
        .live-indicator {
          display: inline-block; width: 10px; height: 10px;
          background: #22c55e; border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { opacity:1; } 50% { opacity:0.3; } 100% { opacity:1; } }
        .hero-title {
          font-size: clamp(2.8rem, 8vw, 5rem);
          font-weight: 800; line-height: 1.1; max-width: 900px;
          margin-bottom: 24px;
        }
        .typewriter { background: linear-gradient(135deg, var(--accent-color), #8b5cf6, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .highlight { color: var(--accent-color); }
        .hero-subtitle {
          font-size: 1.2rem; color: var(--text-muted);
          max-width: 700px; margin-bottom: 40px;
        }
        .hero-cta { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }

        /* ---------- MARQUEE ---------- */
        .marquee-container {
          overflow: hidden; background: var(--card-bg);
          backdrop-filter: blur(8px); border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
          padding: 16px 0;
        }
        .marquee-content {
          display: flex; gap: 24px; animation: marquee 25s linear infinite;
          width: max-content;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content span { font-weight: 600; color: var(--text-muted); white-space: nowrap; }
        .marquee-content .dot { color: var(--accent-color); }

        /* ---------- SECTION HEADER ---------- */
        .section-header {
          text-align: center; margin-bottom: 60px;
        }
        .section-header h2 {
          font-size: 2.5rem; font-weight: 800; margin-bottom: 12px;
        }
        .section-header p { color: var(--text-muted); font-size: 1.1rem; }

        /* ---------- PROJECTS ---------- */
        .filter-buttons {
          display: flex; flex-wrap: wrap; justify-content: center;
          gap: 12px; margin-bottom: 40px;
        }
        .filter-btn {
          padding: 8px 24px; border-radius: 40px; border: 1px solid var(--border-color);
          background: transparent; color: var(--text-muted); font-weight: 500;
          transition: all 0.3s; cursor: pointer;
        }
        .filter-btn.active, .filter-btn:hover {
          background: var(--accent-color); color: #fff; border-color: var(--accent-color);
        }
        .projects-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
        }
        .project-card {
          background: var(--card-bg); border-radius: 20px; overflow: hidden;
          backdrop-filter: blur(8px); border: 1px solid var(--glass-border);
          transition: all 0.4s; box-shadow: var(--glass-shadow);
        }
        .project-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .project-image {
          height: 220px; background-size: cover; background-position: center;
          position: relative;
        }
        .project-category {
          position: absolute; top: 16px; right: 16px;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          padding: 6px 14px; border-radius: 40px; font-size: 12px;
          color: #fff; font-weight: 500;
        }
        .project-content { padding: 24px; }
        .project-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
        .project-desc { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px; }
        .project-link {
          color: var(--accent-color); font-weight: 600; text-decoration: none;
          display: inline-flex; align-items: center; gap: 4px;
          transition: gap 0.3s;
        }
        .project-link:hover { gap: 12px; }

        /* ---------- WHY ME (BENTO) ---------- */
        .bento-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 24px; margin-bottom: 60px;
        }
        .bento-item {
          padding: 32px; border-radius: 20px; position: relative;
          background: var(--card-bg); backdrop-filter: blur(8px);
          border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);
          transition: all 0.3s;
        }
        .bento-item:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.06); }
        .bento-large { grid-column: span 2; }
        .bento-wide { grid-column: span 3; }
        .feature-icon { font-size: 2.5rem; color: var(--accent-color); margin-bottom: 16px; }
        .bento-item h3 { font-size: 1.3rem; margin-bottom: 8px; }
        .bento-item p { color: var(--text-muted); line-height: 1.6; }

        /* ---------- STATS ---------- */
        .stats-container {
          display: flex; justify-content: center; gap: 60px;
          padding: 40px 0; border-top: 1px solid var(--border-color);
          margin-top: 20px;
        }
        .stat-item { text-align: center; }
        .stat-number { font-size: 3rem; font-weight: 800; color: var(--accent-color); display: block; }
        .stat-label { color: var(--text-muted); font-weight: 500; }

        /* ---------- PRICING ---------- */
        .pricing-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }
        .pricing-card {
          padding: 40px 28px; border-radius: 24px; text-align: center;
          background: var(--card-bg); backdrop-filter: blur(8px);
          border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);
          transition: all 0.4s; position: relative;
        }
        .pricing-card:hover { transform: translateY(-8px); }
        .pricing-card.popular {
          border-color: var(--accent-color); box-shadow: 0 0 30px rgba(124,58,237,0.1);
        }
        .popular-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: var(--accent-color); color: #fff; padding: 4px 20px;
          border-radius: 40px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
        }
        .pricing-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; }
        .pricing-desc { color: var(--text-muted); margin-bottom: 24px; }
        .pricing-features { list-style: none; text-align: left; margin-bottom: 32px; }
        .pricing-features li {
          display: flex; align-items: center; gap: 12px; padding: 8px 0;
          color: var(--text-muted);
        }
        .pricing-features i { color: var(--accent-color); font-size: 1.2rem; }
        .pricing-btn { width: 100%; justify-content: center; }

        /* ---------- PROCESS (TIMELINE) ---------- */
        .process-timeline-container {
          position: relative; max-width: 800px; margin: 40px auto 0;
          padding: 0 20px;
        }
        .process-timeline-line {
          position: absolute; left: 50%; top: 0; bottom: 0;
          width: 4px; background: var(--glass-border);
          transform: translateX(-50%); border-radius: 4px;
        }
        .process-timeline-progress-fill {
          position: absolute; left: 50%; top: 0; height: 0%;
          width: 4px; background: linear-gradient(to bottom, var(--accent-color), #8b5cf6, #10b981);
          transform: translateX(-50%); border-radius: 4px;
          transition: height 0.1s ease-out;
        }
        .process-timeline-item {
          display: flex; justify-content: center; align-items: center;
          margin-bottom: 40px; width: 100%; position: relative;
        }
        .process-timeline-dot {
          position: absolute; left: 50%; transform: translateX(-50%);
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--card-bg); border: 4px solid var(--glass-border);
          display: flex; align-items: center; justify-content: center;
          z-index: 10; color: var(--text-muted);
          transition: all 0.4s ease;
        }
        .process-timeline-dot.active {
          border-color: var(--accent-color); background: var(--accent-color);
          color: #fff; box-shadow: 0 0 20px rgba(124,58,237,0.3);
        }
        .process-timeline-content {
          width: 45%; cursor: pointer;
        }
        .process-timeline-content .glass-panel {
          padding: 24px; border-radius: 16px; background: var(--card-bg);
          backdrop-filter: blur(8px); border: 1px solid var(--glass-border);
          transition: all 0.3s;
        }
        .process-timeline-content .glass-panel:hover { transform: translateY(-4px); }
        .step-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .step-number {
          font-size: 12px; font-weight: 800; color: var(--accent-color);
          letter-spacing: 1px; text-transform: uppercase;
        }
        .step-header h4 { font-size: 1.2rem; font-weight: 700; flex: 1; }
        .step-header i { color: var(--accent-color); font-size: 1.4rem; }
        .step-detail {
          margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);
          color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;
        }

        /* ---------- TESTIMONIALS MARQUEE ---------- */
        .testimonials-marquee-container {
          overflow: hidden; position: relative;
        }
        .testimonials-marquee-content {
          display: flex; gap: 32px; animation: marqueeTestimonial 30s linear infinite;
          width: max-content;
        }
        .testimonials-marquee-container:hover .testimonials-marquee-content {
          animation-play-state: paused;
        }
        @keyframes marqueeTestimonial {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .testimonial-card {
          width: 320px; padding: 28px; border-radius: 20px;
          background: var(--card-bg); backdrop-filter: blur(8px);
          border: 1px solid var(--glass-border); flex-shrink: 0;
        }
        .testimonial-quote-icon { font-size: 2rem; color: var(--accent-color); opacity: 0.3; margin-bottom: 12px; }
        .testimonial-text { font-size: 0.95rem; line-height: 1.6; color: var(--text-color); margin-bottom: 16px; }
        .testimonial-author { display: flex; align-items: center; gap: 14px; }
        .testimonial-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
        }
        .testimonial-author h4 { font-weight: 700; font-size: 0.95rem; }
        .testimonial-author span { font-size: 0.8rem; color: var(--text-muted); }

        /* ---------- FAQ ---------- */
        .faq-list { max-width: 800px; margin: 40px auto 0; display: flex; flex-direction: column; gap: 16px; }
        .faq-item { border-radius: 16px; overflow: hidden; }
        .faq-item button {
          width: 100%; padding: 20px 24px; display: flex; justify-content: space-between;
          align-items: center; background: transparent; border: none;
          font-size: 1rem; font-weight: 600; color: var(--text-color);
          cursor: pointer; text-align: left;
        }
        .faq-item button i { color: var(--accent-color); font-size: 1.2rem; transition: transform 0.3s; }
        .faq-answer {
          max-height: 0; overflow: hidden; padding: 0 24px;
          transition: max-height 0.4s ease, padding 0.4s ease, opacity 0.4s ease;
          opacity: 0; color: var(--text-muted);
        }
        .faq-answer.open {
          max-height: 200px; padding: 0 24px 20px; opacity: 1;
        }

        /* ---------- CONTACT ---------- */
        .contact-card {
          padding: 60px 48px; border-radius: 32px; text-align: center;
          background: var(--card-bg); backdrop-filter: blur(8px);
          border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow);
        }
        .contact-content h2 { font-size: 2rem; margin-bottom: 16px; }
        .contact-content p { color: var(--text-muted); max-width: 600px; margin: 0 auto 32px; }
        .contact-buttons { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }

        /* ---------- FOOTER ---------- */
        footer {
          padding: 40px 0; margin-top: 60px;
          border-top: 1px solid var(--border-color);
        }
        .footer-container {
          display: flex; flex-direction: column; gap: 20px;
        }
        .footer-brand {
          display: flex; align-items: center; gap: 12px;
          font-weight: 700; font-size: 1.2rem;
        }
        .footer-brand span span { font-weight: 300; color: var(--text-muted); }
        .footer-social { display: flex; gap: 20px; }
        .footer-social a {
          font-size: 1.6rem; color: var(--text-muted);
          transition: all 0.3s;
        }
        .footer-social a:hover { color: var(--accent-color); transform: scale(1.2); }
        .footer-legal { text-align: center; padding-top: 20px; border-top: 1px solid var(--border-color); }
        .legal-link {
          color: var(--text-muted); font-size: 14px; text-decoration: none;
          transition: color 0.3s;
        }
        .legal-link:hover { color: var(--accent-color); }

        /* ---------- FLOATING WA ---------- */
        .floating-wa {
          position: fixed; bottom: 30px; right: 30px;
          background: #25D366; color: #fff; width: 60px; height: 60px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 32px; box-shadow: 0 10px 25px rgba(37,211,102,0.4);
          z-index: 100; animation: pulseWa 2s infinite; text-decoration: none;
        }
        @keyframes pulseWa {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,211,102,0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(37,211,102,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,211,102,0); }
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 992px) {
          .bento-grid { grid-template-columns: 1fr 1fr; }
          .bento-large, .bento-wide { grid-column: span 1; }
          .nav-links { display: none; }
          .hamburger { display: block; }
          .mobile-menu { display: flex; flex-direction: column; }
          .mobile-menu.active { display: flex; }
          .process-timeline-line, .process-timeline-dot { left: 40px !important; }
          .process-timeline-item { justify-content: flex-end !important; }
          .process-timeline-content { width: calc(100% - 80px) !important; margin-left: auto; }
          .process-timeline-content .glass-panel { text-align: left !important; }
          .stats-container { gap: 30px; flex-wrap: wrap; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.4rem; }
          .projects-grid { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; }
          .pricing-card.popular { transform: none !important; margin-top: 15px; }
          .contact-card { padding: 40px 24px; }
          .bento-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .hero-cta { flex-direction: column; align-items: center; }
          .btn-large { width: 100%; justify-content: center; }
        }

        /* ---------- REVEAL ANIMATION ---------- */
        .reveal {
          opacity: 0; transform: translateY(40px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal.active { opacity: 1; transform: translateY(0); }

        /* ---------- SKELETON ---------- */
        .skeleton { background: linear-gradient(90deg, var(--border-color) 25%, var(--glass-border) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: skeleton 1.5s infinite; border-radius: 8px; }
        @keyframes skeleton { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton-card .project-image { background: var(--border-color); }
      `}} />
    </>
  );
}