import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANGUAGES, type Lang } from '@/lib/client-store';
import { siteDescription } from '@/lib/i18n';
import { SITE_ORIGIN, alternatesFor } from '@/lib/site';

export { default } from '../(root)/page';

/**
 * Three pages, one per language, prerendered. The list is `LANGUAGES` rather
 * than a copy of it, so a fourth language is a route the moment it is a value.
 */
export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  // A path that is not a language is not a language page. The client router
  // forgives an unknown address because the document is always underneath it;
  // a prerendered route has no document to fall back to.
  if (!(LANGUAGES as readonly string[]).includes(lang)) notFound();
  return {
    title: 'OML — One Music Lab',
    // Its own, because this tree has its own root layout and inherits nothing
    // from `app/(root)`. Without it every canonical and every hreflang on the
    // three language pages would be a relative URL, which is the one thing
    // hreflang may not be.
    metadataBase: new URL(SITE_ORIGIN),
    description: siteDescription[lang as Lang],
    alternates: alternatesFor(lang as Lang),
  };
}
