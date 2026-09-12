import React, { useEffect, useState } from 'react';
import { Info, ArrowRight, Tag, Building2, Clock, AlertCircle } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';
import { LocalClassifier } from '../../../repositories/classification';
import type { RoutingDecision } from '../../../domain';

interface Props {
  requestText: string;
  onContinue: (decision: RoutingDecision) => void;
}

const PRIORITY_CLASS: Record<string, string> = {
  LOW: 'ics-priority-low', NORMAL: 'ics-priority-normal',
  HIGH: 'ics-priority-high', URGENT: 'ics-priority-urgent',
};

export default function ClassificationPage({ requestText, onContinue }: Props) {
  const { language, haptic } = useAccessibility();
  const T = getTranslations(language);
  const [decision, setDecision] = useState<RoutingDecision | null>(null);

  useEffect(() => {
    const classification = LocalClassifier.classify(requestText);
    const routing = LocalClassifier.explain(classification, requestText);
    setDecision(routing);
  }, [requestText]);

  if (!decision) {
    return <div className="ics-main text-center py-16" aria-live="polite"><p style={{ color: 'var(--color-text-2)' }}>{T.common.loading}</p></div>;
  }

  const { classification } = decision;
  const catLabel = T.categories[classification.category];
  const priorityLabel = T.staffDashboard.priorityLabels[classification.priority];
  const reason = language === 'ta' ? (classification.reasonTA ?? classification.reason) : classification.reason;

  return (
    <div className="ics-main">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          {T.classification.title}
        </h1>
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-2)' }}>{T.classification.subtitle}</p>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg mb-6" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
          <Info size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs">{T.classification.disclaimer}</p>
        </div>

        {/* Classification result */}
        <div className="ics-card mb-4">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide" style={{ color: 'var(--color-text-3)' }}>Classification result</h2>
          <dl className="space-y-3">
            <div className="flex items-start gap-3">
              <Tag size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
              <div>
                <dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.classification.fields.category}</dt>
                <dd className="font-semibold" style={{ color: 'var(--color-text)' }}>{catLabel}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
              <div>
                <dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.classification.fields.department}</dt>
                <dd className="font-semibold" style={{ color: 'var(--color-text)' }}>{classification.department}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
              <div>
                <dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.classification.fields.priority}</dt>
                <dd><span className={`ics-badge ${PRIORITY_CLASS[classification.priority]}`}>{priorityLabel}</span></dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
              <div>
                <dt className="text-xs font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.classification.fields.estimatedResponse}</dt>
                <dd style={{ color: 'var(--color-text)' }}>{classification.estimatedResponseTime}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Routing explanation */}
        <div className="ics-card mb-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>{T.classification.routing.title}</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.classification.routing.detectedIssue}</dt>
              <dd style={{ color: 'var(--color-text)' }}>"{decision.detectedIssue}"</dd>
            </div>
            <div>
              <dt className="font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.classification.routing.destination}</dt>
              <dd style={{ color: 'var(--color-text)' }}>{classification.department}</dd>
            </div>
            <div>
              <dt className="font-semibold" style={{ color: 'var(--color-text-3)' }}>{T.classification.routing.reason}</dt>
              <dd style={{ color: 'var(--color-text-2)' }}>{reason}</dd>
            </div>
          </dl>
        </div>

        <button
          className="ics-btn ics-btn-primary ics-btn-lg w-full"
          onClick={() => { haptic('navigation'); onContinue(decision); }}
        >
          {T.classification.continue}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
