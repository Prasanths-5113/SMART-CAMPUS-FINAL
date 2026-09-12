import React, { useState } from 'react';
import { HelpCircle, XCircle, ExternalLink } from 'lucide-react';
import type { Recommendation, DismissReason } from '../types';
import PriorityBadge from './PriorityBadge';
import FeedbackControl from './FeedbackControl';
import WhyModal from './WhyModal';

interface Props {
  rec: Recommendation;
  onDismiss: (id: string, reason: DismissReason) => void;
}

const CATEGORY_ICON: Record<string, string> = {
  Transport:        '🚌',
  Academic:         '📚',
  'Student Services': '🎓',
  Accessibility:    '♿',
  Event:            '📣',
};

export default function RecommendationCard({ rec, onDismiss }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const icon = CATEGORY_ICON[rec.notice.category] ?? '📌';
  const score = rec.evidence.breakdown.finalScore;

  return (
    <>
      <article
        className="ics-card"
        style={{ borderLeft: `4px solid ${priorityBorderColor(rec.priorityLevel)}` }}
        aria-label={`${rec.priorityLevel} priority recommendation: ${rec.notice.title}`}
      >
        {/* Priority badge */}
        <div className="mb-2">
          <PriorityBadge level={rec.priorityLevel} score={score} />
        </div>

        {/* Title */}
        <h3 className="font-bold text-base mb-1 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <span aria-hidden="true">{icon}</span>
          {rec.notice.title}
        </h3>

        {/* Deadline */}
        {rec.notice.deadline && (
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-3)' }}>
            ⏰ {rec.notice.deadline}
          </p>
        )}

        {/* Action */}
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-2)', lineHeight: 1.6 }}>
          {rec.action}
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            className="ics-btn ics-btn-ghost"
            style={{ fontSize: '0.8125rem', minHeight: 36 }}
            onClick={() => setShowWhy(true)}
            aria-label={`Why am I seeing recommendation: ${rec.notice.title}`}
          >
            <HelpCircle size={14} aria-hidden="true" />
            Why?
          </button>

          <button
            className="ics-btn ics-btn-secondary"
            style={{ fontSize: '0.8125rem', minHeight: 36 }}
            onClick={() => setShowWhy(true)}
            aria-label={`View details for: ${rec.notice.title}`}
          >
            <ExternalLink size={14} aria-hidden="true" />
            View
          </button>

          <button
            className="ics-btn ics-btn-ghost"
            style={{ fontSize: '0.8125rem', minHeight: 36, color: 'var(--color-text-3)' }}
            onClick={() => setShowFeedback(f => !f)}
            aria-expanded={showFeedback}
            aria-label={`Mark recommendation as not relevant: ${rec.notice.title}`}
          >
            <XCircle size={14} aria-hidden="true" />
            Not Relevant
          </button>
        </div>

        {/* Inline feedback */}
        {showFeedback && (
          <FeedbackControl
            onDismiss={reason => { onDismiss(rec.id, reason); setShowFeedback(false); }}
            onCancel={() => setShowFeedback(false)}
          />
        )}
      </article>

      {/* Why modal */}
      {showWhy && <WhyModal rec={rec} onClose={() => setShowWhy(false)} />}
    </>
  );
}

function priorityBorderColor(level: string): string {
  if (level === 'HIGH')   return 'var(--color-danger)';
  if (level === 'MEDIUM') return '#f59e0b';
  return 'var(--color-success)';
}
