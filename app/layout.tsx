import type { Metadata } from 'next';
import { siteDescription } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'OML — One Music Lab',
  metadataBase: new URL('https://onemusiclab.org'),
  alternates: { canonical: '/' },
  description: siteDescription.en,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
