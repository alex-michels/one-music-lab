'use client';
import { useState, useSyncExternalStore } from 'react';
import { type Lang } from '@/lib/client-store';
import { nt } from '@/lib/notation-tasks';
import { topicById, ruleLabels, type TopicId } from '@/lib/topics';
import { type Rule } from '@/lib/exercises';
import { NoteText } from './note-text';
import { CoachingHistory } from './practice-coach';
import {
  emptyProfile,
  MAX_BACKUP_BYTES,
  parseBackup,
  profileStore,
  serializeProfile,
  type LocalProfile,
} from '@/lib/local-profile';

export function useLocalProfile() {
  return useSyncExternalStore(
    profileStore.subscribe,
    profileStore.getSnapshot,
    profileStore.getServerSnapshot,
  );
}

export function LessonProgress({
  topic,
  lang,
}: {
  topic: TopicId;
  lang: Lang;
}) {
  const { profile } = useLocalProfile();
  const completed = profile.completed.includes(topic);
  return (
    <div className="lesson-progress">
      <label>
        <input
          type="checkbox"
          checked={completed}
          onChange={() =>
            profileStore.update((current) => ({
              ...current,
              completed: current.completed.includes(topic)
                ? current.completed.filter((id) => id !== topic)
                : [...current.completed, topic],
            }))
          }
        />{' '}
        {
          nt(
            'I have worked through this lesson',
            'Я проработал(а) этот урок',
            'Ich habe diese Lektion durchgearbeitet',
          )[lang]
        }
      </label>
      <p>
        {
          nt(
            'Your own reading marker, not a skill assessment.',
            'Ваша отметка о работе с уроком, а не оценка навыка.',
            'Deine persönliche Lesemarkierung, keine Bewertung deiner Fähigkeiten.',
          )[lang]
        }
      </p>
    </div>
  );
}

