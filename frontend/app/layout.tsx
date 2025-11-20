import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Point Prevalence Survey Dashboard',
  description: 'Point Prevalence Survey data management and analytics platform',
  generator: 'Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} h-full overflow-hidden`}
      >
        <Header />
        <div className="h-full pt-16 overflow-hidden">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
