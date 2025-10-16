// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/Providers';
import Header from '@/components/layout/Header';

const siteUrl = process.env.BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Оюутны Холбоо',
  description: 'Шинэ Монгол Оюутны Холбоо',
  manifest: '/manifest.json',

  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Оюутны Холбоо',
    description: 'Шинэ Монгол Оюутны Холбоо',
    siteName: 'Оюутны Холбоо',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Шинэ Монгол Оюутны Холбоо',
      },
    ],
    locale: 'mn_MN',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Оюутны Холбоо',
    description: 'Шинэ Монгол Оюутны Холбоо',
    images: [`${siteUrl}/og-image.jpg`],
  },
};

const MonoRegular = localFont({
  src: './MonoRegular.woff2',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className={MonoRegular.className}>
        <Providers>
          <Header />
            <main className="min-h-screen bg-background text-foreground dark:bg-zinc-900 dark:text-zinc-100">
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