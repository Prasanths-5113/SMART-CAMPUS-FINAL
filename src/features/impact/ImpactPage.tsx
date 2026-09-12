import React, { useEffect, useState } from 'react';
import { Info, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { getTranslations } from '../../i18n';
import { LocalTicketRepository } from '../../repositories/LocalTicketRepository';
import type { Ticket } from '../../domain';

interface Props { onBack: () => void; }

export default function ImpactPage({ onBack }: Props) {
  const { language } = useAccessibility();
  const T = getTranslations(language);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const repo = new LocalTicketRepository();
    repo.listAllTickets().then(setTickets);
  }, []);

  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const offline = tickets.filter(t => t.source === 'OFFLINE').length;
  const assisted = tickets.filter(t => t.source === 'ASSISTED').length;
  const voice = tickets.filter(t => t.source === 'VOICE').length;
  const routedPct = total > 0 ? Math.round(((total - tickets.filter(t => t.category === 'GENERAL').length) / total) * 100) : 0;
  const satisfactionScores = tickets.filter(t => t.feedback).map(t => t.feedback!.rating);
  const avgSatisfaction = satisfactionScores.length > 0 ? (satisfactionScores.reduce((a,b) => a+b, 0) / satisfactionScores.length).toFixed(1) : '—';

  const metrics = [
    { label: T.impact.metrics.totalRequests,       value: String(total),            note: 'prototype' },
    { label: T.impact.metrics.successfullyRouted,  value: `${routedPct}%`,           note: 'prototype' },
    { label: T.impact.metrics.resolved,            value: `${resolved}`,             note: 'prototype' },
    { label: T.impact.metrics.offlineRequests,     value: String(offline),           note: 'prototype' },
    { label: T.impact.metrics.assistedRequests,    value: String(assisted),          note: 'prototype' },
    { label: T.impact.metrics.voiceRequests,       value: String(voice),             note: 'prototype' },
    { label: T.impact.metrics.studentSatisfaction, value: `${avgSatisfaction} / 5`,  note: 'prototype' },
  ];

  return (
    <div className="ics-main">
      <button className="ics-btn ics-btn-ghost mb-6" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> {T.nav.back}
      </button>

      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>{T.impact.title}</h1>
      <p className="text-sm mb-2" style={{ color: 'var(--color-text-2)' }}>{T.impact.subtitle}</p>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg mb-8" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
        <Info size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs">{T.impact.disclaimer}</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {metrics.map(m => (
          <div key={m.label} className="ics-card text-center">
            <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-accent)' }}>{m.value}</p>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{m.label}</p>
            <span className="ics-badge ics-badge-yellow" style={{ fontSize: '0.65rem' }}>{m.note}</span>
          </div>
        ))}
      </div>

      {/* Friction model */}
      <section aria-labelledby="friction-heading" className="mb-8">
        <h2 id="friction-heading" className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <TrendingUp size={20} aria-hidden="true" style={{ color: 'var(--color-accent)' }} />
          {T.impact.frictionModel.title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="ics-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
            <h3 className="font-bold mb-3 flex items-center gap-1" style={{ color: 'var(--color-danger)' }}>
              {T.impact.frictionModel.before}
            </h3>
            <ul className="space-y-2">
              {T.impact.frictionModel.beforeItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                  <span aria-hidden="true" className="mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>{i+1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="ics-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
              <ArrowRight size={16} aria-hidden="true" /> {T.impact.frictionModel.after}
            </h3>
            <ul className="space-y-2">
              {T.impact.frictionModel.afterItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-2)' }}>
                  <span aria-hidden="true" className="mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Haptic section */}
      <section className="ics-card" aria-labelledby="haptic-heading">
        <h2 id="haptic-heading" className="font-bold mb-2" style={{ color: 'var(--color-text)' }}>{T.haptics.title}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-2)' }}>{T.haptics.subtitle}</p>
        <ul className="space-y-2">
          {(Object.entries(T.haptics.patterns) as [string,string][]).map(([key, desc]) => (
            <li key={key} className="flex items-start gap-2 text-sm">
              <span className="ics-badge ics-badge-blue">{key}</span>
              <span style={{ color: 'var(--color-text-2)' }}>{desc}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs mt-4" style={{ color: 'var(--color-text-3)' }}>{T.haptics.note}</p>
      </section>
    </div>
  );
}
