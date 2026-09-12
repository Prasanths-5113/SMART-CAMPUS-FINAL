import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import type { Recommendation } from '../types';
import PriorityBadge from './PriorityBadge';

interface Props {
  rec: Recommendation;
  onClose: () => void;
}

export default function WhyModal({ rec, onClose }: Props) {
  const { breakdown } = rec.evidence;

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="ics-card w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ position: 'relative' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 id="why-modal-title" className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
            Why am I seeing this?
          </h2>
          <button
            className="ics-btn ics-btn-ghost"
            onClick={onClose}
            aria-label="Close explanation"
            style={{ minHeight: 36, minWidth: 36, padding: '0.25rem' }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Recommendation title */}
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{rec.notice.title}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-2)' }}>{rec.action}</p>
        </div>

        <PriorityBadge level={rec.priorityLevel} score={breakdown.finalScore} />

        {/* Evidence */}
        <div className="mt-4 mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-3)' }}>
            Evidence
          </h3>
          <ul className="space-y-1.5" aria-label="Evidence for this recommendation">
            {rec.evidence.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                <CheckCircle size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" style={{ color: 'var(--color-success)' }} />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />

        {/* Score breakdown */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-3)' }}>
            Priority Breakdown
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Urgency',        value: breakdown.urgencyScore,       weight: '× 0.40' },
              { label: 'Relevance',      value: breakdown.relevanceScore,     weight: '× 0.35' },
              { label: 'Student Impact', value: breakdown.studentImpactScore, weight: '× 0.25' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="text-sm w-32 flex-shrink-0" style={{ color: 'var(--color-text-2)' }}>{row.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.value}%`, background: 'var(--color-accent)', transition: 'width 0.4s ease' }}
                    role="progressbar"
                    aria-valuenow={row.value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${row.label}: ${row.value}`}
                  />
                </div>
                <span className="text-xs font-mono w-20 text-right flex-shrink-0" style={{ color: 'var(--color-text-3)' }}>
                  {row.value} {row.weight}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 mt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Final Score</span>
              <span className="font-bold text-lg" style={{ color: 'var(--color-accent)' }}>{breakdown.finalScore} / 100</span>
            </div>
          </div>
        </div>

        <button className="ics-btn ics-btn-primary w-full mt-5" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
