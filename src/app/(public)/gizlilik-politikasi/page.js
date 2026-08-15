"use client";

import { useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    // Basic Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const handleThemeToggle = () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
    
    if (themeToggle) {
      themeToggle.addEventListener('click', handleThemeToggle);
    }
    
    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const handleHamburgerClick = () => {
      mobileMenu?.classList.toggle('active');
    };
    
    if (hamburger) {
      hamburger.addEventListener('click', handleHamburgerClick);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (themeToggle) themeToggle.removeEventListener('click', handleThemeToggle);
      if (hamburger) hamburger.removeEventListener('click', handleHamburgerClick);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Gizlilik Politikası | Kodiva Web Tasarım Ajansı</title>
        <meta name="description" content="KODİVA olarak kullanıcılarımızın ve müşterilerimizin kişisel verilerinin gizliliğine önem veriyoruz." />
        <link rel="canonical" href="https://kodiva.vercel.app/gizlilik-politikasi" />
      </Head>

      <div className="background-pattern"></div>

      <nav className="navbar">
          <div className="nav-container container">
              <div className="logo">
                  <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/favicon.svg" alt="Kodiva Logo" style={{ height: '36px', width: 'auto' }} />
                    kodiva<span>website</span>
                  </Link>
              </div>
              
              <div className="nav-links">
                  <Link href="/#projects">Projeler</Link>
                  <Link href="/#why-me">Hakkımda</Link>
                  <Link href="/#pricing">Paketler</Link>
                  <Link href="/#process">Süreç</Link>
                  <Link href="/#contact">İletişim</Link>
              </div>

              <div className="nav-actions">
                  <button className="theme-toggle" id="theme-toggle" aria-label="Tema Değiştir">
                      <i className="ph ph-sun sun-icon"></i>
                      <i className="ph ph-moon moon-icon"></i>
                  </button>
                  <Link href="/#contact" className="btn btn-primary">İletişime Geç</Link>
                  <button className="hamburger" id="hamburger">
                      <i className="ph ph-list"></i>
                  </button>
              </div>
          </div>
          {/* Mobile Menu */}
          <div className="mobile-menu" id="mobile-menu">
              <Link href="/#projects" className="mobile-link">Projeler</Link>
              <Link href="/#why-me" className="mobile-link">Hakkımda</Link>
              <Link href="/#pricing" className="mobile-link">Paketler</Link>
              <Link href="/#process" className="mobile-link">Süreç</Link>
              <Link href="/#contact" className="mobile-link">İletişim</Link>
              <Link href="/#contact" className="btn btn-primary mobile-cta">İletişime Geç</Link>
          </div>
      </nav>

      <main style={{ paddingTop: '150px', paddingBottom: '100px', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '20px', color: 'var(--text-color)', textAlign: 'center' }}>GİZLİLİK POLİTİKASI</h1>
            
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '40px', textAlign: 'center', fontSize: '16px' }}>
              KODİVA olarak kullanıcılarımızın ve müşterilerimizin kişisel verilerinin gizliliğine önem veriyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret eden veya hizmetlerimizden yararlanan kişilerin bilgilerinin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklar.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-info"></i> 1. Toplanan Bilgiler
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  Web sitemiz ve iletişim kanallarımız üzerinden aşağıdaki bilgiler toplanabilir:
                </p>
                <ul style={{ color: 'var(--text-muted)', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '15px' }}>
                  <li>Ad ve soyad</li>
                  <li>Telefon numarası</li>
                  <li>E-posta adresi</li>
                  <li>İşletme adı</li>
                  <li>İşletme sektörü</li>
                  <li>Web sitesi bilgileri</li>
                  <li>Kullanıcının bizimle iletişim sırasında gönüllü olarak paylaştığı diğer bilgiler</li>
                  <li>IP adresi, tarayıcı bilgileri, cihaz bilgileri ve site kullanımına ilişkin teknik veriler</li>
                </ul>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Kişisel bilgiler yalnızca ilgili hizmetin sunulması, iletişim kurulması, müşteri taleplerinin değerlendirilmesi ve hizmet kalitesinin geliştirilmesi amacıyla kullanılacaktır.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-briefcase"></i> 2. Bilgilerin Kullanım Amaçları
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  Toplanan bilgiler aşağıdaki amaçlarla kullanılabilir:
                </p>
                <ul style={{ color: 'var(--text-muted)', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Web tasarım ve dijital hizmet taleplerini değerlendirmek</li>
                  <li>Kullanıcılarla iletişim kurmak</li>
                  <li>Fiyat teklifi ve hizmet bilgisi sunmak</li>
                  <li>Kullanıcı tarafından talep edilen ücretsiz demo veya ön çalışma hazırlamak</li>
                  <li>Hizmetlerin sağlanması ve geliştirilmesi</li>
                  <li>Teknik destek ve müşteri hizmetleri sağlamak</li>
                  <li>Güvenlik, hata tespiti ve kötüye kullanımı önlemek</li>
                  <li>Yasal yükümlülükleri yerine getirmek</li>
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-share-network"></i> 3. Kişisel Verilerin Paylaşılması
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  KODİVA, kişisel bilgileri izinsiz şekilde üçüncü kişilere satmaz veya kiralamaz.
                </p>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Kişisel veriler yalnızca hizmetin sunulmasının gerekli olduğu durumlarda, teknik hizmet sağlayıcılarla veya yasal olarak yetkili kurum ve kuruluşlarla, yürürlükteki mevzuata uygun şekilde paylaşılabilir.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-megaphone"></i> 4. Meta ve Reklam Formları
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  KODİVA, Meta platformları üzerinden reklam ve potansiyel müşteri formları kullanabilir.
                </p>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  Kullanıcıların Meta reklamları aracılığıyla gönderdiği ad, telefon numarası ve benzeri bilgiler; kullanıcı tarafından talep edilen web tasarım hizmeti, ücretsiz demo, fiyat bilgisi veya iletişim amacıyla kullanılabilir.
                </p>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Meta platformlarında gerçekleştirilen veri işlemleri ayrıca Meta'nın kendi gizlilik politikalarına tabi olabilir.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-cookie"></i> 5. Çerezler ve Teknik Veriler
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  Web sitemizde kullanıcı deneyimini geliştirmek, güvenliği sağlamak, trafik ölçümlemek ve reklam performansını değerlendirmek amacıyla çerezler veya benzeri teknolojiler kullanılabilir.
                </p>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Kullanıcılar tarayıcı ayarları üzerinden çerezleri yönetebilir veya devre dışı bırakabilir. Ancak bazı çerezlerin kapatılması web sitesinin bazı işlevlerinin düzgün çalışmamasına neden olabilir.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-shield-check"></i> 6. Veri Güvenliği
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  KODİVA, kişisel verilerin yetkisiz erişim, kayıp, kötüye kullanım, değiştirilme veya ifşa edilmesine karşı korunması için makul teknik ve idari güvenlik önlemleri almaya çalışır.
                </p>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Bununla birlikte, internet üzerinden gerçekleştirilen hiçbir veri aktarımının tamamen risksiz olduğu garanti edilemez.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-clock"></i> 7. Verilerin Saklanma Süresi
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  Kişisel veriler, işlenme amaçlarının gerektirdiği süre boyunca veya ilgili mevzuatta öngörülen yasal süreler boyunca saklanabilir.
                </p>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Saklama süresi sona erdiğinde, ilgili veriler mevzuata uygun şekilde silinir, yok edilir veya anonim hale getirilir.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-user-focus"></i> 8. Kullanıcı Hakları
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  Yürürlükteki mevzuat kapsamında kullanıcılar, kişisel verileriyle ilgili olarak bilgi talep etme, verilerinin işlenip işlenmediğini öğrenme, düzeltme, silme veya mevzuat kapsamında diğer haklarını kullanma taleplerinde bulunabilir.
                </p>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Bu tür talepler için KODİVA'nın resmi iletişim kanalları kullanılabilir.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-buildings"></i> 9. Üçüncü Taraf Hizmetler
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  Web sitemizde veya reklam çalışmalarımızda Google, Meta, analiz hizmetleri, hosting sağlayıcıları, ödeme sistemleri veya benzeri üçüncü taraf hizmet sağlayıcılar kullanılabilir.
                </p>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  Bu hizmet sağlayıcıların kendi gizlilik politikaları ve veri işleme kuralları bulunabilir.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-baby"></i> 10. Çocukların Gizliliği
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  KODİVA hizmetleri doğrudan çocuklara yönelik değildir. Bilerek çocuklardan kişisel veri toplamayı amaçlamıyoruz.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-file-text"></i> 11. Politika Değişiklikleri
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8' }}>
                  KODİVA, gerekli gördüğü durumlarda bu Gizlilik Politikası'nı güncelleyebilir. Güncellenen politika web sitesinde yayımlandığı tarihten itibaren geçerli olur.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '22px', color: 'var(--accent-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="ph-fill ph-envelope"></i> 12. İletişim
                </h2>
                <p style={{ color: 'var(--text-color)', lineHeight: '1.8', marginBottom: '15px' }}>
                  Gizlilik ve kişisel verilerle ilgili sorularınız veya talepleriniz için aşağıdaki iletişim kanallarından KODİVA ile iletişime geçebilirsiniz:
                </p>
                <ul style={{ color: 'var(--text-muted)', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
                  <li><strong style={{ color: 'var(--text-color)' }}>KODİVA</strong></li>
                  <li><strong style={{ color: 'var(--text-color)' }}>Web Sitesi:</strong> <a href="https://kodiva.vercel.app/" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>https://kodiva.vercel.app/</a></li>
                  <li><strong style={{ color: 'var(--text-color)' }}>E-posta:</strong> <a href="mailto:hello@ufukstudio.com" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>hello@ufukstudio.com</a></li>
                  <li><strong style={{ color: 'var(--text-color)' }}>Telefon / WhatsApp:</strong> <a href="https://wa.me/905555555555" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>+90 555 555 55 55</a></li>
                </ul>
              </section>

            </div>

            <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Son Güncelleme: 15 Ağustos 2026
            </div>

          </div>
        </div>
      </main>

      <footer>
          <div className="footer-container container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
                  <div className="footer-brand">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
                    <img src="/favicon.svg" alt="Kodiva Logo" style={{ height: '28px', width: 'auto' }} />
                    <span>kodiva<span>website</span> &copy; <span>2026</span></span>
                  </div>
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
        textDecoration: 'none'
      }}>
        <i className="ph-fill ph-whatsapp-logo"></i>
      </a>

    </>
  );
}
