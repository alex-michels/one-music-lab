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
  // The document supports both themes and the export cannot know which one this
  // reader wants, so it declares both and leaves `data-theme` to the effect that
  // resolves it. A reader whose machine is dark still sees one light frame
  // before hydration; removing that needs an inline script, which is a separate
  // decision from this one.
  return (
    <html lang="en">
      <meta name="color-scheme" content="light dark" />
      <body className="antialiased">{children}</body>
    </html>
  );
}
