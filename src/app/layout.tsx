import "@/styles/global.css";
import { UserGenderProvider } from '@/components/UserGenderContext';

import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

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
          href="/icons/logo.png"
        />
        {/* Android Icon */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/logo.png"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <UserGenderProvider>
          {children}
        </UserGenderProvider>
      </body>
    </html>
  );
}


