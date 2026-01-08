import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

import { db } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.schoolSettings.findFirst();
  const schoolName = settings?.schoolName || "PPDB MTsN 1 Pacitan";
  const schoolLogo = settings?.schoolLogo || "/logo_mts.png"; // Fallback to default if no logo

  return {
    title: schoolName,
    description: `Sistem Penerimaan Peserta Didik Baru ${schoolName}`,
    manifest: "/manifest.json",
    icons: {
      icon: schoolLogo,
      apple: schoolLogo,
    },
  };
}

export const viewport = {
  themeColor: "#15803d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={publicSans.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="font-sans antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
