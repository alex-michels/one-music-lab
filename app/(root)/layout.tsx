import type { Metadata } from 'next';
import { siteDescription } from '@/lib/i18n';
import { SITE_ORIGIN, languageAlternates } from '@/lib/site';
import { BOOT_SCRIPT } from '@/lib/theme-boot';
import '../globals.css';

export const metadata: Metadata = {
  title: 'OML — One Music Lab',
  metadataBase: new URL(SITE_ORIGIN),
  // `/` is the language-neutral entry — it opens in the reader's saved
  // language — so it is its own canonical and names the three language roots
  // rather than claiming to be one of them.
  alternates: {
    canonical: '/',
    languages: { ...languageAlternates(), 'x-default': '/' },
  },
  description: siteDescription.en,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The document supports both themes and the export cannot know which one this
  // reader wants. The inline script at the top of the body resolves it from the
  // reader's own browser before the first paint, so a dark-theme reader no
  // longer sees a light frame; it adds attributes to <html> that the server
  // did not render, which is what `suppressHydrationWarning` acknowledges.
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="color-scheme" content="light dark" />
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
