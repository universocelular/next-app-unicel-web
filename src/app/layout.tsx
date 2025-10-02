import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: 'swap',
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "UNIVERSO CELULAR",
  description: "Servicios profesionales de desbloqueo y reparación de dispositivos móviles.",
  keywords: ["desbloqueo", "móviles", "celulares", "reparación", "iPhone", "Android", "Samsung", "Huawei"],
  authors: [{ name: "UNIVERSO CELULAR" }],
  creator: "UNIVERSO CELULAR",
  publisher: "UNIVERSO CELULAR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://universocelular.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "UNIVERSO CELULAR",
    description: "Servicios profesionales de desbloqueo y reparación de dispositivos móviles.",
    url: 'https://universocelular.com',
    siteName: 'UNIVERSO CELULAR',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "UNIVERSO CELULAR",
    description: "Servicios profesionales de desbloqueo y reparación de dispositivos móviles.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${caveat.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
