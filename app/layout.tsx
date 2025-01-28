import "@/styles/global.css";

import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Navbar from "@/lib/components/Navbar";
import Footer from "@/lib/components/Footer";

export const metadata: Metadata = {
  title: "Kal-Cali",
  description: "האפליקציה שלך לניהול פיננסי",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* Browser Favicon */}
        <link rel="icon" href="/icons/app_logo.svg" />
        {/* Apple Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/app_logo.svg"
        />
        {/* Android Icon */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/app_logo.svg"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
          {children}
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
