import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { DismissReason } from '../types';
import { DISMISS_REASONS } from '../types';

interface Props {
  onDismiss: (reason: DismissReason) => void;
  onCancel: () => void;
}

export default function FeedbackControl({ onDismiss, onCancel }: Props) {
  const [selected, setSelected] = useState<DismissReason | null>(null);

  return (
    <div
      className="mt-3 p-3 rounded-lg"
      style={{ background: 'var(--color-surface-2)', border: '1.5px solid var(--color-border)' }}
      role="group"
      aria-labelledby="feedback-label"
    >
      <div className="flex items-center justify-between mb-2">
        <p id="feedback-label" className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          Why wasn't this useful?
        </p>
        <button
          className="ics-btn ics-btn-ghost"
          onClick={onCancel}
          aria-label="Cancel feedback"
          style={{ minHeight: 28, minWidth: 28, padding: '0.125rem' }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1 mb-3" role="radiogroup" aria-label="Dismiss reason">
        {DISMISS_REASONS.map(reason => (
          <label
            key={reason}
            className="flex items-center gap-2 p-2 rounded cursor-pointer text-sm"
            style={{
              background: selected === reason ? 'var(--color-accent-light)' : 'transparent',
              color: selected === reason ? 'var(--color-accent)' : 'var(--color-text-2)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <input
              type="radio"
              name="dismiss-reason"
              value={reason}
              checked={selected === reason}
              onChange={() => setSelected(reason)}
              style={{ accentColor: 'var(--color-accent)' }}
              aria-label={reason}
            />
            {reason}
          </label>
        ))}
      </div>

      <button
        className="ics-btn ics-btn-danger w-full"
        style={{ minHeight: 36, fontSize: '0.875rem' }}
        disabled={!selected}
        onClick={() => selected && onDismiss(selected)}
        aria-disabled={!selected}
      >
        Remove recommendation
      </button>
    </div>
  );
}
