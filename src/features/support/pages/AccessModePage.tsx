import React from 'react';
import { Mic, Type, Layers, Users, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';
import type { AccessMode } from '../../../domain';

interface Props { onSelect: (mode: AccessMode) => void; }

const MODE_ICONS: Record<AccessMode, React.ComponentType<{ size?: number; 'aria-hidden'?: string }>> = {
  VOICE_AUDIO:       Mic,
  TEXT_VISUAL:       Type,
  VOICE_TEXT_VISUAL: Layers,
  ASSISTED:          Users,
};

const MODES: AccessMode[] = ['VOICE_AUDIO', 'TEXT_VISUAL', 'VOICE_TEXT_VISUAL', 'ASSISTED'];

export default function AccessModePage({ onSelect }: Props) {
  const { language, setAccessMode, haptic } = useAccessibility();
  const T = getTranslations(language);

  function handleSelect(mode: AccessMode) {
    setAccessMode(mode);
    haptic('navigation');
    onSelect(mode);
  }

  return (
    <div className="ics-main">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {T.accessMode.question}
        </h1>
        <p className="mb-8" style={{ color: 'var(--color-text-2)' }}>
          {T.accessMode.subtitle}
        </p>

        <div className="space-y-3" role="list">
          {MODES.map(mode => {
            const Icon = MODE_ICONS[mode];
            const info = T.accessMode.modes[mode];
            return (
              <button
                key={mode}
                role="listitem"
                className="ics-btn ics-btn-ghost w-full text-left flex items-center gap-4 p-4"
                style={{ minHeight: 72, borderRadius: 'var(--radius-lg)', justifyContent: 'flex-start' }}
                onClick={() => handleSelect(mode)}
                aria-label={`${info.label} — ${info.description}`}
              >
                <span aria-hidden="true" className="flex-shrink-0 p-2.5 rounded-lg" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold" style={{ color: 'var(--color-text)' }}>{info.label}</span>
                  <span className="block text-sm mt-0.5" style={{ color: 'var(--color-text-2)' }}>{info.description}</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" style={{ color: 'var(--color-text-3)' }} />
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-center" style={{ color: 'var(--color-text-3)' }}>
          You can change your access method at any time from settings.
        </p>
      </div>
    </div>
  );
}
