import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';
import type { Language } from '../../../domain';

interface Props { onSelect: (lang: Language) => void; }

export default function LanguagePage({ onSelect }: Props) {
  const { language, setLanguage, haptic } = useAccessibility();
  const T = getTranslations(language);

  function handleSelect(lang: Language) {
    setLanguage(lang);
    haptic('navigation');
    onSelect(lang);
  }

  return (
    <div className="ics-main">
      <div className="max-w-sm mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {T.language.question}
        </h1>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-text-2)' }}>{T.language.subtitle}</p>

        <div className="space-y-3">
          {(['en', 'ta'] as Language[]).map(lang => {
            const label = lang === 'en' ? T.language.english : T.language.tamil;
            const isSelected = language === lang;
            return (
              <button
                key={lang}
                className="ics-btn w-full flex items-center justify-between p-4"
                style={{
                  minHeight: 64,
                  background: isSelected ? 'var(--color-accent-light)' : 'var(--color-surface)',
                  border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                }}
                onClick={() => handleSelect(lang)}
                aria-pressed={isSelected}
                lang={lang}
              >
                <span className="font-semibold text-lg">{label}</span>
                {isSelected && <CheckCircle size={20} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
