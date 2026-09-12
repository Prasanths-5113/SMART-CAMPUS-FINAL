import React, { useEffect, useState } from 'react';
import { Clock, Building2, ArrowRight, MessageSquare } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';
import { LocalTicketRepository } from '../../../repositories/LocalTicketRepository';
import type { Ticket } from '../../../domain';

interface Props {
  studentId: string;
  onGetSupport: () => void;
  onViewTicket: (ticket: Ticket) => void;
}

export default function StudentDashboard({ studentId, onGetSupport, onViewTicket }: Props) {
  const { language } = useAccessibility();
  const T = getTranslations(language);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const repo = new LocalTicketRepository();
    repo.listStudentTickets(studentId).then(t => { setTickets(t); setLoading(false); });
  }, [studentId]);

  const active = tickets.filter(t => t.status !== 'RESOLVED');
  const resolved = tickets.filter(t => t.status === 'RESOLVED');

  return (
    <div className="ics-main">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{T.studentDashboard.title}</h1>
        <button className="ics-btn ics-btn-primary" onClick={onGetSupport}>
          {T.studentDashboard.getSupport}
        </button>
      </div>

      {loading && <p style={{ color: 'var(--color-text-2)' }}>{T.common.loading}</p>}

      {!loading && tickets.length === 0 && (
        <div className="ics-card text-center py-12">
          <p className="mb-4" style={{ color: 'var(--color-text-2)' }}>{T.studentDashboard.noRequests}</p>
          <button className="ics-btn ics-btn-primary" onClick={onGetSupport}>{T.studentDashboard.getSupport}</button>
        </div>
      )}

      {active.length > 0 && (
        <section aria-labelledby="active-heading" className="mb-8">
          <h2 id="active-heading" className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-3)' }}>
            {T.studentDashboard.activeRequest}
          </h2>
          <div className="space-y-3">
            {active.map(ticket => <TicketCard key={ticket.ticketId} ticket={ticket} T={T} onClick={() => onViewTicket(ticket)} />)}
          </div>
        </section>
      )}

      {resolved.length > 0 && (
        <section aria-labelledby="resolved-heading">
          <h2 id="resolved-heading" className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-3)' }}>
            Resolved
          </h2>
          <div className="space-y-3">
            {resolved.map(ticket => <TicketCard key={ticket.ticketId} ticket={ticket} T={T} onClick={() => onViewTicket(ticket)} />)}
          </div>
        </section>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TicketCard({ ticket, T, onClick }: { ticket: Ticket; T: any; onClick: () => void }) {
  const statusLabel = T.ticket.statuses[ticket.status];
  return (
    <button
      className="ics-card w-full text-left hover:shadow-md transition-shadow"
      onClick={onClick}
      aria-label={`Ticket ${ticket.ticketId} — ${statusLabel} — ${ticket.department}`}
      style={{ cursor: 'pointer' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="font-bold text-lg" style={{ color: 'var(--color-accent)' }}>{ticket.ticketId}</span>
        <span className={`ics-status ics-status-${ticket.status.toLowerCase()}`}>{statusLabel}</span>
      </div>
      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-2)' }}>{ticket.requestText}</p>
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--color-text-3)' }}>
        <span className="flex items-center gap-1"><Building2 size={12} aria-hidden="true" />{ticket.department}</span>
        <span className="flex items-center gap-1"><Clock size={12} aria-hidden="true" />{new Date(ticket.createdAt).toLocaleDateString()}</span>
        {ticket.timeline.length > 0 && (
          <span className="flex items-center gap-1"><MessageSquare size={12} aria-hidden="true" />{ticket.timeline.length} update{ticket.timeline.length !== 1 ? 's' : ''}</span>
        )}
        <span className="flex items-center gap-1 ml-auto" style={{ color: 'var(--color-accent)' }}>
          View <ArrowRight size={12} aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
