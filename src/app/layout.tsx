import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KULSTORE — магазин обуви",
  description: "Молодёжный интернет-магазин обуви KULSTORE",
};

// Шапка (Header) на каждом маршруте обращается к БД и читает сессию, поэтому всё
// приложение рендерится динамически. Это также убирает обращение к БД на этапе
// next build — образ собирается без доступной базы.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
