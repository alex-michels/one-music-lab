import { BOOT_SCRIPT } from '@/lib/theme-boot';
import '../globals.css';

/**
 * The second root layout, and the reason the language is a path segment at all.
 *
 * Next lets exactly one layout per tree render `<html>`, so a nested layout
 * under `app/[lang]` could not set the attribute this whole route exists to
 * set. Two route groups give two roots: `app/(root)` serves `/` and this one
 * serves `/en`, `/ru` and `/de`, each with the language written into the
 * document before a line of JavaScript runs. Until now the only record of a
 * reader's language was `localStorage`, so every crawler, every screen reader
 * reading the markup, and every translation service saw one English page.
 */
export default async function LanguageLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      {/* The document supports both themes and the export cannot know which one
          this reader wants. The inline script resolves it from the reader's own
          browser before the first paint; see app/(root)/layout.tsx. */}
      <meta name="color-scheme" content="light dark" />
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
