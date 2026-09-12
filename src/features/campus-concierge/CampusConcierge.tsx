import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Settings, RefreshCw, ArrowLeft } from 'lucide-react';
import { PERSONAS } from './data/personas';
import { CAMPUS_NOTICES } from './data/notices';
import { computeRecommendations } from './utils/engine';
import type { StudentPersona, StudentPreferences, DismissReason } from './types';
import RecommendationCard from './components/RecommendationCard';
import PersonaSelector    from './components/PersonaSelector';
import PreferenceEditor   from './components/PreferenceEditor';

const STORAGE_KEY = 'concierge_state_v1';

interface PersistedState {
  activePersonaId: string;
  prefsOverrides: Record<string, StudentPreferences>;
  dismissedIds: string[];
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { activePersonaId: 'priya', prefsOverrides: {}, dismissedIds: [] };
  } catch {
    return { activePersonaId: 'priya', prefsOverrides: {}, dismissedIds: [] };
  }
}

function saveState(s: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

interface Props { onBack: () => void; }

export default function CampusConcierge({ onBack }: Props) {
  const [state, setState]         = useState<PersistedState>(loadState);
  const [showPrefs, setShowPrefs] = useState(false);
  const [toast, setToast]         = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Persist on every state change
  useEffect(() => { saveState(state); }, [state]);

  // Active persona merged with any saved preference overrides
  const basePersona = PERSONAS.find(p => p.id === state.activePersonaId) ?? PERSONAS[0];
  const activePersona: StudentPersona = useMemo(() => ({
    ...basePersona,
    preferences: state.prefsOverrides[state.activePersonaId] ?? basePersona.preferences,
  }), [basePersona, state.activePersonaId, state.prefsOverrides]);

  // Compute recommendations reactively
  const recommendations = useMemo(() => {
    return computeRecommendations(CAMPUS_NOTICES, activePersona, {
      dismissedIds: state.dismissedIds,
    });
  }, [activePersona, state.dismissedIds]);

  // Show toast helper
  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  // ── Event handlers ─────────────────────────────────────

  function handlePersonaChange(id: string) {
    setState(s => ({ ...s, activePersonaId: id, dismissedIds: [] }));
    setLastUpdated(new Date());
    flash('Profile switched — recommendations updated.');
  }

  function handleDismiss(id: string, reason: DismissReason) {
    setState(s => ({ ...s, dismissedIds: [...s.dismissedIds, id] }));
    setLastUpdated(new Date());
    flash(`Recommendation updated ✓ (${reason})`);
  }

  function handlePreferencesSave(updated: StudentPreferences) {
    setState(s => ({
      ...s,
      prefsOverrides: { ...s.prefsOverrides, [s.activePersonaId]: updated },
      dismissedIds: [],
    }));
    setLastUpdated(new Date());
    setShowPrefs(false);
    flash('Your recommendations were updated based on your preferences.');
  }

  function handleReset() {
    setState(s => ({ ...s, dismissedIds: [] }));
    setLastUpdated(new Date());
    flash('Recommendations reset.');
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="ics-main">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button className="ics-btn ics-btn-ghost mb-4" onClick={onBack} aria-label="Back to home">
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>

        {/* Page header */}
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-accent)' }}>
            Adaptive Campus Concierge
          </p>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            {greeting}, {activePersona.name} 👋
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-2)' }}>
            {activePersona.year} · {activePersona.department} · Attendance: {activePersona.attendance}%
            {activePersona.attendance < 75 && (
              <span className="ml-2 ics-badge ics-badge-red" style={{ fontSize: '0.7rem' }}>⚠ Below 75%</span>
            )}
          </p>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            <PersonaSelector
              personas={PERSONAS}
              activeId={state.activePersonaId}
              onChange={handlePersonaChange}
            />
            <button
              className="ics-btn ics-btn-ghost"
              style={{ fontSize: '0.8125rem', minHeight: 36 }}
              onClick={() => setShowPrefs(p => !p)}
              aria-expanded={showPrefs}
              aria-label="Edit preferences"
            >
              <Settings size={14} aria-hidden="true" />
              Edit Preferences
            </button>
            <button
              className="ics-btn ics-btn-ghost"
              style={{ fontSize: '0.8125rem', minHeight: 36 }}
              onClick={handleReset}
              aria-label="Reset all dismissed recommendations"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Reset
            </button>
          </div>
        </header>

        {/* Preference editor — inline, not modal */}
        {showPrefs && (
          <PreferenceEditor
            prefs={activePersona.preferences}
            onChange={handlePreferencesSave}
            onClose={() => setShowPrefs(false)}
          />
        )}

        {/* Toast */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}
          >
            {toast}
          </div>
        )}

        {/* Current preferences summary */}
        <div className="ics-card mb-5 py-3 px-4">
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-3)' }}>
            Active preferences
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '🚌 ' + activePersona.preferences.transport },
              { label: '♿ ' + activePersona.preferences.accessibility },
              { label: '🔔 ' + activePersona.preferences.notification },
            ].map(p => (
              <span key={p.label} className="ics-badge ics-badge-blue" style={{ fontSize: '0.75rem' }}>{p.label}</span>
            ))}
          </div>
        </div>

        {/* Section heading */}
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-3)' }}>
          Your priorities for today
        </h2>

        {/* Recommendation list */}
        {recommendations.length === 0 ? (
          <div className="ics-card text-center py-10">
            <p className="text-2xl mb-2" aria-hidden="true">✅</p>
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>No active recommendations</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-2)' }}>
              All notices have been dismissed. Click Reset to see them again.
            </p>
            <button className="ics-btn ics-btn-secondary mt-4" onClick={handleReset}>
              <RefreshCw size={14} aria-hidden="true" /> Reset
            </button>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Personalized recommendations">
            {recommendations.map(rec => (
              <div key={rec.id} role="listitem">
                <RecommendationCard rec={rec} onDismiss={handleDismiss} />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--color-text-3)' }}>
          Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          &nbsp;· Deterministic engine · No external AI API
        </p>

        {/* Today's timetable reference */}
        <details className="mt-4">
          <summary className="text-sm font-semibold cursor-pointer" style={{ color: 'var(--color-text-3)' }}>
            📅 Today's timetable for {activePersona.name}
          </summary>
          <div className="ics-card mt-2">
            <ul className="space-y-2">
              {activePersona.timetableToday.map((entry, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="font-mono font-semibold flex-shrink-0" style={{ color: 'var(--color-accent)' }}>{entry.time}</span>
                  <span>
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{entry.subject}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--color-text-3)' }}>{entry.venue}</span>
                    {entry.hasAssignmentDue && (
                      <span className="ml-2 ics-badge ics-badge-red" style={{ fontSize: '0.65rem' }}>Assignment due</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </details>

      </div>
    </div>
  );
}
