import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function OdemeBasariliPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f4ee', color: '#1c1a16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ maxWidth: 500, width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(20,16,10,0.08)', borderRadius: 24, padding: '48px 32px' }}>

        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#16a34a" />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 16px', color: '#1c1a16' }}>Ödemeniz Alındı!</h1>
        <p style={{ fontSize: 15, color: '#6b6459', lineHeight: 1.6, margin: '0 0 32px' }}>
          Teşekkür ederiz. Ödemeniz başarıyla sistemimize yansıdı.
          <br /><br />
          <b>ÖNEMLİ:</b> Kodiva ekibi projenizi inceleyecek ve <b>Manuel Onay</b> sürecinden sonra hizmetiniz (Aboneliğiniz) aktif edilecektir. Sizinle en kısa sürede iletişime geçeceğiz.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/" style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(20,16,10,0.06)', color: '#1c1a16', textDecoration: 'none', fontWeight: 600 }}>
            Ana Sayfaya Dön
          </Link>
          <a href="https://wa.me/905432300157" target="_blank" rel="noreferrer" style={{ padding: '12px 24px', borderRadius: 12, background: '#4f46e5', color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            Bize Ulaşın <ArrowRight size={16} />
          </a>
        </div>

      </div>

    </div>
  );
}
