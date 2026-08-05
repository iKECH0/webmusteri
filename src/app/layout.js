import "./globals.css";

export const metadata = {
  title: "Oto & Halı Yıkama CRM | Müşteri Bulucu",
  description: "Google Haritalar üzerinden oto yıkama ve halı yıkama firmalarını bulun, web sitesi olmayanları tespit edin ve müşteri takibini CRM ile yönetin.",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Yıkama CRM" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
