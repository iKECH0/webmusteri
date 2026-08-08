"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PublicHomePage() {
  const [projects, setProjects] = useState([
    {
        "id": "1",
        "title": "Cafe Roma",
        "category": "Restoran",
        "description": "Menü, online rezervasyon ve konum bilgisi içeren modern, mobil uyumlu restoran web sitesi.",
        "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
        "link": "#",
        "order": 0
    },
    {
        "id": "2",
        "title": "Güzellik Merkezi",
        "category": "Kuaför / Bakım",
        "description": "Hizmetlerin sergilendiği, randevu formu ve galeri içeren zarif tasarımlı tanıtım sitesi.",
        "image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
        "link": "#",
        "order": 1
    },
    {
        "id": "3",
        "title": "TechStore",
        "category": "E-Ticaret",
        "description": "Hızlı, güvenli ödeme altyapılı ve gelişmiş ürün filtrelemeye sahip e-ticaret platformu.",
        "image": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800",
        "link": "#",
        "order": 2
    }
  ]);

  useEffect(() => {
    // 2. Set Current Year in Footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    
    // 3. Setup Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
      });
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
        document.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrame);
        interactiveEls.forEach(el => {
          el.removeEventListener('mouseenter', handleMouseOver);
          el.removeEventListener('mouseleave', handleMouseLeave);
        });
      };
    }
  }, []);

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
              <a href="#contact" className="mobile-link">İletişim</a>
              <a href="#contact" className="btn btn-primary mobile-cta">İletişime Geç</a>
          </div>
      </nav>

      <main>
          {/* Hero Section */}
          <section className="hero container reveal">
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

          {/* Projects Section */}
          <section id="projects" className="projects container reveal">
              <div className="section-header">
                  <h2>Öne Çıkan Projeler</h2>
                  <p>Yakın zamanda tamamlanan işlerden bazıları</p>
              </div>
              
              <div className="projects-grid" id="projects-grid">
                  {projects.map(project => (
                    <article key={project.id} className="project-card" data-tilt data-tilt-max="5" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
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
                  ))}
              </div>
          </section>

          {/* Why Me Section */}
          <section id="why-me" className="why-me container reveal">
              <div className="section-header">
                  <h2>Neden Benimle Çalışmalısınız?</h2>
                  <p>Projelerinizi hayata geçirirken sunduğum avantajlar</p>
              </div>
              
              <div className="features-grid">
                  <div className="feature-card">
                      <div className="feature-icon"><i className="ph ph-lightning"></i></div>
                      <h3>Hızlı Teslimat</h3>
                      <p>Zamanınızın değerli olduğunu biliyorum. Projeleri anlaştığımız takvime sadık kalarak, en kısa sürede teslim ediyorum.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon"><i className="ph ph-device-mobile"></i></div>
                      <h3>Mobil Uyumlu Tasarım</h3>
                      <p>Tasarımlarım tüm cihazlarda kusursuz görünür. Ziyaretçileriniz telefondan girse bile harika bir deneyim yaşar.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon"><i className="ph ph-magnifying-glass"></i></div>
                      <h3>SEO Uyumlu</h3>
                      <p>Arama motorlarında üst sıralarda çıkmanız için temiz kod ve en iyi SEO pratikleriyle kodlama yapıyorum.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon"><i className="ph ph-wallet"></i></div>
                      <h3>Uygun Fiyat</h3>
                      <p>Bütçenizi yormayacak, ihtiyacınıza tam uygun, şeffaf ve yüksek fiyat/performans oranına sahip çözümler sunuyorum.</p>
                  </div>
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
          <div className="footer-container container">
              <div className="footer-brand">
                  kodiva<span>website</span> &copy; <span id="current-year"></span>
              </div>
              <div className="footer-social">
                  <a href="#" aria-label="Instagram"><i className="ph ph-instagram-logo"></i></a>
                  <a href="#" aria-label="LinkedIn"><i className="ph ph-linkedin-logo"></i></a>
                  <a href="#" aria-label="GitHub"><i className="ph ph-github-logo"></i></a>
              </div>
          </div>
      </footer>
    </>
  );
}
