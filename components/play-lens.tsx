'use client';
import { useEffect, useEffectEvent, useRef, type RefObject } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CircleHelp,
  Download,
  Headphones,
  Music2,
  Pause,
  Piano,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NumberField } from '@/components/number-field';
import { NotesLab } from '@/components/notes-lab';
import { Experiments } from '@/components/experiments';
import { fixedNumber, localNumber, type Translate } from '@/lib/i18n';
import { keyboardPitch, octaveName } from '@/lib/notation';
import { frequencyForMidi, type Tuning, type Wave } from '@/lib/music';

/** What the analyser hands back: one byte per sample, 128 being silence. */
type WaveSamples = Uint8Array<ArrayBuffer>;
import type { Lang, Page } from '@/lib/client-store';
import type {
  NotationExampleId,
  NotesLabState,
} from '@/lib/notation-experiments';

const waveTypes: Wave[] = ['sine', 'triangle', 'square', 'sawtooth'];

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
 * The oscilloscope, which is the one thing on the site that draws sixty times a
 * second and the one place a CSS custom property has to be read by hand: a
 * canvas 2D context inherits nothing, so the three score tokens are read off
 * the element itself, once per resize rather than once per frame.
 *
 * `prefers-reduced-motion` has to be honoured **here** and not in the
 * stylesheet. The site's `@media (prefers-reduced-motion: reduce)` block turns
 * off animations and transitions, and a `requestAnimationFrame` loop is neither:
 * a reader who asks for less motion was still shown a waveform moving at 60 fps.
 * When the query matches, the scope draws one static cycle at mount and on every
 * parameter change, and never schedules a frame. The picture is still there; it
 * simply stops moving, and the live signal falls back to the ideal waveform,
 * which is what the scope shows when nothing is sounding anyway.
 */
function useOscilloscope(
  canvas: RefObject<HTMLCanvasElement | null>,
  wave: Wave,
  playing: boolean,
  readSamples: () => WaveSamples | null,
) {
  /**
   * The reader for the live signal is an effect event rather than a
   * dependency. It is a function declared in the page, so it is a new value on
   * every render; as a dependency it tore the loop down and built it again
   * each time, taking a `getComputedStyle` for the ink with it on every
   * keystroke in the frequency field. What the loop needs is the latest
   * reader, not a reason to restart.
   */
  const currentSamples = useEffectEvent(() => readSamples());
  useEffect(() => {
    let frame = 0;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
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
    const paint = () => {
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
          const samples = playing ? currentSamples() : null;
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
    };
    const tick = () => {
      paint();
      frame = requestAnimationFrame(tick);
    };
    /**
     * Painting and scheduling are separate because the two callers want
     * different things, and folding them together forked the loop: a resize
     * used to call the drawing function directly, which scheduled a second
     * frame while the first was still pending, and the cleanup could only
     * cancel whichever one it had last written down. Every resize left another
     * 60 fps chain running, and unmounting stopped one of them.
     *
     * A resize also changes the canvas's backing store, and a still scope has
     * no next frame in which to notice that — so it repaints either way.
     */
    const restart = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (still.matches) paint();
      else tick();
    };
    still.addEventListener('change', restart);
    window.addEventListener('resize', restart);
    restart();
    return () => {
      cancelAnimationFrame(frame);
      still.removeEventListener('change', restart);
      window.removeEventListener('resize', restart);
    };
  }, [canvas, wave, playing]);
}

/**
 * The scope owns its own canvas so that unmounting the instrument cancels the
 * frame: the loop used to keep running against a `display: none` canvas of
 * zero size while the reader was on the notes tab.
 */
