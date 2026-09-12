import React from 'react';
import type { PriorityLevel } from '../types';

interface Props { level: PriorityLevel; score?: number; }

const CONFIG: Record<PriorityLevel, { label: string; emoji: string; bg: string; color: string; border: string }> = {
  HIGH:   { label: 'HIGH PRIORITY',   emoji: '🔴', bg: 'var(--color-danger-bg)',  color: 'var(--color-danger)',  border: 'var(--color-danger)' },
  MEDIUM: { label: 'MEDIUM PRIORITY', emoji: '🟠', bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '#f59e0b' },
  LOW:    { label: 'LOW PRIORITY',    emoji: '🟢', bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'var(--color-success)' },
};

export default function PriorityBadge({ level, score }: Props) {
  const c = CONFIG[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ background: c.bg, color: c.color, border: `1.5px solid ${c.border}` }}
      aria-label={`Priority: ${c.label}${score !== undefined ? `, score ${score} out of 100` : ''}`}
    >
      <span aria-hidden="true">{c.emoji}</span>
      {c.label}
      {score !== undefined && <span className="ml-1 opacity-80">· {score}/100</span>}
    </span>
  );
}
