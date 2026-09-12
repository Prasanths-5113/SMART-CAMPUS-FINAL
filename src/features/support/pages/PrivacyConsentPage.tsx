import React, { useState } from 'react';
import { ShieldCheck, XCircle, AlertCircle } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';
import type { RoutingDecision } from '../../../domain';

interface Props {
  requestText: string;
  routing: RoutingDecision;
  studentId: string;
  onStudentIdChange: (id: string) => void;
  onConsent: () => void;
}

export default function PrivacyConsentPage({ requestText, routing, studentId, onStudentIdChange, onConsent }: Props) {
  const { language, haptic } = useAccessibility();
  const T = getTranslations(language);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [idError, setIdError] = useState('');

  function handleSubmit() {
    if (!studentId.trim()) { setIdError('Student ID is required.'); haptic('error'); return; }
    if (!checked) { setError(T.privacy.consentRequired); haptic('error'); return; }
    haptic('success');
    onConsent();
  }

  const preview = requestText.length > 120 ? requestText.slice(0, 117) + '…' : requestText;

  return (
    <div className="ics-main">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>{T.privacy.title}</h1>

        {/* Data minimisation notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg mb-6" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
          <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm">{T.privacy.dataMinimisation}</p>
        </div>

        {/* Information being shared */}
        <div className="ics-card mb-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--color-text-3)' }}>
            {T.privacy.informationShared}
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.privacy.request}</dt>
              <dd style={{ color: 'var(--color-text)' }}>"{preview}"</dd>
            </div>
            <div>
              <dt className="font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.privacy.recipient}</dt>
              <dd style={{ color: 'var(--color-text)' }}>{routing.classification.department}</dd>
            </div>
            <div>
              <dt className="font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.privacy.purpose}</dt>
              <dd style={{ color: 'var(--color-text-2)' }}>{routing.routingExplanation}</dd>
            </div>
            <div>
              <dt className="font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.privacy.requiredId}</dt>
              <dd style={{ color: 'var(--color-text)' }}>Student ID</dd>
            </div>
          </dl>
        </div>

        {/* Not collected */}
        <div className="ics-card mb-6" style={{ borderColor: 'var(--color-success)' }}>
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
            <XCircle size={16} aria-hidden="true" />
            {T.privacy.notCollected}
          </h2>
          <ul className="space-y-1">
            {T.privacy.notCollectedItems.map(item => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--color-success)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Student ID input */}
        <div className="mb-4">
          <label htmlFor="student-id" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            {T.common.studentId} <span aria-hidden="true" style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="student-id"
            type="text"
            className="ics-input"
            value={studentId}
            onChange={e => { onStudentIdChange(e.target.value); setIdError(''); }}
            placeholder="e.g. ST2024001"
            aria-required="true"
            aria-describedby={idError ? 'id-error' : undefined}
          />
          {idError && <p id="id-error" role="alert" className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-danger)' }}><AlertCircle size={12} aria-hidden="true" />{idError}</p>}
        </div>

        {/* Consent checkbox */}
        <div className="ics-card mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={e => { setChecked(e.target.checked); setError(''); }}
              className="mt-1 flex-shrink-0"
              style={{ width: 20, height: 20, accentColor: 'var(--color-accent)' }}
              aria-required="true"
              aria-describedby={error ? 'consent-error' : undefined}
            />
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>{T.privacy.consentLabel}</span>
          </label>
          {error && <p id="consent-error" role="alert" className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-danger)' }}><AlertCircle size={12} aria-hidden="true" />{error}</p>}
        </div>

        <button
          className="ics-btn ics-btn-primary ics-btn-lg w-full"
          onClick={handleSubmit}
        >
          {T.privacy.consentButton}
        </button>
      </div>
    </div>
  );
}
