'use client';
import {
  translator,
  fixedNumber,
  localNumber,
  localText,
  siteDescription,
  type LocalText,
  type Translate,
} from '@/lib/i18n';
import { localizedNoteName, keyboardPitch, octaveName } from '@/lib/notation';

import { flushSync } from 'react-dom';
import {
  Experiments,
  Theory,
  Practice,
  Encyclopedia,
} from '@/components/learning';
import { NumberField } from '@/components/number-field';
import { ChordsLab } from '@/components/chords-lab';
import { NotesLab } from '@/components/notes-lab';
import {
  initialNotesLabState,
  notationLessonPresets,
  planNotationExample,
  type NotationExampleId,
} from '@/lib/notation-experiments';
import { exportTone } from '@/lib/wav';
import { registerLabTools, type LabState } from '@/lib/webmcp';
import { Download } from 'lucide-react';
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  CircleHelp,
  FlaskConical,
  Globe2,
  Headphones,
  Library,
  Music2,
  Pause,
  Piano,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AudioEngine } from '@/lib/audio';
import {
  DEFAULT_LENS,
  DEFAULT_THEME,
  LANGUAGE_STORAGE_KEY,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
  THEME_STORAGE_KEY,
  clampSidebarWidth,
  createClientStore,
  hashOf,
  langFromStorage,
  localStorageOrNull,
  pageForRoute,
  resolveTheme,
  routeForPage,
  routeFromHash,
  sidebarWidthFromStorage,
  themeFromStorage,
  type Lang,
  type Page,
  type Lens,
  type Route,
  type Theme,
} from '@/lib/client-store';
import { TOPIC_IDS, topicById, type TopicId } from '@/lib/topics';
import {
  frequencyForMidi,
  nearestNote,
  noteName,
  type Tuning,
  type Wave,
} from '@/lib/music';
const waveTypes: Wave[] = ['sine', 'triangle', 'square', 'sawtooth'];
// The selected route and language live in browser state the server cannot see.
// Each is read once on the client and changes only through navigate/setLang.
const routeStore = createClientStore<Route>(
  () =>
    routeFromHash(window.location.hash, {
      lang: langFromStorage(localStorageOrNull()),
      topics: TOPIC_IDS,
    }),
  { lang: 'en', lens: DEFAULT_LENS, topic: null, anchor: null },
);
// The address is the source of truth for the language, and the saved one is the
// fallback for an address that does not name it. Reading it here rather than
// reconciling afterwards keeps the two stores agreeing from the first snapshot.
const langStore = createClientStore<Lang>(
  () =>
    routeFromHash(window.location.hash, {
      lang: langFromStorage(localStorageOrNull()),
      topics: TOPIC_IDS,
    }).lang,
  'en',
);
const sidebarWidthStore = createClientStore<number>(
  () => sidebarWidthFromStorage(localStorageOrNull()),
  SIDEBAR_WIDTH.preferred,
);
const themeStore = createClientStore<Theme>(
  () => themeFromStorage(localStorageOrNull()),
  DEFAULT_THEME,
);
function WaveIcon({ wave }: { wave: Wave }) {
  const d =
    wave === 'sine'
      ? 'M1 12C7-3 11-3 17 12S27 27 33 12'
      : wave === 'triangle'
        ? 'M1 18L9 3L25 24L33 8'
        : wave === 'square'
          ? 'M1 20V4H16V20H32V4'
          : 'M1 22L16 3V22L32 3V22';
  return (
    <svg
      width="30"
      height="24"
      viewBox="0 0 34 27"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
/**
 * Drag handle for the navigation panel's width. Translated labels are not all
 * the same length — `Chords lab` is `Лаборатория аккордов` — so the labels wrap
 * at the default width rather than being cut off, and a reader who would rather
 * have them on one line can widen the panel here. It is a button rather than
 * the ARIA window-splitter pattern, because a focusable `separator` is not
 * something this project's linter will accept without a suppression; the cost
 * is that the current width is not announced, and the gain is that pointer,
 * keyboard and screen-reader users all get the same working control. Arrow keys
 * move it, Shift moves it faster, Home restores the design width, and the value
 * is remembered per browser.
 */
function SidebarResizer({
  width,
  setWidth,
  t,
}: {
  width: number;
  setWidth: (value: number) => void;
  t: Translate;
}) {
  return (
    <button
      type="button"
      className="sidebar-resizer"
      aria-label={t(
        'Navigation width. Drag, or use the left and right arrow keys.',
        'Ширина панели навигации. Перетащите или используйте стрелки влево и вправо.',
      )}
      onDoubleClick={() => setWidth(SIDEBAR_WIDTH.preferred)}
      onPointerDown={(event) => {
        event.preventDefault();
        // Capture keeps the cursor and the events on the handle while the
        // pointer wanders off it, but Firefox refuses a pointer id it did not
        // itself issue, and losing the drag is worse than losing the cursor.
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {}
        // The window, not the handle: an eleven-pixel target is easy to leave,
        // and without capture the handle would stop hearing the pointer.
        const drag = (moved: PointerEvent) =>
          setWidth(clampSidebarWidth(moved.clientX));
        const release = () => {
          window.removeEventListener('pointermove', drag);
          window.removeEventListener('pointerup', release);
          window.removeEventListener('pointercancel', release);
        };
        window.addEventListener('pointermove', drag);
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 32 : 8;
        if (event.key === 'ArrowLeft')
          setWidth(clampSidebarWidth(width - step));
        else if (event.key === 'ArrowRight')
          setWidth(clampSidebarWidth(width + step));
        else if (event.key === 'Home') setWidth(SIDEBAR_WIDTH.preferred);
        else return;
        event.preventDefault();
      }}
    />
  );
}
/**
 * The four views of one subject, in one order, always all four.
 *
 * Never collapsible and never reordered: a reader stranded on a question they
 * cannot answer has to see the way out without opening a widget, and a
 * navigation that changes shape per page fails WCAG 3.2.3. A lens that cannot
 * show this subject yet says so in inert text rather than as a disabled
 * button, because a disabled button is a promise that someone is working on it.
 */
const LENS_ORDER = ['read', 'play', 'drill', 'define'] as const;

function SubjectLine({
  route,
  title,
  module,
  t,
  go,
  headingRef,
}: {
  route: Route;
  title: string;
  module: string | null;
  t: Translate;
  go: (next: Route) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const name: Record<Lens, string> = {
    read: t('Read', 'Читать'),
    play: t('Play', 'Играть'),
    drill: t('Drill', 'Упражнение'),
    define: t('Define', 'Определения'),
  };
  // Two lenses can show a subject today. The trainer and the encyclopedia are
  // not scoped to one yet, so on a subject they say so.
  const shows = (lens: Lens) =>
    route.topic === null || lens === 'read' || lens === 'play';
  return (
    <>
      {module && <p className="subject-module num">{module}</p>}
      {/* Focus lands here on every move, so a keyboard reader hears where they
          arrived instead of staying on a control that has just re-rendered. */}
      <h1 className="subject-title" tabIndex={-1} ref={headingRef}>
        {title}
      </h1>
      <nav
        className="lens-rail"
        aria-label={
          route.topic
            ? t('Views of this topic', 'Виды темы')
            : t('Indexes', 'Обзоры')
        }
      >
        <ul role="list">
          {LENS_ORDER.map((lens) => (
            <li key={lens}>
              {shows(lens) ? (
                <a
                  href={hashOf({ ...route, lens, anchor: null })}
                  aria-current={route.lens === lens ? 'page' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    go({ ...route, lens, anchor: null });
                  }}
                >
                  {name[lens]}
                </a>
              ) : (
                <span className="lens-absent">
                  {name[lens]} — {t('not written', 'не написано')}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function Navigation({
  page,
  navigate,
  t,
  width,
  setWidth,
}: {
  page: Page;
  navigate: (p: Page) => void;
  t: Translate;
  width: number;
  setWidth: (value: number) => void;
}) {
  const { setOpenMobile } = useSidebar();
  const items = [
    { id: 'lab', icon: FlaskConical, label: t('Sound lab', 'Лаборатория') },
    {
      id: 'chords',
      icon: Music2,
      label: t('Chords lab', 'Лаборатория аккордов'),
    },
    { id: 'theory', icon: BookOpen, label: t('Music theory', 'Теория музыки') },
    { id: 'practice', icon: Headphones, label: t('Practice', 'Практика') },
    {
      id: 'encyclopedia',
      icon: Library,
      label: t('Encyclopedia', 'Энциклопедия'),
    },
  ] as const;
  return (
    <Sidebar
      className="lab-sidebar"
      mobileTitle={t('Navigation', 'Навигация')}
      mobileDescription={t(
        'Navigate between the music laboratories and learning pages.',
        'Переходите между музыкальными лабораториями и учебными страницами.',
      )}
    >
      <SidebarHeader>
        <a
          href="#lab"
          className="brand"
          aria-label="One Music Lab"
          onClick={() => navigate('lab')}
        >
          <span className="brand-icon">
            <AudioLines size={25} strokeWidth={1.8} />
          </span>
          <span>
            oml<span className="brand-dot">.</span>
            <small>ONE MUSIC LAB</small>
          </span>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <div className="nav-label">
          {t('YOUR MUSIC WORKSPACE', 'МУЗЫКАЛЬНОЕ ПРОСТРАНСТВО')}
        </div>
        <SidebarMenu>
          {items.map(({ id, icon: Icon, label }) => (
            <SidebarMenuItem key={id}>
              <SidebarMenuButton
                isActive={page === id}
                onClick={() => {
                  navigate(id);
                  setOpenMobile(false);
                }}
                className="nav-item"
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="sidebar-line" />
        <div className="nav-label">
          {t('EXPLORE BY DOING', 'ОТ ТЕОРИИ К ОПЫТУ')}
        </div>
        <div className="sidebar-note">
          <span className="little-orbit">
            <Music2 size={19} />
          </span>
          <h3>{t('Make theory audible.', 'Услышать теорию.')}</h3>
          <p>
            {t(
              'Every sound is a place to start.',
              'Каждый звук — начало открытия.',
            )}
          </p>
          <button
            onClick={() => {
              navigate('theory');
              setOpenMobile(false);
            }}
          >
            {t('Explore the foundations', 'Изучить основы')}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="sidebar-version">
          <span className="status-dot" />
          {t('An open world of music', 'Открытый мир музыки')}
          <span>v0.1</span>
        </div>
      </SidebarFooter>
      <SidebarResizer width={width} setWidth={setWidth} t={t} />
    </Sidebar>
  );
}
export default function Home() {
  const [exporting, setExporting] = useState(false);
  const lang = useSyncExternalStore(
    langStore.subscribe,
    langStore.getSnapshot,
    langStore.getServerSnapshot,
  );
  const route = useSyncExternalStore(
    routeStore.subscribe,
    routeStore.getSnapshot,
    routeStore.getServerSnapshot,
  );
  const page = pageForRoute(route);
  // Which lesson is open is not a private thought of this component any more:
  // it is the subject in the address, so it can be linked to, shared, and come
  // back on the Back button.
  const lessonId = route.topic;
  const sidebarWidth = useSyncExternalStore(
    sidebarWidthStore.subscribe,
    sidebarWidthStore.getSnapshot,
    sidebarWidthStore.getServerSnapshot,
  );
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );
  const setLang = langStore.set;
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Set by a deliberate move, read by the effect that moves focus.
  const moved = useRef(false);
  const [frequency, setFrequency] = useState(440);
  const [labTab, setLabTab] = useState<'tone' | 'notes'>('tone');
  const [notesState, setNotesState] = useState(initialNotesLabState);
  const [reference, setReference] = useState(440);
  const [tuning, setTuning] = useState<Tuning>('equal');
  const [wave, setWave] = useState<Wave>('sine');
  const [volume, setVolume] = useState(18);
  const [playing, setPlaying] = useState(false);
  const [octave, setOctave] = useState(4);
  const [error, setError] = useState<LocalText | null>(null);
  const audio = useRef<AudioEngine | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const t = translator(lang);
  const displayNote = (midi: number) =>
    lang === 'de' ? localizedNoteName(midi, lang) : noteName(midi);
  const referenceLabel = lang === 'de' ? 'a′' : 'A4';
  const note = nearestNote(frequency, reference, tuning);
  const waveNames = [
    t('Sine', 'Синус'),
    t('Triangle', 'Треугольник'),
    t('Square', 'Меандр'),
    t('Sawtooth', 'Пила'),
  ];
  /**
   * Moving to another subject or another view of it is a place the reader can
   * come back to, so it pushes an entry. Until now every move replaced the same
   * one, which is why Back left the site instead of retracing it.
   */
  function go(next: Route) {
    moved.current = true;
    audio.current?.stopAll();
    setPlaying(false);
    setError(null);
    routeStore.set(next);
    const hash = hashOf(next);
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  }
  function navigate(p: Page) {
    go(routeForPage(p, lang));
  }
  function engine() {
    if (!audio.current) audio.current = new AudioEngine();
    return audio.current;
  }
  function setHz(hz: number) {
    if (Number.isFinite(hz)) setFrequency(Math.max(20, Math.min(20000, hz)));
  }
  async function toggle() {
    try {
      setError(null);
      if (playing) {
        audio.current?.stopAll();
        setPlaying(false);
      } else {
        const started = await engine().start(frequency, wave, volume / 100);
        if (started) setPlaying(true);
      }
    } catch {
      setError(
        localText(
          'Audio could not start. Check your browser audio settings and try again.',
          'Звук не запустился. Проверьте настройки звука браузера и попробуйте снова.',
        ),
      );
    }
  }
  async function playSequence(
    frequencies: number[],
    spacing = 0,
    shape = wave,
  ) {
    audio.current?.stopAll();
    setPlaying(false);
    setError(null);
    try {
      await engine().preview(
        frequencies,
        shape,
        volume / 100,
        spacing ? 0.6 : 1.5,
        spacing,
      );
    } catch {
      setError(
        localText(
          'Audio could not start. Please try again.',
          'Звук не запустился. Попробуйте ещё раз.',
        ),
      );
      throw new Error('Audio unavailable');
    }
  }
  async function download() {
    setExporting(true);
    try {
      await exportTone(frequency, wave, volume / 100);
    } catch {
      setError(
        localText(
          'The audio file could not be created. Please try again.',
          'Не удалось создать звуковой файл. Попробуйте ещё раз.',
        ),
      );
    } finally {
      setExporting(false);
    }
  }
  function stopSound() {
    audio.current?.stopAll();
    setPlaying(false);
  }
  function changeLabTab(tab: 'tone' | 'notes') {
    stopSound();
    setLabTab(tab);
  }
  async function playNotationExample(id: NotationExampleId, tempo: number) {
    stopSound();
    setError(null);
    try {
      const plan = planNotationExample(id, tempo);
      await engine().preview(
        plan.midis.map((midi) => frequencyForMidi(midi, reference, tuning)),
        'triangle',
        volume / 100,
        plan.duration,
        plan.spacing,
      );
    } catch {
      setError(
        localText(
          'Audio is unavailable in this browser.',
          'Звук недоступен в этом браузере.',
        ),
      );
    }
  }
  function setLessonId(id: string | null) {
    go({ lang, lens: 'read', topic: id, anchor: null });
  }
  function openLab(hz: number, shape: Wave, lessonId: string) {
    // The play lens of a subject, so the address and the rail both say which.
    go({ lang, lens: 'play', topic: lessonId, anchor: null });
    setHz(hz);
    setWave(shape);
    const preset = Object.hasOwn(notationLessonPresets, lessonId)
      ? notationLessonPresets[lessonId]
      : null;
    setLabTab(preset ? 'notes' : 'tone');
    if (preset) setNotesState({ ...initialNotesLabState, ...preset });
  }
  function changeReference(value: number) {
    if (!Number.isFinite(value) || value < 20 || value > 2000) return;
    setHz((frequency * value) / reference);
    setReference(value);
  }
  function changeTuning(value: Tuning) {
    setHz(frequencyForMidi(note.midi, reference, value));
    setTuning(value);
  }
  async function playNote(midi: number) {
    const hz = frequencyForMidi(midi, reference, tuning);
    if (hz < 20 || hz > 20000) return;
    setHz(hz);
    try {
      if (!playing) await engine().preview([hz], wave, volume / 100);
    } catch {
      setError(
        localText(
          'Audio is unavailable in this browser.',
          'Звук недоступен в этом браузере.',
        ),
      );
    }
  }
  useEffect(
    () => () => {
      audio.current?.dispose();
      audio.current = null;
    },
    [],
  );
  // Keep this effect below the langStore hook: React runs passive effects in
  // hook order, so the store reads the saved language before this write.
  useEffect(() => {
    document.documentElement.lang = lang;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', siteDescription[lang]);
    // Until now every page in every language was titled the same, so a reader
    // with several tabs open could not tell one from another. The lens joins
    // the title once the four lens names have their German.
    const topic =
      route.topic && route.topic in topicById
        ? topicById[route.topic as TopicId]
        : null;
    document.title = topic
      ? `${topic.title[lang]} — One Music Lab`
      : 'OML — One Music Lab';
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {}
  }, [lang, route.topic]);
  // A single-document app changes the page without telling anyone: aria-current
  // marks the new place but announces nothing at the moment of arrival, and
  // focus stays on a control that has just re-rendered.
  useEffect(() => {
    // Only after a move the reader made. Watching the route alone would fire on
    // arrival too: the prerendered markup carries the default route and the
    // address replaces it during hydration, which looks like a navigation and
    // is not one. Someone who followed a link is already where they meant to be.
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus({ preventScroll: true });
  }, [route.lens, route.topic]);
  // The first hashchange listener this app has had. Back and Forward move
  // through the site now instead of leaving it, and a pasted address is read
  // the same way whether it arrives on load or afterwards.
  useEffect(() => {
    const reread = () => {
      moved.current = true;
      const next = routeFromHash(window.location.hash, {
        lang,
        topics: TOPIC_IDS,
      });
      routeStore.set(next);
      if (next.lang !== lang) setLang(next.lang);
    };
    window.addEventListener('hashchange', reread);
    return () => window.removeEventListener('hashchange', reread);
  }, [lang, setLang]);
  // The address says what the reader is looking at, from the first frame and in
  // the language they are reading. Replacing rather than pushing: neither
  // arriving nor switching language is a place to come back to.
  useEffect(() => {
    const current = route.lang === lang ? route : { ...route, lang };
    if (current !== route) routeStore.set(current);
    const hash = hashOf(current);
    if (window.location.hash !== hash)
      window.history.replaceState(null, '', hash);
  }, [route, lang]);
  // Same ordering rule as the language above: the store has already read the
  // saved width by the time this effect writes one back.
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
    } catch {}
  }, [sidebarWidth]);
  // Two channels, written together. The token layer flips on [data-theme], but
  // the `dark:` utilities inside components/ui compile through `.dark`, so
  // writing only one leaves those components rendering light values on a dark
  // ground. `system` is resolved here rather than in a media query for the same
  // reason: a query can reach the tokens but never the class.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = resolveTheme(theme, media.matches);
      document.documentElement.dataset.theme = resolved;
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };
    apply();
    media.addEventListener('change', apply);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  useEffect(() => {
    audio.current?.update(frequency, wave, volume / 100);
  }, [frequency, wave, volume]);
  useEffect(() => {
    const silence = () => {
      audio.current?.stopAll();
      setPlaying(false);
    };
    const hidden = () => {
      if (document.hidden) silence();
    };
    window.addEventListener('pagehide', silence);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('pagehide', silence);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);
  useEffect(() => {
    if (page !== 'lab') return;
    let frame = 0;
    // A canvas cannot inherit a custom property, so the scope reads the three
    // score tokens off its own element. Once per resize, never per frame:
    // getComputedStyle in a draw loop is a layout read sixty times a second.
    let ink: { grid: string; axis: string; live: string } | null = null;
    const readInk = (element: HTMLCanvasElement) => {
      const style = getComputedStyle(element);
      return {
        grid: style.getPropertyValue('--s-grid').trim(),
        axis: style.getPropertyValue('--s-axis').trim(),
        live: style.getPropertyValue('--s-live').trim(),
      };
    };
    const draw = () => {
      const c = canvas.current;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          const width = c.clientWidth,
            height = c.clientHeight,
            dpr = Math.min(window.devicePixelRatio || 1, 2);
          const resized = c.width !== width * dpr || c.height !== height * dpr;
          if (resized) {
            c.width = width * dpr;
            c.height = height * dpr;
          }
          if (resized || !ink) ink = readInk(c);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);
          ctx.strokeStyle = ink.grid;
          ctx.lineWidth = 1;
          for (let x = 0; x < width; x += 42) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y <= height; y += 36) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
          ctx.strokeStyle = ink.axis;
          ctx.beginPath();
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();
          const samples = playing ? audio.current?.samples() : null;
          let peak = 1;
          if (samples)
            for (const sample of samples)
              peak = Math.max(peak, Math.abs(sample - 128));
          ctx.strokeStyle = ink.live;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = ink.live;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          for (let x = 0; x < width; x++) {
            const phase = (x / width) * Math.PI * 8;
            let v =
              wave === 'sine'
                ? Math.sin(phase)
                : wave === 'triangle'
                  ? (2 / Math.PI) * Math.asin(Math.sin(phase))
                  : wave === 'square'
                    ? Math.sign(Math.sin(phase))
                    : 2 * ((phase / (Math.PI * 2)) % 1) - 1;
            if (samples) {
              v =
                (samples[Math.floor((x / width) * samples.length)] - 128) /
                peak;
            }
            const y = height / 2 - v * height * 0.29;
            if (!x) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [wave, playing, page]);
  // Effect events read the latest state and handlers without re-subscribing,
  // replacing the ref that used to be written during render.
  const onKeydown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      audio.current?.stopAll();
      setPlaying(false);
      return;
    }
    if (
      e.repeat ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      page !== 'lab' ||
      labTab !== 'tone'
    )
      return;
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'input,textarea,select,button,[role="slider"],[role="combobox"],[role="tab"],[contenteditable="true"]',
      )
    )
      return;
    if (e.code === 'Space') {
      e.preventDefault();
      void toggle();
    } else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      e.preventDefault();
      setHz(
        frequency + (e.code === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 0.1 : 1),
      );
    } else {
      const key = [
        'KeyA',
        'KeyW',
        'KeyS',
        'KeyE',
        'KeyD',
        'KeyF',
        'KeyT',
        'KeyG',
        'KeyY',
        'KeyH',
        'KeyU',
        'KeyJ',
        'KeyK',
      ].indexOf(e.code);
      if (key >= 0) {
        e.preventDefault();
        void playNote(12 * (octave + 1) + key);
      }
    }
  });
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => onKeydown(e);
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, []);
  const readLab = useEffectEvent(
    (): LabState => ({ frequency, reference, tuning, wave, playing }),
  );
  const configureLab = useEffectEvent((values: Partial<LabState>) => {
    audio.current?.stopAll();
    const labRoute = routeForPage('lab', lang);
    flushSync(() => {
      setPlaying(false);
      routeStore.set(labRoute);
      const ref = values.reference ?? reference;
      const tune = (values.tuning ?? tuning) as Tuning;
      const pitch =
        values.frequency ??
        (values.tuning
          ? frequencyForMidi(
              nearestNote(frequency, reference, tuning).midi,
              ref,
              tune,
            )
          : (frequency * ref) / reference);
      setReference(ref);
      setTuning(tune);
      setWave((values.wave ?? wave) as Wave);
      setHz(pitch);
    });
    // The agent tool writes the same address the nav does, rather than its own.
    history.replaceState(null, '', hashOf(labRoute));
  });
  const stopLab = useEffectEvent(() => {
    audio.current?.stopAll();
    flushSync(() => setPlaying(false));
  });
  useEffect(
    () =>
      registerLabTools(
        () => readLab(),
        (values) => configureLab(values),
        () => stopLab(),
      ),
    [],
  );
  const whiteKeys = Array.from(
    { length: 15 },
    (_, i) =>
      12 * (octave + 1) +
      Math.floor(i / 7) * 12 +
      [0, 2, 4, 5, 7, 9, 11][i % 7],
  );
  const openTopic =
    route.topic && route.topic in topicById
      ? topicById[route.topic as TopicId]
      : null;
  // The site's own five headings when there is no subject; the subject's title
  // when there is one. No new copy: these are the headings it already had,
  // without the eyebrow, the paragraph and the decorative circle that made a
  // lesson impossible to open with.
  const pageHeading: Record<Page, string> = {
    lab: t('Sound, at your fingertips.', 'Звук в ваших руках.'),
    chords: t('Chords, connected.', 'Аккорды в движении.'),
    theory: t('The ideas behind the music.', 'Идеи, из которых звучит музыка.'),
    practice: t('Make listening a skill.', 'Превратите слушание в навык.'),
    encyclopedia: t('The language of music.', 'Язык музыки.'),
  };
  const subjectTitle = openTopic ? openTopic.title[lang] : pageHeading[page];
  const tuningNames = {
    equal: t('12-tone equal temperament', '12-ступенный равномерный'),
    just: t('Just intonation · A', 'Чистый строй · от A'),
    pythagorean: t('Pythagorean · A', 'Пифагорейский · от A'),
  };
  return (
    <>
      {/* Seven focusable things stand between the top of the document and the
          content, and <main id="main-content"> has been waiting here for one
          of these. */}
      <a className="skip-link" href="#main-content">
        {t('Skip to content', 'К содержанию')}
      </a>
      <SidebarProvider
        style={{ '--sidebar-width': sidebarWidth + 'px' } as CSSProperties}
      >
        <Navigation
          page={page}
          navigate={navigate}
          t={t}
          width={sidebarWidth}
          setWidth={sidebarWidthStore.set}
        />
        <div className="workspace">
          {/* Where the reader has arrived, spoken once. <output> and not
            role="status": the linter bans the redundant role and the repo
            allows no suppressions. */}
          <output aria-live="polite" className="route-announcer">
            {subjectTitle}
          </output>
          <header className="topbar">
            <SidebarTrigger
              className="mobile-menu"
              aria-label={t('Open navigation', 'Открыть навигацию')}
            />
            <div className="topbar-right">
              <fieldset
                className="language-switch"
                aria-label={t('Language', 'Язык')}
              >
                <Globe2 size={16} />
                <button
                  type="button"
                  className={lang === 'en' ? 'selected' : ''}
                  aria-pressed={lang === 'en'}
                  onClick={() => setLang('en')}
                  lang="en"
                >
                  EN
                </button>
                {/* The slashes only separate the three labels visually; in the
                  accessibility tree they are read out between the buttons. */}
                <span aria-hidden="true">/</span>
                <button
                  type="button"
                  className={lang === 'ru' ? 'selected' : ''}
                  aria-pressed={lang === 'ru'}
                  onClick={() => setLang('ru')}
                  lang="ru"
                >
                  RU
                </button>
                <span aria-hidden="true">/</span>
                <button
                  type="button"
                  className={lang === 'de' ? 'selected' : ''}
                  aria-pressed={lang === 'de'}
                  onClick={() => setLang('de')}
                  title="Deutsch"
                  lang="de"
                >
                  DE
                </button>
              </fieldset>
            </div>
          </header>
          <main id="main-content" className="main-content">
            {/* First, so an error is never below a full-width instrument. */}
            {error && (
              <div className="error-message" role="alert">
                {error[lang]}
              </div>
            )}
            <SubjectLine
              route={route}
              title={subjectTitle}
              module={openTopic?.module ?? null}
              t={t}
              go={go}
              headingRef={headingRef}
            />
            {page === 'lab' ? (
              <>
                <div className="section-tabs">
                  <button
                    type="button"
                    className={labTab === 'tone' ? 'active' : ''}
                    aria-pressed={labTab === 'tone'}
                    onClick={() => changeLabTab('tone')}
                  >
                    <Activity size={17} />
                    {t('Tone generator', 'Генератор тонов')}
                  </button>
                  <button
                    type="button"
                    className={labTab === 'notes' ? 'active' : ''}
                    aria-pressed={labTab === 'notes'}
                    onClick={() => changeLabTab('notes')}
                  >
                    <Music2 size={17} />
                    {t('Notes', 'Ноты')}
                  </button>
                  <span className="section-caption">
                    {labTab === 'notes'
                      ? t('FROM WRITING TO SOUND', 'ОТ ЗАПИСИ К ЗВУЧАНИЮ')
                      : t('FROM FREQUENCY TO FEELING', 'ОТ ЧАСТОТЫ К ОЩУЩЕНИЮ')}
                  </span>
                </div>
                {labTab === 'notes' && (
                  <NotesLab
                    lang={lang}
                    reference={reference}
                    tuning={tuning}
                    play={playNote}
                    state={notesState}
                    onChange={setNotesState}
                    playExample={playNotationExample}
                    stop={stopSound}
                  />
                )}
                <div
                  className={
                    labTab === 'tone'
                      ? 'instrument-grid'
                      : 'instrument-grid is-hidden'
                  }
                >
                  <section className="panel generator">
                    <div className="panel-heading">
                      <span>
                        <span className="panel-number">01</span>
                        {t('Tone generator', 'Генератор тонов')}
                      </span>
                      <span className="soft-badge">
                        <span
                          className={
                            playing ? 'status-dot pulsing' : 'status-dot'
                          }
                        />
                        {playing
                          ? t('Playing', 'Звучит')
                          : t('Ready to play', 'Готов к звучанию')}
                      </span>
                    </div>
                    <div className="frequency-zone">
                      <label className="eyebrow" htmlFor="frequency">
                        {t('FREQUENCY', 'ЧАСТОТА')}
                      </label>
                      <div className="frequency-input">
                        <NumberField
                          id="frequency"
                          aria-label={t(
                            'Frequency in hertz',
                            'Частота в герцах',
                          )}
                          min={20}
                          max={20000}
                          step="0.01"
                          value={frequency}
                          onValue={setHz}
                        />
                        <span>Hz</span>
                      </div>
                      <div className="note-pill">
                        {displayNote(note.midi)}
                        <span>·</span>
                        {note.cents > 0 ? '+' : ''}
                        {fixedNumber(note.cents, 1, lang)} {t('cents', 'цента')}
                      </div>
                    </div>
                    <div className="frequency-slider">
                      <Slider
                        aria-label={t('Frequency', 'Частота')}
                        value={[Math.log2(frequency / 20)]}
                        min={0}
                        max={Math.log2(1000)}
                        step={0.001}
                        onValueChange={(v) =>
                          setHz(20 * 2 ** (Array.isArray(v) ? v[0] : v))
                        }
                      />
                      <div className="range-labels">
                        <span>20 Hz</span>
                        <span>100</span>
                        <span>1k</span>
                        <span>20k Hz</span>
                      </div>
                    </div>
                    <div className="transport">
                      <div className="octave-buttons">
                        <button
                          onClick={() => setHz(frequency / 2)}
                          aria-label={t('One octave down', 'На октаву ниже')}
                        >
                          <ArrowDown size={15} />½
                        </button>
                        <button
                          onClick={() => setHz(frequency * 2)}
                          aria-label={t('One octave up', 'На октаву выше')}
                        >
                          <ArrowUp size={15} />
                          2×
                        </button>
                      </div>
                      <button
                        className={
                          'play-button ' + (playing ? 'is-playing' : '')
                        }
                        onClick={toggle}
                      >
                        {playing ? (
                          <Pause size={18} fill="currentColor" />
                        ) : (
                          <Play size={18} fill="currentColor" />
                        )}
                        {playing
                          ? t('Stop tone', 'Остановить')
                          : t('Play tone', 'Слушать тон')}
                        <kbd>{t('Space', 'Пробел')}</kbd>
                      </button>
                      <button
                        className="icon-button"
                        aria-label={t(
                          'Reset frequency to A4',
                          'Вернуться к A4',
                        )}
                        onClick={() => setHz(reference)}
                      >
                        <RotateCcw size={17} />
                      </button>
                    </div>
                    <fieldset
                      className="wave-picker"
                      aria-label={t('Waveform', 'Форма волны')}
                    >
                      {waveTypes.map((w, i) => (
                        <button
                          key={w}
                          onClick={() => setWave(w)}
                          className={wave === w ? 'selected' : ''}
                          aria-pressed={wave === w}
                        >
                          <WaveIcon wave={w} />
                          {waveNames[i]}
                        </button>
                      ))}
                    </fieldset>
                    <div className="scope">
                      <div className="scope-header">
                        <span>
                          <Activity size={13} />
                          {t('OSCILLOSCOPE', 'ОСЦИЛЛОГРАММА')}
                        </span>
                        <span>
                          {playing
                            ? t('LIVE SIGNAL', 'ЖИВОЙ СИГНАЛ')
                            : t('WAVEFORM PREVIEW', 'ФОРМА ВОЛНЫ')}
                        </span>
                      </div>
                      <canvas
                        ref={canvas}
                        aria-label={t(
                          'Audio waveform visualization',
                          'Визуализация звуковой волны',
                        )}
                      />
                      <div className="scope-footer">
                        <span>{waveNames[waveTypes.indexOf(wave)]}</span>
                        <span>{fixedNumber(frequency, 2, lang)} Hz</span>
                      </div>
                    </div>
                    <div className="volume-row">
                      <Volume2 size={17} />
                      <span>{t('Volume', 'Громкость')}</span>
                      <Slider
                        aria-label={t('Volume', 'Громкость')}
                        value={[volume]}
                        min={0}
                        max={100}
                        onValueChange={(v) =>
                          setVolume(Array.isArray(v) ? v[0] : v)
                        }
                      />
                      <span className="mono">{volume}%</span>
                    </div>
                  </section>
                  <aside className="tuning-column">
                    <section className="panel tuning-panel">
                      <div className="panel-heading">
                        <span>
                          <SlidersHorizontal size={17} />
                          {t('Your tuning', 'Ваш строй')}
                        </span>
                      </div>
                      <label className="field-label" htmlFor="reference">
                        {t('Reference pitch', 'Опорная частота')}
                        <span>{referenceLabel}</span>
                      </label>
                      <div className="reference-input">
                        <span>{referenceLabel} =</span>
                        <NumberField
                          id="reference"
                          aria-label={t(
                            'A4 reference frequency',
                            'Опорная частота A4',
                          )}
                          min={20}
                          max={2000}
                          step={0.01}
                          value={reference}
                          onValue={changeReference}
                        />
                        <span>Hz</span>
                      </div>
                      <div className="preset-row">
                        {[415, 432, 440, 442].map((hz) => (
                          <button
                            key={hz}
                            aria-pressed={reference === hz}
                            className={reference === hz ? 'selected' : ''}
                            onClick={() => changeReference(hz)}
                          >
                            {hz}
                          </button>
                        ))}
                      </div>
                      <p className="field-hint">
                        {t(
                          'Change A4. Every note follows.',
                          'Измените A4 — все ноты последуют за ней.',
                        )}
                      </p>
                      <label className="field-label" id="tuning-label">
                        {t('Tuning system', 'Система настройки')}
                      </label>
                      <Select
                        value={tuning}
                        onValueChange={(v) => {
                          if (v) changeTuning(v as Tuning);
                        }}
                      >
                        <SelectTrigger
                          aria-labelledby="tuning-label"
                          className="tuning-select"
                        >
                          <SelectValue>{tuningNames[tuning]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(tuningNames).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="tuning-explanation">
                        <CircleHelp size={15} />
                        <p>
                          {t(
                            'A4 sets the reference. The tuning system sets the relationships between notes.',
                            'A4 задаёт опорную высоту. Строй определяет отношения между нотами.',
                          )}
                        </p>
                      </div>
                    </section>
                    <section className="note-card">
                      <div className="eyebrow">
                        {t(
                          'THE NOTE YOU’RE EXPLORING',
                          'НОТА, КОТОРУЮ ВЫ ИССЛЕДУЕТЕ',
                        )}
                      </div>
                      <div className="current-note">
                        {lang === 'de'
                          ? displayNote(note.midi)
                          : note.name.replace(/-?\d+$/, '')}
                        {lang !== 'de' && (
                          <span>{Math.floor(note.midi / 12) - 1}</span>
                        )}
                        <Music2 size={29} strokeWidth={1.2} />
                      </div>
                      <div className="note-data">
                        <div>
                          <span>{t('Frequency', 'Частота')}</span>
                          <strong>{fixedNumber(frequency, 2, lang)} Hz</strong>
                        </div>
                        <div>
                          <span>{t('Period', 'Период')}</span>
                          <strong>
                            {fixedNumber(1000 / frequency, 3, lang)} ms
                          </strong>
                        </div>
                        <div>
                          <span>{t('MIDI note', 'Нота MIDI')}</span>
                          <strong>{note.midi}</strong>
                        </div>
                      </div>
                      <button onClick={() => navigate('theory')}>
                        {t(
                          'How does pitch work?',
                          'Как устроена высота звука?',
                        )}
                        <ArrowUpRight size={16} />
                      </button>
                    </section>
                  </aside>
                </div>
                <section className="panel keyboard-panel">
                  <div className="panel-heading">
                    <span>
                      <Piano size={18} />
                      {t('Explore the notes', 'Исследуйте ноты')}
                    </span>
                    <div className="keyboard-controls">
                      <span>
                        {referenceLabel} = {localNumber(reference, lang)} Hz
                      </span>
                      <button
                        aria-label={t(
                          'Lower keyboard octave',
                          'Понизить октаву клавиатуры',
                        )}
                        onClick={() => setOctave(Math.max(0, octave - 1))}
                      >
                        −
                      </button>
                      <span>
                        {lang === 'de'
                          ? octaveName(keyboardPitch((octave + 1) * 12), lang)
                          : `${t('Octave', 'Октава')} ${octave}`}
                      </span>
                      <button
                        aria-label={t(
                          'Raise keyboard octave',
                          'Повысить октаву клавиатуры',
                        )}
                        onClick={() => setOctave(Math.min(6, octave + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="piano-scroll">
                    <div className="piano-keys">
                      {whiteKeys.map((midi, i) => (
                        <div key={midi} className="key-slot">
                          <button
                            disabled={
                              frequencyForMidi(midi, reference, tuning) < 20 ||
                              frequencyForMidi(midi, reference, tuning) > 20000
                            }
                            className={
                              'white-key ' +
                              (note.midi === midi ? 'active-key' : '')
                            }
                            onClick={() => playNote(midi)}
                            aria-label={`${displayNote(midi)}, ${fixedNumber(frequencyForMidi(midi, reference, tuning), 2, lang)} Hz`}
                          >
                            <span>
                              {lang === 'de' ? (
                                displayNote(midi)
                              ) : (
                                <>
                                  {['C', 'D', 'E', 'F', 'G', 'A', 'B'][i % 7]}
                                  <small>{Math.floor(midi / 12) - 1}</small>
                                </>
                              )}
                            </span>
                          </button>
                          {[0, 2, 5, 7, 9].includes(midi % 12) && i < 14 && (
                            <button
                              disabled={
                                frequencyForMidi(midi + 1, reference, tuning) <
                                  20 ||
                                frequencyForMidi(midi + 1, reference, tuning) >
                                  20000
                              }
                              aria-label={displayNote(midi + 1)}
                              className={
                                'black-key ' +
                                (note.midi === midi + 1 ? 'active-key' : '')
                              }
                              onClick={() => playNote(midi + 1)}
                            >
                              <span>
                                {lang === 'de'
                                  ? displayNote(midi + 1)
                                  : [
                                      'C♯',
                                      '',
                                      'D♯',
                                      '',
                                      '',
                                      'F♯',
                                      '',
                                      'G♯',
                                      '',
                                      'A♯',
                                    ][midi % 12]}
                              </span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="keyboard-caption">
                    <span>
                      <span className="status-dot" />
                      {t(
                        'All notes follow your tuning',
                        'Все ноты следуют вашему строю',
                      )}
                    </span>
                    <span>
                      {t(
                        'Click a key to hear it',
                        'Нажмите клавишу, чтобы услышать',
                      )}
                    </span>
                  </div>
                </section>
                <Experiments
                  lang={lang}
                  reference={reference}
                  tuning={tuning}
                  play={playSequence}
                />
                <button
                  className="secondary-button chord-lab-link"
                  onClick={() => navigate('chords')}
                >
                  <Music2 size={18} />
                  {t(
                    'Open Chords lab · build a progression',
                    'Лаборатория аккордов · создайте последовательность',
                  )}
                  <ArrowUpRight size={16} />
                </button>
                <div className="export-row">
                  <button
                    className="secondary-button"
                    disabled={exporting}
                    onClick={download}
                  >
                    <Download size={16} />
                    {exporting
                      ? t('Preparing…', 'Подготовка…')
                      : t(
                          'Download tone · WAV, 5 sec',
                          'Скачать тон · WAV, 5 сек',
                        )}
                  </button>
                  <span>
                    {t(
                      'Space to play · Esc to silence · A–K to explore notes',
                      'Пробел — звук · Esc — тишина · A–K — ноты',
                    )}
                  </span>
                </div>
                <div
                  className={
                    labTab === 'tone' ? 'lab-footer' : 'lab-footer is-hidden'
                  }
                >
                  <span>
                    <Headphones size={15} />
                    {t(
                      'Start quietly. Keep listening comfortable.',
                      'Начните тихо. Слушайте на комфортной громкости.',
                    )}
                  </span>
                  <span>
                    20 Hz — 20 kHz <span className="footer-dot">·</span> Web
                    Audio
                  </span>
                </div>
              </>
            ) : page === 'chords' ? (
              <ChordsLab lang={lang} />
            ) : page === 'theory' ? (
              <Theory
                lang={lang}
                lessonId={lessonId}
                setLessonId={setLessonId}
                openLab={openLab}
                openPractice={() => navigate('practice')}
              />
            ) : page === 'practice' ? (
              <Practice lang={lang} reference={reference} play={playSequence} />
            ) : (
              <Encyclopedia lang={lang} openLesson={setLessonId} />
            )}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
