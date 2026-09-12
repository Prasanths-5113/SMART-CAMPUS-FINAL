import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { getTranslations } from '../../i18n';
import { getAllQueueItems, removeQueueItem, clearQueue } from '../../offline/queue';
import { syncAll } from '../../offline/sync';
import type { OfflineQueueItem } from '../../domain';

export default function OfflineBanner() {
  const { isOnline, language, haptic } = useAccessibility();
  const T = getTranslations(language);
  const [items, setItems] = useState<OfflineQueueItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    getAllQueueItems().then(setItems);
  }, [isOnline]);

  async function handleSync() {
    setSyncing(true);
    await syncAll();
    const updated = await getAllQueueItems();
    setItems(updated);
    setSyncing(false);
    haptic('success');
  }

  async function handleRemove(id: string) {
    await removeQueueItem(id);
    setItems(prev => prev.filter(i => i.clientRequestId !== id));
    haptic('warning');
  }

  if (isOnline && items.filter(i => i.status === 'QUEUED').length === 0) return null;

  const pendingCount = items.filter(i => i.status === 'QUEUED' || i.status === 'FAILED').length;

  return (
    <div role="status" aria-live="polite" aria-label="Connectivity status">
      <div className="ics-offline-banner mx-4 mt-2">
        <WifiOff size={18} className="flex-shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{T.offline.banner}</p>
          <p className="text-xs mt-0.5">{T.offline.bannerDetail}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isOnline && pendingCount > 0 && (
            <button className="ics-btn" style={{ fontSize: '0.75rem', minHeight: 32, padding: '0.25rem 0.625rem', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid #f59e0b' }}
              onClick={handleSync} disabled={syncing} aria-label="Sync pending requests">
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} aria-hidden="true" />
              {T.offline.syncNow}
            </button>
          )}
          {pendingCount > 0 && (
            <button className="ics-btn" style={{ fontSize: '0.75rem', minHeight: 32, padding: '0.25rem 0.625rem', background: 'transparent', color: 'var(--color-warning)', border: 'none' }}
              onClick={() => setExpanded(e => !e)} aria-expanded={expanded} aria-controls="offline-queue">
              {pendingCount} pending
            </button>
          )}
        </div>
      </div>

      {expanded && items.length > 0 && (
        <div id="offline-queue" className="mx-4 mb-2 ics-card" style={{ borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{T.offline.queueTitle}</h3>
            <button className="ics-btn" style={{ fontSize: '0.75rem', minHeight: 28, padding: '0.125rem 0.5rem', color: 'var(--color-danger)', background: 'none', border: 'none' }}
              onClick={async () => { await clearQueue(); setItems([]); }}>
              {T.offline.clearAll}
            </button>
          </div>
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.clientRequestId} className="flex items-center justify-between gap-3 p-2 rounded-lg text-sm" style={{ background: 'var(--color-surface-2)' }}>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono text-xs" style={{ color: 'var(--color-text-3)' }}>{item.clientRequestId.slice(0,20)}…</p>
                  <p className="truncate text-xs mt-0.5" style={{ color: 'var(--color-text-2)' }}>{item.payload.requestText?.slice(0, 60)}…</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`ics-badge ${item.status === 'SYNCED' ? 'ics-badge-green' : item.status === 'FAILED' ? 'ics-badge-red' : item.status === 'SYNCING' ? 'ics-badge-blue' : 'ics-badge-yellow'}`} style={{ fontSize: '0.65rem' }}>
                    {T.offline.queueItem[item.status.toLowerCase() as 'pending'|'syncing'|'synced'|'failed']}
                  </span>
                  {item.status !== 'SYNCED' && (
                    <button onClick={() => handleRemove(item.clientRequestId)} aria-label="Remove pending request"
                      className="ics-btn" style={{ minHeight: 28, padding: '0.125rem 0.375rem', fontSize: '0.7rem', color: 'var(--color-text-3)', border: 'none', background: 'none' }}>
                      ✕
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
