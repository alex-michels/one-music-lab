'use client';
import { localNumber, translator } from '@/lib/i18n';
import { intervalLabels } from '@/lib/notation';
import { german } from '@/lib/german';

import { useState } from 'react';
import { count } from '@/lib/plural';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Headphones,
  Play,
  Search,
  Volume2,
  X,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  curriculum,
  exerciseExplanations,
  exerciseModes,
  lessons,
  terms,
} from '@/lib/learning';
import {
  generateFrom,
  grade,
  type ExerciseKind,
  type Level,
} from '@/lib/exercises';
import { Staff } from '@/components/staff';
import { StaffAnswer } from '@/components/staff-answer';
import { frequencyForMidi, noteName, type Wave } from '@/lib/music';
type Lang = import('@/lib/client-store').Lang;
type PlaySequence = (
  frequencies: number[],
  spacing?: number,
  wave?: Wave,
) => Promise<void>;

export { Experiments } from './experiments';

export function Theory({
  lang,
  lessonId,
  setLessonId,
  openLab,
  openPractice,
}: {
  lang: Lang;
  lessonId: string | null;
  setLessonId: (id: string | null) => void;
  openLab: (hz: number, wave: Wave, lessonId: string) => void;
  openPractice: () => void;
}) {
  const t = translator(lang);
  const lesson = lessons.find((l) => l.id === lessonId);
  if (lesson)
    return (
      <article className="lesson-article">
        <button className="text-button" onClick={() => setLessonId(null)}>
          <ArrowLeft size={16} />
          {t('All foundations', 'Все основы')}
        </button>
        <div className="lesson-layout">
          <div className="panel lesson-body">
            <span className="eyebrow">{lesson.category[lang]}</span>
            <h2>{lesson.title[lang]}</h2>
            {lesson.paragraphs.map((p, i) => (
              <p key={i}>{p[lang]}</p>
            ))}
            <div className="formula">{lesson.formula[lang]}</div>
            <a
              className="source-link"
              href={lesson.source}
              target="_blank"
              rel="noreferrer"
            >
              {t('Further reading', 'Для дальнейшего чтения')}
              <ArrowUpRight size={15} />
            </a>
          </div>
          <aside className="lesson-experiment">
            <div className="eyebrow">
              {t('MAKE IT AUDIBLE', 'УСЛЫШЬТЕ ЭТО')}
            </div>
            <Headphones size={32} />
            <h3>{t('Try it in the lab', 'Попробуйте в лаборатории')}</h3>
            <p>{lesson.experiment[lang]}</p>
            <button
              className="primary-button"
              onClick={() => openLab(lesson.hz, lesson.wave as Wave, lesson.id)}
            >
              {t('Open this experiment', 'Открыть эксперимент')}
              <ArrowRight size={16} />
            </button>
            <button className="text-button" onClick={openPractice}>
              {t('Train your ear', 'Тренировать слух')}
              <ChevronRight size={16} />
            </button>
          </aside>
        </div>
      </article>
    );
  return (
    <>
      <div className="content-section-heading">
        <div>
          <span className="eyebrow">
            {t('START WITH THE FOUNDATIONS', 'НАЧНИТЕ С ОСНОВ')}
          </span>
          <h2>
            {t('Understand what you hear.', 'Понимайте то, что слышите.')}
          </h2>
        </div>
        <span className="count-badge">
          {count(lessons.length, lang, 'lessons')}
        </span>
      </div>
      <div className="lesson-grid">
        {lessons.map((l, i) => (
          <button
            key={l.id}
            className="panel lesson-tile"
            onClick={() => setLessonId(l.id)}
          >
            <div className="tile-top">
              <span className="panel-number">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{l.category[lang]}</span>
              <ArrowUpRight size={18} />
            </div>
            <h3>{l.title[lang]}</h3>
            <p>{l.summary[lang]}</p>
            <div className="tile-bottom">
              <BookOpen size={14} />
              {t('Read → listen → try', 'Прочитать → услышать → попробовать')}
            </div>
          </button>
        ))}
      </div>
      <div className="content-section-heading curriculum-heading">
        <div>
          <span className="eyebrow">
            {t('THE BIGGER PICTURE', 'ОБЩАЯ КАРТИНА')}
          </span>
          <h2>
            {t(
              'A world of musical knowledge.',
              'Целый мир музыкальных знаний.',
            )}
          </h2>
          <p>
            {t(
              'The first chapter is here. This is the direction for the growing library.',
              'Первая глава уже здесь. Так будет развиваться библиотека.',
            )}
          </p>
        </div>
      </div>
      <div className="curriculum-grid">
        {curriculum.map((c, i) => (
          <div key={i} className="curriculum-item">
            <span className="curriculum-number">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3>{c.title[lang]}</h3>
              <p>{c.topics[lang]}</p>
              <span className={i === 0 ? 'available' : 'planned'}>
                {c.state[lang]}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="culture-note">
        {t(
          'Musical traditions deserve their own context, terminology and sources. A raga or maqam is not simply a scale preset.',
          'Музыкальные традиции требуют собственного контекста, терминологии и источников. Рага или макам — не просто настройка звукоряда.',
        )}
      </p>
    </>
  );
}

export function Encyclopedia({
  lang,
  openLesson,
}: {
  lang: Lang;
  openLesson: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const t = translator(lang);
  const filtered = terms.filter((term) =>
    (term.title[lang] + ' ' + term.body[lang])
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="content-section-heading">
        <div>
          <span className="eyebrow">
            {t('A SMALL, GROWING REFERENCE', 'КРАТКИЙ РАСТУЩИЙ СПРАВОЧНИК')}
          </span>
          <h2>
            {t(
              'Find the words for what you hear.',
              'Найдите слова для того, что слышите.',
            )}
          </h2>
        </div>
      </div>
      <label className="search-field">
        <Search size={19} />
        <input
          aria-label={t('Search musical terms', 'Найти музыкальный термин')}
          placeholder={t('Search a term…', 'Найти термин…')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>{filtered.length}</span>
      </label>
      <div className="terms-grid">
        {filtered.map((term) => (
          <article className="panel term-card" key={term.title.en}>
            <h3>{term.title[lang]}</h3>
            <p>{term.body[lang]}</p>
            <button
              className="text-button"
              onClick={() => openLesson(term.lesson)}
            >
              {t('Explore the idea', 'Исследовать понятие')}
              <ArrowUpRight size={15} />
            </button>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="panel empty-state">
          <Search size={30} />
          <h3>{t('No matching term yet', 'Термин пока не найден')}</h3>
          <p>
            {t(
              'Try “pitch”, “interval”, “строй” or a shorter search.',
              'Попробуйте «высота», «строй», «pitch» или более короткий запрос.',
            )}
          </p>
          <button className="text-button" onClick={() => setQuery('')}>
            {t('Show all terms', 'Показать все термины')}
          </button>
        </div>
      )}
    </>
  );
}

const quizIntervals = [
  {
    de: german['Minor third'],
    en: 'Minor third',
    ru: 'Малая терция',
    step: 3,
    degree: 2,
  },
  {
    de: german['Major third'],
    en: 'Major third',
    ru: 'Большая терция',
    step: 4,
    degree: 2,
  },
  {
    de: german['Perfect fifth'],
    en: 'Perfect fifth',
    ru: 'Чистая квинта',
    step: 7,
    degree: 4,
  },
  { de: german['Octave'], en: 'Octave', ru: 'Октава', step: 12, degree: 7 },
];
/**
 * The generated notation exercises. Items are pure values from
 * `lib/exercises.ts`, so what happens here is only choosing a seed, showing the
 * item and reporting the tag its own generator attached to the chosen option.
 */
function NotationQuiz({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const [kind, setKind] = useState<ExerciseKind>('octave-region');
  const [level, setLevel] = useState<Level>(1);
  // The seed is the item. Keeping it in state means a reader can be sent back
  // to the exact question they saw, and the tests can reproduce it.
  const [seed, setSeed] = useState(1);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const item = generateFrom(kind, level, seed, lang);
  const resultFor = (id: string) =>
    id === 'written-wrong'
      ? { correct: false, tag: 'wrong-written-note' as const }
      : grade(item, id);
  const verdict = chosen === null ? null : resultFor(chosen);
  const answer = (id: string) => {
    if (chosen !== null) return;
    setChosen(id);
    setTotal((n) => n + 1);
    if (resultFor(id).correct) setScore((n) => n + 1);
  };
  const restart = (next: { kind?: ExerciseKind; level?: Level }) => {
    if (next.kind) setKind(next.kind);
    if (next.level) setLevel(next.level);
    setSeed((n) => n + 101);
    setChosen(null);
  };
  return (
    <div className="practice-layout">
      <section className="panel practice-card">
        <div className="eyebrow">
          {t('READING NOTATION', 'ЧТЕНИЕ НОТНОЙ ЗАПИСИ')}
        </div>
        <div className="exercise-kinds">
          {exerciseModes.map((mode) => (
            <button
              key={mode.kind}
              className={mode.kind === kind ? 'selected' : ''}
              aria-pressed={mode.kind === kind}
              onClick={() => restart({ kind: mode.kind })}
            >
              {mode.label[lang]}
            </button>
          ))}
        </div>
        <div className="exercise-levels">
          {([1, 2, 3] as const).map((value) => (
            <button
              key={value}
              className={value === level ? 'selected' : ''}
              aria-pressed={value === level}
              onClick={() => restart({ level: value })}
            >
              {t('Level', 'Уровень')} {value}
            </button>
          ))}
        </div>
        {kind === 'read-pitch' ? (
          <StaffAnswer
            key={`${seed}-${level}-${lang}`}
            item={item}
            chosen={chosen}
            onAnswer={answer}
          />
        ) : (
          <>
            {item.staff && (
              <div className="exercise-staff">
                <Staff
                  pitches={item.staff.pitches}
                  clef={item.staff.clef}
                  barlines={item.staff.barlines}
                  accidentalVisibility={item.staff.accidentalVisibility}
                  lang={lang}
                  space={13}
                  label={t('The note to name', 'Нота, которую нужно назвать')}
                />
              </div>
            )}
            <h2 className="exercise-prompt">{item.prompt}</h2>
            <div className="answer-grid">
              {item.options.map((option) => (
                <button
                  key={option.id}
                  disabled={chosen !== null}
                  onClick={() => answer(option.id)}
                  className={
                    chosen !== null && option.id === item.answer
                      ? 'answer-correct'
                      : chosen === option.id
                        ? 'answer-wrong'
                        : ''
                  }
                >
                  <span>{option.label}</span>
                  {chosen !== null && option.id === item.answer ? (
                    <Check size={18} />
                  ) : chosen === option.id ? (
                    <X size={18} />
                  ) : null}
                </button>
              ))}
            </div>
          </>
        )}
        {verdict && (
          <output
            className={
              'answer-feedback ' + (verdict.correct ? 'correct' : 'incorrect')
            }
          >
            <strong>
              {verdict.correct
                ? t('That’s right.', 'Верно.')
                : t('Not quite.', 'Не совсем.')}
            </strong>{' '}
            {exerciseExplanations[verdict.tag][lang]}
          </output>
        )}
        {verdict && (
          <button className="primary-button" onClick={() => restart({})}>
            {t('Next question', 'Следующий вопрос')}
            <ArrowRight size={17} />
          </button>
        )}
      </section>
      <aside>
        <section className="panel practice-progress">
          <span className="eyebrow">{t('THIS SESSION', 'ЭТА СЕССИЯ')}</span>
          <div className="score">
            {score}
            <span>/ {total}</span>
          </div>
          <p>{t('correct answers', 'правильных ответов')}</p>
          <Progress
            aria-label={t(
              'Correct answer percentage',
              'Процент правильных ответов',
            )}
            value={total ? (score / total) * 100 : 0}
          />
          <div className="progress-caption">
            <span>{total ? Math.round((score / total) * 100) : 0}%</span>
            <button
              onClick={() => {
                setScore(0);
                setTotal(0);
                restart({});
              }}
            >
              {t('Reset session', 'Сбросить сессию')}
            </button>
          </div>
        </section>
        <div className="practice-tip">
          <h3>{t('Read, then check', 'Сначала прочитайте')}</h3>
          <p>
            {t(
              'Name the answer to yourself before looking at the options. The options are there to be checked against, not to be chosen from.',
              'Сначала ответьте себе, а потом смотрите на варианты. Варианты нужны для проверки, а не для выбора.',
            )}
          </p>
        </div>
      </aside>
    </div>
  );
}

export function Practice({
  lang,
  reference,
  play,
}: {
  lang: Lang;
  reference: number;
  play: PlaySequence;
}) {
  const t = translator(lang);
  const [mode, setMode] = useState<'ear' | 'notation'>('ear');
  const [question, setQuestion] = useState<{
    index: number;
    root: number;
    reference: number;
  } | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasHeard, setHasHeard] = useState(false);
  const replay = async (q = question) => {
    if (q) {
      try {
        await play(
          [
            frequencyForMidi(q.root, q.reference),
            frequencyForMidi(q.root + quizIntervals[q.index].step, q.reference),
          ],
          0.75,
          'sine',
        );
        setHasHeard(true);
      } catch {
        setHasHeard(false);
      }
    }
  };
  const next = () => {
    const q = {
      index: Math.floor(Math.random() * quizIntervals.length),
      root: 57 + Math.floor(Math.random() * 12),
      reference,
    };
    setQuestion(q);
    setAnswer(null);
    setHasHeard(false);
    void replay(q);
  };
  const choose = (i: number) => {
    if (!question || answer !== null || !hasHeard) return;
    setAnswer(i);
    setTotal((n) => n + 1);
    if (i === question.index) setScore((n) => n + 1);
  };
  return (
    <>
      <fieldset
        className="practice-modes"
        aria-label={t('Exercise', 'Упражнение')}
      >
        <button
          className={mode === 'ear' ? 'selected' : ''}
          aria-pressed={mode === 'ear'}
          onClick={() => setMode('ear')}
        >
          <Headphones size={16} />
          {t('Ear training', 'Тренировка слуха')}
        </button>
        <button
          className={mode === 'notation' ? 'selected' : ''}
          aria-pressed={mode === 'notation'}
          onClick={() => setMode('notation')}
        >
          <BookOpen size={16} />
          {t('Reading notation', 'Чтение нотной записи')}
        </button>
      </fieldset>
      {mode === 'notation' ? <NotationQuiz lang={lang} /> : practiceEar()}
    </>
  );
  function practiceEar() {
    return (
      <div className="practice-layout">
        <section className="panel practice-card">
          <div className="eyebrow">
            {t('EAR TRAINING · INTERVALS', 'ТРЕНИРОВКА СЛУХА · ИНТЕРВАЛЫ')}
          </div>
          <span className="practice-icon">
            <Headphones size={38} strokeWidth={1.4} />
          </span>
          <h2>
            {t(
              'Listen to the space between.',
              'Услышьте расстояние между нотами.',
            )}
          </h2>
          <p>
            {t(
              'Two notes, played one after the other. Which interval do you hear?',
              'Две ноты звучат последовательно. Какой интервал вы слышите?',
            )}
          </p>
          <div className="quiz-pitch">
            <span>♪</span>
            <span className="quiz-dashes">· · · · ·</span>
            <span>?</span>
          </div>
          {!question ? (
            <button className="primary-button" onClick={next}>
              <Play size={17} />
              {t('Start listening', 'Начать тренировку')}
            </button>
          ) : (
            <>
              <button
                className="secondary-button"
                onClick={() => void replay()}
              >
                <Volume2 size={18} />
                {t('Listen again', 'Послушать ещё раз')}
              </button>
              <div className="answer-grid">
                {quizIntervals.map((option, i) => (
                  <button
                    key={i}
                    disabled={answer !== null || !hasHeard}
                    onClick={() => choose(i)}
                    className={
                      answer !== null && i === question.index
                        ? 'answer-correct'
                        : answer === i
                          ? 'answer-wrong'
                          : ''
                    }
                  >
                    <span>{option[lang]}</span>
                    {answer !== null && i === question.index ? (
                      <Check size={18} />
                    ) : answer === i ? (
                      <X size={18} />
                    ) : (
                      <span className="answer-number">{i + 1}</span>
                    )}
                  </button>
                ))}
              </div>
              {answer !== null && (
                <output
                  className={
                    'answer-feedback ' +
                    (answer === question.index ? 'correct' : 'incorrect')
                  }
                >
                  <strong>
                    {answer === question.index
                      ? t('That’s right.', 'Верно.')
                      : t('Keep listening.', 'Продолжайте слушать.')}
                  </strong>{' '}
                  {quizIntervals[question.index][lang]} ·{' '}
                  {count(quizIntervals[question.index].step, lang, 'semitones')}
                  .
                  <span className="answer-detail">
                    {lang === 'de'
                      ? intervalLabels(
                          question.root,
                          quizIntervals[question.index].step,
                          quizIntervals[question.index].degree,
                          lang,
                        ).join(' → ')
                      : `${noteName(question.root)} → ${noteName(question.root + quizIntervals[question.index].step)}`}{' '}
                    · {lang === 'de' ? 'a′' : 'A4'} ={' '}
                    {localNumber(question.reference, lang)} Hz
                  </span>
                </output>
              )}
              {answer !== null && (
                <button className="primary-button" onClick={next}>
                  {t('Next interval', 'Следующий интервал')}
                  <ArrowRight size={17} />
                </button>
              )}
            </>
          )}
        </section>
        <aside>
          <section className="panel practice-progress">
            <span className="eyebrow">{t('THIS SESSION', 'ЭТА СЕССИЯ')}</span>
            <div className="score">
              {score}
              <span>/ {total}</span>
            </div>
            <p>{t('correct answers', 'правильных ответов')}</p>
            <Progress
              aria-label={t(
                'Correct answer percentage',
                'Процент правильных ответов',
              )}
              value={total ? (score / total) * 100 : 0}
            />
            <div className="progress-caption">
              <span>{total ? Math.round((score / total) * 100) : 0}%</span>
              <button
                onClick={() => {
                  setScore(0);
                  setTotal(0);
                  setQuestion(null);
                  setAnswer(null);
                  setHasHeard(false);
                }}
              >
                {t('Reset session', 'Сбросить сессию')}
              </button>
            </div>
          </section>
          <div className="practice-tip">
            <h3>{t('A listening habit', 'Слуховая привычка')}</h3>
            <p>
              {t(
                'Sing the first note, then the second. Notice the distance, not just whether it sounds familiar.',
                'Спойте первую ноту, затем вторую. Обращайте внимание на расстояние, а не только на знакомое звучание.',
              )}
            </p>
            <p>
              {t(
                'Exercises use 12-tone equal temperament. Your chosen A4 is captured when each question starts. Results stay in this session.',
                'Упражнения используют 12-ступенный равномерный строй. Выбранная A4 фиксируется в начале вопроса. Результаты хранятся в этой сессии.',
              )}
            </p>
          </div>
        </aside>
      </div>
    );
  }
}
