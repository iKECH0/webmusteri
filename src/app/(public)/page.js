"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Lenis from 'lenis';

export default function PublicHomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  
  const faqs = [
    { q: "Süreç ne kadar sürüyor?", a: "Projenin kapsamına bağlı olarak genellikle 1-3 hafta içerisinde sitenizi anahtar teslim yayına alıyoruz." },
    { q: "Alan adı ve hosting dahil mi?", a: "Evet, tüm paketlerimizde ilk yıl alan adı ve yüksek hızlı sunucu (hosting) ücretsiz olarak sunulmaktadır." },
    { q: "Daha sonra kendi sitemi güncelleyebilir miyim?", a: "Kesinlikle! Size özel hazırladığımız yönetim paneli sayesinde metinleri ve görselleri kolayca değiştirebilirsiniz." },
    { q: "Arama motorlarında (Google) üst sırada çıkar mıyım?", a: "Sitenizi en güncel SEO (Arama Motoru Optimizasyonu) kurallarına göre kodluyoruz. Bu sayede organik yükselişiniz garanti altına alınır." }
  ];

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 0. Initialize Smooth Scroll (Lenis)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    let lenisRafId;
    function raf(time) {
      lenis.raf(time);
      lenisRafId = requestAnimationFrame(raf);
    }
    lenisRafId = requestAnimationFrame(raf);

    // 1. Fetch Projects (References) from API
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (data.length > 0) {
            const mappedProjects = data.map((item, index) => ({
              id: item.id || String(index),
              title: item.title || '',
              category: 'Referans',
              description: item.description || '',
              image: item.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800',
              link: item.url || '#',
              order: index
            }));
            setProjects(mappedProjects);
          } else {
            setProjects([]); // Clear default projects when DB is empty
          }
        }
      })
      .catch(err => console.error('Referanslar yüklenirken hata:', err))
      .finally(() => setIsLoading(false));

    // 2. Set Current Year in Footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    // 3. Setup Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const handleThemeToggle = () => document.body.classList.toggle('dark-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', handleThemeToggle);
    }
    
    // 4. Setup Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
          icon.classList.replace('ph-list', 'ph-x');
        } else {
          icon.classList.replace('ph-x', 'ph-list');
        }
      });

      const mobileLinks = document.querySelectorAll('.mobile-link');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('active');
          const icon = hamburger.querySelector('i');
          icon.classList.replace('ph-x', 'ph-list');
        });
      });
    }
    
    // 5. Setup Scroll Animations
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 100;
      reveals.forEach(reveal => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add('active');
        }
      });

      // Process Timeline Progress
      const timelineLine = document.querySelector('.process-timeline-progress-fill');
      const timelineContainer = document.querySelector('.process-timeline-container');
      if (timelineLine && timelineContainer) {
        const containerTop = timelineContainer.getBoundingClientRect().top;
        const containerHeight = timelineContainer.offsetHeight;
        if (containerTop < windowHeight / 2) {
          const scrollDistance = (windowHeight / 2) - containerTop;
          const progress = Math.max(0, Math.min(100, (scrollDistance / containerHeight) * 100));
          timelineLine.style.height = progress + '%';
          
          const dots = document.querySelectorAll('.process-timeline-dot');
          dots.forEach(dot => {
            if (dot.getBoundingClientRect().top < windowHeight / 2 + 50) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }
      }
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // init
    
    // 6. Setup Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    });

    // Initialize VanillaTilt if available
    if (typeof window.VanillaTilt !== 'undefined') {
      window.VanillaTilt.init(document.querySelectorAll(".project-card"));
    }

    // 7. Setup Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    if (cursor && follower) {
      let mouseX = 0, mouseY = 0;
      let followerX = 0, followerY = 0;

      const handleMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
      };

      document.addEventListener('mousemove', handleMouseMove);

      let animationFrame;
      const animate = () => {
        followerX += (mouseX - followerX) * 0.2;
        followerY += (mouseY - followerY) * 0.2;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
        animationFrame = requestAnimationFrame(animate);
      };
      animate();

      // Add hover effects for cursor
      const interactiveEls = document.querySelectorAll('a, button, .project-card, .feature-card, .contact-card');
      const handleMouseOver = () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      };
      const handleMouseLeave = () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      };
      
      interactiveEls.forEach(el => {
        el.addEventListener('mouseenter', handleMouseOver);
        el.addEventListener('mouseleave', handleMouseLeave);
      });

      return () => {
        if (themeBtn) themeBtn.removeEventListener('click', handleThemeToggle);
        lenis.destroy();
        cancelAnimationFrame(lenisRafId);
        document.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrame);
        interactiveEls.forEach(el => {
          el.removeEventListener('mouseenter', handleMouseOver);
          el.removeEventListener('mouseleave', handleMouseLeave);
        });
      };
    }
  }, []);

  useEffect(() => {
    // Re-initialize VanillaTilt when projects change
    if (typeof window.VanillaTilt !== 'undefined') {
      window.VanillaTilt.init(document.querySelectorAll(".project-card"));
    }
  }, [projects]);

  return (
    <>
      <div className="custom-cursor"></div>
      <div className="custom-cursor-follower"></div>
      <div className="background-pattern"></div>

      <nav className="navbar">
          <div className="nav-container container">
              <div className="logo">
                  <a href="#">kodiva<span>website</span></a>
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
                  <a href="#contact" className="btn btn-primary">İletişime Geç</a>
                  <button className="hamburger" id="hamburger">
                      <i className="ph ph-list"></i>
                  </button>
              </div>
          </div>
          {/* Mobile Menu */}
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
          {/* Hero Section */}
          <section className="hero container reveal">
              <div className="hero-glow"></div>
              <div className="hero-badge">
                  <span className="live-indicator"></span>
                  Yeni Projeler Eklendi
              </div>
              <h1 className="hero-title">
                  İşletmenizin Dijital Vitrinini<br />
                  <span className="highlight">Birlikte İnşa Ettik.</span>
              </h1>
              <p className="hero-subtitle">
                  Farklı sektörlerden işletmeler için hazırladığım, hızlı, modern ve mobil uyumlu web sitelerine buradan göz atabilirsiniz. İhtiyacınıza en uygun çözümleri sunuyorum.
              </p>
              <div className="hero-cta">
                  <a href="#projects" className="btn btn-primary btn-large">Projeleri İncele <i className="ph ph-arrow-right"></i></a>
                  <a href="#contact" className="btn btn-outline btn-large">Benimle Çalışın</a>
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
                  {/* Duplicate for infinite loop */}
                  <span aria-hidden="true">React</span><span className="dot" aria-hidden="true">•</span>
                  <span aria-hidden="true">Next.js</span><span className="dot" aria-hidden="true">•</span>
                  <span aria-hidden="true">Node.js</span><span className="dot" aria-hidden="true">•</span>
                  <span aria-hidden="true">PostgreSQL</span><span className="dot" aria-hidden="true">•</span>
                  <span aria-hidden="true">Figma</span><span className="dot" aria-hidden="true">•</span>
                  <span aria-hidden="true">Tailwind</span><span className="dot" aria-hidden="true">•</span>
                  <span aria-hidden="true">Vercel</span><span className="dot" aria-hidden="true">•</span>
              </div>
          </div>

          {/* Projects Section */}
          <section id="projects" className="projects container reveal">
              <div className="section-header">
                  <h2>Öne Çıkan Projeler</h2>
                  <p>Yakın zamanda tamamlanan işlerden bazıları</p>
              </div>
              
              <div className="projects-grid" id="projects-grid">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <article key={idx} className="project-card skeleton-card">
                          <div className="project-image skeleton"></div>
                          <div className="project-content">
                              <div className="skeleton skeleton-text" style={{ width: '50%', height: '24px', marginBottom: '12px' }}></div>
                              <div className="skeleton skeleton-text" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
                              <div className="skeleton skeleton-text" style={{ width: '80%', height: '14px', marginBottom: '24px' }}></div>
                              <div className="skeleton skeleton-text" style={{ width: '120px', height: '16px' }}></div>
                          </div>
                      </article>
                    ))
                  ) : projects.length > 0 ? (
                    projects.map(project => (
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
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <p>Yakında yeni projeler eklenecektir.</p>
                    </div>
                  )}
              </div>
          </section>

          {/* Why Me Section */}
          <section id="why-me" className="why-me container reveal">
              <div className="section-header">
                  <h2>Neden Benimle Çalışmalısınız?</h2>
                  <p>Projelerinizi hayata geçirirken sunduğum avantajlar</p>
              </div>
              
              <div className="bento-grid">
                  <div className="bento-item bento-large glass-panel">
                      <div className="bento-glow"></div>
                      <div className="feature-icon"><i className="ph ph-lightning"></i></div>
                      <h3>Işık Hızında Performans</h3>
                      <p>Sitenizin yüklenme hızını saniyelerin altına indirerek, ziyaretçilerinizi sıkılmadan sitede tutuyoruz. Modern mimariler ile 100/100 PageSpeed skoru hedeflenir.</p>
                  </div>
                  <div className="bento-item glass-panel">
                      <div className="bento-glow"></div>
                      <div className="feature-icon"><i className="ph ph-device-mobile"></i></div>
                      <h3>Mobil Öncelikli</h3>
                      <p>Kullanıcıların %80'i mobil cihazlarda. Siteniz telefonda bir uygulama gibi hissettirecek.</p>
                  </div>
                  <div className="bento-item glass-panel">
                      <div className="bento-glow"></div>
                      <div className="feature-icon"><i className="ph ph-magnifying-glass"></i></div>
                      <h3>Google Dostu (SEO)</h3>
                      <p>Temiz kodlama ve optimize içerik yapısı ile rakiplerinizi organik aramalarda geride bırakın.</p>
                  </div>
                  <div className="bento-item bento-wide glass-panel">
                      <div className="bento-glow"></div>
                      <div className="feature-icon"><i className="ph ph-shield-check"></i></div>
                      <h3>Üst Düzey Güvenlik ve Uygun Fiyat</h3>
                      <p>Premium tasarımı, siber saldırılara karşı maksimum güvenlikle ve bütçe dostu fiyatlandırma ile sunuyoruz. SSL, veri şifreleme ve düzenli yedekleme hizmetleri.</p>
                  </div>
              </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="pricing container reveal">
              <div className="section-header">
                  <h2>Hizmet Paketleri</h2>
                  <p>İhtiyacınıza ve bütçenize en uygun çözümü seçin</p>
              </div>
              
              <div className="pricing-grid">
                  {/* Starter */}
                  <div className="pricing-card glass-panel" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" suppressHydrationWarning>
                      <h3 className="pricing-title">Başlangıç</h3>
                      <p className="pricing-desc">Küçük işletmeler ve kişisel portfolyolar için ideal tek sayfalık yapı.</p>
                      <ul className="pricing-features">
                          <li><i className="ph-fill ph-check-circle"></i> Tek Sayfa (One-Page) Tasarım</li>
                          <li><i className="ph-fill ph-check-circle"></i> Mobil Uyumlu (Responsive)</li>
                          <li><i className="ph-fill ph-check-circle"></i> İletişim Formu</li>
                          <li><i className="ph-fill ph-check-circle"></i> Temel SEO Altyapısı</li>
                      </ul>
                      <a href="#contact" className="btn btn-outline pricing-btn">Teklif Alın</a>
                  </div>
                  
                  {/* Professional */}
                  <div className="pricing-card glass-panel popular" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2" suppressHydrationWarning>
                      <div className="pricing-glow-border"></div>
                      <div className="popular-badge">EN ÇOK TERCİH EDİLEN</div>
                      <h3 className="pricing-title">Kurumsal</h3>
                      <p className="pricing-desc">Şirketler ve markalar için çok sayfalı, dinamik ve kapsamlı web sitesi.</p>
                      <ul className="pricing-features">
                          <li><i className="ph-fill ph-check-circle"></i> Çok Sayfalı Premium Tasarım</li>
                          <li><i className="ph-fill ph-check-circle"></i> Yönetim Paneli (İçerik Yönetimi)</li>
                          <li><i className="ph-fill ph-check-circle"></i> Gelişmiş SEO ve Hız Optimizasyonu</li>
                          <li><i className="ph-fill ph-check-circle"></i> 1 Yıl Ücretsiz Alan Adı & Hosting</li>
                      </ul>
                      <a href="#contact" className="btn btn-primary pricing-btn">Teklif Alın</a>
                  </div>

                  {/* E-Commerce */}
                  <div className="pricing-card glass-panel" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1" suppressHydrationWarning>
                      <h3 className="pricing-title">E-Ticaret</h3>
                      <p className="pricing-desc">Ürünlerinizi internetten güvenle satabileceğiniz sanal mağaza.</p>
                      <ul className="pricing-features">
                          <li><i className="ph-fill ph-check-circle"></i> Sınırsız Ürün ve Kategori</li>
                          <li><i className="ph-fill ph-check-circle"></i> Güvenli Ödeme (Sanal POS)</li>
                          <li><i className="ph-fill ph-check-circle"></i> Kargo ve Sipariş Takip Modülü</li>
                          <li><i className="ph-fill ph-check-circle"></i> Sepet Kurtarma ve Promosyonlar</li>
                      </ul>
                      <a href="#contact" className="btn btn-outline pricing-btn">Teklif Alın</a>
                  </div>
              </div>
          </section>

          {/* Timeline / Process Section */}
          <section id="process" className="process container reveal" style={{ paddingTop: '100px' }}>
              <div className="section-header">
                  <h2>Nasıl Çalışıyoruz?</h2>
                  <p>Fikrinizden yayına kadar geçen şeffaf ve hızlı sürecimiz</p>
              </div>
              <div className="process-timeline-container" style={{ position: 'relative', maxWidth: '800px', margin: '40px auto 0', padding: '0 20px' }}>
                  <div className="process-timeline-line" style={{ position: 'absolute', left: '50%', top: '0', bottom: '0', width: '4px', background: 'var(--glass-border)', transform: 'translateX(-50%)', borderRadius: '4px', opacity: '0.5' }}></div>
                  <div className="process-timeline-progress-fill" style={{ position: 'absolute', left: '50%', top: '0', height: '0%', width: '4px', background: 'linear-gradient(to bottom, var(--accent-color), #8b5cf6, #10b981)', transform: 'translateX(-50%)', borderRadius: '4px', transition: 'height 0.1s ease-out' }}></div>
                  
                  {[
                    { step: '1', title: 'Strateji ve Planlama', desc: 'İhtiyaç analizinizin yapılması, hedeflerin belirlenmesi ve dijital haritanızın çıkarılması.', icon: 'ph-target' },
                    { step: '2', title: 'Tasarım ve Arayüz', desc: 'Kurumsal kimliğinize uygun, premium ve kullanıcı dostu (UI/UX) görünümün tasarlanması.', icon: 'ph-pen-nib' },
                    { step: '3', title: 'Yazılım ve Kodlama', desc: 'Son teknoloji altyapı ile sitenizin sıfırdan kodlanması ve SEO altyapısının kurulması.', icon: 'ph-code' },
                    { step: '4', title: 'Test ve Optimizasyon', desc: 'Mobil cihaz uyumluluğu, güvenlik ve Google hız (PageSpeed) testlerinin yapılması.', icon: 'ph-check-circle' },
                    { step: '5', title: 'Yayına Alma', desc: 'Projenin anahtar teslim olarak canlıya alınması ve kontrol panelinizin teslimi.', icon: 'ph-rocket' },
                  ].map((s, i) => (
                    <div key={i} className="process-timeline-item" style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', alignItems: 'center', marginBottom: '40px', width: '100%', position: 'relative' }}>
                      <div className="process-timeline-dot" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--card-bg)', border: '4px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: 'var(--text-muted)', transition: 'all 0.4s ease' }}>
                        <i className={`ph ${s.icon}`} style={{ fontSize: '24px' }}></i>
                      </div>
                      <div className="process-timeline-content" style={{ width: '45%' }}>
                        <div className="glass-panel" style={{ padding: '24px', textAlign: i % 2 === 0 ? 'right' : 'left', borderRadius: '16px', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--glass-shadow)'; }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-color)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Adım {s.step}</div>
                          <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-color)', marginBottom: '12px' }}>{s.title}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="testimonials container reveal" style={{ paddingTop: '100px' }}>
              <div className="section-header">
                  <h2>Ne Dediler?</h2>
                  <p>Benimle çalışan müşterilerimin deneyimleri</p>
              </div>
              <div className="testimonials-marquee-container">
                  <div className="testimonials-marquee-content">
                      {/* Original Items */}
                      <div className="glass-panel testimonial-card">
                          <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                          <p className="testimonial-text">"Sitemiz eski ve yavaştı. Kodiva ile çalıştıktan sonra hem harika bir tasarıma kavuştuk hem de Google'da ilk sayfaya çıktık. İletişimi ve hızı muazzamdı."</p>
                          <div className="testimonial-author">
                              <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }}></div>
                              <div>
                                  <h4>Ahmet Yılmaz</h4>
                                  <span>Cafe Roma İşletmecisi</span>
                              </div>
                          </div>
                      </div>
                      <div className="glass-panel testimonial-card">
                          <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                          <p className="testimonial-text">"Estetik ve zarafet bizim sektörde her şeydir. Beklentimizin çok üstünde premium bir site teslim aldık. Randevularımız gözle görülür şekilde arttı."</p>
                          <div className="testimonial-author">
                              <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}></div>
                              <div>
                                  <h4>Ayşe K.</h4>
                                  <span>Güzellik Merkezi Kurucusu</span>
                              </div>
                          </div>
                      </div>
                      <div className="glass-panel testimonial-card">
                          <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                          <p className="testimonial-text">"E-ticaret sitemizi kurarken tüm detaylarla bizzat ilgilendi. Sadece siteyi yapmakla kalmadı, satış stratejileri konusunda da ufkumuzu açtı."</p>
                          <div className="testimonial-author">
                              <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }}></div>
                              <div>
                                  <h4>Caner T.</h4>
                                  <span>TechStore Kurucusu</span>
                              </div>
                          </div>
                      </div>

                      {/* Duplicate Items for Infinite Scroll */}
                      <div className="glass-panel testimonial-card" aria-hidden="true">
                          <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                          <p className="testimonial-text">"Sitemiz eski ve yavaştı. Kodiva ile çalıştıktan sonra hem harika bir tasarıma kavuştuk hem de Google'da ilk sayfaya çıktık. İletişimi ve hızı muazzamdı."</p>
                          <div className="testimonial-author">
                              <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }}></div>
                              <div>
                                  <h4>Ahmet Yılmaz</h4>
                                  <span>Cafe Roma İşletmecisi</span>
                              </div>
                          </div>
                      </div>
                      <div className="glass-panel testimonial-card" aria-hidden="true">
                          <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                          <p className="testimonial-text">"Estetik ve zarafet bizim sektörde her şeydir. Beklentimizin çok üstünde premium bir site teslim aldık. Randevularımız gözle görülür şekilde arttı."</p>
                          <div className="testimonial-author">
                              <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}></div>
                              <div>
                                  <h4>Ayşe K.</h4>
                                  <span>Güzellik Merkezi Kurucusu</span>
                              </div>
                          </div>
                      </div>
                      <div className="glass-panel testimonial-card" aria-hidden="true">
                          <i className="ph-fill ph-quotes testimonial-quote-icon"></i>
                          <p className="testimonial-text">"E-ticaret sitemizi kurarken tüm detaylarla bizzat ilgilendi. Sadece siteyi yapmakla kalmadı, satış stratejileri konusunda da ufkumuzu açtı."</p>
                          <div className="testimonial-author">
                              <div className="testimonial-avatar" style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }}></div>
                              <div>
                                  <h4>Caner T.</h4>
                                  <span>TechStore Kurucusu</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="faq container reveal" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
              <div className="section-header">
                  <h2>Sıkça Sorulan Sorular</h2>
                  <p>Aklınızdaki soru işaretlerini giderelim</p>
              </div>
              <div style={{ maxWidth: '800px', margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {faqs.map((faq, index) => (
                      <div key={index} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                          <button 
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            style={{ width: '100%', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-color)', fontSize: '16px', fontWeight: 600 }}
                          >
                              {faq.q}
                              <i className={`ph ${openFaq === index ? 'ph-caret-up' : 'ph-caret-down'}`} style={{ color: 'var(--accent-color)', fontSize: '20px' }}></i>
                          </button>
                          <div style={{ maxHeight: openFaq === index ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease', padding: openFaq === index ? '0 25px 20px' : '0 25px', opacity: openFaq === index ? 1 : 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                              {faq.a}
                          </div>
                      </div>
                  ))}
              </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="contact container reveal">
              <div className="contact-card glass-panel">
                  <div className="contact-content">
                      <h2>Sizin de bir web sitesine mi ihtiyacınız var?</h2>
                      <p>İşletmenizi dijitale taşımak veya mevcut sitenizi yenilemek için benimle hemen iletişime geçin. Hedeflerinizi birlikte gerçekleştirelim.</p>
                      <div className="contact-buttons">
                          <a href="https://wa.me/905555555555" target="_blank" className="btn btn-whatsapp">
                              <i className="ph-fill ph-whatsapp-logo"></i> WhatsApp&apos;tan Yazın
                          </a>
                          <a href="mailto:hello@ufukstudio.com" className="btn btn-email">
                              <i className="ph-fill ph-envelope"></i> E-Posta Gönderin
                          </a>
                      </div>
                  </div>
              </div>
          </section>
      </main>

      <footer>
          <div className="footer-container container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
                  <div className="footer-brand">
                      kodiva<span>website</span> &copy; <span id="current-year"></span>
                  </div>
                  <div className="footer-social">
                      <a href="#" aria-label="Instagram"><i className="ph ph-instagram-logo"></i></a>
                      <a href="#" aria-label="LinkedIn"><i className="ph ph-linkedin-logo"></i></a>
                      <a href="#" aria-label="GitHub"><i className="ph ph-github-logo"></i></a>
                  </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center' }}>
                  <Link href="/gizlilik-politikasi" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      Gizlilik Politikası
                  </Link>
              </div>
          </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/905555555555" target="_blank" rel="noreferrer" style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: '#25D366',
        color: 'white',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        boxShadow: '0 10px 25px rgba(37, 211, 102, 0.4)',
        zIndex: 100,
        animation: 'pulse-wa 2s infinite',
        textDecoration: 'none'
      }}>
        <i className="ph-fill ph-whatsapp-logo"></i>
      </a>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-wa {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        @media (max-width: 768px) {
          .process-timeline-line { left: 40px !important; }
          .process-timeline-dot { left: 40px !important; }
          .process-timeline-item { justify-content: flex-end !important; }
          .process-timeline-content { width: calc(100% - 80px) !important; margin-left: auto; }
          .process-timeline-content .glass-panel { text-align: left !important; }
          .pricing-card.popular { transform: none !important; margin-top: 15px; }
        }
      `}} />
    </>
  );
}
