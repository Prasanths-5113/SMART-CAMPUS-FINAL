import React from 'react';
import { Save } from 'lucide-react';
import type { StudentPreferences, TransportMode, AccessibilityPref, NotificationPref } from '../types';

interface Props {
  prefs: StudentPreferences;
  onChange: (updated: StudentPreferences) => void;
  onClose: () => void;
}

const TRANSPORT_OPTIONS: TransportMode[]      = ['College Bus', 'Walking', 'Private Vehicle'];
const ACCESSIBILITY_OPTIONS: AccessibilityPref[] = ['No preference', 'Elevator preferred', 'Avoid stairs', 'Short walking distance', 'Avoid crowded areas'];
const NOTIFICATION_OPTIONS: NotificationPref[] = ['All', 'Important only', 'Academic only', 'Transport only'];

export default function PreferenceEditor({ prefs, onChange, onClose }: Props) {
  const [draft, setDraft] = React.useState<StudentPreferences>({ ...prefs });
  const [saved, setSaved]  = React.useState(false);

  function handleSave() {
    onChange(draft);
    setSaved(true);
    setTimeout(onClose, 700);
  }

  return (
    <div
      className="ics-card mt-4"
      role="region"
      aria-label="Edit preferences"
    >
      <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>Edit Preferences</h2>

      {/* Transport */}
      <div className="mb-4">
        <label htmlFor="pref-transport" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Transportation
        </label>
        <select
          id="pref-transport"
          className="ics-input"
          value={draft.transport}
          onChange={e => setDraft(d => ({ ...d, transport: e.target.value as TransportMode }))}
        >
          {TRANSPORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Accessibility */}
      <div className="mb-4">
        <label htmlFor="pref-accessibility" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Accessibility
        </label>
        <select
          id="pref-accessibility"
          className="ics-input"
          value={draft.accessibility}
          onChange={e => setDraft(d => ({ ...d, accessibility: e.target.value as AccessibilityPref }))}
        >
          {ACCESSIBILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Notification */}
      <div className="mb-5">
        <label htmlFor="pref-notification" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          Notification preference
        </label>
        <select
          id="pref-notification"
          className="ics-input"
          value={draft.notification}
          onChange={e => setDraft(d => ({ ...d, notification: e.target.value as NotificationPref }))}
        >
          {NOTIFICATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          className="ics-btn ics-btn-primary flex-1"
          onClick={handleSave}
          aria-live="polite"
        >
          <Save size={15} aria-hidden="true" />
          {saved ? 'Saved ✓' : 'Save preferences'}
        </button>
        <button className="ics-btn ics-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
