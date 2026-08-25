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
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="afterInteractive" />
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1696269471434036');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1696269471434036&ev=PageView&noscript=1" alt="" />
        </noscript>
        {children}
      </body>
    </html>
  );
}
