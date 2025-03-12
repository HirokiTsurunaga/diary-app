import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'DiaryNote - あなたの日常を記録',
  description: '日々の思い出や感情を記録し、振り返ることができる日記アプリです。',
  keywords: '日記, 記録, 日常, メモ, 思い出',
  authors: [{ name: 'DiaryNote Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className={`${inter.className} min-h-screen antialiased bg-gray-50`}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pt-16 pb-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
