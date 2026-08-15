import "./public.css";
import Script from "next/script";

export const metadata = {
  title: "Kodiva Web Tasarım Ajansı",
  description: "İşletmenizin Dijital Vitrinini Birlikte İnşa Ettik.",
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ]
  },
  appleWebApp: {
    title: 'KodivaWeb',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function PublicLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js" strategy="afterInteractive" />
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="afterInteractive" />
      </head>
      <body className="dark-theme">
        {children}
      </body>
    </html>
  );
}
