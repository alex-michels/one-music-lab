'use client';
import { Monitor, Moon, Sun } from 'lucide-react';
import { localizedText as text } from '@/lib/i18n';
import { THEMES, type Lang, type Theme } from '@/lib/client-store';

const labels = {
  group: text('Colour theme', 'Цветовая тема', 'Farbschema'),
  light: text('Light theme', 'Светлая тема', 'Helles Farbschema'),
  dark: text('Dark theme', 'Тёмная тема', 'Dunkles Farbschema'),
  system: text(
    'Follow the device setting',
    'Как на устройстве',
    'Geräteeinstellung übernehmen',
  ),
};
const icons = { light: Sun, dark: Moon, system: Monitor };

/**
 * The three themes the site already had and never offered: light, dark and
 * whatever the device asks for. Three pressed-state buttons rather than one
 * cycling button, so the current choice and the other two are all visible and
 * each is one press away. The icons are decoration; every button is named.
 */
export function ThemeSwitch({
  lang,
  theme,
  setTheme,
}: {
  lang: Lang;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  return (
    <fieldset className="theme-switch" aria-label={labels.group[lang]}>
      {THEMES.map((value) => {
        const Icon = icons[value];
        return (
          <button
            key={value}
            type="button"
            className={theme === value ? 'selected' : ''}
            aria-pressed={theme === value}
            aria-label={labels[value][lang]}
            title={labels[value][lang]}
            onClick={() => setTheme(value)}
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        );
      })}
    </fieldset>
  );
}
