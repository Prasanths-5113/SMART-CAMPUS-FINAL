import type { Ticket, TicketStatus, TicketTimelineEvent, TicketFeedback, UserRole } from '../domain';
import { cacheTicket, getCachedTicket, getCachedTicketsByStudent } from '../offline/queue';

export interface ITicketRepository {
  createTicket(data: Omit<Ticket, 'ticketId' | 'timeline' | 'createdAt' | 'updatedAt'> & { idempotencyKey: string }): Promise<Ticket>;
  getTicket(ticketId: string): Promise<Ticket | null>;
  listStudentTickets(studentId: string): Promise<Ticket[]>;
  listAllTickets(): Promise<Ticket[]>;
  updateTicketStatus(ticketId: string, status: TicketStatus, actor: string, actorRole: UserRole, message: string): Promise<Ticket>;
  addTimelineEvent(ticketId: string, event: Omit<TicketTimelineEvent, 'id'>): Promise<Ticket>;
  assignStaff(ticketId: string, staffName: string): Promise<Ticket>;
  submitFeedback(ticketId: string, feedback: TicketFeedback): Promise<Ticket>;
}

const STORAGE_KEY = 'ics_tickets_v1';

function loadStore(): Map<string, Ticket> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedData();
    const arr: Ticket[] = JSON.parse(raw);
    return new Map(arr.map((t) => [t.ticketId, t]));
  } catch { return buildSeedData(); }
}

function saveStore(store: Map<string, Ticket>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(store.values())));
}

function buildSeedData(): Map<string, Ticket> {
  const store = new Map<string, Ticket>();
  const now = Date.now();

  const t1: Ticket = {
    ticketId: 'CAMP-4827', studentId: 'ST2024001', studentName: 'Ravi',
    requestText: 'I have not received my scholarship amount for this semester.',
    language: 'ta', category: 'SCHOLARSHIP_FINANCE', department: 'Scholarship & Finance Office',
    priority: 'NORMAL', status: 'IN_REVIEW', source: 'VOICE', accessibilityMode: 'VOICE_AUDIO',
    consent: {
      consentGiven: true, consentTimestamp: new Date(now - 86400000 * 2).toISOString(),
      dataShared: { requestText: 'Scholarship payment issue.', recipient: 'Scholarship & Finance Office', purpose: 'Investigate scholarship payment.', requiredIdentifier: 'Student ID' },
      notCollected: ['Password', 'Payment card', 'Biometric information'],
    },
    requiredInformation: ['studentId'], assignedStaff: 'Mrs. Lakshmi Priya',
    estimatedResponseTime: '2 working days', idempotencyKey: 'seed-4827',
    createdAt: new Date(now - 86400000 * 2).toISOString(), updatedAt: new Date(now - 3600000 * 3).toISOString(),
    timeline: [
      { id: 'tl-1', status: 'SUBMITTED', message: 'Request submitted via voice input.', actor: 'Ravi', actorRole: 'STUDENT', timestamp: new Date(now - 86400000 * 2).toISOString() },
      { id: 'tl-2', status: 'SUBMITTED', message: 'Scholarship & Finance Office received the request.', actor: 'System', actorRole: 'ADMIN', timestamp: new Date(now - 86400000 * 2 + 3600000).toISOString() },
      { id: 'tl-3', status: 'IN_REVIEW', message: 'Request is being reviewed by Mrs. Lakshmi Priya.', actor: 'Mrs. Lakshmi Priya', actorRole: 'STAFF', timestamp: new Date(now - 3600000 * 3).toISOString() },
    ],
  };

  const t2: Ticket = {
    ticketId: 'CAMP-4831', studentId: 'ST2024002', studentName: 'Priya',
    requestText: 'My hostel room has a broken ceiling fan since last week.',
    language: 'en', category: 'HOSTEL', department: 'Hostel Administration',
    priority: 'HIGH', status: 'ACTION_TAKEN', source: 'WEB', accessibilityMode: 'TEXT_VISUAL',
    consent: {
      consentGiven: true, consentTimestamp: new Date(now - 86400000 * 5).toISOString(),
      dataShared: { requestText: 'Broken fan in hostel room.', recipient: 'Hostel Administration', purpose: 'Arrange repair.', requiredIdentifier: 'Student ID' },
      notCollected: ['Password', 'Payment card', 'Biometric information'],
    },
    requiredInformation: ['studentId', 'roomNumber'], assignedStaff: 'Mr. Senthil Kumar',
    estimatedResponseTime: '1 working day', idempotencyKey: 'seed-4831',
    createdAt: new Date(now - 86400000 * 5).toISOString(), updatedAt: new Date(now - 86400000).toISOString(),
    timeline: [
      { id: 'tl-b1', status: 'SUBMITTED', message: 'Request submitted.', actor: 'Priya', actorRole: 'STUDENT', timestamp: new Date(now - 86400000 * 5).toISOString() },
      { id: 'tl-b2', status: 'IN_REVIEW', message: 'Hostel warden assigned.', actor: 'Mr. Senthil Kumar', actorRole: 'STAFF', timestamp: new Date(now - 86400000 * 4).toISOString() },
      { id: 'tl-b3', status: 'ACTION_TAKEN', message: 'Maintenance team dispatched. Repair scheduled.', actor: 'Mr. Senthil Kumar', actorRole: 'STAFF', timestamp: new Date(now - 86400000).toISOString() },
    ],
  };

  const t3: Ticket = {
    ticketId: 'CAMP-4835', studentId: 'ST2024003', studentName: 'Karthik',
    requestText: 'I need a bonafide certificate for bank loan application.',
    language: 'en', category: 'CERTIFICATES', department: 'Academic Records Office',
    priority: 'NORMAL', status: 'SUBMITTED', source: 'ASSISTED', accessibilityMode: 'ASSISTED',
    consent: {
      consentGiven: true, consentTimestamp: new Date(now - 3600000 * 2).toISOString(),
      dataShared: { requestText: 'Bonafide certificate request.', recipient: 'Academic Records Office', purpose: 'Issue bonafide certificate.', requiredIdentifier: 'Student ID' },
      notCollected: ['Password', 'Payment card', 'Biometric information'],
    },
    requiredInformation: ['studentId'], estimatedResponseTime: '2 working days',
    idempotencyKey: 'seed-4835',
    createdAt: new Date(now - 3600000 * 2).toISOString(), updatedAt: new Date(now - 3600000 * 2).toISOString(),
    timeline: [
      { id: 'tl-c1', status: 'SUBMITTED', message: 'Request submitted via campus help desk (assisted support).', actor: 'Help Desk Staff', actorRole: 'STAFF', timestamp: new Date(now - 3600000 * 2).toISOString() },
    ],
  };

  [t1, t2, t3].forEach(t => store.set(t.ticketId, t));
  saveStore(store);
  return store;
}

