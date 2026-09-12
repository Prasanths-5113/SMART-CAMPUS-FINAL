import React, { useState } from 'react';
import { Building2, Clock, Star } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';
import { LocalTicketRepository } from '../../../repositories/LocalTicketRepository';
import type { Ticket } from '../../../domain';

interface Props { ticket: Ticket; onBack: () => void; }

export default function TicketDetailPage({ ticket: initialTicket, onBack }: Props) {
  const { language, haptic } = useAccessibility();
  const T = getTranslations(language);
  const [ticket, setTicket] = useState(initialTicket);
  const [rating, setRating] = useState(ticket.feedback?.rating ?? 0);
  const [comment, setComment] = useState(ticket.feedback?.comment ?? '');
  const [feedbackSent, setFeedbackSent] = useState(!!ticket.feedback);

  async function submitFeedback() {
    if (!rating) return;
    const repo = new LocalTicketRepository();
    const updated = await repo.submitFeedback(ticket.ticketId, {
      rating: rating as 1|2|3|4|5, comment, submittedAt: new Date().toISOString(),
    });
    setTicket(updated);
    setFeedbackSent(true);
    haptic('success');
  }

  return (
    <div className="ics-main">
      <button className="ics-btn ics-btn-ghost mb-6" onClick={onBack}>← {T.nav.back}</button>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{ticket.ticketId}</h1>
          <span className={`ics-status ics-status-${ticket.status.toLowerCase()}`}>{T.ticket.statuses[ticket.status]}</span>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-2)' }}>{ticket.requestText}</p>

        {/* Info */}
        <div className="ics-card mb-6">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-semibold text-xs" style={{ color: 'var(--color-text-3)' }}><Building2 size={12} className="inline mr-1" aria-hidden="true" />{T.ticket.department}</dt>
              <dd style={{ color: 'var(--color-text)' }}>{ticket.department}</dd>
            </div>
            <div>
              <dt className="font-semibold text-xs" style={{ color: 'var(--color-text-3)' }}>{T.ticket.estimatedResponse}</dt>
              <dd style={{ color: 'var(--color-text)' }}>{ticket.estimatedResponseTime}</dd>
            </div>
            {ticket.assignedStaff && (
              <div>
                <dt className="font-semibold text-xs" style={{ color: 'var(--color-text-3)' }}>Assigned to</dt>
                <dd style={{ color: 'var(--color-text)' }}>{ticket.assignedStaff}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-xs" style={{ color: 'var(--color-text-3)' }}>Last updated</dt>
              <dd style={{ color: 'var(--color-text)' }}>{new Date(ticket.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        {/* Timeline */}
        <div className="ics-card mb-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{T.studentDashboard.timeline}</h2>
          <ol className="ics-timeline" aria-label="Request timeline">
            {ticket.timeline.map((event, i) => (
              <li key={event.id} className="ics-timeline-item" aria-current={i === ticket.timeline.length - 1 ? 'step' : undefined}>
                <time className="text-xs" style={{ color: 'var(--color-text-3)' }} dateTime={event.timestamp}>
                  {new Date(event.timestamp).toLocaleString()}
                </time>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text)' }}>{event.message}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
                  <Clock size={10} className="inline mr-1" aria-hidden="true" />
                  {event.actor}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Feedback */}
        {ticket.status === 'RESOLVED' && (
          <div className="ics-card">
            <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>{T.feedback.title}</h2>
            {feedbackSent ? (
              <p style={{ color: 'var(--color-success)' }}>{T.feedback.thankYou}</p>
            ) : (
              <>
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-2)' }}>{T.feedback.ratingLabel}</p>
                <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Rating">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className="ics-btn"
                      style={{ minHeight: 44, minWidth: 44, padding: '0.25rem',
                        background: rating >= n ? 'var(--color-warning-bg)' : 'var(--color-surface-2)',
                        border: `2px solid ${rating >= n ? '#f59e0b' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-sm)',
                        color: rating >= n ? '#f59e0b' : 'var(--color-text-3)',
                      }}
                      aria-pressed={rating >= n}
                      aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                    >
                      <Star size={20} fill={rating >= n ? '#f59e0b' : 'none'} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <textarea
                  className="ics-input mb-3"
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={T.feedback.commentPlaceholder}
                  aria-label={T.feedback.commentLabel}
                />
                <button className="ics-btn ics-btn-primary" onClick={submitFeedback} disabled={!rating}>
                  {T.feedback.submit}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
