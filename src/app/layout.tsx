import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar }           from "@/components/Navbar";
import { Footer }           from "@/components/Footer";
import { WhatsAppButton }   from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/context/LanguageContext";
import { getVisiblePosts } from "@/lib/blog";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Luis Jacho Zambrano — Senior Full Stack Developer",
  description:
    "Senior Full Stack Developer with 9 years of experience in .NET, Angular, and Azure. Azure Developer Associate certified.",
  keywords: [".NET", "Angular", "Azure", "Full Stack", "TypeScript", "Ecuador"],
  authors: [{ name: "Luis Antonio Jacho Zambrano" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Routes prerendered with their own URL (same source as generateStaticParams). The Navbar keeps the real
  // pathname for these and renders the neutral 404 shell state for any other URL until hydration.
  const prerenderedPaths = ["/", "/blog", ...getVisiblePosts().map((p) => `/blog/${p.slug}`)];
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          <Navbar prerenderedPaths={prerenderedPaths} />
          {children}
          <Footer />
          <WhatsAppButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
