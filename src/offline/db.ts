import { openDB, IDBPDatabase } from 'idb';
import type { OfflineQueueItem, Ticket } from '../domain';

const DB_NAME = 'inclusive-campus-support';
const DB_VERSION = 1;

interface CampusDB {
  offlineQueue: { key: string; value: OfflineQueueItem; indexes: { 'by-status': string } };
  tickets: { key: string; value: Ticket; indexes: { 'by-studentId': string } };
}

let dbPromise: Promise<IDBPDatabase<CampusDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<CampusDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CampusDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const qs = db.createObjectStore('offlineQueue', { keyPath: 'clientRequestId' });
          qs.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains('tickets')) {
          const ts = db.createObjectStore('tickets', { keyPath: 'ticketId' });
          ts.createIndex('by-studentId', 'studentId');
        }
      },
    });
  }
  return dbPromise;
}
