import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Оюутны Холбоо',
  description: 'Шинэ Монгол Оюутны Холбоо',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#333333',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <head>
        <link rel="icon" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* Add the missing icon */}
        <link rel="icon" sizes="144x144" href="/icons/icon-144x144.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
            <main className="min-h-screen bg-background text-foreground dark:bg-[#0a0a0a]">
              {children}
            </main>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}