export class LocalTicketRepository implements ITicketRepository {
  private store: Map<string, Ticket>;

  constructor() { this.store = loadStore(); }
  private persist() { saveStore(this.store); }
  private generateTicketId(): string { return `CAMP-${4900 + Math.floor(Math.random() * 900)}`; }

  async createTicket(data: Omit<Ticket, 'ticketId' | 'timeline' | 'createdAt' | 'updatedAt'> & { idempotencyKey: string }): Promise<Ticket> {
    for (const t of this.store.values()) {
      if (t.idempotencyKey === data.idempotencyKey) return t;
    }
    const now = new Date().toISOString();
    const ticketId = this.generateTicketId();
    const ticket: Ticket = {
      ...data, ticketId, status: 'SUBMITTED',
      timeline: [{
        id: `tl-${Date.now()}`, status: 'SUBMITTED',
        message: data.source === 'ASSISTED' ? 'Request submitted via campus help desk.' : data.source === 'OFFLINE' ? 'Request submitted after offline sync.' : `Request submitted via ${data.source.toLowerCase()} input.`,
        actor: data.studentName ?? data.studentId, actorRole: 'STUDENT', timestamp: now,
      }],
      createdAt: now, updatedAt: now,
    };
    this.store.set(ticketId, ticket);
    this.persist();
    await cacheTicket(ticket);
    return ticket;
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    return this.store.get(ticketId) ?? await getCachedTicket(ticketId) ?? null;
  }

  async listStudentTickets(studentId: string): Promise<Ticket[]> {
    const inMem = Array.from(this.store.values()).filter(t => t.studentId === studentId);
    const cached = await getCachedTicketsByStudent(studentId);
    const merged = new Map(inMem.map(t => [t.ticketId, t]));
    cached.forEach(t => { if (!merged.has(t.ticketId)) merged.set(t.ticketId, t); });
    return Array.from(merged.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listAllTickets(): Promise<Ticket[]> {
    return Array.from(this.store.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, actor: string, actorRole: UserRole, message: string): Promise<Ticket> {
    const ticket = this.store.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    const now = new Date().toISOString();
    const updated: Ticket = {
      ...ticket, status, updatedAt: now,
      timeline: [...ticket.timeline, { id: `tl-${Date.now()}`, status, message, actor, actorRole, timestamp: now }],
    };
    this.store.set(ticketId, updated);
    this.persist();
    await cacheTicket(updated);
    return updated;
  }

  async addTimelineEvent(ticketId: string, event: Omit<TicketTimelineEvent, 'id'>): Promise<Ticket> {
    const ticket = this.store.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    const updated: Ticket = {
      ...ticket, updatedAt: new Date().toISOString(),
      timeline: [...ticket.timeline, { ...event, id: `tl-${Date.now()}` }],
    };
    this.store.set(ticketId, updated);
    this.persist();
    await cacheTicket(updated);
    return updated;
  }

  async assignStaff(ticketId: string, staffName: string): Promise<Ticket> {
    const ticket = this.store.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    const now = new Date().toISOString();
    const updated: Ticket = {
      ...ticket, assignedStaff: staffName, status: 'IN_REVIEW', updatedAt: now,
      timeline: [...ticket.timeline, { id: `tl-${Date.now()}`, status: 'IN_REVIEW', message: `Assigned to ${staffName}.`, actor: staffName, actorRole: 'STAFF', timestamp: now }],
    };
    this.store.set(ticketId, updated);
    this.persist();
    await cacheTicket(updated);
    return updated;
  }

  async submitFeedback(ticketId: string, feedback: TicketFeedback): Promise<Ticket> {
    const ticket = this.store.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    const updated: Ticket = { ...ticket, feedback, updatedAt: new Date().toISOString() };
    this.store.set(ticketId, updated);
    this.persist();
    return updated;
  }
}
