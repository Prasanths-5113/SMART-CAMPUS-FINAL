import React, { useEffect, useState } from 'react';
import { Filter, UserCheck, MessageSquare } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { getTranslations } from '../../i18n';
import { LocalTicketRepository } from '../../repositories/LocalTicketRepository';
import type { Ticket, TicketStatus } from '../../domain';

interface Props { staffName: string; onViewTicket: (ticket: Ticket) => void; }

type FilterType = 'all' | 'open' | 'inReview' | 'resolved';

function matchFilter(ticket: Ticket, f: FilterType): boolean {
  if (f === 'all') return true;
  if (f === 'open') return ticket.status === 'SUBMITTED';
  if (f === 'inReview') return ticket.status === 'IN_REVIEW' || ticket.status === 'ACTION_TAKEN';
  if (f === 'resolved') return ticket.status === 'RESOLVED';
  return true;
}

const PRIORITY_CLASS: Record<string, string> = {
  LOW: 'ics-priority-low', NORMAL: 'ics-priority-normal',
  HIGH: 'ics-priority-high', URGENT: 'ics-priority-urgent',
};

export default function StaffDashboard({ staffName, onViewTicket }: Props) {
  const { language } = useAccessibility();
  const T = getTranslations(language);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  function reload() {
    const repo = new LocalTicketRepository();
    repo.listAllTickets().then(t => { setTickets(t); setLoading(false); });
  }
  useEffect(() => { reload(); }, []);

  const visible = tickets.filter(t => matchFilter(t, filter));

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all',      label: T.staffDashboard.filters.all },
    { key: 'open',     label: T.staffDashboard.filters.open },
    { key: 'inReview', label: T.staffDashboard.filters.inReview },
    { key: 'resolved', label: T.staffDashboard.filters.resolved },
  ];

  async function handleAssign(ticketId: string) {
    const repo = new LocalTicketRepository();
    await repo.assignStaff(ticketId, staffName);
    reload();
  }

  async function handleResolve(ticketId: string) {
    const repo = new LocalTicketRepository();
    await repo.updateTicketStatus(ticketId, 'RESOLVED', staffName, 'STAFF', 'Request resolved.');
    reload();
  }

  return (
    <div className="ics-main-wide">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{T.staffDashboard.title}</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>Signed in as <strong>{staffName}</strong></p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-6 flex-wrap" role="tablist" aria-label="Filter tickets">
        {filters.map(f => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className="ics-btn"
            style={{
              background: filter === f.key ? 'var(--color-accent)' : 'var(--color-surface)',
              color: filter === f.key ? '#fff' : 'var(--color-text-2)',
              border: `1.5px solid ${filter === f.key ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}
            onClick={() => setFilter(f.key)}
          >
            <Filter size={14} aria-hidden="true" /> {f.label}
            {f.key !== 'all' && (
              <span className="ml-1 text-xs opacity-80">({tickets.filter(t => matchFilter(t, f.key)).length})</span>
            )}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-text-2)' }}>{T.common.loading}</p>}

      {!loading && visible.length === 0 && (
        <div className="ics-card text-center py-10">
          <p style={{ color: 'var(--color-text-2)' }}>{T.staffDashboard.noTickets}</p>
        </div>
      )}

      {/* Ticket list */}
      <div className="space-y-4">
        {visible.map(ticket => (
          <div key={ticket.ticketId} className="ics-card">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div>
                <button
                  className="font-bold text-lg hover:underline"
                  style={{ color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => onViewTicket(ticket)}
                >
                  {ticket.ticketId}
                </button>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
                  {new Date(ticket.createdAt).toLocaleString()} · {ticket.studentName ?? ticket.studentId}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`ics-badge ${PRIORITY_CLASS[ticket.priority]}`}>
                  {T.staffDashboard.priorityLabels[ticket.priority]}
                </span>
                <span className={`ics-status ics-status-${ticket.status.toLowerCase()}`}>
                  {T.staffDashboard.statusLabels[ticket.status]}
                </span>
              </div>
            </div>

            <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-2)' }}>{ticket.requestText}</p>

            <div className="flex flex-wrap gap-2 text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>
              <span>{T.categories[ticket.category]}</span>
              <span>·</span>
              <span>{ticket.department}</span>
              {ticket.assignedStaff && <><span>·</span><span className="flex items-center gap-1"><UserCheck size={11} aria-hidden="true" />{ticket.assignedStaff}</span></>}
            </div>

            {/* Actions */}
            {ticket.status !== 'RESOLVED' && (
              <div className="flex gap-2 flex-wrap">
                {!ticket.assignedStaff && (
                  <button className="ics-btn ics-btn-secondary" style={{ fontSize: '0.8125rem', minHeight: 36 }} onClick={() => handleAssign(ticket.ticketId)}>
                    <UserCheck size={14} aria-hidden="true" /> {T.staffDashboard.actions.assign}
                  </button>
                )}
                <button className="ics-btn ics-btn-ghost" style={{ fontSize: '0.8125rem', minHeight: 36 }} onClick={() => onViewTicket(ticket)}>
                  <MessageSquare size={14} aria-hidden="true" /> {T.staffDashboard.actions.addNote}
                </button>
                <button className="ics-btn ics-btn-primary" style={{ fontSize: '0.8125rem', minHeight: 36 }} onClick={() => handleResolve(ticket.ticketId)}>
                  {T.staffDashboard.actions.resolve}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
