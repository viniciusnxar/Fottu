import type { Metadata } from "next";
import localFont from "next/font/local";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

// Fonte embutida no projeto: funciona offline, sem Google Fonts.
const sans = localFont({ src: "../fonts/Geist-Variable.woff2", variable: "--font-sans", weight: "100 900" });

// Páginas dependem da sessão (cookies) e de dados vivos do Supabase.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fottu — Encontre e compre suas fotos",
  description: "Encontre suas fotos por sessão, veja a prévia e baixe em alta resolução."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sans.variable}>
      <body className="min-h-screen font-sans">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
