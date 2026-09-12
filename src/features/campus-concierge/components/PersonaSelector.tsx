import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { StudentPersona } from '../types';

interface Props {
  personas: StudentPersona[];
  activeId: string;
  onChange: (id: string) => void;
}

export default function PersonaSelector({ personas, activeId, onChange }: Props) {
  return (
    <div className="relative inline-block">
      <label htmlFor="persona-select" className="sr-only">Demo student profile</label>
      <div className="flex items-center gap-1" style={{ position: 'relative' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-3)' }}>Profile:</span>
        <select
          id="persona-select"
          value={activeId}
          onChange={e => onChange(e.target.value)}
          className="ics-input"
          style={{
            minHeight: 36,
            padding: '0.25rem 2rem 0.25rem 0.625rem',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--color-accent)',
            background: 'var(--color-accent-light)',
            border: '1.5px solid var(--color-accent)',
            width: 'auto',
            appearance: 'none',
            cursor: 'pointer',
          }}
          aria-label="Switch demo student profile"
        >
          {personas.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.year}, {p.department}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          aria-hidden="true"
          style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: 'var(--color-accent)' }}
        />
      </div>
    </div>
  );
}
