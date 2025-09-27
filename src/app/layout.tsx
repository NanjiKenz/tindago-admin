import type { Metadata } from "next";
import { Geist, Geist_Mono, ABeeZee } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const abeeZee = ABeeZee({
  variable: "--font-abeezee",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "TindaGo Admin - Sari-Sari Store Admin Management Dashboard",
  description: "Comprehensive administrative dashboard for managing TindaGo sari-sari store registrations, user management, and marketplace operations in the Philippines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/images/tindagologofavicon.svg" />
        <link rel="icon" type="image/png" href="/images/tindagologofavicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#E85A4F" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${abeeZee.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
