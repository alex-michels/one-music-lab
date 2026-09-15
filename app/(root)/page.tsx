'use client';
import {
  translator,
  localText,
  siteDescription,
  type LocalText,
  type Translate,
} from '@/lib/i18n';
import { localizedNoteName } from '@/lib/notation';
import { lessons } from '@/lib/learning';

import { flushSync } from 'react-dom';
import {
  Theory,
  Practice,
  Encyclopedia,
  resetPracticeSession,
} from '@/components/learning';
import { LocalData, useLocalProfile } from '@/components/local-data';
import {
  profileStore,
  initialRoute,
  isLearningAddress,
  type LocalProfile,
} from '@/lib/local-profile';
import { ChordsLab, type ChordsLabSnapshot } from '@/components/chords-lab';
import { CourseIndex, CourseNavigation } from '@/components/course-navigation';
import { collectionTitle, courseAddresses } from '@/lib/course';
import { PlayLens } from '@/components/play-lens';
import type { ExperimentSnapshot } from '@/components/experiments';
import {
  initialNotesLabState,
  notationLessonPresets,
  planNotationExample,
  type NotationExampleId,
} from '@/lib/notation-experiments';
import { exportTone } from '@/lib/wav';
import { registerLabTools, type LabState } from '@/lib/webmcp';
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
  ArrowUpRight,
  AudioLines,
  BookOpen,
  FlaskConical,
  Globe2,
  Headphones,
  Library,
  Music2,
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
  langFromPath,
  pageForRoute,
  resolveTheme,
  routeForPage,
  routeFromHash,
  type Lang,
  type Page,
  type Lens,
  type Route,
  type Theme,
} from '@/lib/client-store';
import {
  TOPIC_IDS,
  drilledTopics,
  topicById,
  type TopicId,
} from '@/lib/topics';
import {
  frequencyForMidi,
  nearestNote,
  noteName,
  type Tuning,
  type Wave,
} from '@/lib/music';
// The selected route and language live in browser state the server cannot see.
// Each is read once on the client and changes only through navigate/setLang.
//
// The address is the source of truth for the language, and it has two halves
// now: the hash is the more specific one, the path is the one a shared link
// actually carries, and the saved language is the fallback for an address that
// names none. Reading all three here rather than reconciling afterwards keeps
// the two stores agreeing from the first snapshot.
function addressedLang(): Lang {
  return (
    langFromPath(window.location.pathname) ??
    profileStore.getSnapshot().profile.settings.language
  );
}
const routeStore = createClientStore<Route>(
  () =>
    initialRoute(
      window.location.hash,
      addressedLang(),
      profileStore.getSnapshot().profile,
    ),
  { lang: 'en', lens: DEFAULT_LENS, topic: null, anchor: null },
);
const langStore = createClientStore<Lang>(
  () =>
    initialRoute(
      window.location.hash,
      addressedLang(),
      profileStore.getSnapshot().profile,
    ).lang,
  'en',
);
const sidebarWidthStore = createClientStore<number>(
  () => profileStore.getSnapshot().profile.settings.sidebarWidth,
  SIDEBAR_WIDTH.preferred,
);
const themeStore = createClientStore<Theme>(
  () => profileStore.getSnapshot().profile.settings.theme,
  DEFAULT_THEME,
);
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
  // Every lens is scoped now except that a subject only has a drill if the
  // generator can ask about it: thirteen of the nineteen topics have a rule, and
  // for the other six the rail says so rather than opening a drill that
  // would have to invent a question.
  const shows = (lens: Lens) =>
    route.topic === null ||
    lens === 'read' ||
    lens === 'play' ||
    lens === 'define' ||
    (drilledTopics as readonly string[]).includes(route.topic);
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
  const saved = useLocalProfile();
  return (
    <HomeSession
      key={`${saved.ready}-${saved.revision}`}
      initial={saved.profile}
      ready={saved.ready}
      restored={saved.revision > 0}
    />
  );
}
function HomeSession({
  initial,
  ready,
  restored,
}: {
  initial: LocalProfile;
  ready: boolean;
  restored: boolean;
}) {
  const [exporting, setExporting] = useState(false);
  const [experimentSnapshot, setExperimentSnapshot] = useState<
    ExperimentSnapshot | undefined
  >(initial.lab.experiment);
  const [chordsSnapshot, setChordsSnapshot] = useState<
    ChordsLabSnapshot | undefined
  >(initial.lab.chords);
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
  const moved = useRef(restored);
  const [frequency, setFrequency] = useState(initial.lab.frequency);
  const [labTab, setLabTab] = useState<'tone' | 'notes'>(initial.lab.tab);
  const [notesState, setNotesState] = useState(initial.lab.notes);
  const [labTopic, setLabTopic] = useState<string | null>(initial.lab.topic);
  const [reference, setReference] = useState(initial.lab.reference);
  const [tuning, setTuning] = useState<Tuning>(initial.lab.tuning);
  const [wave, setWave] = useState<Wave>(initial.lab.wave);
  const [volume, setVolume] = useState(initial.lab.volume);
  const [playing, setPlaying] = useState(false);
  const [octave, setOctave] = useState(initial.lab.octave);
  const [error, setError] = useState<LocalText | null>(null);
  // Returning from theory/practice/reference keeps the current experiment.
  // A different topic loads its authored preset, including on a direct link.
  if (route.lens === 'play' && !route.collection && route.topic !== labTopic) {
    setLabTopic(route.topic);
    setExperimentSnapshot(undefined);
    const preset =
      route.topic && Object.hasOwn(notationLessonPresets, route.topic)
        ? notationLessonPresets[route.topic]
        : null;
    const lesson = lessons.find((entry) => entry.id === route.topic);
    setLabTab(preset ? 'notes' : 'tone');
    if (preset) setNotesState({ ...initialNotesLabState, ...preset });
    if (lesson) {
      setFrequency(lesson.hz);
      setWave(lesson.wave as Wave);
    }
  }
  const audio = useRef<AudioEngine | null>(null);
  // Only persist a client snapshot, never the prerendered server defaults.
  useEffect(() => {
    if (!ready) return;
    profileStore.update((current) => ({
      ...current,
      settings: { language: lang, theme, sidebarWidth },
      lastRoute: isLearningAddress(hashOf({ ...route, lang }))
        ? hashOf({ ...route, lang })
        : null,
      lab: {
        topic: labTopic as TopicId | null,
        frequency,
        reference,
        tuning,
        wave,
        volume,
        octave,
        tab: labTab,
        notes: {
          ...notesState,
          note: {
            letter: notesState.note.letter,
            accidental: notesState.note.accidental,
            octave: notesState.note.octave,
          },
        },
        experiment: experimentSnapshot,
        chords: chordsSnapshot,
      },
    }));
  }, [
    ready,
    lang,
    theme,
    sidebarWidth,
    route,
    labTopic,
    frequency,
    reference,
    tuning,
    wave,
    volume,
    octave,
    labTab,
    notesState,
    experimentSnapshot,
    chordsSnapshot,
  ]);
  function restore(next: LocalProfile) {
    audio.current?.stopAll();
    resetPracticeSession();
    const nextRoute = initialRoute('', next.settings.language, next);
    routeStore.set(nextRoute);
    langStore.set(next.settings.language);
    themeStore.set(next.settings.theme);
    sidebarWidthStore.set(next.settings.sidebarWidth);
    window.history.replaceState(null, '', hashOf(nextRoute));
  }
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
  /**
   * The live signal, handed to the scope as a function rather than as data: the
   * analyser's buffer is written in place sixty times a second, so passing the
   * array itself would hand the lens a value React sees as unchanged.
   */
  function readSamples() {
    return audio.current?.samples() ?? null;
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
        (volume / 100) * plan.gain,
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
    setExperimentSnapshot(undefined);
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
      : collectionTitle(route.collection)
        ? `${collectionTitle(route.collection)![lang]} — One Music Lab`
        : 'OML — One Music Lab';
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {}
  }, [lang, route.topic, route.collection]);
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
    // A lesson link can be at the bottom of a long article. WebKit can leave
    // this heading focused during a pointer click, so focus alone may not
    // scroll. Move the viewport explicitly as well as announcing the topic.
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: 'start' });
  }, [route.lens, route.topic, route.collection]);
  // The first hashchange listener this app has had. Back and Forward move
  // through the site now instead of leaving it, and a pasted address is read
  // the same way whether it arrives on load or afterwards.
  useEffect(() => {
    const reread = () => {
      moved.current = true;
      audio.current?.stopAll();
      setPlaying(false);
      setError(null);
      const next = routeFromHash(window.location.hash, {
        lang,
        topics: TOPIC_IDS,
        ...courseAddresses,
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
  // Effect events read the latest state and handlers without re-subscribing,
  // replacing the ref that used to be written during render.
  const onKeydown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      audio.current?.stopAll();
      setPlaying(false);
      return;
    }
    if (
      !ready ||
      e.repeat ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      page !== 'lab' ||
      route.collection !== undefined ||
      labTab !== 'tone'
    )
      return;
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'a,summary,input,textarea,select,button,[role="slider"],[role="combobox"],[role="tab"],[contenteditable="true"]',
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
    // The trainer used to open on ear training, and its heading said so. Ear
    // training is an experiment in the lab now, and what is here is the drill.
    practice: t('One rule at a time.', 'По одному правилу за раз.'),
    encyclopedia: t('The language of music.', 'Язык музыки.'),
  };
  const subjectTitle = openTopic
    ? openTopic.title[lang]
    : (collectionTitle(route.collection)?.[lang] ?? pageHeading[page]);
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
        // The server cannot read the browser's profile. Keep its placeholder
        // controls inert until restoration finishes, so an early click cannot
        // be consumed by the instance that hydration is about to replace.
        inert={!ready}
        aria-busy={!ready}
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
            <CourseNavigation route={route} />
            <LocalData lang={lang} onRestore={restore} />
            {route.collection ? (
              <CourseIndex route={route} />
            ) : page === 'lab' ? (
              <PlayLens
                key={route.topic ?? 'free'}
                experimentKind={
                  route.topic === 'scales' ? 'scales' : 'intervals'
                }
                experimentSnapshot={experimentSnapshot}
                onExperimentSnapshot={setExperimentSnapshot}
                lang={lang}
                t={t}
                labTab={labTab}
                changeLabTab={changeLabTab}
                frequency={frequency}
                setHz={setHz}
                note={note}
                displayNote={displayNote}
                wave={wave}
                setWave={setWave}
                waveNames={waveNames}
                volume={volume}
                setVolume={setVolume}
                playing={playing}
                toggle={toggle}
                samples={readSamples}
                reference={reference}
                referenceLabel={referenceLabel}
                changeReference={changeReference}
                tuning={tuning}
                tuningNames={tuningNames}
                changeTuning={changeTuning}
                octave={octave}
                setOctave={setOctave}
                whiteKeys={whiteKeys}
                playNote={playNote}
                playSequence={playSequence}
                playNotationExample={playNotationExample}
                stopSound={stopSound}
                notesState={notesState}
                setNotesState={setNotesState}
                navigate={navigate}
                download={download}
                exporting={exporting}
              />
            ) : page === 'chords' ? (
              <ChordsLab
                lang={lang}
                snapshot={chordsSnapshot}
                onSnapshot={setChordsSnapshot}
              />
            ) : page === 'theory' ? (
              <Theory
                lang={lang}
                lessonId={lessonId}
                setLessonId={setLessonId}
                openLab={openLab}
                anchor={route.anchor}
              />
            ) : page === 'practice' ? (
              <Practice lang={lang} topic={route.topic} />
            ) : (
              // Keyed on the subject so that arriving from a second ledger row
              // reselects the facet: the initial state of a mounted component
              // is not re-read when only a prop changes.
              <Encyclopedia
                key={`${route.topic ?? ''}-${route.anchor ?? ''}`}
                lang={lang}
                openLesson={setLessonId}
                subject={route.topic}
                anchor={route.anchor}
              />
            )}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}
