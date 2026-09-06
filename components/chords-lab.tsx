'use client';
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Headphones,
  Music2,
  Play,
  Plus,
  Redo2,
  Square,
  Trash2,
  Undo2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NumberField } from './number-field';
import { ChordPlayer, type ChordTone } from '@/lib/chord-audio';
import {
  appliedDominant,
  chordNotes,
  chordQualities,
  chordSymbol,
  commonToneNames,
  keyName,
  keyPitch,
  MAX_CHORDS,
  paletteChord,
  planProgression,
  progressionTemplates,
  romanNumeral,
  templateGroups,
  templateSources,
  type ChordKey,
  type ChordQuality,
  type ChordStep,
  type ProgressionPlan,
  type Texture,
} from '@/lib/chords';
import { pitchLabel, pitchName, type MusicLanguage } from '@/lib/notation';
import { count } from '@/lib/plural';

type Option = { value: string; label: string };
function Choice({
  label,
  value,
  options,
  onChange,
  children,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <div className="chord-field">
      <span>{label}</span>
      <Select
        value={value}
        onValueChange={(v) => {
          if (v !== null) onChange(v);
        }}
      >
        <SelectTrigger aria-label={label}>
          {/* A value outside the list is shown as itself rather than crashing. */}
          <SelectValue>
            {options.find((option) => option.value === value)?.label ?? value}
          </SelectValue>
        </SelectTrigger>
        {/* A long grouped list reads better anchored under its trigger than
            centred on the current value, which can open a 22-entry popup
            already scrolled past the family the reader is looking for. */}
        <SelectContent
          className="chord-select-content"
          alignItemWithTrigger={false}
        >
          {children ??
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * The document the editor owns. Playback preferences (timbre, volume, repeat
 * count) stay outside it, because undoing a change to the progression should
 * not silently move the volume slider back as well.
 */
type Draft = {
  key: ChordKey;
  chords: ChordStep[];
  tempo: number;
  texture: Texture;
  template: number;
  edited: boolean;
};
type History = { past: Draft[]; present: Draft; future: Draft[] };
/** Deep enough for a working session, short enough to stay a fixed cost. */
const HISTORY_LIMIT = 60;

function fromTemplate(index: number, tonic = 0): Draft {
  const template = progressionTemplates[index];
  return {
    key: { tonic, mode: template.mode },
    chords: template.steps.map((chord) => ({ ...chord })),
    tempo: template.tempo,
    texture: template.texture,
    template: index,
    edited: false,
  };
}

export function ChordsLab({ lang }: { lang: MusicLanguage }) {
  const t = (en: string, ru: string) => (lang === 'ru' ? ru : en);
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: fromTemplate(1),
    future: [],
  }));
  const draft = history.present;
  const { key, chords, tempo, texture } = draft;
  const [selectedCard, setSelected] = useState(0);
  // Undo, redo and deletion can shorten the phrase under the selection.
  const selected = Math.min(selectedCard, chords.length - 1);
  const [replaced, setReplaced] = useState(false);
  const [sevenths, setSevenths] = useState(false);
  const [tone, setTone] = useState<ChordTone>('triangle');
  const [volume, setVolume] = useState(25);
  const [repeats, setRepeats] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const player = useRef<ChordPlayer | null>(null);
  const request = useRef(0);
  const session = useRef<{
    origin: number;
    plan: ProgressionPlan;
    cards: number[];
  } | null>(null);
  const chord = chords[selected];
  const notes = chordNotes(key, chord);
  const construction = chordNotes(key, { ...chord, inversion: 0 });
  const definition = chordQualities[chord.quality];
  const template = progressionTemplates[draft.template];
  const source = templateSources[template.source];
  const duration =
    ((chords.reduce((sum, c) => sum + c.beats, 0) * 60) / tempo) * repeats;
  const common =
    selected > 0 ? commonToneNames(key, chords[selected - 1], chord, lang) : [];

  function stop() {
    request.current++;
    player.current?.stop();
    session.current = null;
    setPlaying(false);
    setPending(false);
    setActive(-1);
  }
  const tick = useEffectEvent(() => {
    const current = session.current;
    if (!current || !player.current) return;
    const elapsed = player.current.context.currentTime - current.origin;
    if (elapsed >= current.plan.duration) {
      stop();
      return;
    }
    const index = current.plan.starts.findLastIndex((at) => at <= elapsed);
    const next = index < 0 ? -1 : current.cards[index % current.cards.length];
    if (next !== active) setActive(next);
  });
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(tick, 30);
    return () => window.clearInterval(timer);
  }, [playing]);
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') stop();
  });
  const onVisibility = useEffectEvent(() => {
    if (document.hidden) stop();
  });
  const disposePlayer = useEffectEvent(() => {
    request.current++;
    player.current?.dispose();
  });
  useEffect(() => {
    window.addEventListener('keydown', onEscape);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposePlayer();
      window.removeEventListener('keydown', onEscape);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  async function play(plan: ProgressionPlan, cards: number[]) {
    stop();
    const id = request.current;
    setError(false);
    setPending(true);
    try {
      player.current ??= new ChordPlayer();
      const origin = await player.current.play(plan, volume / 100, tone);
      if (id !== request.current) return;
      setPending(false);
      if (origin === null) return;
      session.current = { origin, plan, cards };
      setPlaying(true);
    } catch {
      if (id === request.current) {
        player.current?.stop();
        setPending(false);
        setError(true);
      }
    }
  }

  /**
   * Every change to the progression goes through here, so that every change is
   * reversible. Choosing a different starting example is a change like any
   * other: it replaces the phrase, and one Undo brings the old one back.
   */
  function commit(change: (draft: Draft) => Draft, nextSelected?: number) {
    stop();
    setHistory((state) => ({
      past: [...state.past, state.present].slice(-HISTORY_LIMIT),
      present: change(state.present),
      future: [],
    }));
    if (nextSelected !== undefined) setSelected(nextSelected);
    setAnswer(null);
    setReplaced(false);
  }
  function undo() {
    stop();
    setHistory((state) =>
      state.past.length === 0
        ? state
        : {
            past: state.past.slice(0, -1),
            present: state.past.at(-1)!,
            future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
          },
    );
    setAnswer(null);
    setReplaced(false);
  }
  function redo() {
    stop();
    setHistory((state) =>
      state.future.length === 0
        ? state
        : {
            past: [...state.past, state.present].slice(-HISTORY_LIMIT),
            present: state.future[0],
            future: state.future.slice(1),
          },
    );
    setAnswer(null);
    setReplaced(false);
  }
  const changeChord = (changes: Partial<ChordStep>) =>
    commit((d) => ({
      ...d,
      edited: true,
      chords: d.chords.map((c, i) =>
        i === selected ? { ...c, ...changes } : c,
      ),
    }));
  function loadTemplate(index: number) {
    const wasEdited = draft.edited;
    commit(() => fromTemplate(index, key.tonic), 0);
    setReplaced(wasEdited);
  }
  const appendChord = (next: ChordStep) =>
    commit(
      (d) => ({ ...d, edited: true, chords: [...d.chords, { ...next }] }),
      chords.length,
    );
  const duplicateChord = () =>
    commit(
      (d) => ({
        ...d,
        edited: true,
        chords: d.chords.toSpliced(selected + 1, 0, { ...chord }),
      }),
      selected + 1,
    );
  const removeChord = () =>
    commit(
      (d) => ({
        ...d,
        edited: true,
        chords: d.chords.filter((_, i) => i !== selected),
      }),
      Math.max(0, selected - 1),
    );
  const move = (direction: number) =>
    commit((d) => {
      const next = [...d.chords];
      [next[selected], next[selected + direction]] = [
        next[selected + direction],
        next[selected],
      ];
      return { ...d, edited: true, chords: next };
    }, selected + direction);

  const hearChord = () =>
    void play(planProgression(key, [{ ...chord, beats: 2 }], 80, 'held', 1), [
      selected,
    ]);
  const keyStart = Math.floor(notes[0].midi / 12) * 12;
  const keyEnd = Math.ceil((notes.at(-1)!.midi + 1) / 12) * 12;
  const pianoKeys = Array.from(
    { length: keyEnd - keyStart },
    (_, i) => keyStart + i,
  );
  const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(midi % 12);
  const whiteCount = pianoKeys.filter((midi) => !isBlack(midi)).length;
  let whiteIndex = 0;

  return (
    <div className="chords-lab">
      <section
        className="panel chord-workbench"
        aria-label={t('Progression editor', 'Редактор последовательности')}
      >
        <div className="chord-workbench-heading">
          <div>
            <span className="chord-kicker">
              {t('MAKE A LITTLE MUSIC', 'СОЧИНИТЕ НЕМНОГО МУЗЫКИ')}
            </span>
            <h2>{t('Your progression', 'Ваша последовательность')}</h2>
          </div>
          <span className="soft-badge">4/4 · {keyName(key, lang)}</span>
        </div>
        <div className="chord-setup">
          <Choice
            label={t('Starting point', 'Отправная точка')}
            value={String(draft.template)}
            onChange={(v) => loadTemplate(Number(v))}
            options={progressionTemplates.map((item, i) => ({
              value: String(i),
              label: `${item[lang]} · ${item.pattern}`,
            }))}
          >
            {templateGroups.map((group) => (
              <SelectGroup key={group.id}>
                <SelectLabel>{group[lang]}</SelectLabel>
                {progressionTemplates.flatMap((item, i) =>
                  item.group === group.id
                    ? [
                        <SelectItem key={item.id} value={String(i)}>
                          {item[lang]} · {item.pattern}
                        </SelectItem>,
                      ]
                    : [],
                )}
              </SelectGroup>
            ))}
          </Choice>
          <Choice
            label={t('Tonic · transpose', 'Тоника · транспонировать')}
            value={String(key.tonic)}
            onChange={(v) =>
              commit((d) => ({ ...d, key: { ...d.key, tonic: Number(v) } }))
            }
            options={Array.from({ length: 12 }, (_, tonic) => ({
              value: String(tonic),
              label: pitchName(keyPitch({ ...key, tonic }), lang),
            }))}
          />
          <Choice
            label={t('Palette scale', 'Гамма палитры')}
            value={key.mode}
            onChange={(v) =>
              commit((d) => ({
                ...d,
                edited: true,
                key: { ...d.key, mode: v as ChordKey['mode'] },
              }))
            }
            options={[
              { value: 'major', label: t('Major', 'Мажор') },
              {
                value: 'minor',
                label: t('Natural minor', 'Натуральный минор'),
              },
            ]}
          />
        </div>
        <fieldset
          className="chord-timeline"
          aria-label={t('Progression chords', 'Аккорды последовательности')}
        >
          {chords.map((item, i) => {
            const applied = appliedDominant(key, item, chords[i + 1]);
            return (
              <button
                key={i}
                className={`chord-card ${i === selected ? 'is-selected' : ''} ${i === active ? 'is-sounding' : ''}`}
                aria-pressed={i === selected}
                aria-label={`${t('Chord', 'Аккорд')} ${i + 1}: ${chordSymbol(key, item)}`}
                onClick={() => {
                  setSelected(i);
                  setAnswer(null);
                }}
              >
                <span className="chord-card-top">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{count(item.beats, lang, 'beats')}</span>
                </span>
                <strong>{chordSymbol(key, item)}</strong>
                <span className="chord-roman">
                  {romanNumeral(key, item)}
                  {applied && (
                    <em
                      title={t(
                        'Acts as the dominant of the next chord',
                        'Действует как доминанта к следующему аккорду',
                      )}
                    >
                      {applied}
                    </em>
                  )}
                </span>
                <span className="chord-beat-dots" aria-hidden="true">
                  {Array.from({ length: item.beats }, (_, n) => (
                    <i key={n} />
                  ))}
                </span>
                {i === active && (
                  <span className="chord-now">{t('Playing', 'Звучит')}</span>
                )}
              </button>
            );
          })}
        </fieldset>
        <div className="chord-edit-actions">
          <output>
            {t('Selected', 'Выбран')} {selected + 1} / {chords.length}
            {draft.edited ? t(' · edited', ' · изменено') : ''}
          </output>
          <div>
            <button
              aria-label={t('Undo', 'Отменить')}
              disabled={history.past.length === 0}
              onClick={undo}
            >
              <Undo2 size={16} />
            </button>
            <button
              aria-label={t('Redo', 'Вернуть')}
              disabled={history.future.length === 0}
              onClick={redo}
            >
              <Redo2 size={16} />
            </button>
            <button
              aria-label={t('Move chord left', 'Переместить аккорд влево')}
              disabled={selected === 0}
              onClick={() => move(-1)}
            >
              <ArrowLeft size={16} />
            </button>
            <button
              aria-label={t('Move chord right', 'Переместить аккорд вправо')}
              disabled={selected === chords.length - 1}
              onClick={() => move(1)}
            >
              <ArrowRight size={16} />
            </button>
            <button
              aria-label={t('Duplicate chord', 'Дублировать аккорд')}
              disabled={chords.length >= MAX_CHORDS}
              onClick={duplicateChord}
            >
              <Copy size={16} />
            </button>
            <button
              aria-label={t('Remove chord', 'Удалить аккорд')}
              disabled={chords.length === 1}
              onClick={removeChord}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {replaced && (
          <output className="chord-message">
            {t(
              'The example replaced the progression you had edited. Undo brings it back.',
              'Пример заменил изменённую вами последовательность. Кнопка «Отменить» вернёт её.',
            )}
          </output>
        )}
        <div className="chord-transport">
          <button
            className="primary-button"
            disabled={duration > 180}
            onClick={() =>
              playing || pending
                ? stop()
                : void play(
                    planProgression(key, chords, tempo, texture, repeats),
                    chords.map((_, i) => i),
                  )
            }
          >
            {playing || pending ? <Square size={16} /> : <Play size={16} />}
            {pending
              ? t('Cancel start', 'Отменить запуск')
              : playing
                ? t('Stop', 'Стоп')
                : t('Play progression', 'Слушать последовательность')}
          </button>
          <label className="chord-tempo">
            {t('Tempo', 'Темп')}
            <NumberField
              aria-label={t('Tempo', 'Темп')}
              min={40}
              max={200}
              value={tempo}
              onValue={(n) => commit((d) => ({ ...d, tempo: n }))}
            />
            <span>BPM</span>
          </label>
          <Choice
            label={t('Play through', 'Повторения')}
            value={String(repeats)}
            onChange={(v) => {
              stop();
              setRepeats(Number(v));
            }}
            options={[1, 2, 4].map((n) => ({
              value: String(n),
              label: `${n}×`,
            }))}
          />
          <output aria-live="polite">
            {playing ? t('Playing', 'Воспроизведение') : t('Ready', 'Готово')} ·{' '}
            {Math.round(duration)} {t('sec', 'с')}
          </output>
        </div>
        {duration > 180 && (
          <p role="alert" className="chord-message">
            {t(
              'Keep a phrase within 3 minutes: reduce repeats or beats, or increase tempo.',
              'Фраза должна длиться не более 3 минут: сократите повторы или длительности либо увеличьте темп.',
            )}
          </p>
        )}
        {error && (
          <p role="alert" className="chord-message">
            {t(
              'Audio could not start. Check browser audio settings and try Play again.',
              'Звук не запустился. Проверьте настройки звука браузера и повторите запуск.',
            )}
          </p>
        )}
        <details className="chord-sound-settings">
          <summary>
            {t('Sound & accompaniment', 'Звук и аккомпанемент')}
          </summary>
          <div className="chord-sound-grid">
            <Choice
              label={t('Texture', 'Фактура')}
              value={texture}
              onChange={(v) => commit((d) => ({ ...d, texture: v as Texture }))}
              options={[
                {
                  value: 'held',
                  label: t('Held chords', 'Выдержанные аккорды'),
                },
                {
                  value: 'pulse',
                  label: t('Quarter-note pulse', 'Пульсация четвертями'),
                },
                {
                  value: 'arpeggio',
                  label: t('Eighth-note arpeggio', 'Арпеджио восьмыми'),
                },
              ]}
            />
            <Choice
              label={t('Timbre', 'Тембр')}
              value={tone}
              onChange={(v) => {
                stop();
                setTone(v as ChordTone);
              }}
              options={[
                {
                  value: 'triangle',
                  label: t('Soft triangle', 'Мягкий треугольник'),
                },
                { value: 'sine', label: t('Pure sine', 'Чистый синус') },
              ]}
            />
            <label className="chord-volume">
              {t('Volume', 'Громкость')} · {volume}%
              <input
                type="range"
                aria-label={t('Volume', 'Громкость')}
                min={0}
                max={60}
                value={volume}
                onChange={(e) => {
                  stop();
                  setVolume(Number(e.target.value));
                }}
              />
            </label>
          </div>
        </details>
      </section>

      <div className="chord-lower-grid">
        <section
          className="panel chord-inspector"
          aria-label={t('Chord inspector', 'Устройство аккорда')}
        >
          <div className="chord-inspector-heading">
            <div>
              <span className="chord-kicker">
                {t('INSIDE THE CHORD', 'ВНУТРИ АККОРДА')} · {selected + 1}
              </span>
              <h2>{chordSymbol(key, chord)}</h2>
              <p>
                {definition[lang]} · {pitchName(construction[0], lang)}
              </p>
            </div>
            <button className="secondary-button" onClick={hearChord}>
              <Headphones size={16} />
              {t('Listen', 'Слушать')}
            </button>
          </div>
          <div className="chord-inspector-controls">
            <Choice
              label={t('Root degree', 'Ступень основного тона')}
              value={String(chord.degree)}
              onChange={(v) => changeChord({ degree: Number(v) })}
              options={Array.from({ length: 7 }, (_, degree) => ({
                value: String(degree),
                label: `${degree + 1} · ${pitchName(chordNotes(key, { ...chord, degree, inversion: 0 })[0], lang)}`,
              }))}
            />
            <Choice
              label={t('Chord type', 'Вид аккорда')}
              value={chord.quality}
              onChange={(v) =>
                changeChord({ quality: v as ChordQuality, inversion: 0 })
              }
              options={Object.entries(chordQualities).map(([value, q]) => ({
                value,
                label: q[lang],
              }))}
            />
            <Choice
              label={t('Bass / inversion', 'Бас / обращение')}
              value={String(chord.inversion)}
              onChange={(v) => changeChord({ inversion: Number(v) })}
              options={construction.map((p, i) => ({
                value: String(i),
                label: `${pitchName(p, lang)}${i === 0 ? t(' · root position', ' · основной вид') : t(' · in the bass', ' · в басу')}`,
              }))}
            />
            <Choice
              label={t('Duration', 'Длительность')}
              value={String(chord.beats)}
              onChange={(v) => changeChord({ beats: Number(v) })}
              options={[1, 2, 3, 4, 6, 8].map((n) => ({
                value: String(n),
                label: count(n, lang, 'beats'),
              }))}
            />
          </div>
          <div className="chord-formula">
            <span>{t('Construction', 'Строение')}</span>
            <strong>{definition.formula}</strong>
          </div>
          <div
            className="chord-pitches"
            aria-label={t(
              'Sounding notes, low to high',
              'Звучащие ноты снизу вверх',
            )}
          >
            {notes.map((p, i) => (
              <button
                key={i}
                onClick={() =>
                  void play(
                    {
                      events: [
                        { midi: p.midi, at: 0, duration: 0.7, level: 0.5 },
                      ],
                      starts: [0],
                      duration: 0.8,
                    },
                    [selected],
                  )
                }
              >
                <strong>{pitchName(p, lang)}</strong>
                <small>{pitchLabel(p, lang)}</small>
                {i === 0 && <em>{t('bass', 'бас')}</em>}
              </button>
            ))}
          </div>
          <figure
            className="chord-keyboard"
            aria-label={`${t('Keyboard, sounding notes', 'Клавиатура, звучащие ноты')}: ${notes.map((p) => pitchLabel(p, lang)).join('; ')}`}
          >
            {pianoKeys.map((midi) => {
              const black = isBlack(midi);
              const index = whiteIndex;
              if (!black) whiteIndex++;
              const activeNote = notes.find((p) => p.midi === midi);
              return (
                <span
                  key={midi}
                  aria-hidden="true"
                  className={`${black ? 'chord-black-key' : 'chord-white-key'} ${activeNote ? 'is-active' : ''}`}
                  style={{
                    left: `${((index - (black ? 0.3 : 0)) / whiteCount) * 100}%`,
                    width: `${((black ? 0.6 : 1) / whiteCount) * 100}%`,
                  }}
                >
                  {activeNote && <i />}
                </span>
              );
            })}
          </figure>
          <p className="chord-insight">
            {t('Root', 'Основной тон')}:{' '}
            <strong>{pitchName(construction[0], lang)}</strong> ·{' '}
            {t('Bass', 'Бас')}: <strong>{pitchName(notes[0], lang)}</strong>.{' '}
            {t(
              'An inversion changes the lowest note, not the root.',
              'Обращение меняет нижний звук, но не основной тон.',
            )}
          </p>
          {selected > 0 && (
            <p className="chord-insight">
              {t(
                'Shared pitches with the previous chord',
                'Общие высоты с предыдущим аккордом',
              )}
              :{' '}
              <strong>
                {common.length ? common.join(', ') : t('none', 'нет')}
              </strong>
              .{' '}
              {t(
                'Compare their registers as well as their names.',
                'Сравните также их регистры.',
              )}
            </p>
          )}
        </section>

        <section
          className="panel chord-palette"
          aria-label={t('Chord palette', 'Палитра аккордов')}
        >
          <div className="chord-workbench-heading">
            <div>
              <span className="chord-kicker">
                {t('WHERE NEXT?', 'ЧТО ДАЛЬШЕ?')}
              </span>
              <h2>{t('Chords in your key', 'Аккорды тональности')}</h2>
            </div>
            <Music2 size={22} />
          </div>
          <fieldset
            className="chord-palette-switch"
            aria-label={t('Palette chord size', 'Состав аккордов палитры')}
          >
            <button aria-pressed={!sevenths} onClick={() => setSevenths(false)}>
              {t('Triads', 'Трезвучия')}
            </button>
            <button aria-pressed={sevenths} onClick={() => setSevenths(true)}>
              {t('Sevenths', 'Септаккорды')}
            </button>
          </fieldset>
          <div className="chord-palette-list">
            {Array.from({ length: 7 }, (_, degree) => {
              const item = paletteChord(key.mode, degree, sevenths);
              return (
                <button
                  key={degree}
                  disabled={chords.length >= MAX_CHORDS}
                  aria-label={`${t('Add', 'Добавить')} ${chordSymbol(key, item)}`}
                  onClick={() => appendChord(item)}
                >
                  <span className="chord-roman">{romanNumeral(key, item)}</span>
                  <strong>{chordSymbol(key, item)}</strong>
                  <small>
                    {chordNotes(key, item)
                      .map((p) => pitchName(p, lang))
                      .join(' · ')}
                  </small>
                  <Plus size={16} />
                </button>
              );
            })}
          </div>
          <p className="chord-insight">
            {chords.length >= MAX_CHORDS
              ? t(
                  '16 chords maximum. Remove one to add another.',
                  'Не более 16 аккордов. Удалите один, чтобы добавить новый.',
                )
              : t(
                  'A chord is added at the end; the copy button puts a duplicate next to the selected card. Then change its type or bass in the inspector. The palette follows the scale; your edited chords can go beyond it.',
                  'Аккорд добавляется в конец, а кнопка копирования ставит дубликат рядом с выбранной карточкой. Затем измените вид или бас в редакторе. Палитра следует гамме; ваши аккорды могут выходить за её пределы.',
                )}
          </p>
          {key.mode === 'minor' && (
            <p className="chord-insight">
              {t(
                'For a leading tone in minor, try major V or V7 in the inspector.',
                'Для вводного тона в миноре выберите мажорный V или V7 в редакторе.',
              )}
            </p>
          )}
        </section>
      </div>

      <section className="panel chord-learning">
        <Tabs defaultValue="explore">
          <TabsList>
            <TabsTrigger value="explore">
              {t('Listen & explore', 'Слушайте и исследуйте')}
            </TabsTrigger>
            <TabsTrigger value="practice">
              {t('Try a challenge', 'Проверьте себя')}
            </TabsTrigger>
            <TabsTrigger value="terms">
              {t('Terms & sources', 'Термины и источники')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="explore">
            <h3>
              {template[lang]} · {template.pattern}
              {draft.edited
                ? t(' · starting example', ' · исходный пример')
                : ''}
            </h3>
            <p>{template.note[lang]}</p>
            <p>
              {t(
                'Change one thing at a time: chord type, bass, order, then tempo. Listen before deciding which version you prefer. Every change can be undone, including loading another example.',
                'Меняйте по одному параметру: вид аккорда, бас, порядок, затем темп. Послушайте, прежде чем выбрать понравившийся вариант. Любое изменение можно отменить, в том числе загрузку другого примера.',
              )}
            </p>
            <a className="chord-source" href={source.href}>
              <BookOpen size={15} />
              {source.label}
            </a>
          </TabsContent>
          <TabsContent value="practice">
            <h3>
              {t('Which pitch is the root?', 'Какой звук — основной тон?')}
            </h3>
            <p>
              {t(
                'Inspect the selected chord. Its lowest sounding note may be a different chord member. Choose the root, then try an inversion and answer again.',
                'Исследуйте выбранный аккорд. Самый низкий звук может быть другим аккордовым тоном. Найдите основной тон, затем смените обращение и ответьте снова.',
              )}
            </p>
            <div className="chord-answer-options">
              {notes.map((p, i) => (
                <button
                  className="secondary-button"
                  key={i}
                  onClick={() => setAnswer(p.midi % 12)}
                >
                  {pitchName(p, lang)}
                </button>
              ))}
            </div>
            {answer !== null && (
              <output className="chord-feedback">
                {answer === construction[0].midi % 12 ? (
                  <>
                    <Check size={17} />
                    {t(
                      'Yes. The root stays',
                      'Верно. Основной тон остаётся',
                    )}{' '}
                    {pitchName(construction[0], lang)}.
                  </>
                ) : (
                  <>
                    {t(
                      'That is a chord member, but the root is',
                      'Это аккордовый тон, но основной тон —',
                    )}{' '}
                    {pitchName(construction[0], lang)}.{' '}
                    {t(
                      'Use the construction formula; changing the bass does not change the root.',
                      'Ориентируйтесь на формулу строения: смена баса не меняет основной тон.',
                    )}
                  </>
                )}
              </output>
            )}
          </TabsContent>
          <TabsContent value="terms">
            <div className="chord-terms">
              <div>
                <h3>{t('Root ≠ bass', 'Основной тон ≠ бас')}</h3>
                <p>
                  {t(
                    'The root identifies the chord. The bass is its lowest sounding pitch. A slash symbol, such as C/E, gives the bass after the slash.',
                    'Основной тон определяет аккорд. Бас — самый низкий звучащий тон. В символе C/E звук после косой черты обозначает бас.',
                  )}
                </p>
              </div>
              <div>
                <h3>{t('Degrees & symbols', 'Ступени и символы')}</h3>
                <p>
                  {t(
                    'Roman numerals here use the major scale as reference: minor-key III, VI and VII roots are written ♭III, ♭VI and ♭VII. Letter symbols follow international lead-sheet practice. The formula describes intervals from the chord root, not from the key tonic.',
                    'Римские цифры здесь отсчитываются от мажорной гаммы: корни III, VI и VII ступеней минора обозначены ♭III, ♭VI и ♭VII. Буквенные символы следуют международной джазовой практике. Формула показывает интервалы от основного тона аккорда, а не от тоники.',
                  )}
                </p>
              </div>
              <div>
                <h3>
                  {t('V/x · applied dominants', 'V/x · побочные доминанты')}
                </h3>
                <p>
                  {t(
                    'A card shows V/x only when its chord is major where the scale is not, and the next chord’s root lies a fifth below. Both conditions are needed, because an applied dominant is defined by its resolution. Chords the lab cannot prove are left with their degree numeral alone.',
                    'Отметка V/x появляется, только если аккорд мажорный там, где гамма даёт другой вид, и корень следующего аккорда лежит квинтой ниже. Нужны оба условия: побочная доминанта определяется своим разрешением. Там, где лаборатория не может это доказать, остаётся только обозначение ступени.',
                  )}
                </p>
              </div>
              <div>
                <h3>
                  {t('A model to experiment with', 'Модель для экспериментов')}
                </h3>
                <p>
                  {t(
                    'This lab uses 12-tone equal temperament, A4 = 440 Hz, and straight 4/4. The examples are harmonic starting points drawn from the readings below. They do not model every tradition, phrasing, or rule of voice leading, and a chord pattern alone does not establish a style or certify a cadence.',
                    'Здесь используются равномерная темперация из 12 ступеней, ля первой октавы = 440 Гц и ровный размер 4/4. Примеры — гармонические отправные точки из приведённых ниже источников. Они не моделируют все традиции, фразировку и правила голосоведения, а сама последовательность аккордов не определяет ни стиль, ни каденцию.',
                  )}
                </p>
              </div>
            </div>
            <div className="chord-source-links">
              {Object.entries(templateSources).map(([id, item]) => (
                <a key={id} href={item.href}>
                  {item.label}
                </a>
              ))}
              <a href="https://musictheory.pugetsound.edu/mt21c/TriadsIntroduction.html">
                Hutchinson · §6.1 {t('Triads', 'Трезвучия')}
              </a>
              <a href="https://musictheory.pugetsound.edu/mt21c/InvertedTriads.html">
                Hutchinson · §6.3 {t('Inversions', 'Обращения')}
              </a>
              <a href="https://musictheory.pugetsound.edu/mt21c/SeventhChordsIntroduction.html">
                Hutchinson · §8.1 {t('Sevenths', 'Септаккорды')}
              </a>
              <a href="https://musictheory.pugetsound.edu/mt21c/JazzChordBasics.html">
                Hutchinson · §31.1 {t('Ninths', 'Нонаккорды')}
              </a>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <p className="chord-footnote">
        {t(
          'Start quietly · Esc to stop · Editing stops playback · Every change can be undone · Sound stays in your browser',
          'Начните тихо · Esc — стоп · Редактирование останавливает звук · Любое изменение обратимо · Звук создаётся в браузере',
        )}
      </p>
    </div>
  );
}
