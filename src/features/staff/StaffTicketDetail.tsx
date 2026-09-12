import React, { useState } from 'react';
import { UserCheck, Save } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { getTranslations } from '../../i18n';
import { LocalTicketRepository } from '../../repositories/LocalTicketRepository';
import type { Ticket, TicketStatus } from '../../domain';

interface Props { ticket: Ticket; staffName: string; onBack: () => void; onUpdated: (t: Ticket) => void; }

const STATUSES: TicketStatus[] = ['SUBMITTED','IN_REVIEW','ACTION_TAKEN','RESOLVED'];

export default function StaffTicketDetail({ ticket: initial, staffName, onBack, onUpdated }: Props) {
  const { language, haptic } = useAccessibility();
  const T = getTranslations(language);
  const [ticket, setTicket] = useState(initial);
  const [note, setNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(ticket.status);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!note.trim() && selectedStatus === ticket.status) return;
    setSaving(true);
    const repo = new LocalTicketRepository();
    let updated = ticket;
    if (selectedStatus !== ticket.status) {
      updated = await repo.updateTicketStatus(ticket.ticketId, selectedStatus, staffName, 'STAFF',
        note.trim() || `Status updated to ${selectedStatus}.`);
    } else if (note.trim()) {
      updated = await repo.addTimelineEvent(ticket.ticketId, {
        status: ticket.status, message: note, actor: staffName, actorRole: 'STAFF', timestamp: new Date().toISOString(),
      });
    }
    setTicket(updated);
    onUpdated(updated);
    setNote('');
    setSaving(false);
    haptic('success');
  }

  async function handleAssign() {
    const repo = new LocalTicketRepository();
    const updated = await repo.assignStaff(ticket.ticketId, staffName);
    setTicket(updated);
    onUpdated(updated);
    haptic('success');
  }

  return (
    <div className="ics-main">
      <button className="ics-btn ics-btn-ghost mb-6" onClick={onBack}>← {T.nav.back}</button>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{ticket.ticketId}</h1>
          <span className={`ics-status ics-status-${ticket.status.toLowerCase()}`}>{T.staffDashboard.statusLabels[ticket.status]}</span>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-2)' }}>{ticket.requestText}</p>

        <div className="ics-card mb-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>Student</dt><dd style={{ color: 'var(--color-text)' }}>{ticket.studentName ?? ticket.studentId}</dd></div>
            <div><dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>Department</dt><dd style={{ color: 'var(--color-text)' }}>{ticket.department}</dd></div>
            <div><dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>Priority</dt><dd><span className={`ics-badge ics-priority-${ticket.priority.toLowerCase()}`}>{T.staffDashboard.priorityLabels[ticket.priority]}</span></dd></div>
            <div><dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>Source</dt><dd style={{ color: 'var(--color-text)' }}>{ticket.source}</dd></div>
            <div><dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>Language</dt><dd style={{ color: 'var(--color-text)' }}>{ticket.language === 'ta' ? 'Tamil' : 'English'}</dd></div>
            <div><dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>Access Mode</dt><dd style={{ color: 'var(--color-text)' }}>{ticket.accessibilityMode}</dd></div>
          </dl>
          {!ticket.assignedStaff && (
            <button className="ics-btn ics-btn-secondary mt-4" onClick={handleAssign}>
              <UserCheck size={16} aria-hidden="true" /> {T.staffDashboard.actions.assign}
            </button>
          )}
          {ticket.assignedStaff && (
            <p className="text-sm mt-3 flex items-center gap-1" style={{ color: 'var(--color-text-3)' }}>
              <UserCheck size={14} aria-hidden="true" /> Assigned to {ticket.assignedStaff}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="ics-card mb-4">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Timeline</h2>
          <ol className="ics-timeline">
            {ticket.timeline.map(event => (
              <li key={event.id} className="ics-timeline-item">
                <time className="text-xs" style={{ color: 'var(--color-text-3)' }} dateTime={event.timestamp}>
                  {new Date(event.timestamp).toLocaleString()}
                </time>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-text)' }}>{event.message}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>{event.actor} · {event.actorRole}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Update panel */}
        {ticket.status !== 'RESOLVED' && (
          <div className="ics-card">
            <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Update request</h2>
            <label className="block text-sm font-semibold mb-1" htmlFor="new-status" style={{ color: 'var(--color-text)' }}>
              {T.staffDashboard.actions.updateStatus}
            </label>
            <select
              id="new-status"
              className="ics-input mb-4"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as TicketStatus)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{T.staffDashboard.statusLabels[s]}</option>
              ))}
            </select>
            <label className="block text-sm font-semibold mb-1" htmlFor="staff-note" style={{ color: 'var(--color-text)' }}>
              {T.staffDashboard.noteLabel}
            </label>
            <textarea
              id="staff-note"
              className="ics-input mb-4"
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={T.staffDashboard.notePlaceholder}
            />
            <button className="ics-btn ics-btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={16} aria-hidden="true" /> {saving ? T.common.saving : T.staffDashboard.saveNote}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
