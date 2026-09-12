import React from 'react';
import { CheckCircle, Clock, Building2, Clipboard } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';
import type { Ticket } from '../../../domain';

interface Props {
  ticket: Ticket;
  isOffline: boolean;
  onTrack: () => void;
  onNewRequest: () => void;
}

export default function TicketConfirmationPage({ ticket, isOffline, onTrack, onNewRequest }: Props) {
  const { language, haptic } = useAccessibility();
  const T = getTranslations(language);
  const statusLabel = T.ticket.statuses[ticket.status];

  const [copied, setCopied] = React.useState(false);
  function copyTicketId() {
    navigator.clipboard?.writeText(ticket.ticketId).then(() => {
      setCopied(true);
      haptic('success');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="ics-main">
      <div className="max-w-lg mx-auto">

        {/* Success banner */}
        <div className="text-center py-8">
          <span aria-hidden="true" className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <CheckCircle size={36} />
          </span>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>{T.ticket.title}</h1>
          <p style={{ color: 'var(--color-text-2)' }}>{T.ticket.subtitle}</p>
        </div>

        {/* Offline notice */}
        {isOffline && (
          <div className="ics-offline-banner mb-6" role="status">
            <Clock size={18} className="flex-shrink-0" aria-hidden="true" />
            <p className="text-sm">{T.ticket.offlineNotice}</p>
          </div>
        )}

        {/* Ticket card */}
        <div className="ics-card mb-6">
          {/* Ticket ID */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-xl" style={{ background: 'var(--color-accent-light)' }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-accent)' }}>
                {T.ticket.ticketId}
              </p>
              <p className="text-3xl font-bold tracking-wide" style={{ color: 'var(--color-accent-dark)' }}>
                {ticket.ticketId}
              </p>
            </div>
            <button
              className="ics-btn ics-btn-ghost"
              onClick={copyTicketId}
              aria-label={`Copy ticket ID ${ticket.ticketId}`}
              style={{ minHeight: 40 }}
            >
              <Clipboard size={16} aria-hidden="true" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Details */}
          <dl className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className={`ics-status ics-status-${ticket.status.toLowerCase()}`} aria-label={`Status: ${statusLabel}`}>
                {statusLabel}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
              <div>
                <dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.ticket.department}</dt>
                <dd style={{ color: 'var(--color-text)' }}>{ticket.department}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
              <div>
                <dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.ticket.estimatedResponse}</dt>
                <dd style={{ color: 'var(--color-text)' }}>{ticket.estimatedResponseTime}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.ticket.createdAt}</dt>
              <dd style={{ color: 'var(--color-text)' }}>{new Date(ticket.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <button className="ics-btn ics-btn-primary ics-btn-lg w-full" onClick={() => { haptic('navigation'); onTrack(); }}>
            {T.ticket.trackButton}
          </button>
          <button className="ics-btn ics-btn-ghost w-full" onClick={onNewRequest}>
            {T.ticket.newRequest}
          </button>
        </div>
      </div>
    </div>
  );
}
