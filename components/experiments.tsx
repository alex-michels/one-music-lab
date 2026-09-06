'use client';
import { useState } from 'react';
import { Play, Sparkles, Volume2 } from 'lucide-react';
import { count } from '@/lib/plural';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { patterns } from '@/lib/learning';
import { scales } from '@/lib/scales';
import {
  experimentTonics,
  octaveName,
  pitchLabel,
  pitchName,
  scaleName,
  spellPattern,
} from '@/lib/notation';
import { frequencyForMidi, type Tuning, type Wave } from '@/lib/music';
type Lang = 'en' | 'ru';
type PlaySequence = (
  frequencies: number[],
  spacing?: number,
  wave?: Wave,
) => Promise<void>;
export function Experiments({
  lang,
  reference,
  tuning,
  play,
}: {
  lang: Lang;
  reference: number;
  tuning: Tuning;
  play: PlaySequence;
}) {
  const [kind, setKind] = useState<keyof typeof patterns>('intervals');
  const [selected, setSelected] = useState(3);
  const [root, setRoot] = useState('A');
  const t = (en: string, ru: string) => (lang === 'ru' ? ru : en);
  const pattern = patterns[kind][Math.min(selected, patterns[kind].length - 1)];
  const tonic = spellPattern(root, { steps: [0], degrees: [0] })[0];
  const notes = spellPattern(root, pattern).map((pitch) => ({
    ...pitch,
    hz: frequencyForMidi(pitch.midi, reference, tuning),
  }));
  const outsideRange = notes.some(
    (n) => !Number.isFinite(n.hz) || n.hz < 20 || n.hz > 20000,
  );
  return (
    <section className="panel experiments">
      <div className="panel-heading">
        <span>
          <Sparkles size={18} />
          {t('A little experiment', 'Небольшой эксперимент')}
        </span>
        <span className="soft-badge">
          {t('Listen to relationships', 'Слушайте отношения')}
        </span>
      </div>
      <Tabs
        value={kind}
        onValueChange={(v) => {
          setKind(v as keyof typeof patterns);
          setSelected(0);
        }}
      >
        <TabsList className="experiment-tabs">
          {(['intervals', 'scales', 'chords'] as const).map((key, i) => (
            <TabsTrigger key={key} value={key}>
              {
                [
                  t('Intervals', 'Интервалы'),
                  t('Scales & modes', 'Гаммы и лады'),
                  t('Chords', 'Аккорды'),
                ][i]
              }
            </TabsTrigger>
          ))}
        </TabsList>
        {(['intervals', 'scales', 'chords'] as const).map((key) => (
          <TabsContent key={key} value={key}>
            <div className="experiment-controls">
              <div>
                <label id={'root-' + key}>
                  {t('Root note', 'Основной тон')}
                </label>
                <Select
                  value={root}
                  onValueChange={(v) => {
                    if (v !== null) setRoot(v);
                  }}
                >
                  <SelectTrigger aria-labelledby={'root-' + key}>
                    <SelectValue>{pitchLabel(tonic, lang)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {experimentTonics.map((name) => {
                      const pitch = spellPattern(name, {
                        steps: [0],
                        degrees: [0],
                      })[0];
                      return (
                        <SelectItem key={name} value={name}>
                          {pitchLabel(pitch, lang)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label id={'pattern-' + key}>
                  {t('Explore', 'Исследовать')}
                </label>
                <Select
                  value={String(selected)}
                  onValueChange={(v) => {
                    if (v !== null) setSelected(Number(v));
                  }}
                >
                  <SelectTrigger aria-labelledby={'pattern-' + key}>
                    <SelectValue>
                      {key === 'scales'
                        ? scaleName(tonic, scales[selected], lang)
                        : pattern[lang]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {patterns[key].map((p, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {key === 'scales'
                          ? scaleName(tonic, scales[i], lang)
                          : p[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                className="primary-button"
                disabled={outsideRange}
                onClick={() =>
                  void play(
                    notes.map((n) => n.hz),
                    0.65,
                  ).catch(() => {})
                }
              >
                <Play size={16} />
                {t('In sequence', 'Последовательно')}
              </button>
              {key !== 'scales' && (
                <button
                  className="secondary-button"
                  disabled={outsideRange}
                  onClick={() =>
                    void play(
                      notes.map((n) => n.hz),
                      0,
                    ).catch(() => {})
                  }
                >
                  <Volume2 size={17} />
                  {t('Together', 'Вместе')}
                </button>
              )}
            </div>
            {outsideRange && (
              <output className="experiment-hint">
                {t(
                  'Some notes are outside 20–20,000 Hz. Adjust the A4 reference to hear the complete experiment.',
                  'Некоторые ноты выходят за пределы 20–20 000 Гц. Измените опорную частоту ля первой октавы, чтобы услышать эксперимент целиком.',
                )}
              </output>
            )}
            <div className="note-sequence">
              {notes.map((n, i) => (
                <div key={i}>
                  <span>
                    {lang === 'ru' ? pitchName(n, lang) : pitchLabel(n, lang)}
                  </span>
                  {lang === 'ru' && (
                    <small className="note-octave">{octaveName(n, lang)}</small>
                  )}
                  <strong>
                    {n.hz.toFixed(2)}
                    <small> Hz</small>
                  </strong>
                  <em>{count(pattern.steps[i], lang, 'semitones')}</em>
                </div>
              ))}
            </div>
            <p className="experiment-hint">
              {t(
                'Note spelling follows the selected tonic and scale or interval degrees. Semitone offsets identify keyboard steps; their sizes depend on your tuning.',
                'Названия нот учитывают выбранную тонику и ступени гаммы или интервалы. Смещения обозначают шаги клавиатуры; их размер зависит от строя.',
              )}
              {key === 'scales' && (
                <>
                  {' '}
                  {t(
                    'Classical melodic minor raises degrees 6 and 7 going up; going down it uses natural minor. Blues here is a fixed-key model with a lowered fifth.',
                    'В учебной классической мелодической гамме VI и VII ступени повышаются при движении вверх; вниз звучит натуральный минор. Блюзовая гамма здесь — модель с фиксированными высотами и пониженной V ступенью.',
                  )}{' '}
                  <a href="https://musictheory.pugetsound.edu/mt21c/MinorScales.html">
                    {t('Minor scales: §3.1', 'Виды минора: §3.1')}
                  </a>
                </>
              )}
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
