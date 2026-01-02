import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneURL - One URL for all your links",
  description: "Create a beautiful profile page to share all your important links in one place. Open source alternative to Linktree.",
  metadataBase: new URL("https://oneurl-alpha.vercel.app"),
  openGraph: {
    title: "OneURL - One URL for all your links",
    description: "Create a beautiful profile page to share all your important links in one place. Open source alternative to Linktree.",
    url: "https://oneurl-alpha.vercel.app",
    siteName: "OneURL",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OneURL - One URL for all your links",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneURL - One URL for all your links",
    description: "Create a beautiful profile page to share all your important links in one place. Open source alternative to Linktree.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <script defer src="https://cloud.umami.is/script.js" data-website-id="cbee05df-c4b6-4d87-af81-25cdd6b7bf4f"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
