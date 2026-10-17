import type { Metadata } from "next";
import { Geist, Caveat, Caveat_Brush, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveatBrush = Caveat_Brush({
  variable: "--font-display-brush",
  subsets: ["latin"],
  weight: ["400"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vélocita — Surveillance de performance de sites web",
  description: "Surveillez et optimisez les performances de vos pages pour augmenter les conversions et mieux ranker sur Google. Core Web Vitals, Lighthouse, monitoring continu.",
  alternates: { canonical: SITE_URL },
  keywords: ["performance web", "Core Web Vitals", "Lighthouse", "vitesse de chargement", "SEO", "monitoring", "Vélocita"],
  authors: [{ name: "Vélocita" }],
  manifest: "/site.webmanifest",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
    apple: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  appleWebApp: {
    title: "Vélocita",
    statusBarStyle: "default",
    capable: true,
  },
  openGraph: {
    title: "Vélocita — Surveillance de performance",
    description: "Surveillez et optimisez les performances de vos pages web.",
    siteName: "Vélocita",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vélocita — Surveillance de performance",
    description: "Surveillez et optimisez les performances de vos pages web.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${caveat.variable} ${caveatBrush.variable} ${jetBrainsMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
