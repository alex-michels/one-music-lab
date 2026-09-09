import { LANGUAGES, type Lang } from './client-store';

/**
 * The four addresses this site has, and what each of them says about the other
 * three.
 *
 * `/` is the language-neutral entry: it keeps the reader's saved language, so
 * it cannot claim to be any one language's page. The three language roots each
 * declare themselves canonical and name the others, which is the whole content
 * of the change — a crawler that only ever saw one English document now sees
 * three, and a reader who is sent a link arrives in the language the link was
 * written in rather than in whatever their browser last stored.
 *
 * `x-default` points at `/`, which is what it is for: the address to use when
 * none of the listed languages matches the request.
 */
export const SITE_ORIGIN = 'https://onemusiclab.org';

/** The path of a language's root, as both the canonical and the alternate. */
export function pathFor(lang: Lang): string {
  return `/${lang}`;
}

export function languageAlternates(): Record<string, string> {
  return Object.fromEntries(
    LANGUAGES.map((code) => [code, pathFor(code)]),
  ) as Record<string, string>;
}

/** What one language root says about itself and its siblings. */
export function alternatesFor(lang: Lang) {
  return {
    canonical: pathFor(lang),
    languages: { ...languageAlternates(), 'x-default': '/' },
  };
}