export function LocalData({
  lang,
  onRestore,
}: {
  lang: Lang;
  onRestore: (profile: LocalProfile) => void;
}) {
  const { profile, problem } = useLocalProfile();
  const [pending, setPending] = useState<LocalProfile | 'reset' | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<'invalid' | 'saved' | 'failed' | null>(
    null,
  );
  const text = (en: string, ru: string, de: string) => nt(en, ru, de)[lang];
  async function read(file: File | undefined) {
    setPending(null);
    setMessage(null);
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('size');
      setPending(parseBackup(await file.text()));
    } catch {
      setMessage('invalid');
    } finally {
      setBusy(false);
    }
  }
  function download() {
    try {
      const url = URL.createObjectURL(
        new Blob([serializeProfile(profile)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'one-music-lab-backup.json';
      document.body.appendChild(link);
      try {
        link.click();
      } finally {
        link.remove();
        URL.revokeObjectURL(url);
      }
      setMessage('saved');
    } catch {
      setMessage('failed');
    }
  }
  function confirm(selection: LocalProfile | 'reset') {
    const next = selection === 'reset' ? emptyProfile() : selection;
    if (profileStore.replace(next)) onRestore(next);
    else setMessage('failed');
    setPending(null);
  }
  return (
    <section
      className="local-data"
      aria-label={text('Learning data', 'Учебные данные', 'Lerndaten')}
    >
      {problem && (
        <p role="alert">
          {problem === 'conflict'
            ? text(
                'Another tab changed the saved data. Export your current work, then reload before continuing.',
                'В другой вкладке изменены сохранённые данные. Экспортируйте текущую работу и обновите страницу.',
                'Ein anderer Tab hat die gespeicherten Daten geändert. Exportiere deine aktuelle Arbeit und lade die Seite neu.',
              )
            : problem === 'invalid'
              ? text(
                  'Saved data could not be read. It has been kept untouched. Import a compatible backup or reset it to resume saving.',
                  'Не удалось прочитать сохранённые данные. Они не изменены. Импортируйте совместимую копию или выполните сброс для сохранения.',
                  'Gespeicherte Daten konnten nicht gelesen werden und bleiben erhalten. Importiere eine kompatible Sicherung oder setze die Daten zurück, um wieder zu speichern.',
                )
              : text(
                  'Browser storage is unavailable or full. Your changes are only in memory; export them before leaving.',
                  'Хранилище браузера недоступно или заполнено. Изменения только в памяти; экспортируйте их перед выходом.',
                  'Der Browserspeicher ist nicht verfügbar oder voll. Änderungen bleiben nur im Arbeitsspeicher; exportiere sie vor dem Verlassen.',
                )}
        </p>
      )}
      <details>
        <summary>
          {text('Learning data', 'Учебные данные', 'Lerndaten')}
        </summary>
        <p>
          {text(
            'Saved only in this browser, with no account or upload. Export a backup before changing browser or clearing site data.',
            'Сохраняются только в этом браузере, без аккаунта и отправки на сервер. Экспортируйте копию перед сменой браузера или очисткой данных сайта.',
            'Nur in diesem Browser gespeichert, ohne Konto oder Upload. Exportiere eine Sicherung, bevor du den Browser wechselst oder Websitedaten löschst.',
          )}
        </p>
        <h2>
          {text(
            'Worked-through lessons',
            'Проработанные уроки',
            'Durchgearbeitete Lektionen',
          )}{' '}
          ({profile.completed.length})
        </h2>
        <ul>
          {profile.completed.map((id) => (
            <li key={id}>
              <a href={`#/${lang}/t/${id}/read`}>
                <NoteText text={topicById[id].title} lang={lang} />
              </a>
            </li>
          ))}
        </ul>
        <h2>{text('Practice history', 'История практики', 'Übungsverlauf')}</h2>
        <CoachingHistory lang={lang} coaching={profile.coaching} />
        <p>
          {text(
            'All graded theory and Drill answers, including individual parts of written exercises and earlier history without hint information. A new session keeps this history.',
            'Все проверенные ответы в теории и упражнениях, включая отдельные части письменных заданий и прежнюю историю без сведений о подсказках. Новая сессия сохраняет историю.',
            'Alle bewerteten Antworten aus Theorie und Übungen, einschließlich einzelner Teilaufgaben und früherer Antworten ohne Hinweisangaben. Eine neue Sitzung behält diesen Verlauf.',
          )}
        </p>
        <dl className="saved-answers">
          {Object.entries(profile.answers).map(([rule, row]) => (
            <div key={rule}>
              <dt>
                <NoteText text={ruleLabels[rule as Rule]} lang={lang} />
              </dt>
              <dd>
                {text('Answered', 'Ответов', 'Beantwortet')}: {row.asked} ·{' '}
                {text('Incorrect', 'Неверных', 'Falsch')}: {row.missed}
              </dd>
            </div>
          ))}
        </dl>
        <div className="local-data-actions">
          <button type="button" className="secondary-button" onClick={download}>
            {text(
              'Export backup',
              'Экспортировать копию',
              'Sicherung exportieren',
            )}
          </button>
          <label>
            {text(
              'Import backup (JSON, up to 1 MB)',
              'Импортировать копию (JSON, до 1 МБ)',
              'Sicherung importieren (JSON, bis 1 MB)',
            )}
            <input
              type="file"
              accept=".json,application/json"
              disabled={busy}
              onChange={(event) => {
                void read(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
          </label>
          <button
            type="button"
            className="text-button"
            disabled={busy}
            onClick={() => {
              setPending('reset');
              setMessage(null);
            }}
          >
            {text(
              'Reset local data',
              'Сбросить локальные данные',
              'Lokale Daten zurücksetzen',
            )}
          </button>
        </div>
        {busy && (
          <output aria-live="polite">
            {text(
              'Reading backup…',
              'Чтение копии…',
              'Sicherung wird gelesen…',
            )}
          </output>
        )}
        {pending !== null && (
          <fieldset className="local-data-confirm">
            <legend>
              {pending === 'reset'
                ? text(
                    'Delete all saved progress and settings?',
                    'Удалить весь сохранённый прогресс и настройки?',
                    'Alle gespeicherten Fortschritte und Einstellungen löschen?',
                  )
                : text(
                    'Replace your progress and settings with this backup?',
                    'Заменить прогресс и настройки этой копией?',
                    'Fortschritte und Einstellungen durch diese Sicherung ersetzen?',
                  )}
            </legend>
            {pending !== 'reset' && (
              <p>
                {text(
                  'Worked-through lessons',
                  'Проработанные уроки',
                  'Durchgearbeitete Lektionen',
                )}
                : {pending.completed.length}
              </p>
            )}
            <p>
              {text(
                'This replaces data in this browser. Export a backup first if you want to keep it.',
                'Данные в этом браузере будут заменены. Сначала экспортируйте копию, если хотите их сохранить.',
                'Die Daten in diesem Browser werden ersetzt. Exportiere vorher eine Sicherung, wenn du sie behalten möchtest.',
              )}
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPending(null)}
            >
              {text('Cancel', 'Отмена', 'Abbrechen')}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => confirm(pending)}
            >
              {text(
                'Confirm replacement',
                'Подтвердить замену',
                'Ersetzen bestätigen',
              )}
            </button>
          </fieldset>
        )}
        {message && (
          <output aria-live="polite">
            {message === 'invalid'
              ? text(
                  'This backup is invalid, too large or from an unsupported version. Nothing was replaced.',
                  'Копия повреждена, слишком велика или имеет неподдерживаемую версию. Данные не заменены.',
                  'Die Sicherung ist ungültig, zu groß oder hat eine nicht unterstützte Version. Es wurde nichts ersetzt.',
                )
              : message === 'saved'
                ? text(
                    'Backup download started.',
                    'Загрузка копии начата.',
                    'Der Download der Sicherung wurde gestartet.',
                  )
                : text(
                    'The operation failed. Your current data is still available.',
                    'Операция не выполнена. Текущие данные по-прежнему доступны.',
                    'Der Vorgang ist fehlgeschlagen. Deine aktuellen Daten sind weiterhin verfügbar.',
                  )}
          </output>
        )}
      </details>
    </section>
  );
}
