import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OML — One Music Lab',
  metadataBase: new URL('https://onemusiclab.org'),
  alternates: { canonical: '/' },
  description:
    'Explore sound, tuning and music theory. A bilingual laboratory with a tone generator, adjustable A4, musical notes and practical exercises.',
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
