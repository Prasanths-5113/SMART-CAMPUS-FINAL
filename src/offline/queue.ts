import { getDB } from './db';
import type { OfflineQueueItem, Ticket } from '../domain';

export async function enqueue(item: OfflineQueueItem): Promise<void> {
  const db = await getDB();
  await db.put('offlineQueue', item);
}

export async function getAllQueued(): Promise<OfflineQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('offlineQueue', 'by-status', 'QUEUED');
}

export async function getAllQueueItems(): Promise<OfflineQueueItem[]> {
  const db = await getDB();
  return db.getAll('offlineQueue');
}

export async function updateQueueItem(id: string, updates: Partial<OfflineQueueItem>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('offlineQueue', id);
  if (existing) await db.put('offlineQueue', { ...existing, ...updates });
}

export async function removeQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('offlineQueue', id);
}

export async function clearQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('offlineQueue');
}

export async function cacheTicket(ticket: Ticket): Promise<void> {
  const db = await getDB();
  await db.put('tickets', ticket);
}

export async function getCachedTicket(ticketId: string): Promise<Ticket | undefined> {
  const db = await getDB();
  return db.get('tickets', ticketId);
}

export async function getCachedTicketsByStudent(studentId: string): Promise<Ticket[]> {
  const db = await getDB();
  return db.getAllFromIndex('tickets', 'by-studentId', studentId);
}
