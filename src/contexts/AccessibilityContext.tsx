import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AccessibilityPreferences, Language, AccessMode } from '../domain';
import { DEFAULT_ACCESSIBILITY_PREFS } from '../domain';

// ── Haptic patterns ───────────────────────────────────────

export type HapticPattern = 'success' | 'error' | 'warning' | 'navigation' | 'statusChange';

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  success:      [80],
  error:        [300],
  warning:      [100, 80, 100],
  navigation:   [60, 40, 60, 40, 60],
  statusChange: [100, 60, 100, 60, 200],
};

function vibrate(pattern: HapticPattern): void {
  if (!navigator.vibrate) return;
  navigator.vibrate(HAPTIC_PATTERNS[pattern]);
}

// ── Context types ─────────────────────────────────────────

interface AccessibilityContextValue {
  prefs: AccessibilityPreferences;
  language: Language;
  accessMode: AccessMode;
  isOnline: boolean;
  setPref: (key: keyof AccessibilityPreferences, value: boolean) => void;
  setLanguage: (lang: Language) => void;
  setAccessMode: (mode: AccessMode) => void;
  haptic: (pattern: HapticPattern) => void;
  flashAlert: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

const PREFS_KEY = 'ics_a11y_prefs_v1';
const LANG_KEY  = 'ics_language_v1';
const MODE_KEY  = 'ics_access_mode_v1';

function loadPrefs(): AccessibilityPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_ACCESSIBILITY_PREFS, ...JSON.parse(raw) } : DEFAULT_ACCESSIBILITY_PREFS;
  } catch { return DEFAULT_ACCESSIBILITY_PREFS; }
}

function loadLanguage(): Language {
  try { return (localStorage.getItem(LANG_KEY) as Language) ?? 'en'; }
  catch { return 'en'; }
}

function loadAccessMode(): AccessMode {
  try { return (localStorage.getItem(MODE_KEY) as AccessMode) ?? 'TEXT_VISUAL'; }
  catch { return 'TEXT_VISUAL'; }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs]           = useState<AccessibilityPreferences>(loadPrefs);
  const [language, setLangState]    = useState<Language>(loadLanguage);
  const [accessMode, setModeState]  = useState<AccessMode>(loadAccessMode);
  const [isOnline, setIsOnline]     = useState(navigator.onLine);

  // Persist prefs
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    // Apply CSS data attributes
    const root = document.documentElement;
    root.setAttribute('data-high-contrast',   String(prefs.highContrast));
    root.setAttribute('data-large-text',      String(prefs.largeText));
    root.setAttribute('data-reduced-motion',  String(prefs.reducedMotion));
    root.setAttribute('data-large-targets',   String(prefs.largeTouchTargets));
    root.setAttribute('data-low-bandwidth',   String(prefs.lowBandwidthMode));
  }, [prefs]);

  // Language on html element
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(LANG_KEY, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, accessMode);
  }, [accessMode]);

  // Connectivity
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Respect OS-level reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches && !prefs.reducedMotion) {
      setPrefs(p => ({ ...p, reducedMotion: true }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPref = useCallback((key: keyof AccessibilityPreferences, value: boolean) => {
    setPrefs(p => ({ ...p, [key]: value }));
  }, []);

  const setLanguage = useCallback((lang: Language) => { setLangState(lang); }, []);
  const setAccessMode = useCallback((mode: AccessMode) => { setModeState(mode); }, []);

  const haptic = useCallback((pattern: HapticPattern) => {
    if (prefs.hapticFeedback) vibrate(pattern);
  }, [prefs.hapticFeedback]);

  const flashAlert = useCallback(() => {
    if (!prefs.visualAlerts) return;
    document.body.classList.add('ics-visual-alert');
    setTimeout(() => document.body.classList.remove('ics-visual-alert'), 700);
  }, [prefs.visualAlerts]);

  return (
    <AccessibilityContext.Provider value={{
      prefs, language, accessMode, isOnline,
      setPref, setLanguage, setAccessMode, haptic, flashAlert,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
