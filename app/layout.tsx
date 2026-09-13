import type { Metadata } from "next";
import { PageTheme } from "@/components/page-theme";
import "./globals.css";

const SITE_URL = "https://ucsdxcrs.web.app";
const SITE_TITLE = "Triton Motorsports";
const SITE_DESCRIPTION =
  "Triton Motorsports — official racing team, partnered with Collegiate Racing Series for hands-on motorsports education.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "Triton Motorsports",
    "Collegiate Racing Series",
    "CRS",
    "IMSA",
    "student racing team",
    "motorsports",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Triton Motorsports",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/triton-motor-sports-logo.png",
        alt: "Triton Motorsports",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/triton-motor-sports-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  name: "Triton Motorsports",
  alternateName: ["Triton Motor Sports"],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  sport: "Motorsport",
  memberOf: {
    "@type": "SportsOrganization",
    name: "Collegiate Racing Series",
    url: "https://drivecrs.com/",
  },
  logo: `${SITE_URL}/images/triton-motor-sports-logo.png`,
  image: `${SITE_URL}/images/triton-motor-sports-logo.png`,
  sameAs: [
    "https://www.instagram.com/ucsd_crs/",
    "https://www.linkedin.com/company/ucsd-crs",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/videos/ucsdxcrs-v4.mp4"
          as="video"
          type="video/mp4"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <PageTheme />
        {children}
      </body>
    </html>
  );
}
