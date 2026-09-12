import React from 'react';
import { Mic, Globe, Wifi, Accessibility, Users, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { getTranslations } from '../../../i18n';

interface Props {
  onGetSupport: () => void;
  onTrackRequest: () => void;
  onStaffLogin: () => void;
  onImpact: () => void;
  onConcierge: () => void;
}

export default function LandingPage({ onGetSupport, onTrackRequest, onStaffLogin, onImpact, onConcierge }: Props) {
  const { language } = useAccessibility();
  const T = getTranslations(language);

  const features = [
    { icon: Mic,           ...T.landing.features.voice },
    { icon: Globe,         ...T.landing.features.language },
    { icon: Wifi,          ...T.landing.features.connectivity },
    { icon: Accessibility, ...T.landing.features.accessibility },
    { icon: Users,         ...T.landing.features.human },
  ];

  return (
    <div className="ics-main">

      {/* Hero */}
      <section className="text-center py-12" aria-labelledby="hero-heading">
        <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-accent)' }}>
          Kingston Engineering College
        </p>
        <h1 id="hero-heading" className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text)', lineHeight: 1.15 }}>
          {T.landing.hero}
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--color-text-2)' }}>
          {T.landing.subhero}
        </p>
        <p className="text-base italic mb-10 max-w-lg mx-auto font-medium" style={{ color: 'var(--color-text-2)' }}>
          "{T.product.tagline}"
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="ics-btn ics-btn-primary ics-btn-lg" onClick={onGetSupport} aria-label={T.landing.cta}>
            {T.landing.cta}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button className="ics-btn ics-btn-secondary ics-btn-lg" onClick={onTrackRequest}>
            {T.landing.trackCta}
          </button>
        </div>
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          <button className="ics-btn ics-btn-ghost" onClick={onStaffLogin} style={{ fontSize: '0.875rem' }}>
            {T.nav.staffDashboard}
          </button>
          <button className="ics-btn ics-btn-ghost" onClick={onImpact} style={{ fontSize: '0.875rem' }}>
            {T.nav.impact}
          </button>
        </div>
      </section>

      <hr className="ics-divider" />

      {/* Feature grid */}
      <section aria-label="Service features" className="py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="ics-card flex gap-3 items-start">
              <span aria-hidden="true" className="mt-0.5 flex-shrink-0 p-2 rounded-md" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                <Icon size={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text)' }}>{title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-2)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="ics-divider" />

      {/* Before / After */}
      <section aria-labelledby="before-after-heading" className="py-8">
        <h2 id="before-after-heading" className="text-xl font-bold text-center mb-6" style={{ color: 'var(--color-text)' }}>
          How this service is different
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Before */}
          <div className="ics-card" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger-bg)' }}>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-danger)' }}>
              <XCircle size={18} aria-hidden="true" />
              {T.landing.before.title}
            </h3>
            <ol className="space-y-2">
              {T.landing.before.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--color-danger)' }}>
                  <span className="font-semibold flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* After */}
          <div className="ics-card" style={{ borderColor: 'var(--color-success)', background: 'var(--color-success-bg)' }}>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
              <CheckCircle size={18} aria-hidden="true" />
              {T.landing.after.title}
            </h3>
            <ol className="space-y-2">
              {T.landing.after.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--color-success)' }}>
                  <span className="font-semibold flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Concierge widget */}
      <section aria-label="Adaptive Campus Concierge" className="py-4">
        <div
          className="ics-card flex items-center justify-between gap-4"
          style={{ background: 'var(--color-accent-light)', border: '1.5px solid var(--color-accent)' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-accent)' }}>
              🎯 New Feature
            </p>
            <p className="font-bold" style={{ color: 'var(--color-text)' }}>Adaptive Campus Concierge</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-2)' }}>
              Personalized, prioritized next actions based on your profile, timetable &amp; campus notices.
            </p>
          </div>
          <button
            className="ics-btn ics-btn-primary flex-shrink-0"
            onClick={onConcierge}
            aria-label="Open Adaptive Campus Concierge"
          >
            Open <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Persona callout */}
      <section aria-label="Demo persona" className="py-6">
        <div className="ics-card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-accent)' }}>Demo scenario</p>
          <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Ravi — Rural student, Tamil-speaking, visual accessibility needs</p>
          <p className="text-sm" style={{ color: 'var(--color-text-2)' }}>
            "I have not received my scholarship amount." — Ravi uses voice input in Tamil. The service classifies the issue, routes it to the Scholarship Office, creates ticket <strong>CAMP-4827</strong>, and he tracks resolution without visiting any office.
          </p>
        </div>
      </section>

    </div>
  );
}