function Oscilloscope({
  t,
  lang,
  wave,
  waveName,
  frequency,
  playing,
  samples,
}: {
  t: Translate;
  lang: Lang;
  wave: Wave;
  waveName: string;
  frequency: number;
  playing: boolean;
  samples: () => WaveSamples | null;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useOscilloscope(canvas, wave, playing, samples);
  return (
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
        <span>{waveName}</span>
        <span>{fixedNumber(frequency, 2, lang)} Hz</span>
      </div>
    </div>
  );
}

/**
 * PLAY. The lab, which is the play lens of every topic that has no lab of its
 * own — the chords lab is the play lens of `chords`, and this is the rest.
 *
 * It was ~490 lines inside `app/page.tsx`, which is why it is a component now:
 * the lens needs a ground of its own, and a ground cannot be given to a
 * fragment. The state stays in the page, because the read lens writes it —
 * “Open this experiment” sets a frequency, a waveform and a tab from a lesson.
 */
export function PlayLens({
  lang,
  t,
  labTab,
  changeLabTab,
  frequency,
  setHz,
  note,
  displayNote,
  wave,
  setWave,
  waveNames,
  volume,
  setVolume,
  playing,
  toggle,
  samples,
  reference,
  referenceLabel,
  changeReference,
  tuning,
  tuningNames,
  changeTuning,
  octave,
  setOctave,
  whiteKeys,
  playNote,
  playSequence,
  playNotationExample,
  stopSound,
  notesState,
  setNotesState,
  navigate,
  download,
  exporting,
}: {
  lang: Lang;
  t: Translate;
  labTab: 'tone' | 'notes';
  changeLabTab: (tab: 'tone' | 'notes') => void;
  frequency: number;
  setHz: (hz: number) => void;
  note: { midi: number; name: string; cents: number };
  displayNote: (midi: number) => string;
  wave: Wave;
  setWave: (wave: Wave) => void;
  waveNames: string[];
  volume: number;
  setVolume: (volume: number) => void;
  playing: boolean;
  toggle: () => void;
  /** The live signal while a tone sounds, so the scope can draw it. */
  samples: () => WaveSamples | null;
  reference: number;
  referenceLabel: string;
  changeReference: (value: number) => void;
  tuning: Tuning;
  tuningNames: Record<Tuning, string>;
  changeTuning: (value: Tuning) => void;
  octave: number;
  setOctave: (octave: number) => void;
  whiteKeys: number[];
  playNote: (midi: number) => void;
  playSequence: (
    frequencies: number[],
    spacing?: number,
    wave?: Wave,
  ) => Promise<void>;
  playNotationExample: (id: NotationExampleId, tempo: number) => Promise<void>;
  stopSound: () => void;
  notesState: NotesLabState;
  setNotesState: (state: NotesLabState) => void;
  navigate: (page: Page) => void;
  download: () => void;
  exporting: boolean;
}) {
  return (
    <div className="lens-play bed" data-lens="play">
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
      {/* The inactive instrument is unmounted, not hidden. `.is-hidden` left
          the oscilloscope's requestAnimationFrame loop running against a
          zero-sized canvas, and left every control in the accessibility tree
          for a panel nobody could see. */}
      {labTab === 'tone' && (
        <div className="instrument-grid">
          <section className="panel generator">
            <div className="panel-heading">
              <span>
                <span className="panel-number">01</span>
                {t('Tone generator', 'Генератор тонов')}
              </span>
              {/* Audio equivalence: every affordance that makes a sound is
                accompanied by a live region naming what is sounding in ink.
                The badge used to be a decorated `<span>`, so a reader who
                could not hear the tone was told nothing when it started. */}
              <output className="soft-badge" aria-live="polite">
                <span
                  className={playing ? 'status-dot pulsing' : 'status-dot'}
                />
                {playing
                  ? `${t('Playing', 'Звучит')} · ${displayNote(note.midi)} · ${fixedNumber(frequency, 2, lang)} Hz`
                  : t('Ready to play', 'Готов к звучанию')}
              </output>
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
                <kbd>{t('Space', 'Пробел')}</kbd>
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
            <Oscilloscope
              t={t}
              lang={lang}
              wave={wave}
              waveName={waveNames[waveTypes.indexOf(wave)]}
              frequency={frequency}
              playing={playing}
              samples={samples}
            />
            <div className="volume-row">
              <Volume2 size={17} />
              <span>{t('Volume', 'Громкость')}</span>
              <Slider
                aria-label={t('Volume', 'Громкость')}
                value={[volume]}
                min={0}
                max={100}
                onValueChange={(v) => setVolume(Array.isArray(v) ? v[0] : v)}
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
                  aria-label={t('A4 reference frequency', 'Опорная частота A4')}
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
              <div className="inset tuning-explanation">
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
                {t('THE NOTE YOU’RE EXPLORING', 'НОТА, КОТОРУЮ ВЫ ИССЛЕДУЕТЕ')}
              </div>
              <div className="current-note">
                {lang === 'de'
                  ? displayNote(note.midi)
                  : note.name.replace(/-?\d+$/, '')}
                {lang !== 'de' && <span>{Math.floor(note.midi / 12) - 1}</span>}
                <Music2 size={29} strokeWidth={1.2} />
              </div>
              <div className="note-data">
                <div>
                  <span>{t('Frequency', 'Частота')}</span>
                  <strong>{fixedNumber(frequency, 2, lang)} Hz</strong>
                </div>
                <div>
                  <span>{t('Period', 'Период')}</span>
                  <strong>{fixedNumber(1000 / frequency, 3, lang)} ms</strong>
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
      )}
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
                    'white-key ' + (note.midi === midi ? 'active-key' : '')
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
                      frequencyForMidi(midi + 1, reference, tuning) < 20 ||
                      frequencyForMidi(midi + 1, reference, tuning) > 20000
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
                        : ['C♯', '', 'D♯', '', '', 'F♯', '', 'G♯', '', 'A♯'][
                            midi % 12
                          ]}
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
            {t('All notes follow your tuning', 'Все ноты следуют вашему строю')}
          </span>
          <span>
            {t('Click a key to hear it', 'Нажмите клавишу, чтобы услышать')}
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
            : t('Download tone · WAV, 5 sec', 'Скачать тон · WAV, 5 сек')}
        </button>
        <span>
          {t(
            'Space to play · Esc to silence · A–K to explore notes',
            'Пробел — звук · Esc — тишина · A–K — ноты',
          )}
        </span>
      </div>
      {labTab === 'tone' && (
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
      )}
    </div>
  );
}
