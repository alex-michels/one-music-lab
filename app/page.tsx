'use client';
import { flushSync } from 'react-dom';
import {
  Experiments,
  Theory,
  Practice,
  Encyclopedia,
} from '@/components/learning';
import { NumberField } from '@/components/number-field';
import { ChordsLab } from '@/components/chords-lab';
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
} from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  ChevronRight,
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
  LANGUAGE_STORAGE_KEY,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
  clampSidebarWidth,
  createClientStore,
  langFromStorage,
  localStorageOrNull,
  pageFromHash,
  sidebarWidthFromStorage,
  type Lang,
  type Page,
} from '@/lib/client-store';
import {
  frequencyForMidi,
  nearestNote,
  noteName,
  type Tuning,
  type Wave,
} from '@/lib/music';
const waveTypes: Wave[] = ['sine', 'triangle', 'square', 'sawtooth'];
// The selected page and language live in browser state the server cannot see.
// Each is read once on the client and changes only through setPage/setLang.
const pageStore = createClientStore<Page>(
  () => pageFromHash(window.location.hash),
  'lab',
);
const langStore = createClientStore<Lang>(
  () => langFromStorage(localStorageOrNull()),
  'en',
);
const sidebarWidthStore = createClientStore<number>(
  () => sidebarWidthFromStorage(localStorageOrNull()),
  SIDEBAR_WIDTH.preferred,
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
  t: (en: string, ru: string) => string;
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
function Navigation({
  page,
  navigate,
  t,
  width,
  setWidth,
}: {
  page: Page;
  navigate: (p: Page) => void;
  t: (en: string, ru: string) => string;
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
    <Sidebar className="lab-sidebar">
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
                {id === 'lab' && (
                  <span className="nav-count" aria-hidden="true">
                    01
                  </span>
                )}
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
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const lang = useSyncExternalStore(
    langStore.subscribe,
    langStore.getSnapshot,
    langStore.getServerSnapshot,
  );
  const page = useSyncExternalStore(
    pageStore.subscribe,
    pageStore.getSnapshot,
    pageStore.getServerSnapshot,
  );
  const sidebarWidth = useSyncExternalStore(
    sidebarWidthStore.subscribe,
    sidebarWidthStore.getSnapshot,
    sidebarWidthStore.getServerSnapshot,
  );
  const setLang = langStore.set;
  const setPage = pageStore.set;
  const [frequency, setFrequency] = useState(440);
  const [reference, setReference] = useState(440);
  const [tuning, setTuning] = useState<Tuning>('equal');
  const [wave, setWave] = useState<Wave>('sine');
  const [volume, setVolume] = useState(18);
  const [playing, setPlaying] = useState(false);
  const [octave, setOctave] = useState(4);
  const [error, setError] = useState('');
  const audio = useRef<AudioEngine | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const t = (en: string, ru: string) => (lang === 'ru' ? ru : en);
  const note = nearestNote(frequency, reference, tuning);
  const waveNames = [
    t('Sine', 'Синус'),
    t('Triangle', 'Треугольник'),
    t('Square', 'Меандр'),
    t('Sawtooth', 'Пила'),
  ];
  function navigate(p: Page) {
    audio.current?.stopAll();
    setPlaying(false);
    setError('');
    setPage(p);
    window.history.replaceState(null, '', '#' + p);
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
      setError('');
      if (playing) {
        audio.current?.stopAll();
        setPlaying(false);
      } else {
        const started = await engine().start(frequency, wave, volume / 100);
        if (started) setPlaying(true);
      }
    } catch {
      setError(
        t(
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
    setError('');
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
        t(
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
        t(
          'The audio file could not be created. Please try again.',
          'Не удалось создать звуковой файл. Попробуйте ещё раз.',
        ),
      );
    } finally {
      setExporting(false);
    }
  }
  function openLab(hz: number, shape: Wave) {
    navigate('lab');
    setHz(hz);
    setWave(shape);
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
        t(
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
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {}
  }, [lang]);
  // Same ordering rule as the language above: the store has already read the
  // saved width by the time this effect writes one back.
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
    } catch {}
  }, [sidebarWidth]);
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
    const draw = () => {
      const c = canvas.current;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          const width = c.clientWidth,
            height = c.clientHeight,
            dpr = Math.min(window.devicePixelRatio || 1, 2);
          if (c.width !== width * dpr || c.height !== height * dpr) {
            c.width = width * dpr;
            c.height = height * dpr;
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);
          ctx.strokeStyle = '#28453f';
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
          ctx.strokeStyle = '#3e6058';
          ctx.beginPath();
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();
          const samples = playing ? audio.current?.samples() : null;
          let peak = 1;
          if (samples)
            for (const sample of samples)
              peak = Math.max(peak, Math.abs(sample - 128));
          ctx.strokeStyle = '#baf6ca';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#baf6ca';
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
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || page !== 'lab')
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
    flushSync(() => {
      setPlaying(false);
      setPage('lab');
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
    history.replaceState(null, '', '#lab');
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
  const tuningNames = {
    equal: t('12-tone equal temperament', '12-ступенный равномерный'),
    just: t('Just intonation · A', 'Чистый строй · от A'),
    pythagorean: t('Pythagorean · A', 'Пифагорейский · от A'),
  };
  return (
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
        <header className="topbar">
          <div className="breadcrumb">
            <SidebarTrigger
              className="mobile-menu"
              aria-label={t('Open navigation', 'Открыть навигацию')}
            />
            <span>{t('Workspace', 'Пространство')}</span>
            <ChevronRight size={14} />
            <strong>
              {page === 'lab'
                ? t('Sound lab', 'Лаборатория')
                : page === 'chords'
                  ? t('Chords lab', 'Лаборатория аккордов')
                  : page === 'theory'
                    ? t('Music theory', 'Теория музыки')
                    : page === 'practice'
                      ? t('Practice', 'Практика')
                      : t('Encyclopedia', 'Энциклопедия')}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="beta-label">
              {t(
                'A LITTLE CURIOSITY GOES A LONG WAY',
                'ВСЁ НАЧИНАЕТСЯ С ЛЮБОПЫТСТВА',
              )}
            </span>
            <div className="language-switch" aria-label="Language">
              <Globe2 size={16} />
              <button
                className={lang === 'en' ? 'selected' : ''}
                aria-pressed={lang === 'en'}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <span>/</span>
              <button
                className={lang === 'ru' ? 'selected' : ''}
                aria-pressed={lang === 'ru'}
                onClick={() => setLang('ru')}
              >
                RU
              </button>
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />
                {t(
                  'LISTEN. EXPLORE. UNDERSTAND.',
                  'СЛУШАТЬ. ИССЛЕДОВАТЬ. ПОНИМАТЬ.',
                )}
              </div>
              <h1>
                {page === 'lab'
                  ? t('Sound, at your fingertips.', 'Звук в ваших руках.')
                  : page === 'chords'
                    ? t('Chords, connected.', 'Аккорды в движении.')
                    : page === 'theory'
                      ? t(
                          'The ideas behind the music.',
                          'Идеи, из которых звучит музыка.',
                        )
                      : page === 'practice'
                        ? t(
                            'Make listening a skill.',
                            'Превратите слушание в навык.',
                          )
                        : t('The language of music.', 'Язык музыки.')}
              </h1>
              <p>
                {page === 'lab'
                  ? t(
                      'A space to play with sound and discover the music inside it.',
                      'Пространство для экспериментов со звуком и открытий в музыке.',
                    )
                  : page === 'chords'
                    ? t(
                        'Build a chord. Shape a progression. Hear what changes.',
                        'Соберите аккорд. Создайте последовательность. Услышьте изменения.',
                      )
                    : t(
                        'Connected ideas. Audible examples. A little discovery every day.',
                        'Связанные понятия. Звучащие примеры. Новые открытия каждый день.',
                      )}
              </p>
            </div>
            <div className="heading-icon">
              <AudioLines size={43} strokeWidth={1.2} />
            </div>
          </div>
          {page === 'lab' ? (
            <>
              <div className="section-tabs">
                <span className="active">
                  <Activity size={17} />
                  {t('Tone generator', 'Генератор тонов')}
                </span>
                <span className="section-caption">
                  {t('FROM FREQUENCY TO FEELING', 'ОТ ЧАСТОТЫ К ОЩУЩЕНИЮ')}
                </span>
              </div>
              <div className="instrument-grid">
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
                        aria-label={t('Frequency in hertz', 'Частота в герцах')}
                        min={20}
                        max={20000}
                        step="0.01"
                        value={frequency}
                        onValue={setHz}
                      />
                      <span>Hz</span>
                    </div>
                    <div className="note-pill">
                      {note.name}
                      <span>·</span>
                      {note.cents > 0 ? '+' : ''}
                      {note.cents.toFixed(1)} {t('cents', 'цента')}
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
                      className={'play-button ' + (playing ? 'is-playing' : '')}
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
                      <kbd>Space</kbd>
                    </button>
                    <button
                      className="icon-button"
                      aria-label={t('Reset frequency to A4', 'Вернуться к A4')}
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
                      <span>{frequency.toFixed(2)} Hz</span>
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
                      <span>A4</span>
                    </label>
                    <div className="reference-input">
                      <span>A4 =</span>
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
                      {note.name.replace(/-?\d+$/, '')}
                      <span>{Math.floor(note.midi / 12) - 1}</span>
                      <Music2 size={29} strokeWidth={1.2} />
                    </div>
                    <div className="note-data">
                      <div>
                        <span>{t('Frequency', 'Частота')}</span>
                        <strong>{frequency.toFixed(2)} Hz</strong>
                      </div>
                      <div>
                        <span>{t('Period', 'Период')}</span>
                        <strong>{(1000 / frequency).toFixed(3)} ms</strong>
                      </div>
                      <div>
                        <span>{t('MIDI note', 'Нота MIDI')}</span>
                        <strong>{note.midi}</strong>
                      </div>
                    </div>
                    <button onClick={() => navigate('theory')}>
                      {t('How does pitch work?', 'Как устроена высота звука?')}
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
                    <span>A4 = {reference} Hz</span>
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
                      {t('Octave', 'Октава')} {octave}
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
                          aria-label={`${noteName(midi)}, ${frequencyForMidi(midi, reference, tuning).toFixed(2)} Hz`}
                        >
                          <span>
                            {['C', 'D', 'E', 'F', 'G', 'A', 'B'][i % 7]}
                            <small>{Math.floor(midi / 12) - 1}</small>
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
                            aria-label={noteName(midi + 1)}
                            className={
                              'black-key ' +
                              (note.midi === midi + 1 ? 'active-key' : '')
                            }
                            onClick={() => playNote(midi + 1)}
                          >
                            <span>
                              {
                                [
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
                                ][midi % 12]
                              }
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
              <div className="lab-footer">
                <span>
                  <Headphones size={15} />
                  {t(
                    'Start quietly. Keep listening comfortable.',
                    'Начните тихо. Слушайте на комфортной громкости.',
                  )}
                </span>
                <span>
                  20 Hz — 20 kHz <span className="footer-dot">·</span> Web Audio
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
            <Encyclopedia
              lang={lang}
              openLesson={(id) => {
                setLessonId(id);
                navigate('theory');
              }}
            />
          )}

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
