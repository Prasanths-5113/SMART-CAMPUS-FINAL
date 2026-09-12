import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';
import type { AccessibilityPreferences } from '../../../domain';

interface Props { onContinue: () => void; }

type PrefKey = keyof AccessibilityPreferences;
const PREF_KEYS: PrefKey[] = [
  'largeText','highContrast','reducedMotion','screenReaderOptimized',
  'voiceInput','captions','visualAlerts','largeTouchTargets',
  'simpleLanguage','hapticFeedback','lowBandwidthMode',
];

export default function AccessibilityPage({ onContinue }: Props) {
  const { prefs, setPref, language, haptic } = useAccessibility();
  const T = getTranslations(language);
  const [saved, setSaved] = React.useState(false);

  function handleToggle(key: PrefKey, value: boolean) {
    setPref(key, value);
    haptic('success');
    setSaved(false);
  }

  function handleSave() {
    haptic('success');
    setSaved(true);
    setTimeout(() => { setSaved(false); onContinue(); }, 800);
  }

  return (
    <div className="ics-main">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          {T.accessibility.title}
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--color-text-2)' }}>{T.accessibility.subtitle}</p>

        <div className="ics-card space-y-1 p-2">
          {PREF_KEYS.map(key => {
            const info = T.accessibility.preferences[key];
            return (
              <label
                key={key}
                className="flex items-center justify-between gap-4 p-3 rounded-lg cursor-pointer"
                style={{ background: prefs[key] ? 'var(--color-accent-light)' : 'transparent' }}
              >
                <span className="flex-1">
                  <span className="block font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{info.label}</span>
                  <span className="block text-xs mt-0.5" style={{ color: 'var(--color-text-2)' }}>{info.desc}</span>
                </span>
                <span className="ics-toggle flex-shrink-0" aria-label={info.label}>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={e => handleToggle(key, e.target.checked)}
                    aria-label={info.label}
                  />
                  <span className="ics-toggle-track" aria-hidden="true" />
                </span>
              </label>
            );
          })}
        </div>

        <button
          className="ics-btn ics-btn-primary ics-btn-lg w-full mt-6"
          onClick={handleSave}
          aria-live="polite"
        >
          {saved
            ? <><CheckCircle size={18} aria-hidden="true" /> {T.accessibility.saved}</>
            : T.accessibility.saveButton
          }
        </button>

        <button
          className="ics-btn ics-btn-ghost w-full mt-3"
          onClick={onContinue}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
