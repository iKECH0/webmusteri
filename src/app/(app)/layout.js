import "../globals.css";

export const metadata = {
  title: "Dijital Ajans CRM | Akıllı Müşteri Takip Sistemi",
  description: "Google Haritalar üzerinden potansiyel müşterilerinizi bulun, yapay zeka destekli kurumsal teklifler oluşturun ve satış sürecinizi tek bir noktadan yönetin.",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ajans CRM" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
