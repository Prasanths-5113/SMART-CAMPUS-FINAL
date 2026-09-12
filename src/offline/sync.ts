import { getAllQueued, updateQueueItem, cacheTicket } from './queue';
import { LocalTicketRepository } from '../repositories/LocalTicketRepository';
import type { OfflineQueueItem } from '../domain';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function syncItem(item: OfflineQueueItem): Promise<void> {
  await updateQueueItem(item.clientRequestId, { status: 'SYNCING', lastAttempt: new Date().toISOString() });
  try {
    let ticket;
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': item.clientRequestId },
        body: JSON.stringify({ ...item.payload, idempotencyKey: item.clientRequestId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      ticket = await res.json();
    } else {
      const repo = new LocalTicketRepository();
      ticket = await repo.createTicket({ ...item.payload, idempotencyKey: item.clientRequestId });
    }
    await cacheTicket(ticket);
    await updateQueueItem(item.clientRequestId, { status: 'SYNCED' });
  } catch (err) {
    await updateQueueItem(item.clientRequestId, {
      status: 'FAILED',
      retryCount: item.retryCount + 1,
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function syncAll(): Promise<{ synced: number; failed: number }> {
  const queued = await getAllQueued();
  let synced = 0, failed = 0;
  for (const item of queued) {
    try { await syncItem(item); synced++; }
    catch { failed++; }
  }
  return { synced, failed };
}

export function setupConnectivityListener(onSync: (r: { synced: number; failed: number }) => void): () => void {
  const handler = async () => { if (navigator.onLine) onSync(await syncAll()); };
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
