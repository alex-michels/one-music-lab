import { THEME_STORAGE_KEY } from './client-store';
import { PROFILE_KEY } from './local-profile';

/** How long the prerendered page may stay hidden if the application never starts. */
export const BOOT_TIMEOUT_MS = 4000;

/**
 * What runs before the first paint, as text for an inline script.
 *
 * The export is one document for every reader: English, light, the Sound lab.
 * The reader's own language, theme and last lesson are in their browser, and
 * the application applies them only once it has started. Until then a returning
 * reader saw the wrong page in the wrong colours for a moment on every visit.
 *
 * This does the two things that cannot wait for the application:
 *
 * 1. It resolves the saved theme (the profile first, then the older single
 *    key, then the device) and writes both channels the stylesheet reads,
 *    `data-theme` and the `dark` class, so the first frame is already the
 *    right colour.
 * 2. It marks the document `data-boot="pending"`. The stylesheet hides the
 *    not-yet-ready shell under that mark, so the prerendered English page is
 *    never shown in place of the reader's own. The application clears the busy
 *    state it is keyed on; if it never starts, the mark removes itself and the
 *    prerendered page is shown as before.
 *
 * Without JavaScript none of this runs and the prerendered page is visible, as
 * it always was. Every storage read is guarded: a blocked or corrupt store
 * falls back to the device setting. Nothing is written to storage here.
 */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var t='system';try{var s=window.localStorage;var p=null;try{p=JSON.parse(s.getItem(${JSON.stringify(PROFILE_KEY)})||'null')}catch(e){}t=(p&&p.settings&&p.settings.theme)||s.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||'system'}catch(e){}var k=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.setAttribute('data-theme',k?'dark':'light');d.classList.toggle('dark',k)}catch(e){}d.setAttribute('data-boot','pending');setTimeout(function(){d.removeAttribute('data-boot')},${BOOT_TIMEOUT_MS})})()`;
