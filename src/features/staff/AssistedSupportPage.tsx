import React, { useState } from 'react';
import { Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { getTranslations } from '../../i18n';
import { LocalClassifier } from '../../repositories/classification';
import { LocalTicketRepository } from '../../repositories/LocalTicketRepository';
import type { Ticket, RoutingDecision } from '../../domain';

interface Props { staffName: string; onTicketCreated: (ticket: Ticket) => void; }

export default function AssistedSupportPage({ staffName, onTicketCreated }: Props) {
  const { language, haptic } = useAccessibility();
  const T = getTranslations(language);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [requestText, setRequestText] = useState('');
  const [routing, setRouting] = useState<RoutingDecision | null>(null);
  const [consentObtained, setConsentObtained] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleClassify() {
    if (!requestText.trim()) { setError('Please enter the student\'s request.'); return; }
    const classification = LocalClassifier.classify(requestText);
    const decision = LocalClassifier.explain(classification, requestText);
    setRouting(decision);
    setError('');
    haptic('success');
  }

  async function handleSubmit() {
    if (!studentId.trim()) { setError('Student ID is required.'); haptic('error'); return; }
    if (!routing) { setError('Please classify the request first.'); return; }
    if (!consentObtained) { setError(T.privacy.consentRequired); haptic('error'); return; }
    setSubmitting(true);
    const repo = new LocalTicketRepository();
    const ticket = await repo.createTicket({
      studentId: studentId.trim(),
      studentName: studentName.trim() || undefined,
      requestText: requestText.trim(),
      language, category: routing.classification.category,
      department: routing.classification.department,
      priority: routing.classification.priority,
      status: 'SUBMITTED', source: 'ASSISTED', accessibilityMode: 'ASSISTED',
      consent: {
        consentGiven: true, consentTimestamp: new Date().toISOString(),
        dataShared: { requestText, recipient: routing.classification.department, purpose: routing.routingExplanation, requiredIdentifier: 'Student ID' },
        notCollected: ['Password', 'Payment card', 'Biometric information'],
      },
      requiredInformation: routing.classification.requiredInformation,
      estimatedResponseTime: routing.classification.estimatedResponseTime,
      idempotencyKey: `assisted-${Date.now()}-${studentId}`,
    });
    setSubmitting(false);
    haptic('success');
    onTicketCreated(ticket);
  }

  return (
    <div className="ics-main">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span aria-hidden="true" className="p-2 rounded-lg" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
            <Users size={20} />
          </span>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{T.assisted.title}</h1>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-2)' }}>{T.assisted.subtitle}</p>

        <div className="ics-card mb-4">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{T.assisted.studentInfo}</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="asst-sid" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                {T.assisted.studentId} <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input id="asst-sid" type="text" className="ics-input" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="e.g. ST2024001" aria-required="true" />
            </div>
            <div>
              <label htmlFor="asst-name" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                {T.assisted.studentName} <span style={{ color: 'var(--color-text-3)', fontWeight: 400 }}>{T.common.optional}</span>
              </label>
              <input id="asst-name" type="text" className="ics-input" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Student's full name" />
            </div>
          </div>
        </div>

        <div className="ics-card mb-4">
          <label htmlFor="asst-request" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            {T.assisted.requestLabel} <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea id="asst-request" className="ics-input mb-3" rows={4} value={requestText}
            onChange={e => { setRequestText(e.target.value); setRouting(null); setError(''); }}
            placeholder={T.request.placeholder} aria-required="true" />
          <button className="ics-btn ics-btn-secondary" onClick={handleClassify} disabled={!requestText.trim()}>
            {T.assisted.classifyButton}
          </button>
        </div>

        {routing && (
          <div className="ics-card mb-4" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <h2 className="font-semibold mb-3" style={{ color: 'var(--color-success)' }}>Classification Result</h2>
            <dl className="space-y-1 text-sm">
              <div><dt className="font-semibold inline" style={{ color: 'var(--color-text-3)' }}>Category: </dt><dd className="inline" style={{ color: 'var(--color-text)' }}>{T.categories[routing.classification.category]}</dd></div>
              <div><dt className="font-semibold inline" style={{ color: 'var(--color-text-3)' }}>Department: </dt><dd className="inline" style={{ color: 'var(--color-text)' }}>{routing.classification.department}</dd></div>
              <div><dt className="font-semibold inline" style={{ color: 'var(--color-text-3)' }}>Response time: </dt><dd className="inline" style={{ color: 'var(--color-text)' }}>{routing.classification.estimatedResponseTime}</dd></div>
            </dl>
          </div>
        )}

        {routing && (
          <div className="ics-card mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consentObtained} onChange={e => { setConsentObtained(e.target.checked); setError(''); }}
                style={{ width: 20, height: 20, marginTop: 2, accentColor: 'var(--color-accent)' }} aria-required="true" />
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{T.assisted.consentNote}</span>
            </label>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--color-danger)' }}>
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </div>
        )}

        {routing && (
          <button className="ics-btn ics-btn-primary ics-btn-lg w-full" onClick={handleSubmit} disabled={submitting || !consentObtained}>
            {submitting ? <><span className="animate-spin mr-2">⟳</span>{T.common.submitting}</> : <><CheckCircle size={18} aria-hidden="true" /> {T.assisted.submitButton}<ArrowRight size={18} aria-hidden="true" /></>}
          </button>
        )}
      </div>
    </div>
  );
}
