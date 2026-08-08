import { db } from '@/lib/db';

export async function generateMetadata({ params }) {
  const { token } = await params;
  let title = "Size Özel Dijital Dönüşüm Teklifi";
  let description = "İşletmenizi dijitale taşımak için hazırladığımız özel yatırım planı ve analiz raporunu hemen inceleyin.";
  let companyName = "İşletmeniz";

  try {
    const res = await db.query('SELECT name FROM leads WHERE portal_token = $1', [token]);
    if (res.rows[0]) {
      companyName = res.rows[0].name;
      title = `${companyName} | Özel Dijital Dönüşüm Teklifi`;
    }
  } catch (e) {
    console.error("Metadata fetch error:", e);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Dijital Dönüşüm Portalı",
      images: [
        {
          url: "https://kodivawebsite.com/logo.jpg", // Professional business logo
          width: 1200,
          height: 630,
          alt: "Kodiva Web Tasarım Sunumu",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ["https://kodivawebsite.com/logo.jpg"],
    },
  };
}

export default function PortalLayout({ children }) {
  return children;
}
